"use client";

import React, { useState } from "react";
import CodeBlock from "./CodeBlock";

type TransportId = "memory" | "nats" | "kafka";

const TRANSPORTS: { id: TransportId; label: string; synapse: string; scale: string; highlight?: boolean }[] = [
  { id: "memory", label: "MemorySynapse", synapse: "memory://",         scale: "In-process. Tests, prototypes, single-host demos." },
  { id: "nats",   label: "NatsSynapse",   synapse: "nats://broker:4222", scale: "Production default  -  clean fit for the protocol." },
  { id: "kafka",  label: "KafkaSynapse",  synapse: "kafka://broker:9092",scale: "Durable, replayable log of every Signal that crossed the bus.", highlight: true },
];

const pySnippet = (url: string) =>
  `<span class="tk-kw">import</span> asyncio, os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>   <span class="tk-cm"># ← the only line that changes</span>
axon <span class="tk-op">=</span> Axon.<span class="tk-fn">huggingface</span>(<span class="tk-str">"greeter"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
    use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>, capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>])

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    worker <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker.<span class="tk-fn">attach_axon</span>(axon)
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)
    <span class="tk-kw">async with</span> worker, orch:
        reply <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_wait</span>(
            neuron<span class="tk-op">=</span><span class="tk-str">"greeter"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: <span class="tk-str">"Say hello to Cosmonapse."</span>}, timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>)
        <span class="tk-fn">print</span>(reply.payload[<span class="tk-str">"output"</span>][<span class="tk-str">"response"</span>])

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

export default function BuildOnCosmonapse() {
  const [active, setActive] = useState<TransportId>("memory");
  const transport = TRANSPORTS.find((t) => t.id === active)!;

  return (
    <section className="section">
      <div className="container">
        <div className="section-eyebrow">// Build on Cosmonapse</div>
        <h2 className="section-title">~20 lines. Three transports.</h2>
        <p className="section-sub">
          A working multi-agent system is about twenty lines  -  define an async
          function, wrap it in an <code className="inline">Axon</code>, attach
          it to a <code className="inline">Dendrite</code>, call{" "}
          <code className="inline">dispatch_and_wait</code>. No protocol
          boilerplate. And the scale path is a single URL swap:{" "}
          <code className="inline">MemorySynapse</code> →{" "}
          <code className="inline">NatsSynapse</code> →{" "}
          <code className="inline">KafkaSynapse</code>, with zero changes to
          your Neuron code.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div className="boc-tabs" role="tablist" aria-label="Choose synapse transport" style={{ margin: 0 }}>
            {TRANSPORTS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active === t.id}
                className={`boc-tab${active === t.id ? " active" : ""}`}
                onClick={() => setActive(t.id)}
              >
                <span className="boc-tab-label">{t.label}</span>
                <span className="boc-tab-url">{t.synapse}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="boc-grid">
          <div className="boc-code">
            <CodeBlock
              filename="main.py"
              html={pySnippet(transport.synapse)}
              variant="elevated"
              maxWidth={760}
            />
          </div>

          <aside className="boc-side">
            <div className="boc-side-eyebrow">// {transport.label}</div>
            <p className="boc-side-prose">{transport.scale}</p>
            <ul className="boc-side-list">
              <li>
                <strong>Axon.huggingface()</strong>  -  one call creates the
                Neuron and wires the Axon. Also{" "}
                <code className="inline">.openai()</code>,{" "}
                <code className="inline">.anthropic()</code>,{" "}
                <code className="inline">.ollama()</code>,{" "}
                <code className="inline">.mcp()</code>.
              </li>
              <li>
                <strong>Dendrite</strong>  -  the only thing that touches the
                Synapse. Hosts the Axon, routes inbound TASKs.
              </li>
              <li>
                <strong>dispatch_and_wait</strong>  -  emit a TASK, await the
                terminal Signal, return. Zero extra state.
              </li>
            </ul>
            {transport.highlight && (
              <div className="boc-side-callout">
                <strong>That&rsquo;s the point.</strong> Kafka in production is
                still the same ~20 lines. The protocol is the abstraction; the
                transport is a URL.
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
