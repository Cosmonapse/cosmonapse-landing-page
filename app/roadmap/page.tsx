import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap  -  Cosmonapse",
  description:
    "0.1.0 was the start. 0.2.0 hardens the core primitives and freezes pathways and traces; 0.3.0 stress-tests the protocol with real agents; 1.0.0 is a strong protocol foundation with Doppler Prism observability, Brains and Brainwaves, and Cosmonapse Cloud.",
};

export default function RoadmapPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Roadmap</div>
          <h1 className="page-title">From 0.1.0 to a Stable 1.0.0.</h1>
          <p className="page-sub">
            0.1.0 was the start: the protocol and SDK shapes are in place. The 0.x line takes the
            five core primitives  -  Synapse, Dendrite, Neuron, Axon, Engram  -  from shapes to
            solid, freezes pathways and traces, and then stress-tests the protocol with real agents.
            1.0.0 is a strong protocol foundation you can build complex RAG and agent systems on,
            observed through Doppler Prism, captured and replayed as Brainwaves, and deployed as
            shareable Brain architectures.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="timeline">
            <div className="timeline-item current">
              <div className="timeline-version">0.1.x · current (0.1.8)  -  the start</div>
              <h2 className="timeline-title">Read the spec. Build the Dendrite by hand.</h2>
              <div className="timeline-body">
                <p>
                  The first public release. The developer reads the envelope spec, writes an Axon and
                  Dendrite using the SDK primitives, chooses a Synapse adapter, and wires their own
                  orchestration logic. Full control, full complexity, appropriate for early adopters. The
                  Python SDK is the complete reference implementation; as of 0.1.6 the TypeScript SDK is at full parity.
                </p>
                <p>What 0.1.0 ships:</p>
                <ul>
                  <li>Envelope codec (Pydantic) and <code className="inline">cosmo validate</code></li>
                  <li>Axon  -  agent-side tool, in-process</li>
                  <li>Dendrite  -  synapse-side connector + all orchestration primitives</li>
                  <li>RegistryStore  -  memory / SQLite / Postgres backends</li>
                  <li>MemorySynapse, DevSynapse (TCP+NDJSON), NatsSynapse, KafkaSynapse</li>
                  <li>
                    <code className="inline">cosmo init</code> (project scaffolding),{" "}
                    <code className="inline">cosmo synapse start|view|stop</code>,{" "}
                    <code className="inline">cosmo doppler</code>,{" "}
                    <code className="inline">cosmo validate</code>,{" "}
                    <code className="inline">cosmo completion</code> (bash / zsh / fish)
                  </li>
                  <li>
                    <strong>Prism</strong>  -  a local browser frontend for monitoring a live Synapse,
                    served by <code className="inline">cosmo doppler --prism</code>. A hero form picks the
                    Synapse URL + namespace, then an animated view streams every Signal on the wildcard
                    subject over a WebSocket in real time
                  </li>
                  <li>LifecycleHooks  -  on_connect / on_refresh / on_schedule</li>
                  <li><code className="inline">connect_synapse(url)</code>  -  build + connect a Synapse in one call</li>
                  <li>Neuron provider factories  -  Ollama, HuggingFace / vLLM (via httpx)</li>
                  <li>
                    <strong>Engram (shared memory)</strong>  -  RECALL / IMPRINT signals,{" "}
                    <code className="inline">EngramBinding</code> + <code className="inline">EngramClient</code>,
                    and three backends (InMemory / SQLite / Postgres)
                  </li>
                  <li>
                    <strong>Pathway</strong>  -  per-trace event handle with three consumption
                    shapes (<code className="inline">await pw.wait()</code>,{" "}
                    <code className="inline">@pw.on(...)</code>,{" "}
                    <code className="inline">async for sig in pw</code>) plus{" "}
                    <code className="inline">scope=&quot;terminal&quot;</code> for the decentralised pattern
                  </li>
                  <li>
                    <strong>Cognition signal family</strong>  -  PLAN, THOUGHT_DELTA, TOOL_CALL,
                    TOOL_RESULT, MEMORY_APPEND, CRITIQUE, ESCALATION, CONSENSUS, CONTEXT_SYNC,
                    each with a matching <code className="inline">emit_*</code> /{" "}
                    <code className="inline">on_*</code> pair
                  </li>
                  <li>
                    <strong>Capability-routed dispatch + competitive bidding</strong>  - {" "}
                    <code className="inline">dispatch(capabilities=...)</code> with queue-group
                    load-balancing, and <code className="inline">dispatch_offer(...)</code> running
                    TASK_OFFER / BID / TASK_AWARDED with <code className="inline">first_bid</code>,{" "}
                    <code className="inline">lowest_cost</code>, or{" "}
                    <code className="inline">highest_confidence</code> selection
                  </li>
                  <li>
                    Dispatch sugar  -  <code className="inline">dispatch_and_wait(...)</code> and{" "}
                    <code className="inline">dispatch_and_subscribe(...)</code>
                  </li>
                  <li>
                    TypeScript SDK  -  full parity as of 0.1.6: envelope, builders, Axon,
                    Dendrite (Pathway dispatch, offers / bidding, interactive cognition), all
                    four Synapse adapters with{" "}
                    <code className="inline">connectSynapse(url)</code>, all three RegistryStore
                    backends, LifecycleHooks, the LLM / MCP / unified{" "}
                    <code className="inline">neuron()</code> source factories, and Engram.
                  </li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">0.2.0 · next  -  solid barebones</div>
              <h2 className="timeline-title">The five primitives, working end to end.</h2>
              <div className="timeline-body">
                <p>
                  Take every core primitive from shipped to dependable: barebones functionality that
                  holds up with at least basic LLMs behind the Neurons, an observability surface that
                  keeps up, and the trace model locked so everything after can rely on it.
                </p>
                <p>What 0.2.0 means:</p>
                <ul>
                  <li>Synapse, Dendrite, Neuron, Axon, and Engram at barebones functionality  -  working end to end with basic LLMs at minimum</li>
                  <li>Doppler grows up  -  multi-tab views, filters, and the workflow of actually watching more than one thing at once</li>
                  <li>Pathways and traces set in stone  -  the per-trace model (trace_id / parent_id, Pathway scopes, terminal semantics) is frozen and relied upon</li>
                  <li>Heavy testing against NATS, Kafka, and the other components  -  the networked paths exercised against real brokers, not just memory transports</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">0.3.0 · future  -  agents on the wire</div>
              <h2 className="timeline-title">Stress-test the protocol with real agents.</h2>
              <div className="timeline-body">
                <p>
                  With the primitives solid, put real agents on the fabric and see what bends. A mix
                  of fixing and development: every gap an agent workload exposes feeds straight back
                  into the protocol and SDKs.
                </p>
                <p>What 0.3.0 means:</p>
                <ul>
                  <li>Agent systems built from Claude and OpenAI models running over the protocol  -  not just single LLM calls</li>
                  <li>Stress testing: long traces, concurrent workflows, bidding under load, Engram-heavy agents</li>
                  <li>Fixes and refinements driven by what those workloads expose  -  development continues where agents demand it</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">1.0.0 · target  -  stable</div>
              <h2 className="timeline-title">A strong protocol foundation.</h2>
              <div className="timeline-body">
                <p>
                  1.0.0 is the point where the foundation is strong enough to disappear: you think in
                  terms of the system you are building, not the protocol underneath it.
                </p>
                <p>What 1.0.0 means:</p>
                <ul>
                  <li><strong>Strong protocol foundation</strong>  -  Synapse, Dendrite, Neuron, Axon, and Engram from cosmonapse-core are solid</li>
                  <li>
                    <strong>Doppler Prism</strong>  -  basic observability and statistics, with{" "}
                    <strong>Brain</strong> development alongside Synapse development. Maybe{" "}
                    <strong>&quot;Brainwaves&quot;</strong>: capture and replay a task or a set of
                    tasks. Shareable Brain architectures  -  think Terraform, for agent fabrics
                  </li>
                  <li><strong>Infra integration</strong>  -  automated deployments, distributed setups wired into the same tooling</li>
                  <li>
                    <strong>The success criterion</strong>  -  consistently building complex RAG
                    LLM / agent systems on Cosmonapse. The capability for agents is already there;
                    1.0.0 is when doing it reliably is unremarkable
                  </li>
                  <li>
                    <strong>Cosmonapse Cloud</strong>  -  all of it available hosted. Further out
                    deliberately: this moves when the project gets full-time attention
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="sub-eyebrow">Priority order  -  0.1.0 → 1.0.0</div>
          <p className="prose">The order matters. Each milestone lands on the baseline the last one established.</p>
          <ol className="prose" style={{ paddingLeft: 24 }}>
            <li>0.1.0  -  the start: protocol drafted, SDKs shipped, every primitive present</li>
            <li>0.2.0  -  the five primitives solid with basic LLMs; Doppler multi-tab + filters; pathways and traces set in stone; heavy testing against NATS / Kafka</li>
            <li>0.3.0  -  agents from Claude and OpenAI stress-testing the protocol; fixing and development in tandem</li>
            <li>1.0.0  -  strong foundation: Doppler Prism observability, Brains and Brainwaves, infra integration, complex RAG / agent systems built consistently, Cosmonapse Cloud</li>
          </ol>
        </div>
      </section>
    </>
  );
}
