import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "RAG + MCP Coding Agent",
  description:
    "RAG-grounded code generation that lands on disk and runs: a coder recalls the style guide, an MCP Effector writes the file, a runner Effector runs it.",
  path: "/examples/rag-mcp",
  keywords: [
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "AI coding agent",
    "MCP filesystem agent",
    "code generation agent",
    "autonomous coding harness",
  ],
});

export default function RagMcpPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "RAG + MCP", path: "/examples/rag-mcp" },
        ]}
      />
      <ExampleDoc
        number="12"
        difficulty="Advanced"
        title="RAG + MCP: a coding agent."
        folder="12-rag-mcp"
        namespace="rag-mcp"
        runArgs={`"..." --filename fib.py --argv 10`}
        prismSrc="/prism/rag-mcp.mp4"
        lede={
          <>
            Code generation grounded in the team&apos;s style guide, written to disk and executed.
            Neurons think (librarian, coder), Effectors act (the MCP filesystem server, a runner),
            and the retrieval stack is reused from{" "}
            <Link href="/examples/rag" className="inline-link">Example 11</Link>.
          </>
        }
        install={install({ pkgs: "cosmonapse httpx python-dotenv 'mcp<2'", hf: true, note: "Node 18+ on PATH - the filesystem MCP server runs via npx" })}
        run={`$ python brain.py "Code a small command-line tool that prints the first N Fibonacci numbers, where N is a positional argument." \\
      --filename fib.py --argv 10`}
        output={`  indexed house-style          2 chunks
  indexed review-checklist     2 chunks
wrote generated/fib.py  (grounded on: house-style#0, review-checklist#1, ...)
--- code --------------------------------------------------
import argparse
...
--- python fib.py 10 --------------------------------------
0
1
1
2
...
exit code: 0`}
        outputNote="The generated script varies; the pipeline and the exit code check do not. The runner executes model-written code on your machine - review generated/ before reusing the pattern."
        tree={`12-rag-mcp/
  config.py              appends ../11-rag to sys.path (VectorEngram, embeddings)
  sample_docs/           house-style.md, review-checklist.md
  neurons/librarian.py   index the docs
  neurons/coder.py       recall the docs -> HF writes one script
  effector/files.py      the filesystem MCP server, as an Effector
  effector/runner.py     run the script, capture the result
  helpers.py             index_docs(), code_pipeline()
  receptors/terminal.py  code
  brain.py               docs-node, a node per Neuron and per Effector, terminal-node`}
        sections={[
          {
            eyebrow: "01 · The coder",
            title: "Rules from retrieval, not training.",
            prose: (
              <p>
                For each request the coder recalls the house-style chunks nearest to it and prompts
                the model with them. Rules the model has never seen (an entry-point guard, argparse,
                complexity docstrings) end up in the code because retrieval put them in the prompt.
              </p>
            ),
            snippets: [{ name: "neurons/coder.py", code: blocks(CODE["neurons/coder.py"], ["make_coder_neuron", "make_axon"]) }],
          },
          {
            eyebrow: "02 · The Effectors",
            title: "Tools answer TOOL_CALLs, not TASKs.",
            prose: (
              <p>
                <code className="inline">files</code> forwards to the MCP filesystem server,
                sandboxed to the example folder. <code className="inline">runner</code> is a
                hand-written tool: a non-zero exit code is data in the TOOL_RESULT, not an error.
              </p>
            ),
            snippets: [
              { name: "effector/files.py", code: stripDocstring(CODE["effector/files.py"]) },
              { name: "effector/runner.py", code: stripDocstring(CODE["effector/runner.py"]) },
            ],
          },
          {
            eyebrow: "03 · The pipeline",
            title: "coder → write_file → run, one trace.",
            prose: (
              <p>
                One TASK, then two <code className="inline">call_tool</code>s on the same trace with
                the coder&apos;s reply as parent. A tool error rides its TOOL_RESULT; it never ends
                the trace on its own.
              </p>
            ),
            snippets: [{ name: "helpers.py", code: blocks(CODE["helpers.py"], ["code_pipeline"]) }],
          },
          {
            eyebrow: "04 · Interface and brain",
            title: "A terminal, and a node per component.",
            snippets: [
              { name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) },
              { name: "brain.py", code: brainBuilders(CODE["brain.py"]) },
            ],
          },
        ]}
        related={[
          { href: "/examples/rag", title: "Full RAG system", desc: "The retrieval stack this example reuses." },
          { href: "/examples/real-world-neurons", title: "Real-world Neurons", desc: "The smallest Effector over an MCP server." },
          { href: "/examples/claude-harness", title: "Claude-code-style harness", desc: "A coding agent with a REPL, subagents and no loop." },
        ]}
      />
    </>
  );
}
