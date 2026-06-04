"use client";

import React from "react";
import Link from "next/link";
import ComboExample, {
  type Combo,
  type ComboData,
  type Step,
} from "@/components/ComboExample";
import { PY_URL, brokerStep, runStep } from "../_shared";

// ===========================================================================
// Install — this example's two sources need different soft deps than the
// LLM examples (flask + mcp for Python; express + the MCP SDK for TS).
// ===========================================================================

const INSTALL_HTML: Record<Combo, string> = {
  "py-dev": `<span class="tk-cm"># SDK + CLI, plus the soft deps the two sources need</span>
pip install <span class="tk-op">-e</span> cosmonapse-core/packages/python-sdk
pip install flask mcp        <span class="tk-cm"># flask = API source · mcp = MCP source</span>

<span class="tk-cm"># The filesystem MCP server is published on npm; npx fetches it on first run</span>
<span class="tk-op">$</span> node <span class="tk-op">--</span>version    <span class="tk-cm"># any Node 18+ provides npx</span>`,

  "py-nats": `<span class="tk-cm"># SDK with the NATS extra + the two source deps</span>
pip install <span class="tk-str">"cosmonapse[nats]"</span>
pip install flask mcp`,

  "py-kafka": `<span class="tk-cm"># SDK with the Kafka extra + the two source deps</span>
pip install <span class="tk-str">"cosmonapse[kafka]"</span>
pip install flask mcp`,

  "ts-dev": `<span class="tk-cm"># SDK + express (API source) + the MCP SDK (MCP source)</span>
npm install <span class="tk-op">@</span>cosmonapse/sdk express <span class="tk-op">@</span>modelcontextprotocol/sdk
npm install <span class="tk-op">-D</span> tsx <span class="tk-op">@</span>types/express`,

  "ts-nats": `<span class="tk-cm"># Same, plus the optional nats driver</span>
npm install <span class="tk-op">@</span>cosmonapse/sdk express <span class="tk-op">@</span>modelcontextprotocol/sdk nats
npm install <span class="tk-op">-D</span> tsx <span class="tk-op">@</span>types/express`,
};

function installStep(combo: Combo): Step {
  return {
    eyebrow: "Install",
    prose: (
      <>
        Each <code className="inline">Neuron(source=…)</code> wrapper is a soft
        dependency — you only install what the sources you use require. The
        filesystem MCP server itself is a separate npm package, fetched on
        demand by <code className="inline">npx</code>.
      </>
    ),
    html: INSTALL_HTML[combo],
    maxWidth: 760,
  };
}

// ===========================================================================
// Python — API worker (Flask), MCP worker (filesystem), and the Cortex.
// Only SYNAPSE_URL changes between dev / NATS / Kafka.
// ===========================================================================

const pyWorkerApi = (url: string) => `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> flask <span class="tk-kw">import</span> Flask, request, jsonify
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron, Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>   <span class="tk-cm"># ← the only line that changes per transport</span>
NAMESPACE   <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>

<span class="tk-cm"># An ordinary Flask app — zero Cosmonapse knowledge anywhere in it.</span>
app <span class="tk-op">=</span> Flask(__name__)

<span class="tk-op">@</span>app.post(<span class="tk-str">"/summarise"</span>)
<span class="tk-kw">def</span> <span class="tk-fn">summarise</span>():
    body <span class="tk-op">=</span> request.get_json() <span class="tk-kw">or</span> {}
    text <span class="tk-op">=</span> body.get(<span class="tk-str">"text"</span>, <span class="tk-str">""</span>)
    <span class="tk-kw">return</span> jsonify(summary<span class="tk-op">=</span>text[:<span class="tk-num">120</span>], length<span class="tk-op">=</span>len(text))

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    <span class="tk-cm"># source="flask" replays each TASK as an in-process HTTP request.</span>
    axon <span class="tk-op">=</span> Axon(
        neuron_id<span class="tk-op">=</span><span class="tk-str">"summary-api"</span>,
        neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"flask"</span>, app<span class="tk-op">=</span>app,
                         default_path<span class="tk-op">=</span><span class="tk-str">"/summarise"</span>),
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"http"</span>, <span class="tk-str">"summarise"</span>],
    )
    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> connect_synapse(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"summary-api"</span>)
    dendrite.attach_axon(axon)
    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            print(<span class="tk-str">"summary-api ready"</span>)
            <span class="tk-kw">await</span> asyncio.Event().wait()
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.close()

asyncio.run(main())`;

const pyWorkerFiles = (url: string) => `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron, Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>
NAMESPACE   <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    <span class="tk-cm"># Wrap the STANDARD filesystem MCP server (spawned via npx) as a Neuron.</span>
    <span class="tk-cm"># Wrapper only — we do not implement the server. "." = allowed directory.</span>
    axon <span class="tk-op">=</span> Axon(
        neuron_id<span class="tk-op">=</span><span class="tk-str">"files"</span>,
        neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"mcp"</span>, server<span class="tk-op">=</span><span class="tk-str">"filesystem"</span>, args<span class="tk-op">=</span>[<span class="tk-str">"."</span>]),
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"mcp"</span>, <span class="tk-str">"filesystem"</span>],
    )
    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> connect_synapse(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"files"</span>)
    dendrite.attach_axon(axon)
    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            print(<span class="tk-str">"files ready"</span>)
            <span class="tk-kw">await</span> asyncio.Event().wait()
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.close()

asyncio.run(main())`;

const pyCortex = (url: string) => `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse, new_trace_id

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> connect_synapse(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"cortex"</span>, heartbeat_s<span class="tk-op">=</span><span class="tk-num">0</span>)
    pending <span class="tk-op">=</span> {}

    <span class="tk-op">@</span>dendrite.on_agent_output
    <span class="tk-kw">async def</span> <span class="tk-fn">_on_output</span>(sig):
        fut <span class="tk-op">=</span> pending.pop(sig.trace_id, <span class="tk-kw">None</span>)
        <span class="tk-kw">if</span> fut <span class="tk-kw">and not</span> fut.done():
            fut.set_result(sig.payload.get(<span class="tk-str">"output"</span>, {}))

    <span class="tk-kw">async def</span> <span class="tk-fn">ask</span>(neuron, input, timeout<span class="tk-op">=</span><span class="tk-num">30.0</span>):
        trace_id <span class="tk-op">=</span> new_trace_id()
        fut <span class="tk-op">=</span> asyncio.get_running_loop().create_future()
        pending[trace_id] <span class="tk-op">=</span> fut
        <span class="tk-kw">await</span> dendrite.dispatch_task(neuron<span class="tk-op">=</span>neuron, input<span class="tk-op">=</span>input, trace_id<span class="tk-op">=</span>trace_id)
        <span class="tk-kw">return</span> <span class="tk-kw">await</span> asyncio.wait_for(fut, timeout<span class="tk-op">=</span>timeout)

    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            <span class="tk-cm"># The same dispatch_task call — the Cortex can't tell an API</span>
            <span class="tk-cm"># from an MCP server. Both are just Neurons behind Axons.</span>
            summary <span class="tk-op">=</span> <span class="tk-kw">await</span> ask(<span class="tk-str">"summary-api"</span>,
                {<span class="tk-str">"text"</span>: <span class="tk-str">"Cosmonapse turns any real-world thing into a neuron."</span>})
            print(<span class="tk-str">"API →"</span>, summary)

            listing <span class="tk-op">=</span> <span class="tk-kw">await</span> ask(<span class="tk-str">"files"</span>,
                {<span class="tk-str">"tool"</span>: <span class="tk-str">"list_directory"</span>, <span class="tk-str">"arguments"</span>: {<span class="tk-str">"path"</span>: <span class="tk-str">"."</span>}})
            print(<span class="tk-str">"MCP →"</span>, listing.get(<span class="tk-str">"response"</span>, <span class="tk-str">""</span>)[:<span class="tk-num">200</span>])
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.close()

asyncio.run(main())`;

const outputSnippet = `<span class="tk-op">$</span> python cortex.py
API → {'status': 200, 'ok': True,
       'json': {'summary': 'Cosmonapse turns any real-world…', 'length': 51}, …}
MCP → [FILE] cortex.py
[FILE] worker_api.py
[FILE] worker_files.py
[DIR]  data`;

// ===========================================================================
// TypeScript — devsynapse (single in-process file)
// ===========================================================================

const tsDev = `<span class="tk-kw">import</span> { Axon, Dendrite, MemorySynapse, expressNeuron, mcpNeuron, newTraceId }
  <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;
<span class="tk-kw">import</span> express <span class="tk-kw">from</span> <span class="tk-str">"express"</span>;

<span class="tk-kw">const</span> NS <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>;

<span class="tk-cm">// 1 · API neuron — an ordinary Express app</span>
<span class="tk-kw">const</span> app <span class="tk-op">=</span> express();
app.use(express.json());
app.post(<span class="tk-str">"/summarise"</span>, (req, res) <span class="tk-op">=&gt;</span>
  res.json({ summary: String(req.body.text <span class="tk-op">??</span> <span class="tk-str">""</span>).slice(<span class="tk-num">0</span>, <span class="tk-num">120</span>) }));

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> MemorySynapse();   <span class="tk-cm">// in-process — one terminal, no broker</span>
  <span class="tk-kw">await</span> synapse.connect();

  <span class="tk-cm">// Two very different Neurons, one Dendrite, identical Axon interface.</span>
  <span class="tk-kw">const</span> worker <span class="tk-op">=</span> <span class="tk-kw">new</span> Dendrite({ synapse, namespace: NS, dendriteId: <span class="tk-str">"workers"</span>, heartbeatMs: <span class="tk-num">0</span> });
  worker.attachAxon(<span class="tk-kw">new</span> Axon({
    neuronId: <span class="tk-str">"summary-api"</span>,
    neuronFn: expressNeuron(app, { defaultPath: <span class="tk-str">"/summarise"</span> }),
  }));
  worker.attachAxon(<span class="tk-kw">new</span> Axon({
    neuronId: <span class="tk-str">"files"</span>,
    neuronFn: mcpNeuron({ server: <span class="tk-str">"filesystem"</span>, args: [<span class="tk-str">"."</span>] }),
  }));
  <span class="tk-kw">await</span> worker.start();

  <span class="tk-kw">const</span> cortex <span class="tk-op">=</span> <span class="tk-kw">new</span> Dendrite({ synapse, namespace: NS, dendriteId: <span class="tk-str">"cortex"</span>, heartbeatMs: <span class="tk-num">0</span> });
  <span class="tk-kw">const</span> pending <span class="tk-op">=</span> <span class="tk-kw">new</span> Map();
  cortex.onAgentOutput((sig) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">const</span> r <span class="tk-op">=</span> pending.get(sig.trace_id);
    <span class="tk-kw">if</span> (r) { pending.delete(sig.trace_id); r((sig.payload <span class="tk-kw">as</span> any).output); }
  });
  <span class="tk-kw">await</span> cortex.start();

  <span class="tk-kw">const</span> ask <span class="tk-op">=</span> (neuron: string, input: any) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">const</span> traceId <span class="tk-op">=</span> newTraceId();
    <span class="tk-kw">const</span> done <span class="tk-op">=</span> <span class="tk-kw">new</span> Promise((res) <span class="tk-op">=&gt;</span> pending.set(traceId, res));
    cortex.dispatchTask({ neuron, input, traceId });
    <span class="tk-kw">return</span> done;
  };

  <span class="tk-kw">const</span> summary: any <span class="tk-op">=</span> <span class="tk-kw">await</span> ask(<span class="tk-str">"summary-api"</span>, { text: <span class="tk-str">"anything can be a neuron"</span> });
  console.log(<span class="tk-str">"API ->"</span>, summary.json);
  <span class="tk-kw">const</span> listing: any <span class="tk-op">=</span> <span class="tk-kw">await</span> ask(<span class="tk-str">"files"</span>, { tool: <span class="tk-str">"list_directory"</span>, arguments: { path: <span class="tk-str">"."</span> } });
  console.log(<span class="tk-str">"MCP ->"</span>, listing.response?.slice(<span class="tk-num">0</span>, <span class="tk-num">200</span>));

  <span class="tk-kw">await</span> synapse.close();
}

main();`;

// ===========================================================================
// TypeScript — NATS (worker_api.ts + worker_files.ts + cortex.ts)
// ===========================================================================

const tsWorkerApiNats = `<span class="tk-kw">import</span> { Axon, Dendrite, NatsSynapse, expressNeuron } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;
<span class="tk-kw">import</span> express <span class="tk-kw">from</span> <span class="tk-str">"express"</span>;

<span class="tk-kw">const</span> app <span class="tk-op">=</span> express();
app.use(express.json());
app.post(<span class="tk-str">"/summarise"</span>, (req, res) <span class="tk-op">=&gt;</span>
  res.json({ summary: String(req.body.text <span class="tk-op">??</span> <span class="tk-str">""</span>).slice(<span class="tk-num">0</span>, <span class="tk-num">120</span>) }));

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> NatsSynapse({ url: <span class="tk-str">"nats://127.0.0.1:4222"</span> });
  <span class="tk-kw">await</span> synapse.connect();

  <span class="tk-kw">const</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> Dendrite({
    synapse, namespace: <span class="tk-str">"quickstart"</span>, dendriteId: <span class="tk-str">"summary-api"</span>, heartbeatMs: <span class="tk-num">0</span>,
  });
  dendrite.attachAxon(<span class="tk-kw">new</span> Axon({
    neuronId: <span class="tk-str">"summary-api"</span>,
    neuronFn: expressNeuron(app, { defaultPath: <span class="tk-str">"/summarise"</span> }),
    capabilities: [<span class="tk-str">"http"</span>, <span class="tk-str">"summarise"</span>],
  }));
  <span class="tk-kw">await</span> dendrite.start();
  console.log(<span class="tk-str">"summary-api ready"</span>);
  <span class="tk-kw">await</span> <span class="tk-kw">new</span> Promise(() <span class="tk-op">=&gt;</span> {});   <span class="tk-cm">// run forever</span>
}

main();`;

const tsWorkerFilesNats = `<span class="tk-kw">import</span> { Axon, Dendrite, NatsSynapse, mcpNeuron } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> NatsSynapse({ url: <span class="tk-str">"nats://127.0.0.1:4222"</span> });
  <span class="tk-kw">await</span> synapse.connect();

  <span class="tk-kw">const</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> Dendrite({
    synapse, namespace: <span class="tk-str">"quickstart"</span>, dendriteId: <span class="tk-str">"files"</span>, heartbeatMs: <span class="tk-num">0</span>,
  });
  dendrite.attachAxon(<span class="tk-kw">new</span> Axon({
    neuronId: <span class="tk-str">"files"</span>,
    neuronFn: mcpNeuron({ server: <span class="tk-str">"filesystem"</span>, args: [<span class="tk-str">"."</span>] }),
    capabilities: [<span class="tk-str">"mcp"</span>, <span class="tk-str">"filesystem"</span>],
  }));
  <span class="tk-kw">await</span> dendrite.start();
  console.log(<span class="tk-str">"files ready"</span>);
  <span class="tk-kw">await</span> <span class="tk-kw">new</span> Promise(() <span class="tk-op">=&gt;</span> {});
}

main();`;

const tsCortexNats = `<span class="tk-kw">import</span> { Dendrite, NatsSynapse, newTraceId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> NatsSynapse({ url: <span class="tk-str">"nats://127.0.0.1:4222"</span> });
  <span class="tk-kw">await</span> synapse.connect();

  <span class="tk-kw">const</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> Dendrite({
    synapse, namespace: <span class="tk-str">"quickstart"</span>, dendriteId: <span class="tk-str">"cortex"</span>, heartbeatMs: <span class="tk-num">0</span>,
  });
  <span class="tk-kw">const</span> pending <span class="tk-op">=</span> <span class="tk-kw">new</span> Map();
  dendrite.onAgentOutput((sig) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">const</span> r <span class="tk-op">=</span> pending.get(sig.trace_id);
    <span class="tk-kw">if</span> (r) { pending.delete(sig.trace_id); r((sig.payload <span class="tk-kw">as</span> any).output); }
  });
  <span class="tk-kw">await</span> dendrite.start();

  <span class="tk-kw">const</span> ask <span class="tk-op">=</span> (neuron: string, input: any) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">const</span> traceId <span class="tk-op">=</span> newTraceId();
    <span class="tk-kw">const</span> done <span class="tk-op">=</span> <span class="tk-kw">new</span> Promise((res) <span class="tk-op">=&gt;</span> pending.set(traceId, res));
    dendrite.dispatchTask({ neuron, input, traceId });
    <span class="tk-kw">return</span> done;
  };

  <span class="tk-kw">const</span> summary: any <span class="tk-op">=</span> <span class="tk-kw">await</span> ask(<span class="tk-str">"summary-api"</span>, { text: <span class="tk-str">"anything can be a neuron"</span> });
  console.log(<span class="tk-str">"API ->"</span>, summary.json);
  <span class="tk-kw">const</span> listing: any <span class="tk-op">=</span> <span class="tk-kw">await</span> ask(<span class="tk-str">"files"</span>, { tool: <span class="tk-str">"list_directory"</span>, arguments: { path: <span class="tk-str">"."</span> } });
  console.log(<span class="tk-str">"MCP ->"</span>, listing.response?.slice(<span class="tk-num">0</span>, <span class="tk-num">200</span>));

  <span class="tk-kw">await</span> synapse.close();
}

main();`;

// ---------------------------------------------------------------------------
// Per-combo step assembly
// ---------------------------------------------------------------------------

function pyData(combo: "py-dev" | "py-nats" | "py-kafka"): ComboData {
  const url = PY_URL[combo];
  const broker = brokerStep(combo);
  const last = runStep(combo, [
    { label: "the API worker", cmd: "python worker_api.py" },
    { label: "the MCP worker", cmd: "python worker_files.py" },
    { label: "the cortex", cmd: "python cortex.py" },
  ]);
  last.afterProse = (
    <>One TASK becomes an HTTP request; the other becomes an MCP tool call:</>
  );
  last.html2 = outputSnippet;
  return {
    steps: [
      installStep(combo),
      ...(broker ? [broker] : []),
      {
        eyebrow: "API worker — a Flask app as a Neuron",
        prose: (
          <>
            <code className="inline">Neuron(source=&quot;flask&quot;)</code> wraps an
            ordinary Flask app. The TASK&rsquo;s <code className="inline">input</code>{" "}
            is replayed as an in-process HTTP request — no socket opened — and the
            JSON response becomes the Neuron output.
          </>
        ),
        filename: "worker_api.py",
        html: pyWorkerApi(url),
      },
      {
        eyebrow: "MCP worker — a filesystem server as a Neuron",
        prose: (
          <>
            <code className="inline">Neuron(source=&quot;mcp&quot;, server=&quot;filesystem&quot;)</code>{" "}
            spawns the standard filesystem MCP server over stdio and exposes its
            tools. This is a <em>wrapper</em> — Cosmonapse ships no servers of its
            own. One subprocess is reused across tasks and torn down on deregister.
          </>
        ),
        filename: "worker_files.py",
        html: pyWorkerFiles(url),
      },
      {
        eyebrow: "The Cortex — one dispatch, two kinds of Neuron",
        prose: (
          <>
            The orchestrator is a plain Dendrite. Notice the two{" "}
            <code className="inline">ask()</code> calls are identical in shape —
            the Cortex never knows one worker is an HTTP API and the other an MCP
            server. That is the whole point: anything that maps a TASK to a result
            is a Neuron.
          </>
        ),
        filename: "cortex.py",
        html: pyCortex(url),
      },
      last,
    ],
    extend: extendBody(combo),
  };
}

function tsNatsData(): ComboData {
  const broker = brokerStep("ts-nats");
  return {
    steps: [
      installStep("ts-nats"),
      ...(broker ? [broker] : []),
      {
        eyebrow: "API worker — an Express app as a Neuron",
        prose: (
          <>
            <code className="inline">expressNeuron(app)</code> mounts the Express
            app on an ephemeral loopback port (once, reused) and replays each TASK
            as an HTTP request.
          </>
        ),
        filename: "worker_api.ts",
        html: tsWorkerApiNats,
      },
      {
        eyebrow: "MCP worker — a filesystem server as a Neuron",
        prose: (
          <>
            <code className="inline">mcpNeuron({"{"} server: &quot;filesystem&quot; {"}"})</code>{" "}
            spawns the standard server via{" "}
            <code className="inline">@modelcontextprotocol/sdk</code> (an optional
            peer dependency, imported lazily) and exposes its tools.
          </>
        ),
        filename: "worker_files.ts",
        html: tsWorkerFilesNats,
      },
      {
        eyebrow: "The Cortex — one dispatch, two kinds of Neuron",
        prose: (
          <>
            Identical to the Python cortex: a{" "}
            <code className="inline">trace_id → resolver</code> map turns each{" "}
            <code className="inline">AGENT_OUTPUT</code> back into a resolved
            promise. Both workers are addressed exactly the same way.
          </>
        ),
        filename: "cortex.ts",
        html: tsCortexNats,
      },
      runStep("ts-nats", [
        { label: "the API worker", cmd: "npx tsx worker_api.ts" },
        { label: "the MCP worker", cmd: "npx tsx worker_files.ts" },
        { label: "the cortex", cmd: "npx tsx cortex.ts" },
      ]),
    ],
    extend: extendBody("ts-nats"),
  };
}

function tsDevData(): ComboData {
  return {
    steps: [
      installStep("ts-dev"),
      {
        eyebrow: "Everything in one file",
        prose: (
          <>
            <code className="inline">MemorySynapse</code> is in-process, so the
            Express-app Neuron, the MCP-server Neuron, and the Cortex all live in
            one Node program. <code className="inline">expressNeuron</code> and{" "}
            <code className="inline">mcpNeuron</code> attach to Axons exactly like
            any hand-written Neuron.
          </>
        ),
        filename: "realworld.ts",
        html: tsDev,
      },
      runStep("ts-dev", [{ label: "everything", cmd: "npx tsx realworld.ts" }]),
    ],
    extend: extendBody("ts-dev"),
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
        <code className="inline">&quot;memory&quot;</code> — or point{" "}
        <code className="inline">command</code>/<code className="inline">args</code>{" "}
        at any other stdio MCP server you have.
      </p>
      <p>
        <strong>Any API.</strong> The{" "}
        <code className="inline">flask</code>/<code className="inline">wsgi</code>{" "}
        source serves any WSGI callable;{" "}
        <code className="inline">expressNeuron</code> serves any Node request
        listener. Existing microservices become Neurons with no code changes.
      </p>
      <p>
        <strong>Mix in LLMs.</strong> Add a third worker with{" "}
        <code className="inline">Neuron(source=&quot;huggingface&quot;, model=&quot;meta-llama/Llama-3.1-8B-Instruct&quot;)</code>{" "}
        — or swap <code className="inline">source=&quot;ollama&quot;</code> for a local
        model. The Cortex dispatches to it the same way. Route by{" "}
        <code className="inline">capabilities</code> to pick the right kind of
        Neuron per task.
      </p>
      {combo === "ts-dev" ? (
        <p>
          <strong>Go multi-process.</strong> Switch{" "}
          <code className="inline">MemorySynapse</code> for{" "}
          <code className="inline">NatsSynapse</code> (the NATS tab) and split the
          file into <code className="inline">worker_api.ts</code>,{" "}
          <code className="inline">worker_files.ts</code>, and{" "}
          <code className="inline">cortex.ts</code> — the Neuron wiring is identical.
        </p>
      ) : (
        <p>
          <strong>Change transport.</strong> Every other tab is the same topology
          — only the install, the synapse you connect to, and the launch commands
          change. The Neuron wiring is byte-for-byte identical.
        </p>
      )}
    </>
  );
}

const DATA: Record<Combo, ComboData> = {
  "py-dev": pyData("py-dev"),
  "py-nats": pyData("py-nats"),
  "py-kafka": pyData("py-kafka"),
  "ts-dev": tsDevData(),
  "ts-nats": tsNatsData(),
};

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
            An API and an MCP server.
            <br />
            Both just Neurons.
          </h1>
          <p className="page-sub">
            A Neuron is <em>anything that interacts with the real world</em>. Here
            one Cortex dispatches to two very different workers — an HTTP{" "}
            <strong>API</strong> (Flask / Express) and a wrapped stdio{" "}
            <strong>MCP server</strong> — through the identical Axon interface.
            Neither worker knows the protocol exists. The same topology runs over
            five language × transport stacks — pick one below.
          </p>
        </div>
      </header>

      <ComboExample data={DATA} defaultCombo="py-dev" />

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/capability-routing" className="card">
              <div className="card-icon">→</div>
              <h3>Capability routing</h3>
              <p>
                Route each task to a live worker that advertises the capability —
                pair it with mixed Neuron kinds.
              </p>
            </Link>
            <Link href="/docs" className="card">
              <div className="card-icon">→</div>
              <h3>Neuron sources</h3>
              <p>
                The full source reference — huggingface, ollama, flask/wsgi,
                mcp, and the TS expressNeuron / mcpNeuron factories.
              </p>
            </Link>
            <Link href="/concepts" className="card">
              <div className="card-icon">→</div>
              <h3>Concepts</h3>
              <p>Neuron, Axon, Dendrite, Synapse — what each one is and isn&apos;t.</p>
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
        .breadcrumb-back:hover { color: #c4b5fd; }
        .breadcrumb-sep { color: var(--text-faint); }
        .breadcrumb-current { color: var(--text-dim); }
      `}</style>
    </>
  );
}
