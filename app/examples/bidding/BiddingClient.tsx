"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

const watchSnippet = `<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>demo

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071).</span>
<span class="tk-cm"># Watch the TASK_OFFER / BID / TASK_AWARDED auction animate in real time.</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> demo`;

const whySnippet = `<span class="tk-cm"># Capability-routed dispatch on a separate subject + queue group gives</span>
<span class="tk-cm"># once-only delivery WITHIN a matching cap profile. But heterogeneous</span>
<span class="tk-cm"># deployments - different Dendrites with different but overlapping</span>
<span class="tk-cm"># cap sets - still get at-least-once across profiles.</span>
<span class="tk-cm">#</span>
<span class="tk-cm"># Bidding solves that: producer broadcasts a TASK_OFFER, candidates BID,</span>
<span class="tk-cm"># the producer picks a winner and emits a TASK_AWARDED naming exactly</span>
<span class="tk-cm"># one Axon. The winner processes; everyone else sees TASK_DECLINED and</span>
<span class="tk-cm"># releases any tentative reservation.</span>`;

const workerSnippet = `<span class="tk-cm"># worker.py - hosts an Axon and bids on offers matching its capability.</span>
<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">summarize</span>(input, context):
    <span class="tk-kw">return</span> {<span class="tk-str">"summary"</span>: input[<span class="tk-str">"text"</span>][:<span class="tk-num">80</span>] <span class="tk-op">+</span> <span class="tk-str">"..."</span>}

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    worker <span class="tk-op">=</span> Dendrite(
        synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>,
        dendrite_id<span class="tk-op">=</span><span class="tk-str">"worker-a"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>,
    )
    worker.<span class="tk-fn">attach_axon</span>(Axon(
        neuron_id<span class="tk-op">=</span><span class="tk-str">"summarizer-a"</span>, neuron_fn<span class="tk-op">=</span>summarize,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"summarize"</span>, <span class="tk-str">"english"</span>],
    ))

    <span class="tk-op">@</span>worker.<span class="tk-fn">on_task_offer</span>(capability<span class="tk-op">=</span><span class="tk-str">"summarize"</span>)
    <span class="tk-kw">async def</span> <span class="tk-fn">respond</span>(offer):
        <span class="tk-cm"># bid() bypasses the orchestrator role guard - bidding is how</span>
        <span class="tk-cm"># workers announce capability, not how they orchestrate.</span>
        <span class="tk-kw">await</span> worker.<span class="tk-fn">bid</span>(
            offer,
            neuron<span class="tk-op">=</span><span class="tk-str">"summarizer-a"</span>,
            cost<span class="tk-op">=</span><span class="tk-num">0.002</span>,           <span class="tk-cm"># estimated USD</span>
            eta_ms<span class="tk-op">=</span><span class="tk-num">300</span>,           <span class="tk-cm"># estimated latency</span>
            confidence<span class="tk-op">=</span><span class="tk-num">0.92</span>,     <span class="tk-cm"># self-assessment 0..1</span>
        )

    <span class="tk-kw">async with</span> worker:
        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(<span class="tk-fn">float</span>(<span class="tk-str">"inf"</span>))

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const producerSnippet = `<span class="tk-cm"># producer.py - emit TASK_OFFER, collect BIDs, pick a winner, await result.</span>
<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)

    <span class="tk-kw">async with</span> orch:
        pw <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_offer</span>(
            input<span class="tk-op">=</span>{<span class="tk-str">"text"</span>: <span class="tk-str">"... a long article ..."</span>},
            capabilities<span class="tk-op">=</span>[<span class="tk-str">"summarize"</span>],
            deadline_ms<span class="tk-op">=</span><span class="tk-num">250</span>,         <span class="tk-cm"># collect BIDs for this window</span>
            select<span class="tk-op">=</span><span class="tk-str">"lowest_cost"</span>,    <span class="tk-cm"># or first_bid / highest_confidence</span>
        )
        sig <span class="tk-op">=</span> <span class="tk-kw">await</span> pw.<span class="tk-fn">wait</span>(timeout_s<span class="tk-op">=</span><span class="tk-num">5.0</span>)
        winner <span class="tk-op">=</span> sig.directed.id <span class="tk-kw">if</span> sig.directed <span class="tk-kw">else</span> <span class="tk-str">"?"</span>
        <span class="tk-fn">print</span>(<span class="tk-str">"winner:"</span>, winner, <span class="tk-str">"result:"</span>, sig.payload[<span class="tk-str">"output"</span>])

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const flowSnippet = `<span class="tk-cm"># What flows on the bus:</span>
<span class="tk-cm">#</span>
<span class="tk-cm">#   producer  --[TASK_OFFER]-------->  *broadcast*</span>
<span class="tk-cm">#   worker-a  --[BID cost=0.002]---->  producer</span>
<span class="tk-cm">#   worker-b  --[BID cost=0.005]---->  producer</span>
<span class="tk-cm">#                                       (wait deadline_ms; pick winner)</span>
<span class="tk-cm">#   producer  --[TASK_AWARDED neuron=summarizer-a]-->  bus</span>
<span class="tk-cm">#   producer  --[TASK_DECLINED neuron=summarizer-b]->  bus  (informational)</span>
<span class="tk-cm">#   worker-a's Dendrite sees TASK_AWARDED for one of its Axons and</span>
<span class="tk-cm">#   synthesises an internal TASK to route to it; AGENT_OUTPUT flows back</span>
<span class="tk-cm">#   on the producer's Pathway.</span>`;

const strategiesSnippet = `<span class="tk-cm"># select= picks the bid-evaluation strategy. All three see the same</span>
<span class="tk-cm"># BID stream; they only differ in which one becomes the winner.</span>

<span class="tk-cm"># first_bid - latency wins. Returns the first BID to arrive; cancels</span>
<span class="tk-cm">#             the wait window early. Best when any answer is fine.</span>
<span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_offer</span>(input<span class="tk-op">=</span>..., capabilities<span class="tk-op">=</span>..., select<span class="tk-op">=</span><span class="tk-str">"first_bid"</span>)

<span class="tk-cm"># lowest_cost - drains deadline_ms; picks the bidder with smallest cost.</span>
<span class="tk-cm">#               Best for cost-aware fanout where bidders price honestly.</span>
<span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_offer</span>(input<span class="tk-op">=</span>..., capabilities<span class="tk-op">=</span>..., select<span class="tk-op">=</span><span class="tk-str">"lowest_cost"</span>)

<span class="tk-cm"># highest_confidence - drains deadline_ms; picks the bidder with the</span>
<span class="tk-cm">#                      largest self-assessment. Best for quality-critical work.</span>
<span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_offer</span>(input<span class="tk-op">=</span>..., capabilities<span class="tk-op">=</span>..., select<span class="tk-op">=</span><span class="tk-str">"highest_confidence"</span>)`;

export default function BiddingClient() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Example 06 \u00b7 Bidding</div>
          <h1 className="page-title">Competitive Bidding for Capability Dispatch.</h1>
          <p className="page-sub">
            TASK_OFFER / BID / TASK_AWARDED is the <strong>atomic-claim</strong> variant of
            capability-routed dispatch. Use it when multiple Dendrites can do the work but
            the producer wants strict one-of-N selection, cost-aware routing, or
            confidence-weighted choice.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Why</div>
          <h2 className="sub-title">Capability routing covers the homogeneous case.<br/>Bidding covers the rest.</h2>
          <CodeBlock filename="why.md" html={whySnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Worker</div>
          <h2 className="sub-title">on_task_offer + bid()</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Workers register an <code className="inline">on_task_offer</code> handler scoped
            to a capability and call <code className="inline">bid()</code> to compete.{" "}
            <code className="inline">bid()</code> uses the private publish path so workers
            with <code className="inline">role=&quot;worker&quot;</code> can still bid even
            though the role guard blocks them from dispatching new TASKs.
          </p>
          <CodeBlock filename="worker.py" html={workerSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Producer</div>
          <h2 className="sub-title">dispatch_offer returns a Pathway.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The producer emits one TASK_OFFER, drains BIDs for{" "}
            <code className="inline">deadline_ms</code>, picks a winner per the
            <code className="inline"> select=</code> strategy, emits TASK_AWARDED, and
            returns a Pathway scoped to the awarded workflow. From the caller&apos;s
            perspective it&apos;s just <code className="inline">await pw.wait()</code>.
          </p>
          <CodeBlock filename="producer.py" html={producerSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Wire</div>
          <h2 className="sub-title">What crosses the bus.</h2>
          <CodeBlock filename="flow.txt" html={flowSnippet} maxWidth={840} />

          <div className="sub-eyebrow" style={{ marginTop: 32 }}>Watch it</div>
          <h2 className="section-title">See the auction in Prism.</h2>
          <CodeBlock filename="terminal" html={watchSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Strategies</div>
          <h2 className="sub-title">select= picks the winner.</h2>
          <CodeBlock filename="strategies.py" html={strategiesSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/capability-routing" className="card">
              <div className="card-icon">\u2192</div>
              <h3>Capability routing</h3>
              <p>The simpler variant  -  queue groups on the .routed subject. Once-only within a matching cap profile.</p>
            </Link>
            <Link href="/examples/pathway" className="card">
              <div className="card-icon">\u2192</div>
              <h3>Pathway</h3>
              <p>Three consumption shapes for the Pathway dispatch_offer returns.</p>
            </Link>
            <Link href="/protocol" className="card">
              <div className="card-icon">\u2192</div>
              <h3>Protocol</h3>
              <p>TASK_OFFER / BID / TASK_AWARDED / TASK_DECLINED envelope shapes.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
