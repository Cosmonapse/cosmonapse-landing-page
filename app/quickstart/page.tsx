import type { Metadata } from "next";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import CodeSwitcher from "@/components/CodeSwitcher";

export const metadata: Metadata = {
  title: "Quickstart — Cosmonapse",
  description:
    "Install Cosmonapse, create a Hugging Face Neuron, wire an Axon and Dendrite, boot a local Synapse, watch Signals flow.",
};

// ── Install ────────────────────────────────────────────────────────────────

const installPy = `<span class="tk-cm"># Python 3.11+</span>
pip install cosmonapse httpx`;

const installTs = `<span class="tk-cm">// Node 18+</span>
npm install @cosmonapse/sdk`;

// ── Synapse start (CLI — same for both) ────────────────────────────────────

const synapseSnippet = `<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>quickstart

<span class="tk-cm">  URL:        cosmo://127.0.0.1:7070</span>
<span class="tk-cm">  Namespace:  quickstart</span>
<span class="tk-cm">  Transport:  TCP + NDJSON  (single-host dev only)</span>
<span class="tk-cm">  ────────────────────────────────────────────────</span>`;

// ── Neuron ─────────────────────────────────────────────────────────────────

const neuronPy = `<span class="tk-kw">import</span> os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon

<span class="tk-cm"># Axon.huggingface() (and .openai(), .anthropic(), .ollama() ...) combines</span>
<span class="tk-cm"># the Neuron factory + Axon wiring in one call. Set HF_TOKEN first.</span>
axon <span class="tk-op">=</span> Axon.<span class="tk-fn">huggingface</span>(<span class="tk-str">"llama"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
    use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>, capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>])`;

const neuronTs = `<span class="tk-kw">import</span> { Axon } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// Axon.huggingface() (and .openai(), .anthropic(), .ollama() ...) combines</span>
<span class="tk-cm">// neuron factory + Axon wiring in one call. Set HF_TOKEN first.</span>
<span class="tk-kw">const</span> axon <span class="tk-op">=</span> Axon.<span class="tk-fn">huggingface</span>(<span class="tk-str">"llama"</span>,
  { endpoint: <span class="tk-str">"https://router.huggingface.co"</span>,
    model: <span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    apiKey: process.env.<span class="tk-fn">HF_TOKEN</span>, useChatApi: <span class="tk-kw">true</span> },
  { capabilities: [<span class="tk-str">"chat"</span>] });`;

// ── Axon + Dendrite (worker) ───────────────────────────────────────────────

const workerPy = `<span class="tk-kw">import</span> asyncio, os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, connect_synapse

<span class="tk-cm"># Axon.huggingface() creates the Neuron and Axon in one step.</span>
<span class="tk-cm"># role="worker": hosts Axons, replies to TASKs, cannot dispatch.</span>
axon <span class="tk-op">=</span> Axon.<span class="tk-fn">huggingface</span>(<span class="tk-str">"llama"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
    use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>, capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>])

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    worker  <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker.<span class="tk-fn">attach_axon</span>(axon)
    <span class="tk-kw">async with</span> worker:
        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(<span class="tk-fn">float</span>(<span class="tk-str">"inf"</span>))  <span class="tk-cm"># serve until Ctrl-C</span>

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const workerTs = `<span class="tk-kw">import</span> { Axon, Dendrite, connectSynapse } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// Axon.huggingface() creates the Neuron and Axon in one step.</span>
<span class="tk-cm">// role: "worker" — hosts Axons, replies to TASKs, cannot dispatch.</span>
<span class="tk-kw">const</span> axon <span class="tk-op">=</span> Axon.<span class="tk-fn">huggingface</span>(<span class="tk-str">"llama"</span>,
  { endpoint: <span class="tk-str">"https://router.huggingface.co"</span>,
    model: <span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    apiKey: process.env.<span class="tk-fn">HF_TOKEN</span>, useChatApi: <span class="tk-kw">true</span> },
  { capabilities: [<span class="tk-str">"chat"</span>] });

<span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connectSynapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>);
<span class="tk-kw">const</span> worker  <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({ synapse, namespace: <span class="tk-str">"quickstart"</span>, role: <span class="tk-str">"worker"</span> });
worker.<span class="tk-fn">attachAxon</span>(axon);

<span class="tk-kw">await</span> worker.<span class="tk-fn">start</span>();
process.<span class="tk-fn">on</span>(<span class="tk-str">"SIGINT"</span>, () <span class="tk-op">=></span> worker.<span class="tk-fn">stop</span>());
<span class="tk-kw">await new</span> <span class="tk-fn">Promise</span>(() <span class="tk-op">=></span> {});`;

// ── HTTP interface (orchestrator) ──────────────────────────────────────────

const serverPy = `<span class="tk-kw">import</span> asyncio, concurrent.futures, threading
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
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>, role<span class="tk-op">=</span><span class="tk-str">"orchestrator"</span>)
    <span class="tk-op">@</span>orch.<span class="tk-fn">on_agent_output</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">on_output</span>(sig):
        fut <span class="tk-op">=</span> pending.<span class="tk-fn">pop</span>(sig.trace_id, <span class="tk-kw">None</span>)
        <span class="tk-kw">if</span> fut <span class="tk-kw">and not</span> fut.<span class="tk-fn">done</span>(): fut.<span class="tk-fn">set_result</span>(sig.payload[<span class="tk-str">"output"</span>])
    <span class="tk-kw">await</span> orch.<span class="tk-fn">start</span>()

asyncio.<span class="tk-fn">run_coroutine_threadsafe</span>(<span class="tk-fn">setup</span>(), loop).<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">10</span>)
app <span class="tk-op">=</span> <span class="tk-fn">Flask</span>(__name__)

<span class="tk-op">@</span>app.<span class="tk-fn">post</span>(<span class="tk-str">"/task"</span>)
<span class="tk-kw">def</span> <span class="tk-fn">submit</span>():
    trace_id <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()
    fut <span class="tk-op">=</span> concurrent.futures.<span class="tk-fn">Future</span>()
    pending[trace_id] <span class="tk-op">=</span> fut
    <span class="tk-kw">async def</span> <span class="tk-fn">_dispatch</span>():
        <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_task</span>(neuron<span class="tk-op">=</span><span class="tk-str">"llama"</span>,
                                  input<span class="tk-op">=</span>request.<span class="tk-fn">get_json</span>(), trace_id<span class="tk-op">=</span>trace_id)
    asyncio.<span class="tk-fn">run_coroutine_threadsafe</span>(<span class="tk-fn">_dispatch</span>(), loop).<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">5</span>)
    <span class="tk-kw">return</span> <span class="tk-fn">jsonify</span>(fut.<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">10</span>))

app.<span class="tk-fn">run</span>(port<span class="tk-op">=</span><span class="tk-num">5000</span>)`;

const serverTs = `<span class="tk-kw">import</span> express <span class="tk-kw">from</span> <span class="tk-str">"express"</span>;
<span class="tk-kw">import</span> { Dendrite, connectSynapse, newTraceId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> app     <span class="tk-op">=</span> <span class="tk-fn">express</span>().<span class="tk-fn">use</span>(express.<span class="tk-fn">json</span>());
<span class="tk-kw">const</span> pending <span class="tk-op">=</span> <span class="tk-kw">new</span> Map();

<span class="tk-cm">// role: "orchestrator" — dispatches TASKs, collects AGENT_OUTPUT replies.</span>
<span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connectSynapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>);
<span class="tk-kw">const</span> orch    <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({ synapse, namespace: <span class="tk-str">"quickstart"</span>, role: <span class="tk-str">"orchestrator"</span> });

orch.<span class="tk-fn">onAgentOutput</span>((sig) <span class="tk-op">=></span> {
  <span class="tk-kw">const</span> resolve <span class="tk-op">=</span> pending.<span class="tk-fn">get</span>(sig.trace_id);
  <span class="tk-kw">if</span> (resolve) { pending.<span class="tk-fn">delete</span>(sig.trace_id); <span class="tk-fn">resolve</span>(sig.payload.output); }
});
<span class="tk-kw">await</span> orch.<span class="tk-fn">start</span>();

app.<span class="tk-fn">post</span>(<span class="tk-str">"/task"</span>, <span class="tk-kw">async</span> (req, res) <span class="tk-op">=></span> {
  <span class="tk-kw">const</span> traceId <span class="tk-op">=</span> <span class="tk-fn">newTraceId</span>();
  <span class="tk-kw">const</span> result  <span class="tk-op">=</span> <span class="tk-kw">await new</span> <span class="tk-fn">Promise</span>((resolve) <span class="tk-op">=></span> {
    pending.<span class="tk-fn">set</span>(traceId, resolve);
    orch.<span class="tk-fn">dispatchTask</span>({ neuron: <span class="tk-str">"llama"</span>, input: req.body, traceId });
  });
  res.<span class="tk-fn">json</span>(result);
});
app.<span class="tk-fn">listen</span>(<span class="tk-num">5000</span>);`;

// ── Doppler (CLI — same for both) ──────────────────────────────────────────

const dopplerSnippet = `<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> quickstart

<span class="tk-cm">  REGISTER      neuron=llama  capabilities=['chat']</span>
<span class="tk-cm">  TASK          trace=trc_01...  neuron=llama</span>
<span class="tk-cm">  AGENT_OUTPUT  trace=trc_01...  neuron=llama</span>

<span class="tk-cm"># filter to specific signal types</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">-n</span> quickstart <span class="tk-op">--</span>type TASK <span class="tk-op">--</span>type AGENT_OUTPUT`;

// ── Test it ────────────────────────────────────────────────────────────────

const testSnippet = `<span class="tk-op">$</span> curl <span class="tk-op">-s</span> <span class="tk-op">-X</span> POST http://localhost:5000/task <span class="tk-op">\\</span>
       <span class="tk-op">-H</span> <span class="tk-str">"Content-Type: application/json"</span> <span class="tk-op">\\</span>
       <span class="tk-op">-d</span> <span class="tk-str">'{"prompt": "Say hello to Cosmonapse."}'</span>

<span class="tk-cm">{"response": "Hello! Great to meet you, Cosmonapse..."}</span>`;

export default function QuickstartPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Quickstart</div>
          <h1 className="page-title">First five minutes.</h1>
          <p className="page-sub">
            Install Cosmonapse, build an Axon backed by Hugging Face, wire a Dendrite, boot a local
            Synapse, watch Signals flow. No Docker. No running broker. Just{" "}
            <code className="inline">pip install</code> (or{" "}
            <code className="inline">npm install</code>) and a few files.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">01 · Install</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            Python 3.11+ or Node 18+. The <code className="inline">cosmo</code> CLI ships with the
            Python package — run it from your virtualenv even when using the TypeScript SDK.
          </p>
          <CodeSwitcher
            python={{ html: installPy }}
            typescript={{ html: installTs }}
            maxWidth={720}
          />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">02 · Start a Synapse</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            <code className="inline">cosmo synapse start memory</code> boots a local TCP+NDJSON
            broker — no Docker, no NATS, no Postgres. Swap the URL for{" "}
            <code className="inline">nats://</code> or <code className="inline">kafka://</code> when
            you move to production — the rest of your code stays the same.
          </p>
          <CodeBlock html={synapseSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">03 · Build an Axon</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            <code className="inline">Axon.huggingface()</code> (and{" "}
            <code className="inline">.openai()</code>,{" "}
            <code className="inline">.anthropic()</code>,{" "}
            <code className="inline">.ollama()</code>,{" "}
            <code className="inline">.mcp()</code>) is the source-paired factory — it creates the
            Neuron and wires the Axon in one call. The TypeScript SDK still uses the two-step{" "}
            <code className="inline">neuron() + new Axon()</code> pattern. Set{" "}
            <code className="inline">HF_TOKEN</code> to your{" "}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-2)", textDecoration: "underline" }}
            >
              Hugging Face access token
            </a>{" "}
            before running.
          </p>
          <CodeSwitcher
            python={{ html: neuronPy }}
            typescript={{ html: neuronTs }}
            maxWidth={760}
          />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">04 · Wire a Dendrite</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            The <strong>Dendrite</strong> is the only component that touches the Synapse — it hosts
            the Axon, emits REGISTER / HEARTBEAT / DEREGISTER, and routes inbound TASKs. Run this
            in a second terminal; it registers and waits for tasks.
          </p>
          <CodeSwitcher
            python={{ html: workerPy, filename: "worker.py" }}
            typescript={{ html: workerTs, filename: "worker.ts" }}
            maxWidth={820}
          />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">05 · Connect an HTTP interface</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            A <code className="inline">role=&quot;orchestrator&quot;</code> Dendrite has no Axon —
            its job is to dispatch tasks and collect results. Keep your web framework at the edge and
            dispatch TASK Signals from route handlers via the orchestrator Dendrite. Install Flask
            with <code className="inline">pip install flask</code> or Express with{" "}
            <code className="inline">npm install express</code>.
          </p>
          <CodeSwitcher
            python={{ html: serverPy, filename: "server.py" }}
            typescript={{ html: serverTs, filename: "server.ts" }}
            maxWidth={840}
          />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">06 · Watch the Signals flow</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            Attach a Doppler to see every Signal as it crosses the Synapse. It is a passive
            read-only subscriber — it never competes with Dendrites for messages.
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
            Watch the Doppler terminal — you&apos;ll see the full REGISTER → TASK → AGENT_OUTPUT
            trace as it happens.
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
            <Link href="/concepts" className="card">
              <div className="card-icon">→</div>
              <h3>Concepts</h3>
              <p>The full Cosmonapse vocabulary — Core, Engram, Doppler, Immune, and Cloud.</p>
            </Link>
            <Link href="/roadmap" className="card">
              <div className="card-icon">→</div>
              <h3>Roadmap</h3>
              <p>
                v0.1 manual SDK · v0.2 Axon-as-MCP · v0.3 declarative router · v0.4 router agent.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
