"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

// ---------------------------------------------------------------------------
// Snippets  -  kept in sync with cosmonapse-core/examples/engram_integration/main.py
// ---------------------------------------------------------------------------

const installSnippet = `<span class="tk-cm"># Python 3.11+. The default InMemoryEngram needs no extras.</span>
<span class="tk-op">$</span> pip install cosmonapse

<span class="tk-cm"># For durable storage:</span>
<span class="tk-op">$</span> pip install <span class="tk-str">"cosmonapse[postgres]"</span>   <span class="tk-cm"># PostgresEngram</span>
<span class="tk-cm"># (SqliteEngram is in the stdlib  -  no extra needed.)</span>`;

const neuronSnippet = `<span class="tk-cm"># The Neuron gains two keyword-only parameters: recall and imprint.</span>
<span class="tk-cm"># The Axon injects them at call time because the Axon was constructed</span>
<span class="tk-cm"># with engrams=[EngramBinding(name="ctx", ...)] (see step 2).</span>
<span class="tk-cm">#</span>
<span class="tk-cm"># Under the hood, recall("ctx", ...) emits a RECALL Signal under the</span>
<span class="tk-cm"># current trace_id and awaits the matching RECALLED reply. The Neuron</span>
<span class="tk-cm"># stays pure  -  it never imports the protocol or touches the Synapse.</span>
<span class="tk-kw">async def</span> <span class="tk-fn">researcher</span>(input, context, *, recall, imprint):
    question <span class="tk-op">=</span> input[<span class="tk-str">"question"</span>]

    <span class="tk-cm"># 1. Look in shared memory for a prior answer to this exact question.</span>
    prior <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"ctx"</span>, query<span class="tk-op">=</span>{<span class="tk-str">"text"</span>: question})
    <span class="tk-kw">if</span> prior.hits:
        cached <span class="tk-op">=</span> prior.hits[<span class="tk-num">0</span>].content[<span class="tk-str">"answer"</span>]
        <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: cached, <span class="tk-str">"source"</span>: <span class="tk-str">"cache"</span>}

    <span class="tk-cm"># 2. Compute a "fresh" answer (stubbed for the demo).</span>
    answer <span class="tk-op">=</span> <span class="tk-fn">f</span><span class="tk-str">"Answer to {question!r}: 42"</span>

    <span class="tk-cm"># 3. Write it back so the next call hits the cache.</span>
    <span class="tk-cm">#    merge_key dedupes by question text so repeated imprints upsert</span>
    <span class="tk-cm">#    a single entry per question.</span>
    <span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(
        <span class="tk-str">"ctx"</span>,
        op<span class="tk-op">=</span><span class="tk-str">"upsert"</span>,
        entry<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: question, <span class="tk-str">"answer"</span>: answer, <span class="tk-str">"tags"</span>: [<span class="tk-str">"qa"</span>]},
        merge_key<span class="tk-op">=</span><span class="tk-fn">f</span><span class="tk-str">"q:{question}"</span>,
        await_ack<span class="tk-op">=</span><span class="tk-kw">True</span>,
        deadline_ms<span class="tk-op">=</span><span class="tk-num">500</span>,
    )
    <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: answer, <span class="tk-str">"source"</span>: <span class="tk-str">"computed"</span>}`;

const wiringSnippet = `<span class="tk-cm"># Three Dendrites, one shared Synapse:</span>
<span class="tk-cm">#</span>
<span class="tk-cm">#   host           -  owns the Engram backend (answers RECALL/IMPRINT)</span>
<span class="tk-cm">#   worker         -  hosts the Neuron, declares the EngramBinding</span>
<span class="tk-cm">#   orchestrator   -  dispatches TASKs</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> (
    Axon, Dendrite, EngramBinding, InMemoryEngram, MemorySynapse,
)

synapse <span class="tk-op">=</span> MemorySynapse()
<span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>()

<span class="tk-cm"># 1. Engram host. engram_id="ctx" is the wire address.</span>
host <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>,
                  dendrite_id<span class="tk-op">=</span><span class="tk-str">"engram-host"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
host.<span class="tk-fn">attach_engram</span>(
    InMemoryEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"ctx"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"context"</span>)
)

<span class="tk-cm"># 2. Worker. The binding maps a local name ("ctx") to the wire</span>
<span class="tk-cm">#    engram_id, so the Neuron addresses memory by a stable local</span>
<span class="tk-cm">#    name  -  operations repoint the backend without editing Neuron code.</span>
worker <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>,
                    dendrite_id<span class="tk-op">=</span><span class="tk-str">"worker"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
worker.<span class="tk-fn">attach_axon</span>(
    Axon(
        neuron_id<span class="tk-op">=</span><span class="tk-str">"researcher"</span>,
        neuron_fn<span class="tk-op">=</span>researcher,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"research"</span>],
        engrams<span class="tk-op">=</span>[EngramBinding(name<span class="tk-op">=</span><span class="tk-str">"ctx"</span>, directed_id<span class="tk-op">=</span><span class="tk-str">"ctx"</span>)],
    )
)

orchestrator <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)`;

const dispatchSnippet = `<span class="tk-cm"># Call twice with the same input. The first call computes + imprints;</span>
<span class="tk-cm"># the second call recalls and short-circuits.</span>
<span class="tk-kw">async with</span> host, worker, orchestrator:
    <span class="tk-kw">for</span> label <span class="tk-kw">in</span> (<span class="tk-str">"first call "</span>, <span class="tk-str">"second call"</span>):
        reply <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(
            neuron<span class="tk-op">=</span><span class="tk-str">"researcher"</span>,
            input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: <span class="tk-str">"what is the meaning of life?"</span>},
            timeout_s<span class="tk-op">=</span><span class="tk-num">5.0</span>,
        )
        out <span class="tk-op">=</span> reply.payload[<span class="tk-str">"output"</span>]
        <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{label}] {out['source']:>8s}  →  {out['answer']}"</span>)`;

const outputSnippet = `<span class="tk-op">$</span> python main.py
[first call ] computed  →  Answer to <span class="tk-str">'what is the meaning of life?'</span>: 42
[second call]    cache  →  Answer to <span class="tk-str">'what is the meaning of life?'</span>: 42`;

const backendsSnippet = `<span class="tk-cm"># Same Engram API, three backends. Swap the line where you mount it;</span>
<span class="tk-cm"># the Neuron and the binding never change.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> InMemoryEngram, SqliteEngram, PostgresEngram

<span class="tk-cm"># 1 · In-process  -  for tests &amp; single-process apps.</span>
host.<span class="tk-fn">attach_engram</span>(InMemoryEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"ctx"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"context"</span>))

<span class="tk-cm"># 2 · SQLite  -  durable, single file, no server.</span>
host.<span class="tk-fn">attach_engram</span>(SqliteEngram(
    engram_id<span class="tk-op">=</span><span class="tk-str">"ctx"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"context"</span>,
    path<span class="tk-op">=</span><span class="tk-str">"./engram.db"</span>,
))

<span class="tk-cm"># 3 · Postgres  -  for production. Requires the [postgres] extra.</span>
host.<span class="tk-fn">attach_engram</span>(PostgresEngram(
    engram_id<span class="tk-op">=</span><span class="tk-str">"ctx"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"context"</span>,
    dsn<span class="tk-op">=</span><span class="tk-str">"postgresql://user:pass@localhost/cosmo"</span>,
))`;

const opsSnippet = `<span class="tk-cm"># imprint operations</span>
<span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"ctx"</span>, op<span class="tk-op">=</span><span class="tk-str">"add"</span>,    entry<span class="tk-op">=</span>{...})                   <span class="tk-cm"># fail if exists</span>
<span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"ctx"</span>, op<span class="tk-op">=</span><span class="tk-str">"append"</span>, entry<span class="tk-op">=</span>{...})                   <span class="tk-cm"># always grow</span>
<span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"ctx"</span>, op<span class="tk-op">=</span><span class="tk-str">"merge"</span>,  entry<span class="tk-op">=</span>{...}, merge_key<span class="tk-op">=</span><span class="tk-str">"q:42"</span>)  <span class="tk-cm"># combine</span>
<span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"ctx"</span>, op<span class="tk-op">=</span><span class="tk-str">"upsert"</span>, entry<span class="tk-op">=</span>{...}, merge_key<span class="tk-op">=</span><span class="tk-str">"q:42"</span>)  <span class="tk-cm"># insert or replace</span>
<span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"ctx"</span>, op<span class="tk-op">=</span><span class="tk-str">"delete"</span>, entry<span class="tk-op">=</span>{...})                   <span class="tk-cm"># remove</span>

<span class="tk-cm"># recall modes (configure default on the binding)</span>
EngramBinding(name<span class="tk-op">=</span><span class="tk-str">"ctx"</span>, directed_id<span class="tk-op">=</span><span class="tk-str">"ctx"</span>, default_recall_mode<span class="tk-op">=</span><span class="tk-str">"merge"</span>)
<span class="tk-cm">#   "first"   -  return the best single match (default)</span>
<span class="tk-cm">#   "merge"   -  combine matching entries across backends</span>
<span class="tk-cm">#   "all"     -  return every match, partial flag if any backend timed out</span>`;

const prismSnippet = `<span class="tk-cm"># This example runs in-process on MemorySynapse, which Prism cannot</span>
<span class="tk-cm"># attach to. To watch it live, run a dev synapse and point the code at it:</span>

<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>demo

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> demo

<span class="tk-cm"># in the code  -  swap one line:</span>
<span class="tk-cm"># synapse = MemorySynapse()</span>
synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)`;

export default function EngramIntegrationClient() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Example 04 · Intermediate</div>
          <h1 className="page-title">Integrating an Engram.</h1>
          <p className="page-sub">
            Bind shared memory to a Neuron with{" "}
            <code className="inline">EngramBinding</code>. The Neuron calls{" "}
            <code className="inline">recall()</code> and{" "}
            <code className="inline">imprint()</code> to read and write the bound{" "}
            <Link href="/concepts" className="inline-link">Engram</Link> without
            ever touching the protocol. Backed by{" "}
            <code className="inline">InMemoryEngram</code> here; swap for{" "}
            <code className="inline">SqliteEngram</code> or{" "}
            <code className="inline">PostgresEngram</code> without editing Neuron
            code.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">00 · Install</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 16 }}>
            <code className="inline">InMemoryEngram</code> and{" "}
            <code className="inline">SqliteEngram</code> ship with the core
            package. <code className="inline">PostgresEngram</code> needs the{" "}
            <code className="inline">[postgres]</code> extra (which pulls in
            asyncpg).
          </p>
          <CodeBlock html={installSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">01 · The Neuron</div>
          <h2 className="sub-title">Pure function  -  plus two helpers.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The Neuron is still a plain async function. The only change is the
            signature: <code className="inline">recall</code> and{" "}
            <code className="inline">imprint</code> arrive as keyword-only
            parameters injected by the Axon. The Neuron addresses memory by the
            local binding name (<code className="inline">&quot;ctx&quot;</code>),
            not the wire-level engram_id.
          </p>
          <CodeBlock filename="researcher.py" html={neuronSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">02 · The wiring</div>
          <h2 className="sub-title">Engram host · worker · orchestrator.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            One Dendrite hosts the Engram, one hosts the Neuron with a
            declarative <code className="inline">EngramBinding</code>, and one
            dispatches TASKs. The host could be the same process as the worker  - 
            we split them here to make the routing explicit.
          </p>
          <CodeBlock filename="wiring.py" html={wiringSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">03 · Run</div>
          <h2 className="sub-title">First call computes, second call recalls.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Two back-to-back dispatches with the same question. The first sees an
            empty Engram and imprints the answer. The second finds the cached
            entry and short-circuits  -  proof the imprint landed.
          </p>
          <CodeBlock filename="dispatch.py" html={dispatchSnippet} maxWidth={880} />
          <div style={{ marginTop: 24 }}>
            <CodeBlock html={outputSnippet} maxWidth={880} />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">04 · Swap the backend</div>
          <h2 className="sub-title">Three Engram backends, one API.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The Engram interface is uniform. Mount whichever backend fits your
            deployment; the Neuron and the binding never change.
          </p>
          <CodeBlock filename="backends.py" html={backendsSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">05 · Operations &amp; modes</div>
          <h2 className="sub-title">Five imprint ops, three recall modes.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">imprint</code> covers add / append / merge /
            upsert / delete. <code className="inline">recall</code> returns one
            entry, a merged view, or the full set  -  pick the mode per call, or
            set a default on the binding.
          </p>
          <CodeBlock filename="ops.py" html={opsSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">06 · Watch it in Prism</div>
          <h2 className="sub-title">RECALL and IMPRINT, live on the bus.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">cosmo doppler --prism</code> shows the full memory
            round-trip  -  RECALL, RECALLED, IMPRINT, IMPRINTED  -  threaded through the
            same trace as the TASK that caused it.
          </p>
          <CodeBlock filename="terminal" html={prismSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/building-a-neuron" className="card">
              <div className="card-icon">→</div>
              <h3>Building a Neuron</h3>
              <p>The same shape without the Engram. Read this first if you skipped it.</p>
            </Link>
            <Link href="/protocol" className="card">
              <div className="card-icon">→</div>
              <h3>Engram envelope spec</h3>
              <p>RECALL / RECALLED / IMPRINT / IMPRINTED  -  the four signals the binding emits.</p>
            </Link>
            <Link href="/docs#engram" className="card">
              <div className="card-icon">→</div>
              <h3>Engram API reference</h3>
              <p>Full surface  -  Engram ABC, EngramBinding, EngramClient, backends, exceptions.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
