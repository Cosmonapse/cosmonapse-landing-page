"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

const retrySnippet = `<span class="tk-cm"># A stage is "stuck" when it produces no terminal signal within</span>
<span class="tk-cm"># timeout_s (or returns a recoverable ERROR). run_with_retry STOPs</span>
<span class="tk-cm"># the abandoned attempt, then re-dispatches on a fresh trace.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> RetryStrategy

sig <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">run_with_retry</span>(
    neuron<span class="tk-op">=</span><span class="tk-str">"generator"</span>,
    input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: <span class="tk-str">"..."</span>},
    retry<span class="tk-op">=</span><span class="tk-fn">RetryStrategy</span>(max_attempts<span class="tk-op">=</span><span class="tk-num">3</span>, timeout_s<span class="tk-op">=</span><span class="tk-num">0.5</span>),
)`;

const stopSnippet = `<span class="tk-cm"># Cooperative cancellation of a whole workflow by trace_id.</span>
<span class="tk-cm"># Broadcast on the trace; every Dendrite cancels its in-flight neuron</span>
<span class="tk-cm"># work and engram I/O and acks with STOPPED.</span>
<span class="tk-kw">await</span> orch.<span class="tk-fn">stop_trace</span>(tid)

<span class="tk-cm"># rollback=True additionally replays each hosted Engram's per-trace</span>
<span class="tk-cm"># inverse-op journal, undoing a half-finished write (saga rollback).</span>
<span class="tk-kw">await</span> orch.<span class="tk-fn">stop_trace</span>(tid, rollback<span class="tk-op">=</span><span class="tk-kw">True</span>)`;

const scenarios = `#  Scenario                                Shows
1  Generator hangs on its first attempt     retry times out, STOPs the stuck
                                            attempt, succeeds on re-dispatch
2  Generator always hangs                   retry exhausts max_attempts and
                                            raises TimeoutError (each STOPped)
3  Ingester crashes after 3 chunks          stop_trace(rollback=True) replays
                                            the journal; the index goes to 0`;

const runSnippet = `<span class="tk-cm"># fully offline  -  no HF_TOKEN, no network, MemorySynapse in-process</span>
<span class="tk-op">$</span> pip install cosmonapse
<span class="tk-op">$</span> python demo.py`;

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
            additions: retry on a fresh trace, cooperative STOP, and Engram saga rollback.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">run_with_retry</div>
          <h2 className="sub-title">Retry a stuck stage on a fresh trace.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Each retry first <strong>STOPs the abandoned attempt</strong>, so a stalled worker
            can&apos;t keep running  -  or keep writing to an Engram  -  behind the retry.{" "}
            <code className="inline">dispatch_and_wait(retry=...)</code> takes the same strategy.
          </p>
          <CodeBlock filename="retry.py" html={retrySnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">stop_trace</div>
          <h2 className="sub-title">Cancel a workflow, and undo its writes.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The saga commit point is <strong>success (FINAL) only</strong>: an ERROR leaves the
            journal in place so a failed workflow can still be rolled back, while a successful
            FINAL, a plain <code className="inline">stop_trace</code>, or a retry&apos;s preemptive
            STOP all discard the journal instead.
          </p>
          <CodeBlock filename="stop.py" html={stopSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Three scenarios</div>
          <h2 className="sub-title">What demo.py walks through.</h2>
          <CodeBlock filename="scenarios" html={scenarios} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Run it</div>
          <h2 className="sub-title">No token, no broker.</h2>
          <CodeBlock filename="terminal" html={runSnippet} maxWidth={840} />
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
