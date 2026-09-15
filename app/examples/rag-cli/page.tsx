import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "RAG CLI - A RAG That Fills Its Own Memory",
  description:
    "One Neuron, one Engram, one Effector. Recall first; if memory is thin, search and fetch the web, imprint it, answer. Related questions stay offline.",
  path: "/examples/rag-cli",
  keywords: [
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "self-updating RAG",
    "web search RAG",
    "BM25 memory",
    "minimal RAG agent",
  ],
});

export default function RagCliPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "RAG CLI", path: "/examples/rag-cli" },
        ]}
      />
      <ExampleDoc
        number="16"
        difficulty="Beginner"
        title="The smallest useful system."
        folder="16-rag-cli"
        namespace="rag-cli"
        entry="python cli.py"
        runArgs={`"what is raft"`}
        prismSrc="/prism/rag.mp4"
        lede={
          <>
            One Neuron, one Engram, one Effector. Ask a question: it recalls, and if memory does
            not cover it, searches the web, reads the pages, remembers them, and answers from what
            it just learned. Ask something related and it answers from memory, no network at all.
          </>
        }
        install={install({
          pkgs: "cosmonapse httpx python-dotenv 'mcp<2'",
          hf: true,
          note: "uv on PATH - the web Effector runs duckduckgo-mcp-server via uvx",
        })}
        run={`$ python cli.py "what is the raft consensus algorithm"   # one-shot
$ python cli.py                                          # REPL: :memory, :web <q>, :quit
$ python smoke_test.py                                   # offline end-to-end check`}
        output={`? what is the raft consensus algorithm
  ~ recall 'what is the raft consensus algorithm'
    -> 0 hit(s)
  * search {"query": "what is the raft consensus algorithm", "max_results": 5}
  * fetch  {"url": "https://raft.github.io/", "max_length": 6000}
  + imprint 24

answer  [web, 9.4s, 24 chunk(s) indexed from 3 page(s)]
Raft is a consensus algorithm designed to be understandable ... [1][3]

? how does raft elect a leader
  ~ recall 'how does raft elect a leader'
    -> 5 hit(s)

answer  [memory, 1.1s]
A leader election begins when a follower's election timeout ... [2]`}
        outputNote="Answers vary with the model and the live web. This example still carries its own hand-rolled cli.py; Receptors (Example 17) show what replaces it."
        tree={`16-rag-cli/
  config.py              settings + the llm() factory
  neurons/rag.py         THE Neuron    a stock model + three decorators
  engram/web_memory.py   THE Engram    BM25 over page chunks, via Engram.serve()
  effector/web.py        THE Effector  search + fetch, via Effector.serve()
  brain.py               three Dendrites + ask()
  cli.py                 the terminal
  smoke_test.py          offline end-to-end check`}
        sections={[
          {
            eyebrow: "01 · The Neuron",
            title: "A stock model. Three decorators make it a RAG.",
            prose: (
              <>
                <p>
                  <code className="inline">neuron_fn</code> is <code className="inline">llm()</code>{" "}
                  and nothing else. The Axon declares what the Neuron may touch, and the declaration
                  is enforced: <code className="inline">effectors=</code> without{" "}
                  <code className="inline">tool_standard=</code> fails at construction.
                </p>
                <ul>
                  <li><code className="inline">@AXON.before_task</code> recalls, and if memory is thin, searches, fetches, chunks, imprints, and recalls again.</li>
                  <li><code className="inline">@AXON.detects_output</code> treats the reply as the answer and re-attaches the sources it may cite.</li>
                  <li><code className="inline">@AXON.host.on_agent_output</code> is the chain, with one link: emit FINAL.</li>
                </ul>
              </>
            ),
            snippets: [{ name: "neurons/rag.py", code: blocks(CODE["neurons/rag.py"], ["AXON", "conclude"]) }],
          },
          {
            eyebrow: "02 · The Engram",
            title: "Storage behind two decorators.",
            prose: (
              <p>
                <code className="inline">Engram.serve()</code> gives the read and write surfaces as
                hooks: <code className="inline">@on_recall</code> runs BM25 over the page chunks,{" "}
                <code className="inline">@on_imprint</code> stores them with an eviction cap, and{" "}
                <code className="inline">@serves</code> refuses queries that are not text.
              </p>
            ),
            snippets: [{ name: "engram/web_memory.py", code: blocks(CODE["engram/web_memory.py"], ["ENGRAM", "only_text", "search", "write"]) }],
          },
          {
            eyebrow: "03 · The Effector",
            title: "The return value is the TOOL_RESULT.",
            prose: (
              <p>
                One MCP server exposes both halves of reading the internet. The hook maps friendly
                names onto the server&apos;s, and <code className="inline">@EFFECTOR.host.on_final</code>{" "}
                drops the per-trace fetch memo when the trace ends. Swap this file for a Playwright
                driver or an internal search API and nothing else changes.
              </p>
            ),
            snippets: [{ name: "effector/web.py", code: blocks(CODE["effector/web.py"], ["EFFECTOR", "_shape", "handle", "forget"]) }],
          },
          {
            eyebrow: "04 · The brain",
            title: "Three Dendrites, one ask().",
            prose: (
              <p>
                <code className="inline">ask()</code> dispatches one capability-routed TASK with{" "}
                <code className="inline">scope=&quot;terminal&quot;</code> and{" "}
                <code className="inline">finalize=False</code>, and waits for FINAL. Every RECALL,
                TOOL_CALL and IMPRINT in between rides the same trace, so Prism shows one chain per
                question. See <Link href="/examples/agent" className="inline-link">Example 14</Link>{" "}
                for the same decorators across three Neurons.
              </p>
            ),
            snippets: [{ name: "brain.py", code: stripDocstring(CODE["brain.py"]) }],
          },
        ]}
        related={[
          { href: "/examples/receptors", title: "Receptors", desc: "What replaces the 232-line hand-rolled cli.py." },
          { href: "/examples/rag", title: "Full RAG system", desc: "A staged pipeline over three Engrams." },
          { href: "/examples/agent", title: "Agent", desc: "The same pattern across a planner and two specialists." },
        ]}
      />
    </>
  );
}
