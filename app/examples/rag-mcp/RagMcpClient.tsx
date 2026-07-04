"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";

// ---------------------------------------------------------------------------
// Snippets  -  kept in sync with cosmonapse-examples/12-rag-mcp/
// ---------------------------------------------------------------------------

const topologySnippet = `<span class="tk-fn">code_pipeline</span>(request)   -   one trace_id

  orchestrator
       |
       v
   coder  -------&gt;  files  -------&gt;  runner
 (worker-rag)    (worker-tools)   (worker-tools)
    |  RECALL     MCP filesystem    subprocess
    v             write_file        python fib.py <span class="tk-num">10</span>
 VectorEngram <span class="tk-str">"code-docs"</span>
 house-style.md + review-checklist.md`;
const installSnippet = `<span class="tk-cm"># Python 3.11+. The filesystem MCP server runs via npx, so Node 18+</span>
<span class="tk-cm"># is required. mcp is the client library Neuron(source="mcp") uses.</span>
<span class="tk-op">$</span> pip install cosmonapse httpx python-dotenv mcp

<span class="tk-cm"># A real token in cosmonapse-examples/.env  -  the coder calls Llama-3.1.</span>
<span class="tk-op">$</span> export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxx`;
const reuseSnippet = `<span class="tk-cm"># This example reuses the VectorEngram + embeddings from Example 10</span>
<span class="tk-cm"># verbatim - one import path away. Nothing about retrieval is re-built.</span>
<span class="tk-kw">import</span> sys
<span class="tk-kw">from</span> pathlib <span class="tk-kw">import</span> Path

_HERE <span class="tk-op">=</span> Path(__file__).<span class="tk-fn">resolve</span>().parent
sys.path.<span class="tk-fn">insert</span>(<span class="tk-num">0</span>, <span class="tk-fn">str</span>(_HERE.parent / <span class="tk-str">"11-rag"</span>))   <span class="tk-cm"># VectorEngram, embeddings</span>

<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, EngramBinding, Neuron, new_trace_id
<span class="tk-kw">from</span> embeddings <span class="tk-kw">import</span> chunk_text, embed             <span class="tk-cm"># from 11-rag</span>
<span class="tk-kw">from</span> vector_engram <span class="tk-kw">import</span> VectorEngram               <span class="tk-cm"># from 11-rag</span>

NAMESPACE <span class="tk-op">=</span> <span class="tk-str">"rag-mcp"</span>
GEN_MODEL <span class="tk-op">=</span> <span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>
OUT_DIR <span class="tk-op">=</span> <span class="tk-str">"generated"</span>`;
const librarianSnippet = `<span class="tk-cm"># librarian: index the team's reference docs into the code-docs engram,</span>
<span class="tk-cm"># so the coder can recall house rules the model was never trained on.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">librarian_neuron</span>(input, context, *, imprint):
    doc_id <span class="tk-op">=</span> input[<span class="tk-str">"doc_id"</span>]
    chunks <span class="tk-op">=</span> <span class="tk-fn">chunk_text</span>(input[<span class="tk-str">"text"</span>])
    vectors <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">embed</span>(chunks, api_key<span class="tk-op">=</span><span class="tk-fn">_hf_token</span>())
    <span class="tk-kw">for</span> i, (chunk, vec) <span class="tk-kw">in</span> <span class="tk-fn">enumerate</span>(<span class="tk-fn">zip</span>(chunks, vectors)):
        <span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"docs"</span>, op<span class="tk-op">=</span><span class="tk-str">"upsert"</span>,
                      entry<span class="tk-op">=</span>{<span class="tk-str">"doc_id"</span>: doc_id, <span class="tk-str">"chunk_index"</span>: i,
                             <span class="tk-str">"text"</span>: chunk, <span class="tk-str">"embedding"</span>: vec},
                      merge_key<span class="tk-op">=</span><span class="tk-str">f"{doc_id}:{i}"</span>,
                      await_ack<span class="tk-op">=</span>(i == <span class="tk-fn">len</span>(chunks) - <span class="tk-num">1</span>), deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"doc_id"</span>: doc_id, <span class="tk-str">"chunks"</span>: <span class="tk-fn">len</span>(chunks)}`;
const coderSnippet = `<span class="tk-cm"># coder: recall the style docs for THIS request, put them in-context,</span>
<span class="tk-cm"># and have Llama write ONE small script that follows rules from retrieval.</span>
<span class="tk-kw">def</span> <span class="tk-fn">make_coder_neuron</span>():
    llm <span class="tk-op">=</span> Neuron(source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>, endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
                 model<span class="tk-op">=</span>GEN_MODEL, api_key<span class="tk-op">=</span><span class="tk-fn">_hf_token</span>(), use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>,
                 max_new_tokens<span class="tk-op">=</span><span class="tk-num">1024</span>, temperature<span class="tk-op">=</span><span class="tk-num">0.1</span>)

    <span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">coder_neuron</span>(input, context, *, recall):
        request <span class="tk-op">=</span> input[<span class="tk-str">"request"</span>]
        qvec <span class="tk-op">=</span> (<span class="tk-kw">await</span> <span class="tk-fn">embed</span>([request], api_key<span class="tk-op">=</span><span class="tk-fn">_hf_token</span>()))[<span class="tk-num">0</span>]
        result <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"docs"</span>, query<span class="tk-op">=</span>{<span class="tk-str">"embedding"</span>: qvec, <span class="tk-str">"top_k"</span>: TOP_K},
                              deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)
        guide <span class="tk-op">=</span> <span class="tk-str">"\n\n---\n\n"</span>.<span class="tk-fn">join</span>(h.entry[<span class="tk-str">"text"</span>] <span class="tk-kw">for</span> h <span class="tk-kw">in</span> result.hits)
        sources <span class="tk-op">=</span> [<span class="tk-str">f"{h.entry['doc_id']}#{h.entry['chunk_index']}"</span> <span class="tk-kw">for</span> h <span class="tk-kw">in</span> result.hits]

        messages <span class="tk-op">=</span> [
            {<span class="tk-str">"role"</span>: <span class="tk-str">"system"</span>, <span class="tk-str">"content"</span>: CODER_SYSTEM},
            {<span class="tk-str">"role"</span>: <span class="tk-str">"user"</span>, <span class="tk-str">"content"</span>: <span class="tk-str">f"House-style context:\n\n{guide}\n\nRequest: {request}"</span>},
        ]
        out <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">llm</span>({<span class="tk-str">"messages"</span>: messages}, [])
        code <span class="tk-op">=</span> <span class="tk-fn">extract_code</span>(out[<span class="tk-str">"response"</span>])          <span class="tk-cm"># pull the fenced block</span>
        <span class="tk-kw">if</span> code <span class="tk-kw">is</span> <span class="tk-kw">None</span>:
            <span class="tk-kw">return</span> {<span class="tk-str">"__error__"</span>: <span class="tk-kw">True</span>, <span class="tk-str">"message"</span>: <span class="tk-str">"coder produced no usable code"</span>}
        <span class="tk-kw">return</span> {<span class="tk-str">"filename"</span>: input[<span class="tk-str">"filename"</span>], <span class="tk-str">"code"</span>: code, <span class="tk-str">"sources"</span>: sources}

    <span class="tk-kw">return</span> coder_neuron`;
const mcpSnippet = `<span class="tk-cm"># files: the STANDARD MCP filesystem server, wrapped as a Neuron and</span>
<span class="tk-cm"># sandboxed to this folder. Neuron(source="mcp", ...) speaks MCP for you -</span>
<span class="tk-cm"># no bespoke tool-calling glue. The orchestrator dispatches to it like any</span>
<span class="tk-cm"># other Neuron; the input names the MCP tool and its arguments.</span>
worker_b.<span class="tk-fn">attach_axon</span>(Axon(
    neuron_id<span class="tk-op">=</span><span class="tk-str">"files"</span>,
    neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"mcp"</span>, server<span class="tk-op">=</span><span class="tk-str">"filesystem"</span>, args<span class="tk-op">=</span>[<span class="tk-fn">str</span>(_HERE)]),
    capabilities<span class="tk-op">=</span>[<span class="tk-str">"mcp"</span>, <span class="tk-str">"filesystem"</span>],
))`;
const runnerSnippet = `<span class="tk-cm"># runner: execute the generated script in a subprocess with a 10s</span>
<span class="tk-cm"># timeout, capture stdout/stderr + exit code.</span>
<span class="tk-cm">#</span>
<span class="tk-cm"># NOTE: this runs LLM-generated code on your machine. Fine for this toy;</span>
<span class="tk-cm"># review generated/ before trusting the pattern with anything real.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">runner_neuron</span>(input, context):
    path <span class="tk-op">=</span> Path(input[<span class="tk-str">"path"</span>])
    proc <span class="tk-op">=</span> <span class="tk-kw">await</span> asyncio.<span class="tk-fn">create_subprocess_exec</span>(
        sys.executable, <span class="tk-fn">str</span>(path), *input.<span class="tk-fn">get</span>(<span class="tk-str">"argv"</span>, []),
        stdout<span class="tk-op">=</span>asyncio.subprocess.PIPE, stderr<span class="tk-op">=</span>asyncio.subprocess.PIPE, cwd<span class="tk-op">=</span><span class="tk-fn">str</span>(_HERE))
    <span class="tk-kw">try</span>:
        stdout, stderr <span class="tk-op">=</span> <span class="tk-kw">await</span> asyncio.<span class="tk-fn">wait_for</span>(proc.<span class="tk-fn">communicate</span>(), timeout<span class="tk-op">=</span><span class="tk-num">10</span>)
    <span class="tk-kw">except</span> asyncio.TimeoutError:
        proc.<span class="tk-fn">kill</span>()
        <span class="tk-kw">return</span> {<span class="tk-str">"exit_code"</span>: -<span class="tk-num">1</span>, <span class="tk-str">"stdout"</span>: <span class="tk-str">""</span>, <span class="tk-str">"stderr"</span>: <span class="tk-str">"timeout after 10s"</span>}
    <span class="tk-kw">return</span> {<span class="tk-str">"exit_code"</span>: proc.returncode,
            <span class="tk-str">"stdout"</span>: stdout.<span class="tk-fn">decode</span>(errors<span class="tk-op">=</span><span class="tk-str">"replace"</span>),
            <span class="tk-str">"stderr"</span>: stderr.<span class="tk-fn">decode</span>(errors<span class="tk-op">=</span><span class="tk-str">"replace"</span>)}`;
const wireSnippet = `<span class="tk-cm"># build_codegen: 1 engram host + 2 workers + orchestrator.</span>
<span class="tk-kw">def</span> <span class="tk-fn">build_codegen</span>(synapse):
    docs <span class="tk-op">=</span> VectorEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"code-docs"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"semantic"</span>)

    host <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                    dendrite_id<span class="tk-op">=</span><span class="tk-str">"docs-host"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    host.<span class="tk-fn">attach_engram</span>(docs)
    bind_docs <span class="tk-op">=</span> [EngramBinding(name<span class="tk-op">=</span><span class="tk-str">"docs"</span>, directed_id<span class="tk-op">=</span><span class="tk-str">"code-docs"</span>)]

    worker_a <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"worker-rag"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker_a.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"librarian"</span>, neuron_fn<span class="tk-op">=</span>librarian_neuron,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"docs-ingest"</span>], engrams<span class="tk-op">=</span>bind_docs))
    worker_a.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"coder"</span>, neuron_fn<span class="tk-op">=</span><span class="tk-fn">make_coder_neuron</span>(),
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"codegen"</span>], engrams<span class="tk-op">=</span>bind_docs))

    worker_b <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"worker-tools"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker_b.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"files"</span>,
        neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"mcp"</span>, server<span class="tk-op">=</span><span class="tk-str">"filesystem"</span>, args<span class="tk-op">=</span>[<span class="tk-fn">str</span>(_HERE)]),
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"mcp"</span>, <span class="tk-str">"filesystem"</span>]))
    worker_b.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"runner"</span>, neuron_fn<span class="tk-op">=</span>runner_neuron,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"execute"</span>]))

    orchestrator <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                            dendrite_id<span class="tk-op">=</span><span class="tk-str">"codegen-api"</span>, role<span class="tk-op">=</span><span class="tk-str">"orchestrator"</span>)
    <span class="tk-kw">return</span> [host, worker_a, worker_b, orchestrator], orchestrator`;
const pipelineSnippet = `<span class="tk-cm"># coder -&gt; files(write_file) -&gt; runner, all on one trace_id.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">code_pipeline</span>(orchestrator, request, filename, argv<span class="tk-op">=</span><span class="tk-kw">None</span>, timeout_s<span class="tk-op">=</span><span class="tk-num">90.0</span>):
    tid <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()

    <span class="tk-cm"># 1. RAG-grounded generation.</span>
    r <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(neuron<span class="tk-op">=</span><span class="tk-str">"coder"</span>,
        input<span class="tk-op">=</span>{<span class="tk-str">"request"</span>: request, <span class="tk-str">"filename"</span>: filename},
        trace_id<span class="tk-op">=</span>tid, timeout_s<span class="tk-op">=</span>timeout_s)
    <span class="tk-kw">if</span> r.type.value == <span class="tk-str">"ERROR"</span>:
        <span class="tk-kw">raise</span> RuntimeError(<span class="tk-str">f"coder failed: {r.payload.get('message')}"</span>)
    gen <span class="tk-op">=</span> r.payload[<span class="tk-str">"output"</span>]

    <span class="tk-cm"># 2. Persist through the MCP filesystem server.</span>
    rel_path <span class="tk-op">=</span> <span class="tk-str">f"{OUT_DIR}/{gen['filename']}"</span>
    r <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(neuron<span class="tk-op">=</span><span class="tk-str">"files"</span>,
        input<span class="tk-op">=</span>{<span class="tk-str">"tool"</span>: <span class="tk-str">"write_file"</span>,
               <span class="tk-str">"arguments"</span>: {<span class="tk-str">"path"</span>: <span class="tk-fn">str</span>(_HERE / rel_path), <span class="tk-str">"content"</span>: gen[<span class="tk-str">"code"</span>]}},
        trace_id<span class="tk-op">=</span>tid, parent_id<span class="tk-op">=</span>r.id, timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>)

    <span class="tk-cm"># 3. Run it.</span>
    r <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(neuron<span class="tk-op">=</span><span class="tk-str">"runner"</span>,
        input<span class="tk-op">=</span>{<span class="tk-str">"path"</span>: rel_path, <span class="tk-str">"argv"</span>: argv <span class="tk-kw">or</span> []},
        trace_id<span class="tk-op">=</span>tid, parent_id<span class="tk-op">=</span>r.id, timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"filename"</span>: rel_path, <span class="tk-str">"code"</span>: gen[<span class="tk-str">"code"</span>],
            <span class="tk-str">"sources"</span>: gen[<span class="tk-str">"sources"</span>], <span class="tk-str">"run"</span>: r.payload[<span class="tk-str">"output"</span>]}`;
const runSnippet = `<span class="tk-cm"># Indexes the style docs, then asks the pipeline to write, save (via the</span>
<span class="tk-cm"># MCP server) and run a tiny Fibonacci CLI.</span>
<span class="tk-op">$</span> python demo.py
indexed house-style          3 chunks
indexed review-checklist     2 chunks

request: Code a small command-line tool that prints the first N Fibonacci numbers.
wrote generated/fib.py  (grounded on: house-style#0, review-checklist#1)
<span class="tk-op">--</span>- run: python fib.py 10 <span class="tk-op">--</span>-
0 1 1 2 3 5 8 13 21 34
exit code: 0

<span class="tk-cm"># Watch the retrieve -&gt; write -&gt; run trace animate in the browser.</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">-n</span> rag-mcp`;

const prismWatchSnippet = `<span class="tk-cm"># This demo runs in-process on a MemorySynapse, which Prism can't attach to.</span>
<span class="tk-cm"># To watch it live, start a dev synapse and point the code at it:</span>

<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace=rag-mcp

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url=cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> rag-mcp

<span class="tk-cm"># in the code  -  swap one line:</span>
<span class="tk-cm"># synapse = MemorySynapse()</span>
synapse = await connect_synapse("cosmo://127.0.0.1:7070")`;

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
            → run, on one trace. We build it stage by stage; every snippet is the real code from{" "}
            <code className="inline">cosmonapse-examples/12-rag-mcp</code>.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Topology</div>
          <h2 className="sub-title">Retrieve, write, run.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Three Neurons across two workers, one VectorEngram for the style docs, all on a single{" "}
            <code className="inline">trace_id</code>. The steps below build each box, then the
            pipeline that connects them.
          </p>
          <CodeBlock filename="topology" html={topologySnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">00 · Install</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 16 }}>
            Python 3.11+ and Node 18+  -  the filesystem MCP server runs via{" "}
            <code className="inline">npx</code>, and <code className="inline">mcp</code> is the
            client library <code className="inline">Neuron(source=&quot;mcp&quot;)</code> drives.
          </p>
          <CodeBlock html={installSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">01 · Reuse the retrieval stack</div>
          <h2 className="sub-title">Import Example 10, don&apos;t rebuild it.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The <code className="inline">VectorEngram</code> and the embed / chunk helpers come
            straight from <code className="inline">11-rag</code> on the path. The coding agent adds
            new Neurons on top of an unchanged retrieval backend  -  that reuse is the whole point.
          </p>
          <CodeBlock filename="brain.py" html={reuseSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">02 · The librarian</div>
          <h2 className="sub-title">Index the house style.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Same shape as the RAG ingester, single index: chunk, embed, and imprint the team&apos;s
            style guide and review checklist into <code className="inline">code-docs</code>. These
            are the rules the model will follow at generation time without ever being trained on
            them.
          </p>
          <CodeBlock filename="brain.py" html={librarianSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">03 · The coder</div>
          <h2 className="sub-title">Rules from retrieval, not training.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The coder recalls the most relevant style chunks for each request, drops them into the
            system context, and asks Llama-3.1 for exactly one fenced script.{" "}
            <code className="inline">extract_code()</code> pulls the block out of the reply. Swap
            the indexed docs and the generated code changes  -  no prompt edits.
          </p>
          <CodeBlock filename="brain.py" html={coderSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">04 · MCP as a Neuron</div>
          <h2 className="sub-title">An MCP server is just another source.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">Neuron(source=&quot;mcp&quot;, ...)</code> wraps a stdio MCP
            server as a pure Neuron, sandboxed to the project folder. The pipeline writes{" "}
            <code className="inline">generated/&lt;name&gt;.py</code> through it  -  no custom
            tool-calling code, and any of the dozens of community MCP servers drops in the same way.
          </p>
          <CodeBlock filename="brain.py" html={mcpSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">05 · The runner</div>
          <h2 className="sub-title">Execute, capture, report.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            A plain Neuron that shells out to the generated file, captures its output, and returns
            the exit code. It closes the loop  -  the agent doesn&apos;t just write code, it proves
            the code runs.
          </p>
          <CodeBlock filename="brain.py" html={runnerSnippet} maxWidth={880} />
          <p className="prose" style={{ marginTop: 16, color: "var(--text-dim)", maxWidth: 760 }}>
            Note: the runner executes model-generated code on your machine. It is fine for this
            toy  -  review <code className="inline">generated/</code> before reusing the pattern.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">06 · Wire the topology</div>
          <h2 className="sub-title">Two workers, one engram host.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">worker-rag</code> hosts the librarian and coder (both bound to{" "}
            <code className="inline">code-docs</code>); <code className="inline">worker-tools</code>{" "}
            hosts the MCP files Neuron and the runner. The orchestrator drives all three pipeline
            stages.
          </p>
          <CodeBlock filename="brain.py" html={wireSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">07 · The pipeline</div>
          <h2 className="sub-title">coder → files → runner, one trace.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Three <code className="inline">dispatch_and_wait</code> calls threaded by{" "}
            <code className="inline">trace_id</code> / <code className="inline">parent_id</code>:
            generate the code, persist it through the MCP server, then run it. One coherent trace
            from request to exit code.
          </p>
          <CodeBlock filename="brain.py" html={pipelineSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">08 · Run it</div>
          <h2 className="sub-title">One command.</h2>
          <CodeBlock filename="terminal" html={runSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Watch it in Prism</div>
          <h2 className="sub-title">See the Signals fire in the browser.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">cosmo doppler --prism</code> opens a live, read-only view of
            every Signal on the bus  -  REGISTER, TASK, AGENT_OUTPUT, FINAL  -  as the workflow
            runs. The demo runs in-process on a <code className="inline">MemorySynapse</code>,
            which Prism can&apos;t attach to, so start a dev synapse and point the code at it.
          </p>
          <CodeBlock filename="terminal" html={prismWatchSnippet} maxWidth={880} />
          <div style={{ marginTop: 24 }}>
            <PrismPreview namespace="rag-mcp" src="/prism/rag-mcp.mp4" />
          </div>
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
