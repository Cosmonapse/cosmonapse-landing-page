"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import DemoFrame from "@/components/DemoFrame";

// ── Shared ───────────────────────────────────────────────────────────────

const installPy = `<span class="tk-cm"># Python 3.11+</span>
pip install cosmonapse httpx`;

// ── Core path snippets ───────────────────────────────────────────────────

const initSnippet = `<span class="tk-op">$</span> cosmo init my-app <span class="tk-op">-n</span> quickstart

<span class="tk-cm">  Scaffolded my-app in ./my-app</span>
<span class="tk-cm">    + config.py   + neurons/hello.py   + effector/tools.py</span>
<span class="tk-cm">    + brain.py    + demo.py            + README.md</span>

<span class="tk-op">$</span> cd my-app
<span class="tk-op">$</span> python demo.py   <span class="tk-cm"># one process, in-process bus - no setup</span>`;

const synapseSnippet = `<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>quickstart

<span class="tk-cm">  URL:        cosmo://127.0.0.1:7070</span>
<span class="tk-cm">  Namespace:  quickstart</span>
<span class="tk-cm">  Transport:  TCP + NDJSON  (single-host dev only)</span>
<span class="tk-cm">  ────────────────────────────────────────────────</span>`;

const neuronPy = `<span class="tk-kw">import</span> os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron

<span class="tk-cm"># Lower level, two steps. Neuron(source=...) is a pure async callable;</span>
<span class="tk-cm"># the Axon gives it an identity and validates its output into a Signal.</span>
neuron <span class="tk-op">=</span> <span class="tk-fn">Neuron</span>(source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>], use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>)

axon <span class="tk-op">=</span> <span class="tk-fn">Axon</span>(neuron_id<span class="tk-op">=</span><span class="tk-str">"llama"</span>, neuron_fn<span class="tk-op">=</span>neuron,
    capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>])`;

const workerPy = `<span class="tk-kw">import</span> asyncio, os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, Neuron, connect_synapse

<span class="tk-cm"># Build the Neuron, then wire it into an Axon (the two-step, lower-level form).</span>
<span class="tk-cm"># role="worker": hosts Axons, replies to TASKs, cannot dispatch TASKs.</span>
neuron <span class="tk-op">=</span> <span class="tk-fn">Neuron</span>(source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>], use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>)
axon <span class="tk-op">=</span> <span class="tk-fn">Axon</span>(neuron_id<span class="tk-op">=</span><span class="tk-str">"llama"</span>, neuron_fn<span class="tk-op">=</span>neuron, capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>])

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    worker  <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker.<span class="tk-fn">attach_axon</span>(axon)
    <span class="tk-kw">async with</span> worker:
        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(<span class="tk-fn">float</span>(<span class="tk-str">"inf"</span>))  <span class="tk-cm"># serve until Ctrl-C</span>

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const serverPy = `<span class="tk-kw">import</span> asyncio, threading
<span class="tk-kw">from</span> flask <span class="tk-kw">import</span> Flask, jsonify, request
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse

<span class="tk-cm"># asyncio loop in a background thread  -  Flask stays synchronous.</span>
loop <span class="tk-op">=</span> asyncio.<span class="tk-fn">new_event_loop</span>()
threading.<span class="tk-fn">Thread</span>(target<span class="tk-op">=</span>loop.run_forever, daemon<span class="tk-op">=</span><span class="tk-kw">True</span>).<span class="tk-fn">start</span>()
orch: Dendrite <span class="tk-op">=</span> <span class="tk-kw">None</span>

<span class="tk-kw">async def</span> <span class="tk-fn">setup</span>():
    <span class="tk-kw">global</span> orch
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>, role<span class="tk-op">=</span><span class="tk-str">"orchestrator"</span>)
    <span class="tk-kw">await</span> orch.<span class="tk-fn">start</span>()

asyncio.<span class="tk-fn">run_coroutine_threadsafe</span>(<span class="tk-fn">setup</span>(), loop).<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">10</span>)
app <span class="tk-op">=</span> <span class="tk-fn">Flask</span>(__name__)

<span class="tk-op">@</span>app.<span class="tk-fn">post</span>(<span class="tk-str">"/task"</span>)
<span class="tk-kw">def</span> <span class="tk-fn">submit</span>():
    <span class="tk-cm"># dispatch_and_wait: emit a TASK, await the first terminal Signal,</span>
    <span class="tk-cm"># close the Pathway, return the Signal. No manual future plumbing.</span>
    fut <span class="tk-op">=</span> asyncio.<span class="tk-fn">run_coroutine_threadsafe</span>(
        orch.<span class="tk-fn">dispatch_and_wait</span>(neuron<span class="tk-op">=</span><span class="tk-str">"llama"</span>,
                               input<span class="tk-op">=</span>request.<span class="tk-fn">get_json</span>(), timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>),
        loop,
    )
    reply <span class="tk-op">=</span> fut.<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">32</span>)
    <span class="tk-kw">return</span> <span class="tk-fn">jsonify</span>(reply.payload[<span class="tk-str">"output"</span>])

app.<span class="tk-fn">run</span>(port<span class="tk-op">=</span><span class="tk-num">5000</span>)`;

const dopplerSnippet = `<span class="tk-op">$</span> cosmo prism <span class="tk-op">--</span>tail <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> quickstart

<span class="tk-cm">  REGISTER      neuron=llama  capabilities=['chat']</span>
<span class="tk-cm">  TASK          trace=trc_01...  neuron=llama</span>
<span class="tk-cm">  AGENT_OUTPUT  trace=trc_01...  neuron=llama</span>

<span class="tk-cm"># filter to specific signal types</span>
<span class="tk-op">$</span> cosmo prism <span class="tk-op">--</span>tail <span class="tk-op">-n</span> quickstart <span class="tk-op">--</span>type TASK <span class="tk-op">--</span>type AGENT_OUTPUT

<span class="tk-cm"># or open Prism  -  the live browser visualization (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> quickstart`;

const testSnippet = `<span class="tk-op">$</span> curl <span class="tk-op">-s</span> <span class="tk-op">-X</span> POST http://localhost:5000/task <span class="tk-op">\\</span>
       <span class="tk-op">-H</span> <span class="tk-str">"Content-Type: application/json"</span> <span class="tk-op">\\</span>
       <span class="tk-op">-d</span> <span class="tk-str">'{"prompt": "Say hello to Cosmonapse."}'</span>

<span class="tk-cm">{"response": "Hello! Great to meet you, Cosmonapse..."}</span>`;

const CORE_STEPS = [
  { id: "step-01", label: "Install" },
  { id: "step-02", label: "Scaffold" },
  { id: "step-03", label: "Synapse" },
  { id: "step-04", label: "Axon" },
  { id: "step-05", label: "Dendrite" },
  { id: "step-06", label: "HTTP" },
  { id: "step-07", label: "Watch" },
  { id: "step-08", label: "Test" },
];

const NEEDS = [
  { title: "Python 3.11+", body: "The cosmo CLI ships inside the cosmonapse package - one install gets you both." },
  { title: "An HF token", body: "Free at huggingface.co/settings/tokens. Swap the source= for openai, anthropic or ollama if you'd rather use those." },
  { title: "Three terminals", body: "One for the Synapse, one for the worker Dendrite, one for the HTTP server. Nothing needs Docker." },
];

// ── Genesis path snippets ────────────────────────────────────────────────

const genesisOpenSnippet = `<span class="tk-cm"># same install as Core - Genesis ships in the same package</span>
<span class="tk-op">$</span> pip install cosmonapse

<span class="tk-op">$</span> cosmo genesis

<span class="tk-cm">  Genesis running at http://127.0.0.1:7072</span>
<span class="tk-cm">  Opening in your browser...</span>`;

const GENESIS_STEPS = [
  { id: "gs-01", label: "Install" },
  { id: "gs-02", label: "Canvas" },
  { id: "gs-03", label: "Add primitives" },
  { id: "gs-04", label: "Run + Connect" },
];

export default function QuickstartTabs() {
  const [tab, setTab] = React.useState<"core" | "genesis">("core");

  return (
    <div className="qs-tabs">
      <div className="qs-tablist" role="tablist" aria-label="Quickstart path">
        <button
          type="button"
          role="tab"
          id="tab-core"
          aria-selected={tab === "core"}
          aria-controls="panel-core"
          className={`qs-tab${tab === "core" ? " active" : ""}`}
          style={{ ["--qs-tab-color" as unknown as string]: "var(--accent)" } as React.CSSProperties}
          onClick={() => setTab("core")}
        >
          <span className="qs-tab-dot" />
          Core <span className="qs-tab-sub">&mdash; wire it by hand</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-genesis"
          aria-selected={tab === "genesis"}
          aria-controls="panel-genesis"
          className={`qs-tab${tab === "genesis" ? " active" : ""}`}
          style={{ ["--qs-tab-color" as unknown as string]: "var(--accent-3)" } as React.CSSProperties}
          onClick={() => setTab("genesis")}
        >
          <span className="qs-tab-dot" />
          Genesis <span className="qs-tab-sub">&mdash; build it on a canvas</span>
        </button>
      </div>

      {tab === "core" ? (
        <div role="tabpanel" id="panel-core" aria-labelledby="tab-core">
          <p className="prose" style={{ marginBottom: 28, maxWidth: 720 }}>
            The eight steps below build a working Axon + Dendrite round-trip entirely by hand, so
            you see every wire before anything writes code for you. If you&apos;d rather place
            components on a canvas and let Genesis generate the same files, switch to the{" "}
            <button
              type="button"
              onClick={() => setTab("genesis")}
              className="inline-link"
              style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
            >
              Genesis tab
            </button>
            .
          </p>

          <div className="grid-3" style={{ marginBottom: 40 }}>
            {NEEDS.map((n) => (
              <div className="card" key={n.title}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </div>
            ))}
          </div>

          <nav className="qs-jumpnav" aria-label="Jump to a step">
            {CORE_STEPS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`}>
                {String(i + 1).padStart(2, "0")} {s.label}
              </a>
            ))}
          </nav>

          <section className="section-sm" id="step-01" style={{ paddingTop: 0 }}>
            <div className="sub-eyebrow">01 · Install</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Python 3.11+. The <code className="inline">cosmo</code> CLI ships with the
              Python package  -  run it from your virtualenv.
            </p>
            <CodeBlock html={installPy} maxWidth={720} />
          </section>

          <section className="section-sm" id="step-02">
            <div className="sub-eyebrow">02 · Scaffold, then code</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Init, scaffold, then code. <code className="inline">cosmo init</code> writes the
              standard package skeleton every example follows  -  {" "}
              <code className="inline">config.py</code>, <code className="inline">neurons/</code>,{" "}
              <code className="inline">effector/</code>, <code className="inline">brain.py</code>,{" "}
              <code className="inline">demo.py</code>  -  with a working Axon + Dendrite round-trip
              and one tool call. The steps below build the same thing by hand so you can see
              every wire; when you code your own project, new Neuron modules go under{" "}
              <code className="inline">neurons/</code>, tool families under{" "}
              <code className="inline">effector/</code>, and the wiring stays in{" "}
              <code className="inline">brain.py</code>.
            </p>
            <CodeBlock html={initSnippet} maxWidth={760} />
          </section>

          <section className="section-sm" id="step-03">
            <div className="sub-eyebrow">03 · Start a Synapse</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              <code className="inline">cosmo synapse start memory</code> boots a local TCP+NDJSON
              broker  -  no Docker, no NATS, no Postgres. Swap the URL for{" "}
              <code className="inline">nats://</code> or <code className="inline">kafka://</code> when
              you move to production  -  the rest of your code stays the same.
            </p>
            <CodeBlock html={synapseSnippet} maxWidth={760} />
          </section>

          <section className="section-sm" id="step-04">
            <div className="sub-eyebrow">04 · Build an Axon</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Two steps, the lower-level way:{" "}
              <code className="inline">Neuron(source=&quot;huggingface&quot;, ...)</code>{" "}
              returns a pure async callable, and{" "}
              <code className="inline">Axon(neuron_id=..., neuron_fn=...)</code> gives it an
              identity on the bus. The Axon validates the Neuron&apos;s raw output into a Signal;
              the Neuron itself never sees the protocol. The one-call factory{" "}
              <code className="inline">Axon.huggingface()</code>  -  and{" "}
              <code className="inline">.openai()</code>,{" "}
              <code className="inline">.anthropic()</code>,{" "}
              <code className="inline">.ollama()</code>,{" "}
              <code className="inline">.mcp()</code>  -  is shorthand for exactly this. Set{" "}
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
            <CodeBlock html={neuronPy} maxWidth={760} />
          </section>

          <section className="section-sm" id="step-05">
            <div className="sub-eyebrow">05 · Wire a Dendrite</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              The <strong>Dendrite</strong> is the only component that touches the Synapse  -  it hosts
              the Axon, emits REGISTER / HEARTBEAT / DEREGISTER, and routes inbound TASKs. Run this
              in a second terminal; it registers and waits for tasks.
            </p>
            <CodeBlock html={workerPy} filename="worker.py" maxWidth={820} />
          </section>

          <section className="section-sm" id="step-06">
            <div className="sub-eyebrow">06 · Connect an HTTP interface</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              A <code className="inline">role=&quot;orchestrator&quot;</code> Dendrite has no Axon -
              its job is to dispatch tasks and collect results. Keep your web framework at the edge and
              dispatch TASK Signals from route handlers via the orchestrator Dendrite. Install Flask
              with <code className="inline">pip install flask</code>.
            </p>
            <CodeBlock html={serverPy} filename="app.py" maxWidth={840} />
          </section>

          <section className="section-sm" id="step-07">
            <div className="sub-eyebrow">07 · Watch the Signals flow</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Attach a Doppler to see every Signal as it crosses the Synapse. It is a passive
              read-only subscriber  -  it never competes with Dendrites for messages.
            </p>
            <CodeBlock html={dopplerSnippet} maxWidth={760} />
          </section>

          <section className="section-sm" id="step-08">
            <div className="sub-eyebrow">08 · Test it</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              With the synapse, worker, and server all running, send a task:
            </p>
            <CodeBlock html={testSnippet} maxWidth={760} />
            <p className="prose" style={{ marginTop: 16 }}>
              Watch the Doppler terminal  -  you&apos;ll see the full REGISTER → TASK → AGENT_OUTPUT
              trace as it happens.
            </p>
          </section>
        </div>
      ) : (
        <div role="tabpanel" id="panel-genesis" aria-labelledby="tab-genesis">
          <p className="prose" style={{ marginBottom: 28, maxWidth: 720 }}>
            Same install, same primitives, same <code className="inline">brain.py</code> - Genesis
            just writes the files for you. Place a Neuron on the canvas instead of typing the
            eight steps on the{" "}
            <button
              type="button"
              onClick={() => setTab("core")}
              className="inline-link"
              style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
            >
              Core tab
            </button>
            , and Genesis wires the same Axon + Dendrite round-trip into your project.
          </p>

          <DemoFrame
            src="/genesis/quickstart.jpg"
            address="http://127.0.0.1:7072"
            badge="GENESIS PREVIEW"
            accent="var(--accent-3)"
            caption="Install, open the canvas, drop a Neuron and a Receptor, then Run and Connect - the whole first five minutes in one shot."
            maxWidth={860}
          />

          <nav className="qs-jumpnav" style={{ marginTop: 40 }} aria-label="Jump to a step">
            {GENESIS_STEPS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`}>
                {String(i + 1).padStart(2, "0")} {s.label}
              </a>
            ))}
          </nav>

          <section className="section-sm" id="gs-01" style={{ paddingTop: 0 }}>
            <div className="sub-eyebrow" style={{ color: "var(--accent-3)" }}>01 · Install</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Genesis ships inside the same package as the runtime - there is nothing extra to
              install. <code className="inline">cosmo genesis</code> opens it in your browser at{" "}
              <code className="inline">127.0.0.1:7072</code>.
            </p>
            <CodeBlock html={genesisOpenSnippet} maxWidth={720} />
          </section>

          <section className="section-sm" id="gs-02">
            <div className="sub-eyebrow" style={{ color: "var(--accent-3)" }}>02 · Open the canvas</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Name a brain and pick a folder - Genesis scaffolds the same standard skeleton{" "}
              <code className="inline">cosmo init</code> does. You land on an empty ring with one
              Synapse at the centre; everything you add orbits it.
            </p>
          </section>

          <section className="section-sm" id="gs-03">
            <div className="sub-eyebrow" style={{ color: "var(--accent-3)" }}>03 · Add primitives</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Pick a Neuron from the palette, point it at Hugging Face, OpenAI, Anthropic or
              Ollama, and name it. Genesis writes{" "}
              <code className="inline">neurons/&lt;name&gt;.py</code> and wires it into{" "}
              <code className="inline">brain.py</code> for you - the name you type becomes the
              component&apos;s id on the bus. Add a Receptor the same way to give the brain a CLI,
              an API, or a chat front door.
            </p>
          </section>

          <section className="section-sm" id="gs-04">
            <div className="sub-eyebrow" style={{ color: "var(--accent-3)" }}>04 · Run and Connect</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Press Run to start <code className="inline">brain.py</code> as a real process - the
              liveness pill goes green once it&apos;s actually serving. Connect opens the
              Receptor&apos;s own surface: a terminal for a CLI Receptor, a request builder for an
              API one, a chat panel for a chat one. What you exercise here is the production path,
              not a mock of it.
            </p>
            <div className="hero-ctas" style={{ marginTop: 8, marginBottom: 0 }}>
              <Link href="/genesis" className="btn btn-primary">
                Read the full Genesis walkthrough <span className="arrow">→</span>
              </Link>
              <Link href="/prism" className="btn btn-ghost">
                Then watch it run in Prism
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
