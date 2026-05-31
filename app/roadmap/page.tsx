import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap — Cosmonapse",
  description: "v0.1 manual SDK · v0.2 Axon-as-MCP · v0.3 declarative router · v0.4 router agent. Plus what is deliberately excluded.",
};

export default function RoadmapPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Roadmap</div>
          <h1 className="page-title">Four versions. Each one builds on the last.</h1>
          <p className="page-sub">
            Cosmonapse evolves in four deliberate stages. v0.1 gives developers raw primitives and a working
            SDK. v0.2 opens the Axon to remote agents via MCP. v0.3 makes orchestration declarative. v0.4
            introduces a Neuron that builds and tunes Dendrites automatically — only possible because the
            protocol is self-describing.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="timeline">
            <div className="timeline-item current">
              <div className="timeline-version">v0.1 · current — manual SDK</div>
              <h2 className="timeline-title">Read the spec. Build the Dendrite by hand.</h2>
              <div className="timeline-body">
                <p>
                  The developer reads the envelope spec, writes an Axon and Dendrite using the SDK
                  primitives, chooses a Synapse adapter, and wires their own orchestration logic. Full
                  control, full complexity, appropriate for early adopters who want to shape what their
                  workflow looks like.
                </p>
                <p>What v0.1 ships:</p>
                <ul>
                  <li>Envelope codec (Pydantic) and <code className="inline">cosmo validate</code></li>
                  <li>Axon — agent-side tool, in-process</li>
                  <li>Dendrite — synapse-side connector + all orchestration primitives</li>
                  <li>RegistryStore — memory / SQLite / Postgres backends</li>
                  <li>MemorySynapse, DevSynapse (TCP+NDJSON), NatsSynapse, KafkaSynapse</li>
                  <li>
                    <code className="inline">cosmo init</code> (project scaffolding),{" "}
                    <code className="inline">cosmo synapse start|view|stop</code>,{" "}
                    <code className="inline">cosmo doppler</code>,{" "}
                    <code className="inline">cosmo validate</code>,{" "}
                    <code className="inline">cosmo completion</code> (bash / zsh / fish)
                  </li>
                  <li>LifecycleHooks — on_connect / on_refresh / on_schedule</li>
                  <li><code className="inline">connect_synapse(url)</code> — build + connect a Synapse in one call</li>
                  <li>Neuron provider factories — Ollama, HuggingFace / vLLM (via httpx)</li>
                  <li>
                    <strong>Engram (shared memory)</strong> — RECALL / IMPRINT signals,{" "}
                    <code className="inline">EngramBinding</code> + <code className="inline">EngramClient</code>,
                    and three backends (InMemory / SQLite / Postgres)
                  </li>
                  <li>
                    <strong>Pathway</strong> — per-trace event handle with three consumption
                    shapes (<code className="inline">await pw.wait()</code>,{" "}
                    <code className="inline">@pw.on(...)</code>,{" "}
                    <code className="inline">async for sig in pw</code>) plus{" "}
                    <code className="inline">scope=&quot;terminal&quot;</code> for the decentralised pattern
                  </li>
                  <li>
                    <strong>Cognition signal family</strong> — PLAN, THOUGHT_DELTA, TOOL_CALL,
                    TOOL_RESULT, MEMORY_APPEND, CRITIQUE, ESCALATION, CONSENSUS, CONTEXT_SYNC,
                    each with a matching <code className="inline">emit_*</code> /{" "}
                    <code className="inline">on_*</code> pair
                  </li>
                  <li>
                    <strong>Capability-routed dispatch + competitive bidding</strong> —{" "}
                    <code className="inline">dispatch(capabilities=...)</code> with queue-group
                    load-balancing, and <code className="inline">dispatch_offer(...)</code> running
                    TASK_OFFER / BID / TASK_AWARDED with <code className="inline">first_bid</code>,{" "}
                    <code className="inline">lowest_cost</code>, or{" "}
                    <code className="inline">highest_confidence</code> selection
                  </li>
                  <li>
                    Dispatch sugar — <code className="inline">dispatch_and_wait(...)</code> and{" "}
                    <code className="inline">dispatch_and_subscribe(...)</code>
                  </li>
                  <li>
                    TypeScript SDK (partial parity) — envelope, builders, Axon, Dendrite,
                    MemorySynapse, NatsSynapse, in-memory RegistryStore, and the express / MCP
                    / unified <code className="inline">neuron()</code> factory.{" "}
                    <strong>Not yet in TypeScript:</strong> DevSynapse,{" "}
                    <code className="inline">connectSynapse(url)</code>, LifecycleHooks, Ollama /
                    HuggingFace neuron sources, KafkaSynapse, SQLite / Postgres RegistryStore,
                    and Engram. Those are tracked in{" "}
                    <code className="inline">packages/ts-sdk/PORTING_STATUS.md</code> and slated
                    for v0.2 — until then, the Python SDK is the reference implementation.
                  </li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">v0.2 · next — Axon as MCP server</div>
              <h2 className="timeline-title">Any agent, anywhere, via MCP.</h2>
              <div className="timeline-body">
                <p>
                  The Axon ships as an installable MCP server. An arbitrary LLM-driven agent — running in
                  Claude, Cursor, on EC2, or anywhere — can talk to a remote Dendrite over HTTP without
                  importing any Python from Cosmonapse. The Neuron&rsquo;s interface stays identical; only
                  the transport changes.
                </p>
                <p>What v0.2 adds:</p>
                <ul>
                  <li>Axon-as-MCP-server (replaces in-process attach for remote agents)</li>
                  <li>
                    <code className="inline">cosmo dev cortex</code> and{" "}
                    <code className="inline">cosmo dev dendrite</code> scaffold subcommands
                  </li>
                  <li>Durable REGISTER replay on join (late-joining peers catch up)</li>
                  <li>TypeScript SDK → full parity — DevSynapse, LifecycleHooks, KafkaSynapse, SqliteRegistryStore / PostgresRegistryStore, and provider-backed Neuron factories</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">v0.3 · next — declarative router</div>
              <h2 className="timeline-title">Describe the workflow. Generate the Dendrite.</h2>
              <div className="timeline-body">
                <p>
                  A higher-level config layer compiles to a Dendrite. Developers describe workflow rules in a
                  DSL — the SDK generates the orchestration code. The manual Dendrite remains available for
                  cases that need full control; the declarative form is for the 80% of patterns that look
                  the same.
                </p>
                <p>What v0.3 adds:</p>
                <ul>
                  <li>Workflow DSL covering dispatch, bidding, critique, escalation, consensus</li>
                  <li>Code generator that emits a Dendrite from the DSL</li>
                  <li>
                    Hot-reload of workflow config in <code className="inline">cosmo synapse start</code>
                  </li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">v0.4 · future — router agent</div>
              <h2 className="timeline-title">A Neuron that builds and tunes Dendrites.</h2>
              <div className="timeline-body">
                <p>
                  A Cosmonapse Neuron whose capability is{" "}
                  <code className="inline">build_dendrite</code>. It reads the Doppler stream (cost, agent
                  load, trace outcomes), observes which routing decisions worked, and tunes Dendrite config
                  at runtime.
                </p>
                <p>
                  This is only possible because the protocol is self-describing — capabilities declared via{" "}
                  <code className="inline">REGISTER</code>, neuron IDs named in TASK Signals, task flow
                  visible in the Doppler stream. The router-builder Neuron is itself a participant: same
                  protocol, same Axon, same Synapse.
                </p>
                <p>What v0.4 unlocks:</p>
                <ul>
                  <li>Self-tuning Dendrites that adapt routing weights based on observed outcomes</li>
                  <li>Automated capacity planning — Neurons spun up or down based on load</li>
                  <li>Adversarial critique workflows that run themselves</li>
                  <li>Cross-Brain federation — Dendrites discovering each other&rsquo;s capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <div className="sub-eyebrow">Out of scope for v0.1</div>
          <h2 className="sub-title">What we deliberately are not shipping.</h2>
          <p className="prose">
            Every item below is a thing Cosmonapse will not build in v0.1, and the reason it&rsquo;s held
            back. The point is to keep the surface small while the protocol stabilises.
          </p>

          <table className="spec-table">
            <thead>
              <tr>
                <th>Excluded</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: "var(--text)" }}>Hosted platform / cloud control plane</td>
                <td>Adds operational complexity before the protocol is proven</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text)" }}>Reference router implementation</td>
                <td>Would bake in routing assumptions developers should own</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text)" }}>Federation across namespaces</td>
                <td>Post-v0.1 — v0.4 brings protocol-level support</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text)" }}>Billing / chargeback beyond cost annotation</td>
                <td>The envelope carries cost_micro_usd; products on top can add billing</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text)" }}>Axon as MCP server</td>
                <td>Ships in v0.2 — in-process Axon ships first</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text)" }}>Declarative router DSL</td>
                <td>Ships in v0.3 — manual Dendrite comes first</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text)" }}>GUI for the Doppler</td>
                <td>Developer&rsquo;s own visualisation — not Cosmonapse&rsquo;s job</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text)" }}>CostStore / LatencyStore / TraceStore</td>
                <td>Developer-specific schemas; SDK exposes the raw envelope stream and stops there</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="sub-eyebrow">Build order — v0.1</div>
          <p className="prose">The order of operations matters. Each item depends on what came before.</p>
          <ol className="prose" style={{ paddingLeft: 24 }}>
            <li>Envelope types + codec (Pydantic) — foundation everything builds on</li>
            <li>MemorySynapse</li>
            <li>Axon — agent-side tool</li>
            <li>Dendrite — synapse-side connector + orchestration primitives</li>
            <li>RegistryStore — memory / SQLite / Postgres backends</li>
            <li>NATS + Kafka Synapses (lazy-imported)</li>
            <li>
              DevSynapseServer + DevSynapse + <code className="inline">cosmo synapse start memory</code> — proves the
              &ldquo;first five minutes&rdquo; rule across processes
            </li>
            <li>LifecycleHooks — on_connect / on_refresh / on_schedule</li>
          </ol>
        </div>
      </section>
    </>
  );
}
