"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";
import ComboExample, {
  type Combo,
  type ComboData,
} from "@/components/ComboExample";
import { PY_URL, installStep, isPython, scaffoldStep, brokerStep, runStep } from "../_shared";

// ===========================================================================
// Python  -  round-robin worker + cortex, parametrised by the Synapse URL.
// Only SYNAPSE_URL changes between dev / NATS / Kafka.
// ===========================================================================

const pyWorker = (url: string) => `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">import</span> os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron, Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>   <span class="tk-cm"># ← the only line that changes per transport</span>
NAMESPACE   <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>
MY_ID       <span class="tk-op">=</span> <span class="tk-str">"worker-a"</span>      <span class="tk-cm"># worker-b is identical but for this line</span>

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    axon <span class="tk-op">=</span> Axon(
        neuron_id<span class="tk-op">=</span>MY_ID,
        neuron_fn<span class="tk-op">=</span>Neuron(
            source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
            endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
            model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
            api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
            use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>, max_new_tokens<span class="tk-op">=</span><span class="tk-num">128</span>,
        ),
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"text-generation"</span>, <span class="tk-str">"chat"</span>],
    )

    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                        dendrite_id<span class="tk-op">=</span>MY_ID)
    dendrite.<span class="tk-fn">attach_axon</span>(axon)

    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"{MY_ID} ready"</span>)
            <span class="tk-kw">await</span> asyncio.<span class="tk-fn">Event</span>().<span class="tk-fn">wait</span>()
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const pyCortex = (url: string) => `<span class="tk-kw">import</span> asyncio, itertools
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse, new_trace_id

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>
WORKERS <span class="tk-op">=</span> (<span class="tk-str">"worker-a"</span>, <span class="tk-str">"worker-b"</span>)

<span class="tk-kw">class</span> <span class="tk-fn">RoundRobinCortex</span>:
    <span class="tk-str">"""A Dendrite that round-robins prompts across a worker pool."""</span>

    <span class="tk-kw">def</span> <span class="tk-fn">__init__</span>(self, dendrite, workers):
        self._dendrite <span class="tk-op">=</span> dendrite
        self._cycle    <span class="tk-op">=</span> itertools.<span class="tk-fn">cycle</span>(workers)
        self._pending  <span class="tk-op">=</span> {}

        <span class="tk-op">@</span>dendrite.<span class="tk-fn">on_agent_output</span>
        <span class="tk-kw">async def</span> <span class="tk-fn">_on_output</span>(sig):
            fut <span class="tk-op">=</span> self._pending.<span class="tk-fn">pop</span>(sig.trace_id, <span class="tk-kw">None</span>)
            <span class="tk-kw">if</span> fut <span class="tk-kw">and not</span> fut.<span class="tk-fn">done</span>():
                fut.<span class="tk-fn">set_result</span>(sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"output"</span>, {}))

    <span class="tk-kw">async def</span> <span class="tk-fn">ask</span>(self, prompt, timeout<span class="tk-op">=</span><span class="tk-num">60.0</span>):
        target   <span class="tk-op">=</span> <span class="tk-fn">next</span>(self._cycle)        <span class="tk-cm"># ← round-robin pick</span>
        trace_id <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()
        fut      <span class="tk-op">=</span> asyncio.<span class="tk-fn">get_running_loop</span>().<span class="tk-fn">create_future</span>()
        self._pending[trace_id] <span class="tk-op">=</span> fut
        <span class="tk-kw">await</span> self._dendrite.<span class="tk-fn">dispatch_task</span>(
            neuron<span class="tk-op">=</span>target, input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: prompt}, trace_id<span class="tk-op">=</span>trace_id,
        )
        <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"→ dispatched to {target}"</span>)
        <span class="tk-kw">return</span> <span class="tk-kw">await</span> asyncio.<span class="tk-fn">wait_for</span>(fut, timeout<span class="tk-op">=</span>timeout)

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"cortex"</span>, heartbeat_s<span class="tk-op">=</span><span class="tk-num">0</span>)
    cortex   <span class="tk-op">=</span> <span class="tk-fn">RoundRobinCortex</span>(dendrite, WORKERS)

    prompts <span class="tk-op">=</span> [<span class="tk-str">"haiku: the sun"</span>, <span class="tk-str">"haiku: the moon"</span>,
               <span class="tk-str">"haiku: the sea"</span>, <span class="tk-str">"haiku: the wind"</span>]
    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            <span class="tk-kw">for</span> p <span class="tk-kw">in</span> prompts:
                result <span class="tk-op">=</span> <span class="tk-kw">await</span> cortex.<span class="tk-fn">ask</span>(p)
                <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"   ← {result.get('response', '').strip()}"</span>)
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const outputSnippet = `<span class="tk-op">$</span> python demo.py
→ dispatched to worker-a
   ← Golden disc ascends  -  silence breaks into light.
→ dispatched to worker-b
   ← Pale lantern in the dark  -  tides remember her face.
→ dispatched to worker-a
   ← Salt sighs against stone, an old song the wind forgot.
→ dispatched to worker-b
   ← Invisible river  -  it bends the wheat into prayer.`;

// ---------------------------------------------------------------------------
// Per-combo step assembly
// ---------------------------------------------------------------------------

function pyData(combo: "py-dev" | "py-nats" | "py-kafka"): ComboData {
  const url = PY_URL[combo];
  const broker = brokerStep(combo);
  const last = runStep(combo, [
    { label: "first worker", cmd: "python worker_a.py" },
    { label: "second worker", cmd: "python worker_b.py" },
    { label: "the cortex", cmd: "python demo.py" },
  ]);
  last.afterProse = (
    <>Watch the prompts alternate A, B, A, B in the cortex output:</>
  );
  last.html2 = outputSnippet;
  return {
    steps: [
      installStep(combo),
      ...(isPython(combo) ? [scaffoldStep("round-robin")] : []),
      ...(broker ? [broker] : []),
      {
        eyebrow: "Worker  -  a Neuron behind an Axon",
        prose: (
          <>
            A Worker Dendrite that hosts a single Axon wrapping a HuggingFace{" "}
            <code className="inline">Neuron</code>. Copy it to{" "}
            <code className="inline">worker_b.py</code> and change only{" "}
            <code className="inline">MY_ID</code> to{" "}
            <code className="inline">&quot;worker-b&quot;</code> (and the model,
            if you like).
          </>
        ),
        filename: "worker_a.py",
        html: pyWorker(url),
      },
      {
        eyebrow: "The Cortex  -  a round-robin Dendrite",
        prose: (
          <>
            A Cortex is just a Dendrite that dispatches tasks and collects
            results.{" "}
            <code className="inline">itertools.cycle(WORKERS)</code> picks the
            next target; a <code className="inline">trace_id → Future</code> map
            resolves the caller when the matching{" "}
            <code className="inline">AGENT_OUTPUT</code> returns.
          </>
        ),
        filename: "demo.py",
        html: pyCortex(url),
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
        <strong>More workers.</strong> Add{" "}
        <code className="inline">worker-c</code> and extend the{" "}
        <code className="inline">WORKERS</code> list  -  the cycle handles any
        length.
      </p>
      <p>
        <strong>Weighted round-robin.</strong> Replace the cycle with a custom
        sequence  -  e.g.{" "}
        <code className="inline">[&quot;a&quot;, &quot;a&quot;, &quot;b&quot;]</code>{" "}
        to send 2-of-3 to worker A.
      </p>
      <p>
        <strong>Dynamic membership.</strong> Pass a{" "}
        <code className="inline">registry_store</code> to the Cortex and call{" "}
        <code className="inline">find_neurons(capability=&quot;chat&quot;)</code>{" "}
        instead of a static list  -  workers can join and leave at runtime.
      </p>
          <p>
      <strong>Change transport.</strong> Every other tab is the same
      topology  -  only the install, the synapse you connect to, and the
      launch commands change. The routing logic is byte-for-byte identical.
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

export default function RoundRobinClient() {
  return (
    <>
      <div className="example-breadcrumb">
        <div className="container">
          <Link href="/examples" className="breadcrumb-back">
            ← Examples
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Orchestrator + Round Robin</span>
        </div>
      </div>

      <header className="page-header" style={{ marginBottom: 24 }}>
        <div className="container">
          <div className="page-eyebrow">// 01 · Orchestration</div>
          <h1 className="page-title">
            Two Neurons. Two Axons.
            One Synapse. One Cortex.
            One Synapse. One Cortex.
          </h1>
          <p className="page-sub">
            A Cortex (orchestrator Dendrite) load-balances prompts across two
            workers in a simple rotation. Each{" "}
            <code className="inline">ask(prompt)</code> dispatches the TASK to
            the next worker, then resolves a future when the matching{" "}
            <code className="inline">AGENT_OUTPUT</code> returns. The same code
            runs over five language × transport stacks  -  pick one below.
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
            <PrismPreview namespace="quickstart" src="/prism/round-robin.mp4" />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/no-orchestrator" className="card">
              <div className="card-icon">→</div>
              <h3>No orchestrator</h3>
              <p>
                Drop the Cortex  -  the workers decide who handles each task,
                with zero coordination.
              </p>
            </Link>
            <Link href="/core/quickstart" className="card">
              <div className="card-icon">→</div>
              <h3>Quickstart</h3>
              <p>The single-worker walkthrough this example builds on.</p>
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
}
