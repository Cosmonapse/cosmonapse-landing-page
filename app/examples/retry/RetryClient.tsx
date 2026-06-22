"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";

// ---------------------------------------------------------------------------
// Snippets  -  kept in sync with cosmonapse-examples/13-retry/
// ---------------------------------------------------------------------------

const topologySnippet = `Three scenarios, fully <span class="tk-kw">in</span>-process on a MemorySynapse

  orchestrator <span class="tk-str">"api"</span>  ---dispatch---&gt;  worker
       |                                  |  ingester  (writes chunks, can crash)
       |  run_with_retry / stop_trace     |  generator (flaky: stalls, then answers)
       v                                  v
  RetryStrategy                       engram-host
  (STOP + re-dispatch)                VectorEngram <span class="tk-str">"retry-vectors"</span> + saga journal`;
const installSnippet = `<span class="tk-cm"># Fully offline  -  no HF_TOKEN, no network, no broker. Deterministic</span>
<span class="tk-cm"># local embeddings and a fake LLM, so the focus is control flow.</span>
<span class="tk-op">$</span> pip install cosmonapse
<span class="tk-op">$</span> python demo.py`;
const offlineSnippet = `<span class="tk-cm"># Reuse the VectorEngram from Example 10, but run OFFLINE: a deterministic</span>
<span class="tk-cm"># 16-dim embedding and a local chunker, so the demo needs no token/network.</span>
<span class="tk-kw">import</span> sys
<span class="tk-kw">from</span> pathlib <span class="tk-kw">import</span> Path

_HERE <span class="tk-op">=</span> Path(__file__).<span class="tk-fn">resolve</span>().parent
sys.path.<span class="tk-fn">insert</span>(<span class="tk-num">0</span>, <span class="tk-fn">str</span>(_HERE.parent / <span class="tk-str">"11-rag"</span>))   <span class="tk-cm"># the VectorEngram backend</span>

<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, EngramBinding
<span class="tk-kw">from</span> vector_engram <span class="tk-kw">import</span> VectorEngram              <span class="tk-cm"># cosine + per-trace saga journal</span>

<span class="tk-kw">def</span> <span class="tk-fn">fake_embed</span>(text) -&gt; list[float]:
    vec <span class="tk-op">=</span> [<span class="tk-num">0.0</span>] * <span class="tk-num">16</span>
    <span class="tk-kw">for</span> ch <span class="tk-kw">in</span> text.<span class="tk-fn">lower</span>():
        vec[<span class="tk-fn">ord</span>(ch) % <span class="tk-num">16</span>] += <span class="tk-num">1.0</span>
    norm <span class="tk-op">=</span> <span class="tk-fn">sum</span>(v * v <span class="tk-kw">for</span> v <span class="tk-kw">in</span> vec) ** <span class="tk-num">0.5</span> <span class="tk-kw">or</span> <span class="tk-num">1.0</span>
    <span class="tk-kw">return</span> [v / norm <span class="tk-kw">for</span> v <span class="tk-kw">in</span> vec]`;
const ingestSnippet = `<span class="tk-cm"># ingester: imprints each chunk under the TASK's trace. With fail_after</span>
<span class="tk-cm"># set it raises partway through, leaving a PARTIAL write the orchestrator</span>
<span class="tk-cm"># can roll back. await_ack=True makes each write durable before the next.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">ingest_neuron</span>(input, context, *, imprint):
    doc_id <span class="tk-op">=</span> input[<span class="tk-str">"doc_id"</span>]
    chunks <span class="tk-op">=</span> <span class="tk-fn">chunk_text</span>(input[<span class="tk-str">"text"</span>])
    fail_after <span class="tk-op">=</span> input.<span class="tk-fn">get</span>(<span class="tk-str">"fail_after"</span>)
    written <span class="tk-op">=</span> <span class="tk-num">0</span>
    <span class="tk-kw">for</span> i, chunk <span class="tk-kw">in</span> <span class="tk-fn">enumerate</span>(chunks):
        <span class="tk-kw">if</span> fail_after <span class="tk-kw">is</span> <span class="tk-kw">not</span> <span class="tk-kw">None</span> <span class="tk-kw">and</span> i &gt;= fail_after:
            <span class="tk-kw">raise</span> RuntimeError(<span class="tk-str">f"ingest of {doc_id!r} crashed after {written} chunks"</span>)
        <span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"vectors"</span>, op<span class="tk-op">=</span><span class="tk-str">"upsert"</span>,
                      entry<span class="tk-op">=</span>{<span class="tk-str">"doc_id"</span>: doc_id, <span class="tk-str">"chunk_index"</span>: i, <span class="tk-str">"text"</span>: chunk,
                             <span class="tk-str">"embedding"</span>: <span class="tk-fn">fake_embed</span>(chunk)},
                      merge_key<span class="tk-op">=</span><span class="tk-str">f"{doc_id}:{i}"</span>, await_ack<span class="tk-op">=</span><span class="tk-kw">True</span>, deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)
        written += <span class="tk-num">1</span>
    <span class="tk-kw">return</span> {<span class="tk-str">"doc_id"</span>: doc_id, <span class="tk-str">"chunks"</span>: written}`;
const flakySnippet = `<span class="tk-cm"># A fake LLM that stalls on its first stall_first calls, then answers.</span>
<span class="tk-cm"># Each retry is a FRESH dispatch -&gt; a fresh call here, so a stuck attempt</span>
<span class="tk-cm"># times out, gets STOPped, and the next attempt runs anew.</span>
<span class="tk-kw">def</span> <span class="tk-fn">make_flaky_generator</span>(stall_first, *, stall_s<span class="tk-op">=</span><span class="tk-num">5.0</span>):
    state <span class="tk-op">=</span> {<span class="tk-str">"calls"</span>: <span class="tk-num">0</span>}

    <span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">generator</span>(input, context):
        state[<span class="tk-str">"calls"</span>] += <span class="tk-num">1</span>
        n <span class="tk-op">=</span> state[<span class="tk-str">"calls"</span>]
        <span class="tk-kw">if</span> n &lt;= stall_first:
            <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(stall_s)            <span class="tk-cm"># stalls past the retry timeout</span>
        <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: <span class="tk-str">f"answer to {input['question']!r}"</span>, <span class="tk-str">"attempt"</span>: n}

    generator.state <span class="tk-op">=</span> state                          <span class="tk-cm"># exposed for the demo printout</span>
    <span class="tk-kw">return</span> generator`;
const wireSnippet = `<span class="tk-cm"># build: engram-host + worker (2 Axons) + orchestrator.</span>
<span class="tk-kw">def</span> <span class="tk-fn">build</span>(synapse, *, generator):
    vectors <span class="tk-op">=</span> VectorEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"retry-vectors"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"semantic"</span>)

    host <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                    dendrite_id<span class="tk-op">=</span><span class="tk-str">"engram-host"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    host.<span class="tk-fn">attach_engram</span>(vectors)

    bind <span class="tk-op">=</span> EngramBinding(name<span class="tk-op">=</span><span class="tk-str">"vectors"</span>, directed_id<span class="tk-op">=</span><span class="tk-str">"retry-vectors"</span>)
    worker <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                      dendrite_id<span class="tk-op">=</span><span class="tk-str">"worker"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"ingester"</span>, neuron_fn<span class="tk-op">=</span>ingest_neuron,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"ingest"</span>], engrams<span class="tk-op">=</span>[bind]))
    worker.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"generator"</span>, neuron_fn<span class="tk-op">=</span>generator,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"generate"</span>]))

    orchestrator <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                            dendrite_id<span class="tk-op">=</span><span class="tk-str">"api"</span>, role<span class="tk-op">=</span><span class="tk-str">"orchestrator"</span>)
    <span class="tk-kw">return</span> [host, worker, orchestrator], orchestrator, vectors`;
const retrySnippet = `<span class="tk-cm"># A stage is "stuck" when it produces no terminal Signal within timeout_s</span>
<span class="tk-cm"># (or returns a recoverable ERROR). run_with_retry STOPs the abandoned</span>
<span class="tk-cm"># attempt, then re-dispatches on a fresh trace - so a stalled worker can't</span>
<span class="tk-cm"># keep running, or keep writing to an Engram, behind the retry.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> RetryStrategy

<span class="tk-kw">def</span> <span class="tk-fn">on_retry</span>(attempt, outcome):
    <span class="tk-fn">print</span>(<span class="tk-str">f"   attempt {attempt} stuck -&gt; STOP + re-dispatch on a fresh trace"</span>)

sig <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">run_with_retry</span>(
    neuron<span class="tk-op">=</span><span class="tk-str">"generator"</span>,
    input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: <span class="tk-str">"what is a Dendrite?"</span>},
    retry<span class="tk-op">=</span>RetryStrategy(max_attempts<span class="tk-op">=</span><span class="tk-num">3</span>, timeout_s<span class="tk-op">=</span><span class="tk-num">0.5</span>, on_retry<span class="tk-op">=</span>on_retry),
)
<span class="tk-fn">print</span>(sig.payload[<span class="tk-str">"output"</span>][<span class="tk-str">"answer"</span>])`;
const stopSnippet = `<span class="tk-cm"># stop_trace: cooperative cancellation of a whole workflow by trace_id.</span>
<span class="tk-cm"># Every Dendrite cancels its in-flight neuron work and engram I/O, acks STOPPED.</span>
<span class="tk-kw">await</span> orch.<span class="tk-fn">stop_trace</span>(tid)

<span class="tk-cm"># rollback=True additionally replays each hosted Engram's per-trace</span>
<span class="tk-cm"># inverse-op journal, undoing a half-finished write (saga rollback).</span>
acks <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">stop_trace</span>(tid, rollback<span class="tk-op">=</span><span class="tk-kw">True</span>, collect_acks<span class="tk-op">=</span><span class="tk-kw">True</span>, timeout_s<span class="tk-op">=</span><span class="tk-num">0.5</span>)
compensated <span class="tk-op">=</span> <span class="tk-fn">sum</span>(a.payload.<span class="tk-fn">get</span>(<span class="tk-str">"compensated"</span>, <span class="tk-num">0</span>) <span class="tk-kw">for</span> a <span class="tk-kw">in</span> acks)

<span class="tk-cm"># Saga commit point is SUCCESS (FINAL) only: an ERROR leaves the journal in</span>
<span class="tk-cm"># place so a failed workflow can still be rolled back; a successful FINAL, a</span>
<span class="tk-cm"># plain stop_trace, or a retry's preemptive STOP all discard the journal.</span>`;
const scenariosSnippet = `<span class="tk-cm">#  Scenario                                Shows</span>
<span class="tk-num">1</span>  Generator hangs on its first attempt     retry times out, STOPs the stuck
                                            attempt, succeeds on re-dispatch
<span class="tk-num">2</span>  Generator always hangs                   retry exhausts max_attempts <span class="tk-kw">and</span>
                                            raises TimeoutError (each STOPped)
<span class="tk-num">3</span>  Ingester crashes after <span class="tk-num">3</span> chunks          <span class="tk-fn">stop_trace</span>(rollback<span class="tk-op">=</span><span class="tk-kw">True</span>) replays
                                            the journal; the index goes to <span class="tk-num">0</span>`;
const runSnippet = `<span class="tk-op">$</span> python demo.py
================================================================
1. retry survives a stalled stage
================================================================
   attempt 1 stuck (TimeoutError) -&gt; STOP + re-dispatch on a fresh trace
   -&gt; answer on attempt 2: answer to 'what is a Dendrite?'
   generator was invoked 2 times total

================================================================
3. roll back a half-finished ingest
================================================================
   index size before ingest: 0
   index size after crash: 3  (partial write)
   stop_trace(rollback=True): 3 inverse ops replayed
   index size after rollback: 0  (clean)`;

const prismWatchSnippet = `<span class="tk-cm"># This demo runs in-process on a MemorySynapse, which Prism can't attach to.</span>
<span class="tk-cm"># To watch it live, start a dev synapse and point the code at it:</span>

<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace=retry-demo

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url=cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> retry-demo

<span class="tk-cm"># in the code  -  swap one line:</span>
<span class="tk-cm"># synapse = MemorySynapse()</span>
synapse = await connect_synapse("cosmo://127.0.0.1:7070")`;

export default function RetryClient() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Example 12 · Retry &amp; rollback</div>
          <h1 className="page-title">Stuck Stages, STOPs, and Saga Rollback.</h1>
          <p className="page-sub">
            Resilience layered on the RAG primitives from{" "}
            <Link href="/examples/rag" className="inline-link">Example 10</Link>, running fully
            offline so the focus is control flow, not retrieval quality. Built on the same{" "}
            <code className="inline">dispatch_and_wait</code> you already know, plus three
            additions: retry on a fresh trace, cooperative STOP, and Engram saga rollback. We
            assemble the offline topology first, then exercise each pattern; every snippet is the
            real code from <code className="inline">cosmonapse-examples/13-retry</code>.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Topology</div>
          <h2 className="sub-title">One worker, two failure modes.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            A single worker hosts a crashable ingester and a flaky generator; the orchestrator
            drives them and owns the retry / STOP control. The VectorEngram keeps a per-trace saga
            journal that makes rollback possible.
          </p>
          <CodeBlock filename="topology" html={topologySnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">00 · Install</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 16 }}>
            No token, no broker, no network. Everything runs in-process on a{" "}
            <code className="inline">MemorySynapse</code>, so the only dependency is Cosmonapse
            itself.
          </p>
          <CodeBlock html={installSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">01 · Offline backend</div>
          <h2 className="sub-title">Real Engram, fake embeddings.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            We reuse the actual <code className="inline">VectorEngram</code> from Example 10  -  
            including its saga journal  -  but feed it a deterministic 16-dim embedding so there is
            no API to call. The resilience behavior is identical; only the embedding quality is
            throwaway.
          </p>
          <CodeBlock filename="resilient.py" html={offlineSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">02 · A crashable ingester</div>
          <h2 className="sub-title">Partial writes on purpose.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The ingester writes chunks one at a time under the TASK&apos;s trace. The{" "}
            <code className="inline">fail_after</code> knob makes it raise mid-stream, leaving the
            index in a half-written state  -  exactly the situation rollback exists to clean up.
          </p>
          <CodeBlock filename="resilient.py" html={ingestSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">03 · A flaky generator</div>
          <h2 className="sub-title">Stalls first, answers later.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            This fake LLM hangs on its first <code className="inline">stall_first</code> calls, then
            succeeds. Because every retry is a fresh dispatch, a process-wide call counter models a
            flaky upstream that recovers after a couple of tries.
          </p>
          <CodeBlock filename="resilient.py" html={flakySnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">04 · Wire the topology</div>
          <h2 className="sub-title">Engram host, worker, orchestrator.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Identical wiring to the bigger examples, just smaller: one engram host, one worker with
            both Axons, one orchestrator. The <code className="inline">generator</code> is passed in
            so each scenario can supply a differently-flaky one.
          </p>
          <CodeBlock filename="resilient.py" html={wireSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">05 · run_with_retry</div>
          <h2 className="sub-title">Retry a stuck stage on a fresh trace.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Each retry first <strong>STOPs the abandoned attempt</strong>, so a stalled worker
            can&apos;t keep running  -  or keep writing to an Engram  -  behind the retry.{" "}
            <code className="inline">dispatch_and_wait(retry=...)</code> takes the same strategy.
          </p>
          <CodeBlock filename="demo.py" html={retrySnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">06 · stop_trace + rollback</div>
          <h2 className="sub-title">Cancel a workflow, and undo its writes.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">stop_trace</code> cancels every Dendrite working on a trace;{" "}
            <code className="inline">rollback=True</code> additionally replays each Engram&apos;s
            inverse-op journal. The commit point is success only, so a failed workflow stays
            rollback-able while a clean finish discards the journal.
          </p>
          <CodeBlock filename="demo.py" html={stopSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">07 · What demo.py walks through</div>
          <h2 className="sub-title">Three scenarios.</h2>
          <CodeBlock filename="scenarios" html={scenariosSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">08 · Run it</div>
          <h2 className="sub-title">No token, no broker.</h2>
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
            <PrismPreview namespace="retry-demo" src="/prism/retry.mp4" />
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
              <p>The multi-stage pipeline and Engram backends these patterns make resilient.</p>
            </Link>
            <Link href="/examples/bidding" className="card">
              <div className="card-icon">→</div>
              <h3>Bidding</h3>
              <p>Atomic claim via TASK_OFFER / BID / TASK_AWARDED for heterogeneous workers.</p>
            </Link>
            <Link href="/examples/pathway" className="card">
              <div className="card-icon">→</div>
              <h3>Pathway</h3>
              <p>The dispatch / wait primitive that run_with_retry and stop_trace build on.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
