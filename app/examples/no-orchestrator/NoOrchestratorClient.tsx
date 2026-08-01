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
// Python  -  self-selecting worker + a routing-free producer.
// Both workers run the SAME owner_of(trace_id); exactly one claims each task.
// Only SYNAPSE_URL changes between dev / NATS / Kafka.
// ===========================================================================

const pyWorker = (url: string) => `<span class="tk-kw">import</span> asyncio, hashlib, os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron, Dendrite, SignalType, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>   <span class="tk-cm"># ← the only line that changes per transport</span>
NAMESPACE   <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>
MY_ID       <span class="tk-op">=</span> <span class="tk-str">"worker-a"</span>                 <span class="tk-cm"># worker-b differs only here</span>
PEERS       <span class="tk-op">=</span> (<span class="tk-str">"worker-a"</span>, <span class="tk-str">"worker-b"</span>)   <span class="tk-cm"># every peer knows the pool</span>

<span class="tk-kw">def</span> <span class="tk-fn">owner_of</span>(trace_id: str) <span class="tk-op">-&gt;</span> str:
    <span class="tk-str">"""Pure function: every peer computes the SAME owner  -  no coordination."""</span>
    h <span class="tk-op">=</span> <span class="tk-fn">int</span>(hashlib.<span class="tk-fn">sha1</span>(trace_id.<span class="tk-fn">encode</span>()).<span class="tk-fn">hexdigest</span>(), <span class="tk-num">16</span>)
    <span class="tk-kw">return</span> PEERS[h <span class="tk-op">%</span> <span class="tk-fn">len</span>(PEERS)]

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    <span class="tk-cm"># The Axon is NOT attached  -  we route by hash, not by neuron-id.</span>
    axon <span class="tk-op">=</span> Axon(
        neuron_id<span class="tk-op">=</span>MY_ID,
        neuron_fn<span class="tk-op">=</span>Neuron(
            source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
            endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
            model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
            api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
            use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>, max_new_tokens<span class="tk-op">=</span><span class="tk-num">128</span>,
        ),
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>],
    )

    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                        dendrite_id<span class="tk-op">=</span>MY_ID, heartbeat_s<span class="tk-op">=</span><span class="tk-num">0</span>)

    <span class="tk-kw">async def</span> <span class="tk-fn">on_task</span>(task):
        <span class="tk-kw">if</span> <span class="tk-fn">owner_of</span>(task.trace_id) <span class="tk-op">!=</span> MY_ID:
            <span class="tk-kw">return</span>                              <span class="tk-cm"># a peer owns this one</span>
        <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{MY_ID}] claims {task.trace_id[4:12]}"</span>)
        reply <span class="tk-op">=</span> <span class="tk-kw">await</span> axon.<span class="tk-fn">handle_task</span>(task)   <span class="tk-cm"># run the Neuron</span>
        <span class="tk-kw">await</span> dendrite.<span class="tk-fn">publish</span>(reply)          <span class="tk-cm"># emit AGENT_OUTPUT</span>

    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            <span class="tk-kw">await</span> dendrite.<span class="tk-fn">subscribe</span>(SignalType.TASK, on_task)
            <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"{MY_ID} listening  -  no cortex, no queue"</span>)
            <span class="tk-kw">await</span> asyncio.<span class="tk-fn">Event</span>().<span class="tk-fn">wait</span>()
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const pyProducer = (url: string) => `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse, new_trace_id

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"producer"</span>, heartbeat_s<span class="tk-op">=</span><span class="tk-num">0</span>)
    pending <span class="tk-op">=</span> {}

    <span class="tk-op">@</span>dendrite.<span class="tk-fn">on_agent_output</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">_on_output</span>(sig):
        fut <span class="tk-op">=</span> pending.<span class="tk-fn">pop</span>(sig.trace_id, <span class="tk-kw">None</span>)
        <span class="tk-kw">if</span> fut <span class="tk-kw">and not</span> fut.<span class="tk-fn">done</span>():
            who <span class="tk-op">=</span> sig.directed.id <span class="tk-kw">if</span> sig.directed <span class="tk-kw">else</span> <span class="tk-str">"?"</span>
            fut.<span class="tk-fn">set_result</span>((who, sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"output"</span>, {})))

    prompts <span class="tk-op">=</span> [<span class="tk-str">"the sun"</span>, <span class="tk-str">"the moon"</span>, <span class="tk-str">"the sea"</span>, <span class="tk-str">"the wind"</span>]
    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            <span class="tk-kw">for</span> p <span class="tk-kw">in</span> prompts:
                trace_id <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()
                fut <span class="tk-op">=</span> asyncio.<span class="tk-fn">get_running_loop</span>().<span class="tk-fn">create_future</span>()
                pending[trace_id] <span class="tk-op">=</span> fut
                <span class="tk-cm"># The producer does NO routing  -  it just drops work in.</span>
                <span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatch_task</span>(neuron<span class="tk-op">=</span><span class="tk-str">"pool"</span>,
                                             input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: p}, trace_id<span class="tk-op">=</span>trace_id)
                who, out <span class="tk-op">=</span> <span class="tk-kw">await</span> asyncio.<span class="tk-fn">wait_for</span>(fut, timeout<span class="tk-op">=</span><span class="tk-num">60</span>)
                <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"{who} answered: {out.get('response', '').strip()}"</span>)
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const outputSnippet = `<span class="tk-op">$</span> python demo.py
<span class="tk-cm"># …meanwhile, in the two worker terminals:</span>
[worker-b] claims a3f2c1d8
[worker-a] claims 7b1e0942
[worker-a] claims 11ce88a4
[worker-b] claims 92aa5b30

<span class="tk-cm"># demo.py prints, in order:</span>
worker-b answered: Golden disc ascends  -  silence breaks into light.
worker-a answered: Pale lantern in the dark  -  tides remember her face.
worker-a answered: Salt sighs against stone, an old song the wind forgot.
worker-b answered: Invisible river  -  it bends the wheat into prayer.`;

// ---------------------------------------------------------------------------
// Per-combo step assembly
// ---------------------------------------------------------------------------

const noAttachNote = (
  <>
    Note the Axon is built but{" "}
    <strong>never attached to the Dendrite</strong>. Attaching would make the
    Dendrite auto-handle every TASK addressed to its{" "}
    <code className="inline">neuron_id</code>; here we want the worker to decide
    for itself, so we subscribe to <code className="inline">TASK</code> directly
    and run the Neuron only when the hash names us.
  </>
);

function pyData(combo: "py-dev" | "py-nats" | "py-kafka"): ComboData {
  const url = PY_URL[combo];
  const broker = brokerStep(combo);
  const last = runStep(combo, [
    { label: "first worker", cmd: "python worker_a.py" },
    { label: "second worker", cmd: "python worker_b.py" },
    { label: "the producer", cmd: "python demo.py" },
  ]);
  last.afterProse = (
    <>
      Ownership is decided by the trace id, so the split is deterministic  -  not
      strictly alternating:
    </>
  );
  last.html2 = outputSnippet;
  return {
    steps: [
      installStep(combo),
      ...(isPython(combo) ? [scaffoldStep("no-orchestrator")] : []),
      ...(broker ? [broker] : []),
      {
        eyebrow: "Worker  -  it decides for itself",
        prose: noAttachNote,
        filename: "worker_a.py",
        html: pyWorker(url),
      },
      {
        eyebrow: "Producer  -  drops work in, routes nothing",
        prose: (
          <>
            The producer fires tasks addressed to a logical{" "}
            <code className="inline">&quot;pool&quot;</code> and waits for
            results. It never picks a worker  -  the{" "}
            <code className="inline">AGENT_OUTPUT</code> tells it who answered
            via <code className="inline">sig.directed.id</code>.
          </>
        ),
        filename: "demo.py",
        html: pyProducer(url),
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
        <strong>More peers.</strong> Add an id to{" "}
        <code className="inline">PEERS</code> on every worker. The hash spreads
        load across the new size automatically  -  no central change.
      </p>
      <p>
        <strong>Smoother rebalancing.</strong> Swap the modulo for{" "}
        consistent hashing with virtual nodes, so adding or removing a peer only
        moves a fraction of traces instead of reshuffling all of them.
      </p>
      <p>
        <strong>Broker-side balancing instead.</strong> If you don&apos;t need
        the workers to <em>decide</em>, give them the same{" "}
        <code className="inline">queue_group</code> on{" "}
        <code className="inline">subscribe(...)</code> and let the Synapse hand
        each task to exactly one  -  no hashing required.
      </p>
      <p>
        <strong>Live membership.</strong> Attach a{" "}
        <code className="inline">registry_store</code> and derive{" "}
        <code className="inline">PEERS</code> from{" "}
        <code className="inline">REGISTER</code> /{" "}
        <code className="inline">DEREGISTER</code> so the pool tracks workers
        joining and leaving.
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

export default function NoOrchestratorClient() {
  return (
    <>
      <div className="example-breadcrumb">
        <div className="container">
          <Link href="/examples" className="breadcrumb-back">
            ← Examples
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">No Orchestrator</span>
        </div>
      </div>

      <header className="page-header" style={{ marginBottom: 24 }}>
        <div className="container">
          <div className="page-eyebrow">// 02 · Decentralised</div>
          <h1 className="page-title">
            No Cortex.
            <br />
            The Dendrites Decide.
          </h1>
          <p className="page-sub">
            Drop the orchestrator entirely. A producer drops tasks into the
            namespace and every worker hears all of them  -  but each runs the
            same pure <code className="inline">owner_of(trace_id)</code>, so
            exactly one claims each task with zero coordination. No cortex, no
            queue, no shared state. Pick a stack below.
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
            <PrismPreview namespace="quickstart" src="/prism/no-orchestrator.mp4" />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/round-robin" className="card">
              <div className="card-icon">←</div>
              <h3>Orchestrator + Round Robin</h3>
              <p>
                The centralised counterpart  -  one Cortex assigns every task in a
                rotation.
              </p>
            </Link>
            <Link href="/core/concepts" className="card">
              <div className="card-icon">→</div>
              <h3>Concepts</h3>
              <p>Neuron, Axon, Dendrite, Synapse  -  what each one is and isn&apos;t.</p>
            </Link>
            <Link href="/docs" className="card">
              <div className="card-icon">→</div>
              <h3>API reference</h3>
              <p>Complete SDK and CLI reference for every primitive.</p>
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
