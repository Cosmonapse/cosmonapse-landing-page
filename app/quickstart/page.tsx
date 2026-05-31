import type { Metadata } from "next";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Quickstart — Cosmonapse",
  description:
    "Install Cosmonapse, write a Neuron, wire an Axon and Dendrite, boot a local Synapse, watch Signals flow. No Docker, no infrastructure.",
};

const installSnippet = `<span class="tk-cm"># Python 3.11+</span>
pip install cosmonapse flask`;

const synapseSnippet = `<span class="tk-cm"># Boot a local TCP dev synapse — no Docker, no NATS, no Postgres.</span>
<span class="tk-cm"># Streams every Signal to stdout as it crosses the bus.</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>quickstart

<span class="tk-cm">  URL:        cosmo://127.0.0.1:7070</span>
<span class="tk-cm">  Namespace:  quickstart</span>
<span class="tk-cm">  Transport:  TCP + NDJSON  (single-host dev only)</span>
<span class="tk-cm">  ────────────────────────────────────────────────</span>`;

const neuronSnippet = `<span class="tk-cm"># A Neuron is a plain async function. Zero protocol knowledge.</span>

<span class="tk-kw">async def</span> <span class="tk-fn">hello_neuron</span>(input: dict, context: list) <span class="tk-op">-></span> dict:
    name <span class="tk-op">=</span> input.<span class="tk-fn">get</span>(<span class="tk-str">"name"</span>, <span class="tk-str">"world"</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"message"</span>: <span class="tk-fn">f</span><span class="tk-str">"Hello, {name}!"</span>}`;

const axonDendriteSnippet = `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    <span class="tk-cm"># 1. Wrap the Neuron in an Axon.</span>
    axon <span class="tk-op">=</span> Axon(
        neuron_id<span class="tk-op">=</span><span class="tk-str">"hello-neuron"</span>,
        neuron_fn<span class="tk-op">=</span>hello_neuron,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"greet"</span>],
        version<span class="tk-op">=</span><span class="tk-str">"1.0.0"</span>,
    )

    <span class="tk-cm"># 2. Connect to the Synapse.</span>
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)

    <span class="tk-cm"># 3. Build a worker Dendrite and attach the Axon.</span>
    <span class="tk-cm">#    role="worker" — workers host Axons and reply to TASKs, but</span>
    <span class="tk-cm">#    cannot dispatch new ones (the role guard sits on emit()).</span>
    worker <span class="tk-op">=</span> Dendrite(
        synapse<span class="tk-op">=</span>synapse,
        namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>,
        role<span class="tk-op">=</span><span class="tk-str">"worker"</span>,
    )
    worker.<span class="tk-fn">attach_axon</span>(axon)

    <span class="tk-kw">async with</span> worker:
        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(<span class="tk-fn">float</span>(<span class="tk-str">"inf"</span>))  <span class="tk-cm"># run until cancelled</span>

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const flaskSnippet = `<span class="tk-kw">import</span> asyncio, concurrent.futures, threading
<span class="tk-kw">from</span> flask <span class="tk-kw">import</span> Flask, request, jsonify
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse, new_trace_id

<span class="tk-cm"># asyncio loop in a background thread — Flask stays synchronous.</span>
loop <span class="tk-op">=</span> asyncio.<span class="tk-fn">new_event_loop</span>()
threading.<span class="tk-fn">Thread</span>(target<span class="tk-op">=</span>loop.run_forever, daemon<span class="tk-op">=</span><span class="tk-kw">True</span>).<span class="tk-fn">start</span>()

pending: dict[str, concurrent.futures.Future] <span class="tk-op">=</span> {}
orch: Dendrite <span class="tk-op">=</span> <span class="tk-kw">None</span>

<span class="tk-kw">async def</span> <span class="tk-fn">setup</span>():
    <span class="tk-kw">global</span> orch
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>)

    <span class="tk-op">@</span>orch.<span class="tk-fn">on_agent_output</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">on_output</span>(sig):
        fut <span class="tk-op">=</span> pending.<span class="tk-fn">pop</span>(sig.trace_id, <span class="tk-kw">None</span>)
        <span class="tk-kw">if</span> fut <span class="tk-kw">and not</span> fut.<span class="tk-fn">done</span>(): fut.<span class="tk-fn">set_result</span>(sig.payload[<span class="tk-str">"output"</span>])

    <span class="tk-kw">await</span> orch.<span class="tk-fn">start</span>()

<span class="tk-cm"># NEW: orch.dispatch_and_wait(...) is now the preferred RPC shape.</span>
<span class="tk-cm"># The Future/dict pattern above predates Pathway; new code should just do:</span>
<span class="tk-cm">#   sig = await orch.dispatch_and_wait(neuron="hello-neuron", input=..., timeout_s=5)</span>
asyncio.<span class="tk-fn">run_coroutine_threadsafe</span>(<span class="tk-fn">setup</span>(), loop).<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">10</span>)

app <span class="tk-op">=</span> <span class="tk-fn">Flask</span>(__name__)

<span class="tk-op">@</span>app.<span class="tk-fn">post</span>(<span class="tk-str">"/task"</span>)
<span class="tk-kw">def</span> <span class="tk-fn">submit</span>():
    trace_id <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()
    fut <span class="tk-op">=</span> concurrent.futures.<span class="tk-fn">Future</span>()
    pending[trace_id] <span class="tk-op">=</span> fut

    <span class="tk-kw">async def</span> <span class="tk-fn">dispatch</span>():
        <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_task</span>(neuron<span class="tk-op">=</span><span class="tk-str">"hello-neuron"</span>,
                                  input<span class="tk-op">=</span>request.<span class="tk-fn">get_json</span>(), trace_id<span class="tk-op">=</span>trace_id)

    asyncio.<span class="tk-fn">run_coroutine_threadsafe</span>(<span class="tk-fn">dispatch</span>(), loop).<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">5</span>)
    <span class="tk-kw">return</span> <span class="tk-fn">jsonify</span>(fut.<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">10</span>))

app.<span class="tk-fn">run</span>(port<span class="tk-op">=</span><span class="tk-num">5000</span>)`;

const dopplerSnippet = `<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">--</span>namespace<span class="tk-op">=</span>quickstart

<span class="tk-cm">  REGISTER      neuron=hello-neuron  capabilities=['greet']</span>
<span class="tk-cm">  TASK          trace=trc_…  neuron=hello-neuron</span>
<span class="tk-cm">  AGENT_OUTPUT  trace=trc_…  neuron=hello-neuron  → {message: Hello, Cosmonapse!}</span>

<span class="tk-cm"># filter to specific types</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> quickstart <span class="tk-op">--</span>type TASK <span class="tk-op">--</span>type AGENT_OUTPUT`;

const testSnippet = `<span class="tk-op">$</span> curl <span class="tk-op">-s</span> <span class="tk-op">-X</span> POST http://localhost:5000/task <span class="tk-op">\\</span>
       <span class="tk-op">-H</span> <span class="tk-str">"Content-Type: application/json"</span> <span class="tk-op">\\</span>
       <span class="tk-op">-d</span> <span class="tk-str">'{"name": "Cosmonapse"}'</span>

<span class="tk-cm">{"message": "Hello, Cosmonapse!"}</span>`;

export default function QuickstartPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Quickstart</div>
          <h1 className="page-title">First five minutes.</h1>
          <p className="page-sub">
            Install Cosmonapse, write a Neuron, wire an Axon and Dendrite, boot a local Synapse, watch
            Signals flow. No Docker. No running broker. Just{" "}
            <code className="inline">pip install</code> and a few files.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">01 · Install</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            Python 3.11 or newer.
          </p>
          <CodeBlock html={installSnippet} maxWidth={720} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">02 · Start a Synapse</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            <code className="inline">cosmo synapse start memory</code> boots a local TCP+NDJSON broker —
            no Docker, no NATS, no Postgres. To watch Signals crossing the bus, attach{" "}
            <code className="inline">cosmo doppler</code> in another terminal (Step 06). The{" "}
            <code className="inline">--namespace</code> flag scopes all Signals so multiple projects can
            share the same server.
          </p>
          <CodeBlock html={synapseSnippet} maxWidth={760} />
          <p className="prose" style={{ marginTop: 16 }}>
            Leave this terminal open. Swap the URL for{" "}
            <code className="inline">nats://</code> or <code className="inline">kafka://</code> when you
            move to production — the rest of your code stays the same.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">03 · Write a Neuron</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            A Neuron is a plain async function — no imports from Cosmonapse, no decorators, no protocol
            knowledge. It receives <code className="inline">input</code> (the TASK payload) and{" "}
            <code className="inline">context</code> (fetched by the Axon via{" "}
            <code className="inline">context_ref</code>) and returns a plain dict.
          </p>
          <CodeBlock html={neuronSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">04 · Wire an Axon and Dendrite</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            The <strong>Axon</strong> wraps the Neuron and gives it an identity on the bus. The{" "}
            <strong>Dendrite</strong> is the only component that touches the Synapse — it hosts the Axon,
            emits REGISTER / HEARTBEAT / DEREGISTER, and routes inbound TASKs.
          </p>
          <CodeBlock filename="worker.py" html={axonDendriteSnippet} maxWidth={800} />
          <p className="prose" style={{ marginTop: 16 }}>
            Run this in a second terminal. The worker registers on the bus and waits for tasks. Any process
            that dispatches a TASK to <code className="inline">"hello-neuron"</code> on namespace{" "}
            <code className="inline">"quickstart"</code> will be routed here.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">05 · Connect an HTTP interface</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            An orchestrator Dendrite has no Axon — its job is to dispatch tasks and collect results. Flask
            is synchronous; cosmonapse is async. The bridge is a{" "}
            <code className="inline">concurrent.futures.Future</code> per{" "}
            <code className="inline">trace_id</code>: the asyncio handler resolves it, the Flask route
            blocks on it.
          </p>
          <CodeBlock filename="server.py" html={flaskSnippet} maxWidth={820} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">06 · Watch the Signals flow</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            Attach a Doppler to see every Signal as it crosses the Synapse. It is a passive read-only
            subscriber — it never competes with Dendrites for messages.
          </p>
          <CodeBlock html={dopplerSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">07 · Test it</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            With the synapse, worker, and server all running, send a task:
          </p>
          <CodeBlock html={testSnippet} maxWidth={760} />
          <p className="prose" style={{ marginTop: 16 }}>
            Watch the Doppler terminal — you'll see the full REGISTER → TASK → AGENT_OUTPUT trace as it
            happens.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">08 · What to read next</div>
          <div className="grid-3">
            <Link href="/protocol" className="card">
              <div className="card-icon">→</div>
              <h3>Envelope spec</h3>
              <p>The canonical wire format. Every field, every message type, validation rules.</p>
            </Link>
            <Link href="/decisions" className="card">
              <div className="card-icon">→</div>
              <h3>Design decisions</h3>
              <p>Every architectural decision and the reasoning behind it.</p>
            </Link>
            <Link href="/roadmap" className="card">
              <div className="card-icon">→</div>
              <h3>Roadmap</h3>
              <p>v0.1 manual SDK · v0.2 Axon-as-MCP · v0.3 declarative router · v0.4 router agent.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
