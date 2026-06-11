import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap  -  Cosmonapse",
  description:
    "0.1.0 public alpha → 1.0.0 stable. The 0.x line is about stabilisation: CI, a frozen machine-checkable spec, real broker integration tests, and TypeScript parity.",
};

export default function RoadmapPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Roadmap</div>
          <h1 className="page-title">From 0.1.0 to a stable 1.0.0.</h1>
          <p className="page-sub">
            The protocol and SDK shapes are substantially in place. The theme of the 0.x line is
            stabilisation, not new surface area: make the contract provably correct, enforce it in CI,
            integration-test every transport, and bring the TypeScript SDK to parity. 1.0.0 means the
            envelope spec is frozen and machine-checkable, both SDKs agree on the core contract, and
            every wire transport is tested against a real broker.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="timeline">
            <div className="timeline-item current">
              <div className="timeline-version">0.1.x · current (0.1.3)  -  public alpha</div>
              <h2 className="timeline-title">Read the spec. Build the Dendrite by hand.</h2>
              <div className="timeline-body">
                <p>
                  The first public release. The developer reads the envelope spec, writes an Axon and
                  Dendrite using the SDK primitives, chooses a Synapse adapter, and wires their own
                  orchestration logic. Full control, full complexity, appropriate for early adopters. The
                  Python SDK is the complete reference implementation; as of 0.1.3 the TypeScript SDK is at full parity.
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
                    TypeScript SDK  -  full parity as of 0.1.3: envelope, builders, Axon,
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
              <div className="timeline-version">0.2.0 · next  -  fixes and updates</div>
              <h2 className="timeline-title">Harden what 0.1.0 shipped.</h2>
              <div className="timeline-body">
                <p>
                  A consolidation release: fixes, refinements, and a reworked Prism, plus the engineering
                  hygiene that lets everything after it land on a green baseline. No new protocol surface.
                </p>
                <p>What 0.2.0 adds:</p>
                <ul>
                  <li>Bug fixes and API refinements from early-adopter feedback on 0.1.0</li>
                  <li>Reworked Prism  -  the local Synapse monitor frontend</li>
                  <li>GitHub Actions running Python tests + ruff + mypy across 3.11 / 3.12 / 3.13, plus TS typecheck / build / test</li>
                  <li>CI required for merge to <code className="inline">main</code> (branch protection)</li>
                  <li>Committed TS lockfile so <code className="inline">npm ci</code> is reproducible</li>
                  <li>Project-wide version reconciliation (docs, examples, docstrings)</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">0.3.0 · next  -  frozen contract</div>
              <h2 className="timeline-title">A spec a third party can implement without reading Python.</h2>
              <div className="timeline-body">
                <p>
                  Turn the envelope spec into something machine-checkable and stable, so non-Python
                  implementers have a schema and fixtures to build against.
                </p>
                <p>What 0.3.0 adds:</p>
                <ul>
                  <li>Published JSON Schema for the envelope, generated from / checked against <code className="inline">envelope.py</code></li>
                  <li>CI validation against a golden-envelope corpus (one valid + one invalid fixture per signal type)</li>
                  <li><code className="inline">ENVELOPE_SPEC.md</code> moves from Draft to Stable, with an additive-only compatibility promise within a major <code className="inline">v</code></li>
                  <li>Cross-language conformance  -  the same corpus round-trips identically through Python and TypeScript codecs</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">0.4.0 · future  -  real transports</div>
              <h2 className="timeline-title">Every backend tested against a real broker.</h2>
              <div className="timeline-body">
                <p>
                  Memory and dev-TCP synapses are well tested today; the networked paths are not yet
                  exercised against live services. 0.4.0 closes that.
                </p>
                <p>What 0.4.0 adds:</p>
                <ul>
                  <li>Integration tests against a real NATS broker (addressed + capability-routed queue-group delivery)</li>
                  <li>Integration tests against a real Kafka broker</li>
                  <li>Integration tests for SqliteEngram / PostgresEngram / PostgresRegistryStore against real Postgres</li>
                  <li>Documented at-least-once vs once-only delivery semantics per transport, each backed by a test</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">0.5.0 · future  -  parity, proven</div>
              <h2 className="timeline-title">TypeScript becomes first-class.</h2>
              <div className="timeline-body">
                <p>
                  The feature surface reached parity early  -  0.1.3 shipped lifecycle hooks,{" "}
                  <code className="inline">connectSynapse(url)</code>, DevSynapse, the LLM provider
                  neuron factories, all three RegistryStore backends, and Engram in TypeScript.
                  0.5.0 makes that parity provable rather than asserted.
                </p>
                <p>What 0.5.0 adds:</p>
                <ul>
                  <li>The cross-language conformance corpus running in TS CI</li>
                  <li>Byte-level envelope golden tests between the two SDKs</li>
                  <li>Published, versioned <code className="inline">@cosmonapse/sdk</code> releases in lock-step with PyPI</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">1.0.0 · target  -  stable</div>
              <h2 className="timeline-title">A contract you can build a company on.</h2>
              <div className="timeline-body">
                <p>
                  The <code className="inline">v=&quot;1&quot;</code> envelope contract is stable; breaking
                  changes require <code className="inline">v=&quot;2&quot;</code>. Both SDKs agree on the core
                  contract, and every transport is integration-tested.
                </p>
                <p>What 1.0.0 requires:</p>
                <ul>
                  <li>All prior milestones complete and green in CI</li>
                  <li>API reference docs generated for both SDKs</li>
                  <li>A documented deprecation / semver policy for the post-1.0 line</li>
                  <li>Every example runs in CI against the memory synapse</li>
                  <li>Security / dependency audit (pip-audit, npm audit) wired into CI</li>
                  <li>Tag <code className="inline">v1.0.0</code> and publish to PyPI + npm</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="sub-eyebrow">Priority order  -  0.1.0 → 1.0.0</div>
          <p className="prose">The order matters. Each milestone lands on the green baseline the last one established.</p>
          <ol className="prose" style={{ paddingLeft: 24 }}>
            <li>0.2.0  -  CI enforced on every commit (provable baseline)</li>
            <li>0.3.0  -  frozen, machine-checkable envelope spec + JSON Schema</li>
            <li>0.4.0  -  integration tests against real NATS / Kafka / Postgres</li>
            <li>0.5.0  -  TypeScript parity proven by a cross-language conformance corpus</li>
            <li>1.0.0  -  docs, semver policy, security audit, tag + publish</li>
          </ol>
        </div>
      </section>
    </>
  );
}
