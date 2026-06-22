"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";

const watchSnippet = `<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>demo

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071).</span>
<span class="tk-cm"># Every Signal on the trace  -  PLAN, THOUGHT_DELTA, AGENT_OUTPUT  -  animates</span>
<span class="tk-cm"># across the bus as the three shapes consume it.</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> demo`;

const workerSnippet = `<span class="tk-cm"># worker.py - one Axon that streams PLAN / THOUGHT_DELTA / AGENT_OUTPUT</span>
<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, SignalType, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">planner</span>(input, context):
    <span class="tk-cm"># Inside a real Neuron you would stream chunks via emit_thought_delta.</span>
    <span class="tk-cm"># Here we just return a final answer so the example stays self-contained.</span>
    <span class="tk-kw">return</span> {<span class="tk-str">"plan"</span>: [<span class="tk-str">"step-1"</span>, <span class="tk-str">"step-2"</span>]}

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    worker <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker.<span class="tk-fn">attach_axon</span>(Axon(
        neuron_id<span class="tk-op">=</span><span class="tk-str">"planner"</span>, neuron_fn<span class="tk-op">=</span>planner,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"plan"</span>],
    ))
    <span class="tk-kw">async with</span> worker:
        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(<span class="tk-fn">float</span>(<span class="tk-str">"inf"</span>))

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const waitShapeSnippet = `<span class="tk-cm"># Shape 1 - sequential / request-reply.</span>
<span class="tk-cm"># Block until the first terminal Signal arrives, then close the Pathway.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)

    <span class="tk-kw">async with</span> orch:
        sig <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_wait</span>(
            capabilities<span class="tk-op">=</span>[<span class="tk-str">"plan"</span>],
            input<span class="tk-op">=</span>{<span class="tk-str">"goal"</span>: <span class="tk-str">"ship feature X"</span>},
            timeout_s<span class="tk-op">=</span><span class="tk-num">5.0</span>,
        )
        <span class="tk-fn">print</span>(sig.payload[<span class="tk-str">"output"</span>])
    <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()`;

const onShapeSnippet = `<span class="tk-cm"># Shape 2 - reactive / trace-scoped callbacks.</span>
<span class="tk-cm"># Pathway.on(SignalType.X) registers a handler that fires for each matching</span>
<span class="tk-cm"># Signal on this trace - not the whole namespace.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, SignalType, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)

    <span class="tk-kw">async with</span> orch:
        pw <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_subscribe</span>(
            capabilities<span class="tk-op">=</span>[<span class="tk-str">"plan"</span>], input<span class="tk-op">=</span>{<span class="tk-str">"goal"</span>: <span class="tk-str">"..."</span>},
        )

        <span class="tk-op">@</span>pw.<span class="tk-fn">on</span>(SignalType.THOUGHT_DELTA)
        <span class="tk-kw">async def</span> <span class="tk-fn">stream</span>(s): <span class="tk-fn">print</span>(s.payload[<span class="tk-str">"delta"</span>], end<span class="tk-op">=</span><span class="tk-str">""</span>)

        <span class="tk-op">@</span>pw.<span class="tk-fn">on</span>(SignalType.PLAN)
        <span class="tk-kw">async def</span> <span class="tk-fn">on_plan</span>(s): <span class="tk-fn">print</span>(<span class="tk-str">"\\nPLAN:"</span>, s.payload[<span class="tk-str">"steps"</span>])

        <span class="tk-op">@</span>pw.<span class="tk-fn">on</span>(SignalType.AGENT_OUTPUT)
        <span class="tk-kw">async def</span> <span class="tk-fn">done</span>(s):
            <span class="tk-fn">print</span>(<span class="tk-str">"DONE:"</span>, s.payload[<span class="tk-str">"output"</span>])
            <span class="tk-kw">await</span> pw.<span class="tk-fn">close</span>()

        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(<span class="tk-num">2.0</span>)   <span class="tk-cm"># give callbacks time to fire</span>`;

const iterShapeSnippet = `<span class="tk-cm"># Shape 3 - streaming iteration.</span>
<span class="tk-cm"># Walk every Signal on the trace as it arrives, until you break or it closes.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, SignalType, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)

    <span class="tk-kw">async with</span> orch:
        <span class="tk-kw">async with</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch</span>(
            capabilities<span class="tk-op">=</span>[<span class="tk-str">"plan"</span>], input<span class="tk-op">=</span>{<span class="tk-str">"goal"</span>: <span class="tk-str">"..."</span>},
        ) <span class="tk-kw">as</span> pw:
            <span class="tk-kw">async for</span> sig <span class="tk-kw">in</span> pw:
                <span class="tk-fn">print</span>(sig.type, sig.payload)
                <span class="tk-kw">if</span> sig.type <span class="tk-kw">is</span> SignalType.AGENT_OUTPUT:
                    <span class="tk-kw">break</span>`;

const scopeSnippet = `<span class="tk-cm"># scope="terminal" - decentralised orchestration.</span>
<span class="tk-cm"># The Cortex only wakes for FINAL / ERROR / CLARIFICATION. Intermediate</span>
<span class="tk-cm"># AGENT_OUTPUT / PLAN / TOOL_CALL fly past on the bus and are handled</span>
<span class="tk-cm"># peer-to-peer by other orchestrators in the same trace.</span>
<span class="tk-kw">async with</span> orch:
    pw <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch</span>(
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"plan"</span>],
        input<span class="tk-op">=</span>{<span class="tk-str">"goal"</span>: <span class="tk-str">"..."</span>},
        scope<span class="tk-op">=</span><span class="tk-str">"terminal"</span>,
    )
    sig <span class="tk-op">=</span> <span class="tk-kw">await</span> pw.<span class="tk-fn">wait</span>(timeout_s<span class="tk-op">=</span><span class="tk-num">60.0</span>)   <span class="tk-cm"># only FINAL / ERROR / CLARIFICATION resolves this</span>`;

const observeSnippet = `<span class="tk-cm"># observe_pathway - watch a trace another peer started.</span>
<span class="tk-cm"># No TASK is emitted; the Pathway just attaches to inbound Signals</span>
<span class="tk-cm"># matching the given trace_id.</span>
<span class="tk-kw">async with</span> monitor_dendrite:
    pw <span class="tk-op">=</span> <span class="tk-kw">await</span> monitor_dendrite.<span class="tk-fn">observe_pathway</span>(trace_id<span class="tk-op">=</span><span class="tk-str">"trc_01J..."</span>)
    <span class="tk-kw">assert</span> pw.role <span class="tk-op">==</span> <span class="tk-str">"observer"</span>
    <span class="tk-kw">async for</span> sig <span class="tk-kw">in</span> pw:
        log.<span class="tk-fn">info</span>(<span class="tk-str">"observed"</span>, type<span class="tk-op">=</span>sig.type.value,
                 neuron<span class="tk-op">=</span>sig.directed.id <span class="tk-kw">if</span> sig.directed <span class="tk-kw">else</span> <span class="tk-kw">None</span>)`;

export default function PathwayClient() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Example 05 \u00b7 Pathway</div>
          <h1 className="page-title">Pathway  -  Three Shapes, One Primitive.</h1>
          <p className="page-sub">
            <code className="inline">dendrite.dispatch(...)</code> returns a{" "}
            <Link href="/concepts" className="inline-link">Pathway</Link>  -  a per-trace event
            handle that exposes <strong>three consumption shapes</strong> on the same primitive.
            The developer picks the shape that fits the workflow; the SDK doesn&apos;t force a style.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Worker side</div>
          <h2 className="sub-title">One Axon serves every shape.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The worker has no idea which shape the caller will use  -  it just declares a
            capability and replies with AGENT_OUTPUT. The shape lives entirely on the
            orchestrator side.
          </p>
          <CodeBlock filename="worker.py" html={workerSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Shape 1</div>
          <h2 className="sub-title">await pw.wait()  -  sequential.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The familiar request/reply shape. Blocks until the first AGENT_OUTPUT,
            CLARIFICATION, ERROR, or FINAL arrives. Pathway auto-closes when the call
            returns. Use this when the orchestrator just needs the answer.
          </p>
          <CodeBlock filename="wait.py" html={waitShapeSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Shape 2</div>
          <h2 className="sub-title">@pw.on(SignalType.X)  -  reactive.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Trace-scoped callbacks. Each callback fires for matching Signals on{" "}
            <em>this</em> trace, not the whole namespace. Useful for streaming
            (THOUGHT_DELTA), structured cognition (PLAN, TOOL_CALL), or any case where
            the orchestrator wants to react to intermediate events.
          </p>
          <CodeBlock filename="on.py" html={onShapeSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Shape 3</div>
          <h2 className="sub-title">async for sig in pw  -  streaming.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Walks every Signal on the trace as it arrives. Closes on FINAL / ERROR or
            when you break out of the loop. The natural shape for log pipes, UI streams,
            or building a custom workflow walker on top.
          </p>
          <CodeBlock filename="iter.py" html={iterShapeSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">scope</div>
          <h2 className="sub-title">scope=&quot;terminal&quot;  -  decentralised.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">scope=&quot;all&quot;</code> (the default) delivers every
            PATHWAY_TYPES Signal on the trace. <code className="inline">scope=&quot;terminal&quot;</code>{" "}
            filters to FINAL / ERROR / CLARIFICATION only  -  the decentralised pattern
            where intermediate orchestration happens peer-to-peer and the Cortex only
            wakes for events that demand its attention. FINAL and ERROR still auto-close
            the Pathway regardless of scope.
          </p>
          <CodeBlock filename="scope.py" html={scopeSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">observe_pathway</div>
          <h2 className="sub-title">Watch traces you didn&apos;t start.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">observe_pathway(trace_id)</code> opens a Pathway in
            observer role. No TASK is emitted; the Pathway just attaches to inbound
            Signals matching the given trace_id. Useful for monitors, dashboards, or
            secondary orchestrators that want to follow a workflow without driving it.
          </p>
          <CodeBlock filename="observe.py" html={observeSnippet} maxWidth={840} />

          <div className="sub-eyebrow" style={{ marginTop: 32 }}>Watch it</div>
          <h2 className="section-title">See every shape in Prism.</h2>
          <CodeBlock filename="terminal" html={watchSnippet} maxWidth={840} />
          <div style={{ marginTop: 24 }}>
            <PrismPreview namespace="demo" src="/prism/pathway.mp4" />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/bidding" className="card">
              <div className="card-icon">\u2192</div>
              <h3>Bidding</h3>
              <p>dispatch_offer / on_task_offer / bid  -  atomic claim for heterogeneous capability routing.</p>
            </Link>
            <Link href="/examples/capability-routing" className="card">
              <div className="card-icon">\u2192</div>
              <h3>Capability routing</h3>
              <p>Address TASKs by capability instead of neuron_id. Once-only delivery via the .routed subject.</p>
            </Link>
            <Link href="/docs#pathway" className="card">
              <div className="card-icon">\u2192</div>
              <h3>Pathway API</h3>
              <p>Full reference for the Pathway class  -  wait, wait_for, on, iteration, scope, lifecycle.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
