import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Real-World Neurons - Functions and MCP",
  description:
    "A plain function as a Neuron, a real MCP server as an Effector, and an HTTP Receptor that sends TASKs to one and TOOL_CALLs to the other.",
  path: "/examples/real-world-neurons",
  keywords: [
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "MCP server agent",
    "Model Context Protocol",
    "wrapping an API as an agent",
    "tool-using agents",
  ],
});

export default function RealWorldNeuronsPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Real-world Neurons", path: "/examples/real-world-neurons" },
        ]}
      />
      <ExampleDoc
        number="08"
        difficulty="Intermediate"
        title="Real-world Neurons."
        folder="08-real-world-neurons"
        namespace="quickstart"
        prismSrc="/prism/real-world-neurons.mp4"
        lede={
          <>
            A Neuron that is a plain function, a tool that is a real MCP server, and an HTTP
            boundary that is neither. Neurons think, Effectors act, Receptors listen. No token
            needed; Node 18+ runs the MCP server.
          </>
        }
        install={install({ pkgs: "'cosmonapse[receptor]' 'mcp<2'", note: "Node 18+ on PATH - the filesystem MCP server runs via npx" })}
        run={`$ python brain.py
$ curl -s localhost:8000/summarise -H 'content-type: application/json' \\
       -d '{"text": "Cosmonapse is an event-driven substrate for agents."}'
$ curl -s localhost:8000/files`}
        output={`{"summary":"Cosmonapse is an event-driven substrate for agents.","length":51}
{"listing":"[FILE] README.md\\n[FILE] brain.py\\n[DIR] effector\\n[DIR] neurons\\n[DIR] receptors"}`}
        tree={`08-real-world-neurons/
  neurons/summary.py     a plain async function behind an Axon
  effector/files.py      the filesystem MCP server, as an Effector
  receptors/api.py       POST /summarise (a TASK) + GET /files (a TOOL_CALL)
  brain.py               summary-node + files-node + api-node`}
        sections={[
          {
            eyebrow: "01 · A Neuron",
            title: "A function is enough.",
            snippets: [{ name: "neurons/summary.py", code: stripDocstring(CODE["neurons/summary.py"]) }],
          },
          {
            eyebrow: "02 · An Effector",
            title: "An MCP server is a tool, not a Neuron.",
            prose: (
              <p>
                Neurons answer TASKs; <Link href="/core/concepts" className="inline-link">Effectors</Link>{" "}
                answer TOOL_CALLs. <code className="inline">Neuron(source=&quot;mcp&quot;, ...)</code>{" "}
                is still the stdio client, but what the bus sees is an Effector: one{" "}
                <code className="inline">@on_tool_call</code> hook that forwards the call. Its
                return value becomes the TOOL_RESULT; raising puts the message on the TOOL_RESULT
                instead, and the trace carries on.
              </p>
            ),
            snippets: [{ name: "effector/files.py", code: stripDocstring(CODE["effector/files.py"]) }],
          },
          {
            eyebrow: "03 · The HTTP edge",
            title: "A TASK on one route, a TOOL_CALL on the other.",
            prose: (
              <p>
                <code className="inline">POST /summarise</code> is the Receptor&apos;s own endpoint:
                the body becomes a TASK for <code className="inline">summary</code>.{" "}
                <code className="inline">GET /files</code> is an extra route that calls the Effector
                directly with <code className="inline">call_tool</code>. Tool calls are not
                role-gated, so any node may make one.
              </p>
            ),
            snippets: [{ name: "receptors/api.py", code: stripDocstring(CODE["receptors/api.py"]) }],
          },
          {
            eyebrow: "04 · The brain",
            title: "attach_axon, attach_effector, attach_receptor.",
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
          },
        ]}
        related={[
          { href: "/examples/rag-mcp", title: "RAG + MCP", desc: "Effectors that write a generated script and run it." },
          { href: "/examples/orchestrator-api", title: "Orchestrator API", desc: "The HTTP edge in depth, including existing Flask apps." },
          { href: "/examples/agent", title: "Agent", desc: "Agents that own their tools through EffectorBindings." },
        ]}
      />
    </>
  );
}
