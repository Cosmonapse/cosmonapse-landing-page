"use client";

import React, { useState } from "react";
import CodeBlock from "./CodeBlock";

// ---------------------------------------------------------------------------
// "Build on Cosmonapse"  -  three transports, one program.
//
// The whole point of this section is that the only line that changes between
// MemorySynapse / NatsSynapse / KafkaSynapse is the URL. Same Neuron, same
// Axon, same Dendrite, same dispatch_and_wait  -  ~20 lines end to end.
// ---------------------------------------------------------------------------

type TransportId = "memory" | "nats" | "kafka";

const TRANSPORTS: {
  id: TransportId;
  label: string;
  synapse: string;
  scale: string;
  highlight?: boolean;
}[] = [
  {
    id: "memory",
    label: "MemorySynapse",
    synapse: "memory://",
    scale: "In-process. Tests, prototypes, single-host demos.",
  },
  {
    id: "nats",
    label: "NatsSynapse",
    synapse: "nats://broker:4222",
    scale: "Production default  -  clean fit for the protocol.",
  },
  {
    id: "kafka",
    label: "KafkaSynapse",
    synapse: "kafka://broker:9092",
    scale: "Durable, replayable log of every Signal that crossed the bus.",
    highlight: true,
  },
];

// ---------------------------------------------------------------------------
// The snippet is the same for every transport  -  only SYNAPSE_URL changes.
// We render it as one template with the URL injected, so the diff between
// tabs is exactly one line, which is the whole point.
// ---------------------------------------------------------------------------
const snippet = (synapseUrl: string) => `<span class="tk-kw">import</span> asyncio, os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, Neuron, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${synapseUrl}"</span>   <span class="tk-cm"># ← the only line that changes</span>

greeter <span class="tk-op">=</span> Neuron(
    source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
    use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>,
)

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    worker <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"greeter"</span>, neuron_fn<span class="tk-op">=</span>greeter,
                              capabilities<span class="tk-op">=</span>[<span class="tk-str">"text-generation"</span>, <span class="tk-str">"chat"</span>]))

    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)
    <span class="tk-kw">async with</span> worker, orch:
        reply <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_wait</span>(
            neuron<span class="tk-op">=</span><span class="tk-str">"greeter"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: <span class="tk-str">"Say hello to Cosmonapse."</span>}, timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>,
        )
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

        <div
          className="boc-tabs"
          role="tablist"
          aria-label="Choose synapse transport"
        >
          {TRANSPORTS.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`boc-tab${isActive ? " active" : ""}`}
                onClick={() => setActive(t.id)}
              >
                <span className="boc-tab-label">{t.label}</span>
                <span className="boc-tab-url">{t.synapse}</span>
              </button>
            );
          })}
        </div>

        <div className="boc-grid">
          <div className="boc-code">
            <CodeBlock
              filename="main.py"
              html={snippet(transport.synapse)}
              variant="elevated"
              maxWidth={760}
            />
          </div>

          <aside className="boc-side">
            <div className="boc-side-eyebrow">// {transport.label}</div>
            <p className="boc-side-prose">{transport.scale}</p>
            <ul className="boc-side-list">
              <li>
                <strong>Neuron</strong>  -  a plain async function. Zero protocol
                knowledge.
              </li>
              <li>
                <strong>Axon</strong>  -  identity, capabilities, validation into{" "}
                <code className="inline">AGENT_OUTPUT</code>.
              </li>
              <li>
                <strong>Dendrite</strong>  -  the only thing that touches the
                Synapse. Hosts the Axon, routes inbound TASKs.
              </li>
              <li>
                <strong>dispatch_and_wait</strong>  -  sugar over a Pathway: emit
                a TASK, await the terminal Signal, close, return.
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

      <style>{`
        .boc-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 32px 0 24px;
        }
        .boc-tab {
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          font-family: var(--font-mono, ui-monospace, monospace);
          color: var(--text-dim);
          background: var(--bg-card, var(--surface));
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 18px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s,
            transform 0.15s, box-shadow 0.15s;
        }
        .boc-tab:hover {
          border-color: var(--border-strong, var(--border));
          color: var(--text);
          transform: translateY(-1px);
        }
        .boc-tab.active {
          color: #fff;
          border-color: rgba(139, 92, 246, 0.55);
          background: linear-gradient(
            180deg,
            rgba(139, 92, 246, 0.16),
            rgba(34, 211, 238, 0.06)
          );
          box-shadow: 0 8px 26px -14px rgba(139, 92, 246, 0.7);
        }
        .boc-tab-label {
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .boc-tab-url {
          font-size: 11.5px;
          color: var(--text-faint);
          letter-spacing: 0.02em;
        }
        .boc-tab.active .boc-tab-url {
          color: rgba(255, 255, 255, 0.7);
        }
        .boc-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 28px;
          align-items: start;
          margin-top: 8px;
        }
        @media (max-width: 900px) {
          .boc-grid {
            grid-template-columns: 1fr;
          }
        }
        .boc-side-eyebrow {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 11.5px;
          color: var(--accent-2, #a78bfa);
          letter-spacing: 0.06em;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .boc-side-prose {
          color: var(--text-dim);
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 18px;
        }
        .boc-side-list {
          list-style: none;
          padding: 0;
          margin: 0 0 20px;
          display: grid;
          gap: 10px;
          color: var(--text-dim);
          font-size: 13.5px;
          line-height: 1.55;
        }
        .boc-side-list li {
          padding-left: 14px;
          position: relative;
        }
        .boc-side-list li::before {
          content: "→";
          position: absolute;
          left: 0;
          top: 0;
          color: var(--accent-2, #a78bfa);
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12px;
        }
        .boc-side-list strong {
          color: var(--text);
          font-weight: 600;
        }
        .boc-side-callout {
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.35);
          background: rgba(139, 92, 246, 0.08);
          color: var(--text-dim);
          font-size: 13px;
          line-height: 1.6;
        }
        .boc-side-callout strong {
          color: var(--text);
        }
      `}</style>
    </section>
  );
}
