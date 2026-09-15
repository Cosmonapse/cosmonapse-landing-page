import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Engram - Shared Multi-Agent Memory",
  description:
    "Bind shared memory to a Neuron with EngramBinding. Call recall() and imprint() without touching the protocol - in-memory, SQLite or Postgres, one API.",
  path: "/examples/engram-integration",
  keywords: [
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "shared agent memory",
    "multi-agent memory",
    "vector memory for agents",
    "agent state management",
    "context engineering",
  ],
});

export default function EngramIntegrationPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Engram Integration", path: "/examples/engram-integration" },
        ]}
      />
      <ExampleDoc
        number="06"
        difficulty="Intermediate"
        title="Integrating an Engram."
        folder="06-engram-integration"
        namespace="demo"
        runArgs={`twice "what is the meaning of life?"`}
        prismSrc="/prism/engram-integration.mp4"
        lede={
          <>
            Shared memory over the bus. The Neuron declares an{" "}
            <code className="inline">EngramBinding</code> and gets{" "}
            <code className="inline">recall</code> and <code className="inline">imprint</code>{" "}
            injected; the <Link href="/core/concepts" className="inline-link">Engram</Link> lives on
            another node. No token needed.
          </>
        }
        install={install()}
        run={`$ python brain.py twice "what is the meaning of life?"
$ python brain.py                     # REPL - ask the same question twice`}
        output={`first call  computed -> Answer to 'what is the meaning of life?': 42
second call    cache -> Answer to 'what is the meaning of life?': 42`}
        tree={`06-engram-integration/
  engram/context.py      InMemoryEngram(engram_id="ctx")
  neurons/researcher.py  recall, compute, imprint
  receptors/terminal.py  ask, and twice (compute, then recall)
  brain.py               memory-node + researcher-node + terminal-node`}
        sections={[
          {
            eyebrow: "01 · The Engram",
            title: "A backend with an address.",
            prose: (
              <p>
                <code className="inline">engram_id=&quot;ctx&quot;</code> is the wire address.
                Swapping backends is swapping the constructor; nothing that uses the memory changes.
              </p>
            ),
            snippets: [{ name: "engram/context.py", code: stripDocstring(CODE["engram/context.py"]) }],
            after: (
              <p>
                Imprint ops: <code className="inline">add</code>, <code className="inline">append</code>,{" "}
                <code className="inline">merge</code>, <code className="inline">upsert</code>,{" "}
                <code className="inline">delete</code> (merge and upsert take a{" "}
                <code className="inline">merge_key</code>). Recall modes:{" "}
                <code className="inline">first</code>, <code className="inline">merge</code>,{" "}
                <code className="inline">all</code>.
              </p>
            ),
          },
          {
            eyebrow: "02 · The Neuron",
            title: "A pure function, plus two helpers.",
            prose: (
              <p>
                Because the Axon was built with <code className="inline">engrams=[...]</code>, the
                Neuron gains keyword-only <code className="inline">recall</code> and{" "}
                <code className="inline">imprint</code>. Each call emits RECALL or IMPRINT on the
                current trace and awaits the reply from whichever node attached{" "}
                <code className="inline">ctx</code>. The binding maps a local name to the wire id, so
                ops can repoint the memory without editing the Neuron.
              </p>
            ),
            snippets: [{ name: "neurons/researcher.py", code: stripDocstring(CODE["neurons/researcher.py"]) }],
          },
          {
            eyebrow: "03 · The interface",
            title: "Ask once to compute, once to recall.",
            prose: (
              <p>
                The memory lives on the Engram node, not in the interface. In the REPL a repeated
                question comes back from the cache; <code className="inline">twice</code> shows the
                same thing in one command.
              </p>
            ),
            snippets: [{ name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) }],
          },
          {
            eyebrow: "04 · The brain",
            title: "Memory, Neuron and interface on three nodes.",
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
          },
        ]}
        related={[
          { href: "/examples/rag", title: "Full RAG system", desc: "Three Engrams, hybrid recall, an answer cache." },
          { href: "/examples/retry", title: "Retry & rollback", desc: "Undo a half-finished imprint with the saga journal." },
          { href: "/examples/agent", title: "Agent", desc: "An agent whose progress lives in an Engram, not a loop." },
        ]}
      />
    </>
  );
}
