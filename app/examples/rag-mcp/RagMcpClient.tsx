"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

const topology = `code_pipeline(request)  -  one trace_id

  orchestrator
       |
       v
   coder  ------->  files  ------->  runner
 (worker-rag)    (worker-tools)   (worker-tools)
    |  RECALL     MCP filesystem    subprocess
    v             write_file        python fib.py 10
 VectorEngram "code-docs"
 house-style.md + review-checklist.md`;

const mcpSnippet = `<span class="tk-cm"># The MCP filesystem server, wrapped as a Neuron and sandboxed to</span>
<span class="tk-cm"># this folder. No bespoke glue  -  Neuron(source="mcp", ...) speaks MCP.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron

files <span class="tk-op">=</span> <span class="tk-fn">Neuron</span>(source<span class="tk-op">=</span><span class="tk-str">"mcp"</span>, server<span class="tk-op">=</span><span class="tk-str">"filesystem"</span>,
    args<span class="tk-op">=</span>[<span class="tk-str">"./generated"</span>], tool<span class="tk-op">=</span><span class="tk-str">"write_file"</span>)

axon <span class="tk-op">=</span> <span class="tk-fn">Axon</span>(neuron_id<span class="tk-op">=</span><span class="tk-str">"files"</span>, neuron_fn<span class="tk-op">=</span>files, capabilities<span class="tk-op">=</span>[<span class="tk-str">"write_file"</span>])`;

const coderSnippet = `<span class="tk-cm"># coder recalls the style docs for each request, then prompts the model</span>
<span class="tk-cm"># to write ONE small script that follows rules it was never trained on.</span>
<span class="tk-kw">async def</span> <span class="tk-fn">coder</span>(input, context, *, recall, imprint):
    rules <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"code-docs"</span>, query<span class="tk-op">=</span>{<span class="tk-str">"text"</span>: input[<span class="tk-str">"request"</span>]})
    prompt <span class="tk-op">=</span> <span class="tk-fn">build_prompt</span>(input[<span class="tk-str">"request"</span>], rules.hits)   <span class="tk-cm"># style guide in-context</span>
    <span class="tk-kw">return</span> {<span class="tk-str">"filename"</span>: <span class="tk-str">"fib.py"</span>, <span class="tk-str">"code"</span>: <span class="tk-kw">await</span> <span class="tk-fn">llama</span>(prompt)}`;

const runSnippet = `<span class="tk-op">$</span> pip install cosmonapse httpx python-dotenv mcp
<span class="tk-cm"># Node 18+ required  -  the filesystem MCP server runs via npx</span>
<span class="tk-op">$</span> python demo.py

<span class="tk-cm"># coder writes generated/fib.py through MCP, runner executes it,</span>
<span class="tk-cm"># prints the first 10 Fibonacci numbers, exit code 0.</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">-n</span> rag-mcp`;

export default function RagMcpClient() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Example 11 · RAG + MCP</div>
          <h1 className="page-title">A Coding Agent That Ends On Disk.</h1>
          <p className="page-sub">
            RAG-grounded code generation, combining the retrieval of{" "}
            <Link href="/examples/rag" className="inline-link">Example 10</Link> with an{" "}
            MCP-server <Link href="/concepts" className="inline-link">Neuron</Link>. A coder
            recalls the team style guide from a VectorEngram, the standard MCP filesystem server
            (wrapped as a Neuron) writes the file, and a runner executes it  -  retrieve → write
            → run, on one trace.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Topology</div>
          <h2 className="sub-title">Retrieve, write, run.</h2>
          <CodeBlock filename="topology" html={topology} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">MCP as a Neuron</div>
          <h2 className="sub-title">An MCP server is just another source.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">Neuron(source=&quot;mcp&quot;, ...)</code> wraps a stdio MCP
            server as a pure Neuron, sandboxed to the project folder. The pipeline writes{" "}
            <code className="inline">generated/&lt;name&gt;.py</code> through it  -  no custom
            tool-calling code.
          </p>
          <CodeBlock filename="files.py" html={mcpSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Grounded generation</div>
          <h2 className="sub-title">Rules from retrieval, not training.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The coder recalls a house-style guide and review checklist for each request, so the
            model follows conventions  -  entry-point guard, argparse, complexity docstrings  -
            it was never trained on. Swap the docs, change the output.
          </p>
          <CodeBlock filename="coder.py" html={coderSnippet} maxWidth={840} />
          <p className="prose" style={{ marginTop: 16, color: "var(--text-dim)", maxWidth: 760 }}>
            Note: the runner executes model-generated code on your machine. It is fine for this
            toy  -  review <code className="inline">generated/</code> before reusing the pattern.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Run it</div>
          <h2 className="sub-title">One command.</h2>
          <CodeBlock filename="terminal" html={runSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/rag" className="card">
              <div className="card-icon">→</div>
              <h3>Full RAG system</h3>
              <p>The hybrid retrieval and Engram backends this coding agent reuses.</p>
            </Link>
            <Link href="/examples/real-world-neurons" className="card">
              <div className="card-icon">→</div>
              <h3>Real-world Neurons</h3>
              <p>More on wrapping MCP servers and other real-world sources as Neurons.</p>
            </Link>
            <Link href="/examples/retry" className="card">
              <div className="card-icon">→</div>
              <h3>Retry, STOP &amp; rollback</h3>
              <p>Make a multi-stage pipeline like this one resilient to stuck or crashing stages.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
