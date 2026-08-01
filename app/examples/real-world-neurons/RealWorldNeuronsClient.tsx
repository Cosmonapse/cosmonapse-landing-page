"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";
import ComboExample, {
  type Combo,
  type ComboData,
  type Step,
} from "@/components/ComboExample";
import { PY_URL, isPython, scaffoldStep, brokerStep, runStep } from "../_shared";

// ===========================================================================
// Install  -  the worker needs the MCP source; the web edge needs a framework.
// ===========================================================================

const INSTALL_HTML: Record<Combo, string> = {
  "py-dev": `<span class="tk-cm"># SDK + CLI, plus the soft deps used here</span>
pip install <span class="tk-op">-e</span> cosmonapse-core/packages/python-sdk
pip install flask mcp        <span class="tk-cm"># flask = the web edge · mcp = the MCP worker</span>

<span class="tk-cm"># The filesystem MCP server is published on npm; npx fetches it on first run</span>
<span class="tk-op">$</span> node <span class="tk-op">--</span>version    <span class="tk-cm"># any Node 18+ provides npx</span>`,

  "py-nats": `<span class="tk-cm"># SDK with the NATS extra + the source deps</span>
pip install <span class="tk-str">"cosmonapse"</span>
pip install flask mcp`,

  "py-kafka": `<span class="tk-cm"># SDK with the Kafka extra + the source deps</span>
pip install <span class="tk-str">"cosmonapse"</span>
pip install flask mcp`,

};

function installStep(combo: Combo): Step {
  return {
    eyebrow: "Install",
    prose: (
      <>
        An <strong>HTTP API is not a Neuron</strong>. The worker hosts a real
        Neuron (the filesystem MCP server); the web framework stays on the{" "}
        <em>outside</em> as an HTTP boundary and dispatches TASKs from its route
        handlers. You only install what the pieces you use require.
      </>
    ),
    html: INSTALL_HTML[combo],
    maxWidth: 760,
  };
}

// ===========================================================================
// Python  -  the worker (MCP + a plain function) and the Flask web edge.
// Only SYNAPSE_URL changes between dev / NATS / Kafka.
// ===========================================================================

const pyWorker = (url: string) => `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron, Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>   <span class="tk-cm"># ← the only line that changes per transport</span>
NAMESPACE   <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>

<span class="tk-cm"># A Neuron is a plain async function  -  zero protocol knowledge.</span>
<span class="tk-kw">async def</span> <span class="tk-fn">summarise</span>(input, context):
    text <span class="tk-op">=</span> input.get(<span class="tk-str">"text"</span>, <span class="tk-str">""</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"summary"</span>: text[:<span class="tk-num">120</span>], <span class="tk-str">"length"</span>: len(text)}

<span class="tk-cm"># The standard filesystem MCP server, wrapped as a Neuron (wrapper only).</span>
files <span class="tk-op">=</span> Neuron(source<span class="tk-op">=</span><span class="tk-str">"mcp"</span>, server<span class="tk-op">=</span><span class="tk-str">"filesystem"</span>, args<span class="tk-op">=</span>[<span class="tk-str">"."</span>])

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> connect_synapse(SYNAPSE_URL)
    <span class="tk-cm"># role="worker"  -  hosts Axons and replies to TASKs, never dispatches.</span>
    worker <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                      dendrite_id<span class="tk-op">=</span><span class="tk-str">"workers"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker.attach_axon(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"summary"</span>, neuron_fn<span class="tk-op">=</span>summarise,
                            capabilities<span class="tk-op">=</span>[<span class="tk-str">"summarise"</span>]))
    worker.attach_axon(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"files"</span>, neuron_fn<span class="tk-op">=</span>files,
                            capabilities<span class="tk-op">=</span>[<span class="tk-str">"mcp"</span>, <span class="tk-str">"filesystem"</span>]))
    <span class="tk-kw">async with</span> worker:
        print(<span class="tk-str">"workers ready"</span>)
        <span class="tk-kw">await</span> asyncio.Event().wait()

asyncio.run(main())`;

const pyServer = (url: string) => `<span class="tk-kw">import</span> asyncio, concurrent.futures, threading
<span class="tk-kw">from</span> flask <span class="tk-kw">import</span> Flask, request, jsonify
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse, new_trace_id

<span class="tk-cm"># asyncio loop in a background thread  -  Flask stays synchronous.</span>
loop <span class="tk-op">=</span> asyncio.new_event_loop()
threading.Thread(target<span class="tk-op">=</span>loop.run_forever, daemon<span class="tk-op">=</span><span class="tk-kw">True</span>).start()
pending <span class="tk-op">=</span> {}
orch <span class="tk-op">=</span> <span class="tk-kw">None</span>

<span class="tk-kw">async def</span> <span class="tk-fn">setup</span>():
    <span class="tk-kw">global</span> orch
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> connect_synapse(<span class="tk-str">"${url}"</span>)
    <span class="tk-cm"># role="orchestrator"  -  dispatches TASKs and collects AGENT_OUTPUT.</span>
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>,
                    dendrite_id<span class="tk-op">=</span><span class="tk-str">"http-edge"</span>, role<span class="tk-op">=</span><span class="tk-str">"orchestrator"</span>)

    <span class="tk-op">@</span>orch.on_agent_output            <span class="tk-cm"># the Dendrite decorator, right here in the app</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">on_output</span>(sig):
        fut <span class="tk-op">=</span> pending.pop(sig.trace_id, <span class="tk-kw">None</span>)
        <span class="tk-kw">if</span> fut <span class="tk-kw">and not</span> fut.done(): fut.set_result(sig.payload[<span class="tk-str">"output"</span>])

    <span class="tk-kw">await</span> orch.start()

asyncio.run_coroutine_threadsafe(setup(), loop).result(timeout<span class="tk-op">=</span><span class="tk-num">10</span>)

app <span class="tk-op">=</span> Flask(__name__)

<span class="tk-kw">def</span> <span class="tk-fn">ask</span>(neuron, payload):
    trace_id <span class="tk-op">=</span> new_trace_id()
    fut <span class="tk-op">=</span> concurrent.futures.Future()
    pending[trace_id] <span class="tk-op">=</span> fut
    <span class="tk-kw">async def</span> <span class="tk-fn">go</span>():
        <span class="tk-kw">await</span> orch.dispatch_task(neuron<span class="tk-op">=</span>neuron, input<span class="tk-op">=</span>payload, trace_id<span class="tk-op">=</span>trace_id)
    asyncio.run_coroutine_threadsafe(go(), loop).result(timeout<span class="tk-op">=</span><span class="tk-num">5</span>)
    <span class="tk-kw">return</span> fut.result(timeout<span class="tk-op">=</span><span class="tk-num">15</span>)

<span class="tk-op">@</span>app.post(<span class="tk-str">"/summarise"</span>)
<span class="tk-kw">def</span> <span class="tk-fn">summarise</span>():
    <span class="tk-kw">return</span> jsonify(ask(<span class="tk-str">"summary"</span>, {<span class="tk-str">"text"</span>: request.get_json()[<span class="tk-str">"text"</span>]}))

<span class="tk-op">@</span>app.post(<span class="tk-str">"/files"</span>)
<span class="tk-kw">def</span> <span class="tk-fn">files</span>():
    <span class="tk-kw">return</span> jsonify(ask(<span class="tk-str">"files"</span>, {<span class="tk-str">"tool"</span>: <span class="tk-str">"list_directory"</span>, <span class="tk-str">"arguments"</span>: {<span class="tk-str">"path"</span>: <span class="tk-str">"."</span>}}))

app.run(port<span class="tk-op">=</span><span class="tk-num">5000</span>)`;

const outputSnippet = `<span class="tk-op">$</span> curl <span class="tk-op">-s</span> <span class="tk-op">-X</span> POST localhost:5000/summarise <span class="tk-op">\\</span>
       <span class="tk-op">-H</span> <span class="tk-str">"Content-Type: application/json"</span> <span class="tk-op">-d</span> <span class="tk-str">'{"text": "API at the edge"}'</span>
<span class="tk-cm">{"summary": "API at the edge", "length": 15}</span>

<span class="tk-op">$</span> curl <span class="tk-op">-s</span> <span class="tk-op">-X</span> POST localhost:5000/files
<span class="tk-cm">{"response": "[FILE] app.py\\n[FILE] brain.py\\n[FILE] worker.py\\n[DIR]  data", ...}</span>`;

// ---------------------------------------------------------------------------
// Per-combo step assembly
// ---------------------------------------------------------------------------

function pyData(combo: "py-dev" | "py-nats" | "py-kafka"): ComboData {
  const url = PY_URL[combo];
  const broker = brokerStep(combo);
  const last = runStep(combo, [
    { label: "the worker", cmd: "python worker.py" },
    { label: "the web edge", cmd: "python app.py" },
  ]);
  last.afterProse = (
    <>The route dispatches a TASK and blocks on the matching AGENT_OUTPUT:</>
  );
  last.html2 = outputSnippet;
  return {
    steps: [
      installStep(combo),
      ...(isPython(combo) ? [scaffoldStep("real-world-neurons")] : []),
      ...(broker ? [broker] : []),
      {
        eyebrow: "Worker  -  real Neurons behind Axons",
        prose: (
          <>
            A plain async function and the filesystem{" "}
            <code className="inline">Neuron(source=&quot;mcp&quot;)</code> sit on a{" "}
            <code className="inline">role=&quot;worker&quot;</code> Dendrite. Neither knows
            anything about HTTP  -  they just map a TASK to a result.
          </>
        ),
        filename: "worker.py",
        html: pyWorker(url),
      },
      {
        eyebrow: "Web edge  -  Flask in front of an orchestrator Dendrite",
        prose: (
          <>
            The API is <em>not</em> a Neuron. Flask owns a{" "}
            <code className="inline">role=&quot;orchestrator&quot;</code> Dendrite and uses
            its <code className="inline">@orch.on_agent_output</code> decorator
            directly. Each route dispatches a TASK and blocks on a{" "}
            <code className="inline">concurrent.futures.Future</code> keyed by{" "}
            <code className="inline">trace_id</code>.
          </>
        ),
        filename: "server.py",
        html: pyServer(url),
      },
      last,
    ],
    extend: extendBody(combo),
  };
}

function extendBody(combo: Combo): React.ReactNode {
  return (
    <>
      <p>
        <strong>Any MCP server.</strong> Swap{" "}
        <code className="inline">server=&quot;filesystem&quot;</code> for{" "}
        <code className="inline">&quot;git&quot;</code>,{" "}
        <code className="inline">&quot;fetch&quot;</code>, or{" "}
        <code className="inline">&quot;memory&quot;</code>  -  or point{" "}
        <code className="inline">command</code>/<code className="inline">args</code>{" "}
        at any other stdio MCP server you have.
      </p>
      <p>
        <strong>Any framework.</strong> Flask, FastAPI, Django, Starlette  -  the
        edge is ordinary web code. It is <em>not</em> a Neuron; it just owns an
        orchestrator Dendrite and dispatches TASKs from its handlers. Existing
        services gain a Cosmonapse mesh with no change to what a Neuron is.
      </p>
      <p>
        <strong>Mix in LLMs.</strong> Add a worker with{" "}
        <code className="inline">Neuron(source=&quot;huggingface&quot;, model=&quot;meta-llama/Llama-3.1-8B-Instruct&quot;)</code>{" "}
         -  or swap <code className="inline">source=&quot;ollama&quot;</code> for a local
        model. The orchestrator dispatches to it the same way. Route by{" "}
        <code className="inline">capabilities</code> to pick the right Neuron per
        task.
      </p>
          <p>
      <strong>Change transport.</strong> Every other tab is the same topology
       -  only the install, the synapse you connect to, and the launch commands
      change. The Neuron wiring is byte-for-byte identical.
    </p>
  
    </>
  );
}

const DATA: Record<Combo, ComboData> = {
  "py-dev": pyData("py-dev"),
  "py-nats": pyData("py-nats"),
  "py-kafka": pyData("py-kafka"),
};

const prismWatchSnippet = `<span class="tk-cm"># This demo runs in-process on a MemorySynapse, which Prism can't attach to.</span>
<span class="tk-cm"># To watch it live, start a dev synapse and point the code at it:</span>

<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace=quickstart

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo prism <span class="tk-op">--</span>url=cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> quickstart

<span class="tk-cm"># in the code  -  swap one line:</span>
<span class="tk-cm"># synapse = MemorySynapse()</span>
synapse = await connect_synapse("cosmo://127.0.0.1:7070")`;

export default function RealWorldNeuronsClient() {
  return (
    <>
      <div className="example-breadcrumb">
        <div className="container">
          <Link href="/examples" className="breadcrumb-back">
            ← Examples
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Real-world Neurons</span>
        </div>
      </div>

      <header className="page-header" style={{ marginBottom: 24 }}>
        <div className="container">
          <div className="page-eyebrow">// 04 · Real-world Neurons</div>
          <h1 className="page-title">
            An MCP Server Is a Neuron.
            <br />
            Your API Is the Edge.
          </h1>
          <p className="page-sub">
            A Neuron is <em>anything that interacts with the real world</em>  -  a
            function, a wrapped stdio <strong>MCP server</strong>, an LLM. An HTTP{" "}
            <strong>API is not a Neuron</strong>: your web framework (Flask /
            FastAPI) stays on the outside as an HTTP boundary and dispatches TASKs
            from its route handlers via an orchestrator Dendrite. The same
            topology runs over three transports  -  pick one below.
          </p>
        </div>
      </header>

      <ComboExample data={DATA} defaultCombo="py-dev" />

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Watch it in Prism</div>
          <h2 className="sub-title">See the Signals fire in the browser.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">cosmo prism</code> opens a live, read-only view of
            every Signal on the bus  -  REGISTER, TASK, AGENT_OUTPUT, FINAL  -  as the workflow
            runs. The demo runs in-process on a <code className="inline">MemorySynapse</code>,
            which Prism can&apos;t attach to, so start a dev synapse and point the code at it.
          </p>
          <CodeBlock filename="terminal" html={prismWatchSnippet} maxWidth={880} />
          <div style={{ marginTop: 24 }}>
            <PrismPreview namespace="quickstart" src="/prism/real-world-neurons.mp4" />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/capability-routing" className="card">
              <div className="card-icon">→</div>
              <h3>Capability routing</h3>
              <p>
                Route each task to a live worker that advertises the capability  - 
                pair it with mixed Neuron kinds.
              </p>
            </Link>
            <Link href="/docs" className="card">
              <div className="card-icon">→</div>
              <h3>Neuron sources</h3>
              <p>
                The full source reference  -  huggingface, ollama, mcp, and the TS
                mcpNeuron / provider factories.
              </p>
            </Link>
            <Link href="/core/concepts" className="card">
              <div className="card-icon">→</div>
              <h3>Concepts</h3>
              <p>Neuron, Axon, Dendrite, Synapse  -  what each one is and isn&apos;t.</p>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .example-breadcrumb { padding: 20px 0 0; position: relative; z-index: 1; }
        .example-breadcrumb .container {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-family: var(--font-mono, ui-monospace, monospace);
        }
        .breadcrumb-back { color: var(--accent); transition: color 0.15s; }
        .breadcrumb-back:hover { color: var(--accent-text); }
        .breadcrumb-sep { color: var(--text-faint); }
        .breadcrumb-current { color: var(--text-dim); }
      `}</style>
    </>
  );
};