import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS, KW_REACTIVE } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Claude-Code-Style Coding Harness",
  description:
    "A coding agent that reads, writes, runs shell commands and delegates to a subagent - choreographed over Signals, with native tool dialects and no loop.",
  path: "/examples/claude-harness",
  keywords: [
    ...KW_HARNESS,
    ...KW_REACTIVE,
    ...KW_EVENT_DRIVEN,
    "claude code alternative",
    "coding agent harness",
    "hermes tool calling",
    "subagents",
  ],
});

const assistant = CODE["neurons/model/assistant.py"];

export default function ClaudeHarnessPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Coding Harness", path: "/examples/claude-harness" },
        ]}
      />
      <ExampleDoc
        number="15"
        difficulty="Advanced"
        title="A claude-code-style harness."
        folder="15-claude-harness"
        namespace="harness"
        entry="python demo.py"
        lede={
          <>
            A terminal REPL where one assistant reads and writes files, runs shell commands,
            searches the web and delegates research to a subagent. Built as a choreographed brain:
            each &quot;loop iteration&quot; is a node creating the next TASK, and the model speaks
            its own tool dialect with no protocol taught to it.
          </>
        }
        install={install({
          pkgs: "cosmonapse httpx python-dotenv 'mcp<2' duckduckgo-mcp-server",
          note: "uv and Node 18+ on PATH. LLM_ENDPOINT + LLM_API_KEY in .env: an OpenAI-compatible completions endpoint serving Qwen2.5-Coder",
        })}
        run={`$ python smoke_test.py      # offline wiring check - no key, no MCP servers
$ python demo.py

❯ read hello.py, then rewrite it with argparse and a --shout flag
❯ what does PEP 723 allow? write a compliant single-file script demoing it
❯ /compact
❯ /memory`}
        output={`  ⏺ read {"path": "hello.py"}
  ⏺ write {"path": "hello.py", "content": "import argparse\\n..."}
  ⏺ bash {"command": "python hello.py --shout"}

Rewrote hello.py with argparse; --shout upper-cases the greeting.
[4 step(s), tools: read,write,bash]`}
        outputNote="Illustrative; steps and wording depend on the model. This example still carries its own demo.py REPL rather than a Receptor."
        tree={`15-claude-harness/
  config.py                   settings, llm() - one endpoint, three roles
  neurons/model/assistant.py  the assistant: EffectorBindings + hermes + the chain
  neurons/model/explorer.py   the subagent - research, report back as an observation
  neurons/model/compactor.py  /compact and auto-compaction
  effector/                   files, websearch, fetch (MCP) + shell (hand-written)
  engram/session_memory.py    turns, observations, the summary + a disk mirror
  brain.py                    a node per agent and tool, run_turn(), run_compact()
  demo.py                     the REPL
  smoke_test.py               offline wiring check`}
        sections={[
          {
            eyebrow: "01 · Native tool calls",
            title: "Declare the dialect, bind the tools.",
            prose: (
              <>
                <p>
                  Qwen is trained on hermes <code className="inline">&lt;tool_call&gt;</code> tags. The
                  Axon declares that and binds the Effectors each tool name lives on. Per step the
                  SDK parses the call, resolves the binding, sends TOOL_CALL, waits for TOOL_RESULT,
                  and hands the observation to the chain on AGENT_OUTPUT. The model never learns
                  Cosmonapse exists.
                </p>
                <p>
                  <code className="inline">effectors=</code> without{" "}
                  <code className="inline">tool_standard=</code> is a ValueError at construction.{" "}
                  <code className="inline">agent</code> is deliberately bound to no Effector, so the
                  parsed call passes through and the chain routes it to the explorer: the Task-tool
                  analogue.
                </p>
              </>
            ),
            snippets: [{ name: "neurons/model/assistant.py", code: blocks(assistant, ["AXON"]) }],
          },
          {
            eyebrow: "02 · The loop that is not a loop",
            title: "The assistant node creates the next TASK.",
            prose: (
              <p>
                <code className="inline">run_turn</code> dispatches one capability-routed TASK and
                waits for FINAL. Everything else happens in chain handlers: a tool observation is
                imprinted and the next <code className="inline">[&quot;assistant&quot;]</code> TASK
                goes out on the same trace; <code className="inline">agent</code> becomes an{" "}
                <code className="inline">[&quot;explorer&quot;]</code> TASK; an answer is imprinted
                and FINAL resolves the REPL.
              </p>
            ),
            snippets: [{ name: "brain.py", code: blocks(CODE["brain.py"], ["run_turn"]) }],
          },
          {
            eyebrow: "03 · Tools",
            title: "Three MCP servers and a shell.",
            prose: (
              <p>
                Files, websearch and fetch are MCP servers behind a shared adapter that maps the
                model-facing names onto each server&apos;s own. The shell is a hand-written{" "}
                <code className="inline">Effector.serve()</code> with a denylist and a timeout,
                confined to <code className="inline">workspace/</code>. The denylist is a guardrail,
                not a security boundary; permission prompts are not ported.
              </p>
            ),
            snippets: [{ name: "effector/shell.py", code: stripDocstring(CODE["effector/shell.py"]) }],
          },
          {
            eyebrow: "04 · Memory",
            title: "The transcript lives in an Engram.",
            prose: (
              <p>
                Turns, tool observations and the compacted summary are entries tagged by kind, and
                each step recalls them. The Engram&apos;s module also declares its host reaction:
                mirror summaries to <code className="inline">workspace/SESSION.md</code> through the
                files Effector.
              </p>
            ),
            snippets: [{ name: "engram/session_memory.py", code: stripDocstring(CODE["engram/session_memory.py"]) }],
            after: (
              <p>
                See <Link href="/examples/agent" className="inline-link">Example 14</Link> for the
                same choreography with a planner and two specialists.
              </p>
            ),
          },
        ]}
        related={[
          { href: "/examples/agent", title: "Agent", desc: "Choreography across a planner, research and coding." },
          { href: "/examples/rag-mcp", title: "RAG + MCP", desc: "A smaller coding pipeline: generate, save, run." },
          { href: "/examples/rag-cli", title: "RAG CLI", desc: "Engram.serve() and Effector.serve() in one small system." },
        ]}
      />
    </>
  );
}
