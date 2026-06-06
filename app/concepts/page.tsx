import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concepts & Terminology  -  Cosmonapse",
  description:
    "The biological vocabulary of Cosmonapse across the full product line: Core, Engram, Doppler, Immune, and Cloud.",
};

type Status = "active" | "scoping" | "not-planned";

const STATUS_LABEL: Record<Status, string> = {
  "active":      "Active Development",
  "scoping":     "Scoping",
  "not-planned": "Planned",
};

const STATUS_COLOR: Record<Status, string> = {
  "active":      "#4ade80",
  "scoping":     "#fbbf24",
  "not-planned": "#6b7280",
};

const STATUS_BG: Record<Status, string> = {
  "active":      "rgba(74,222,128,0.08)",
  "scoping":     "rgba(251,191,36,0.08)",
  "not-planned": "rgba(107,114,128,0.06)",
};

const productLine: {
  product: string;
  tagline: string;
  color: string;
  status: Status;
  concepts: { name: string; map: string; desc: string }[];
  subProject?: {
    product: string;
    tagline: string;
    color: string;
    status: Status;
    concepts: { name: string; map: string; desc: string }[];
  };
}[] = [
  {
    product: "Cosmonapse Core",
    tagline: "Distributed cognition runtime",
    color: "var(--accent)",
    status: "active",
    concepts: [
      {
        name: "Brain",
        map: "Team of agents",
        desc: "A collection of Neurons sharing a Synapse. The unit of organisation when teams group agents by capability or domain.",
      },
      {
        name: "Neuron",
        map: "Agent · MCP server · function",
        desc: "Anything that interacts with the real world, exposed behind a pure-function interface  -  receives (input, context), returns output, zero protocol knowledge. Not just an LLM agent: it can be an agent, an MCP server, or a plain async function. The Neuron(source=…) factory turns each into the same callable. An HTTP API is not a Neuron  -  keep your web framework at the edge and dispatch TASKs from its routes via an orchestrator Dendrite. Replaceable without touching infrastructure.",
      },
      {
        name: "Axon",
        map: "Agent-side tool",
        desc: "The only piece of Cosmonapse that lives inside the Neuron's process. Wraps the Neuron function, validates its output into a Signal (AGENT_OUTPUT, CLARIFICATION, PERMISSION, or ERROR), and hands it to the Dendrite. The Neuron itself never touches the protocol.",
      },
      {
        name: "Dendrite",
        map: "Synapse-side connector",
        desc: "The only component that touches the Synapse. Hosts Axons, owns routing decisions, exposes the aggregate of its Axons' capabilities, and emits REGISTER / HEARTBEAT / DEREGISTER per attached Axon. Has a role: orchestrator (can dispatch TASKs) or worker (hosts Axons only). Workers are guarded  -  they can serve TASKs and bid in capability routing, but can't emit orchestration signals.",
      },
      {
        name: "Pathway",
        map: "Per-trace event handle",
        desc: "Returned by dendrite.dispatch(...). A single primitive with three consumption shapes: await pw.wait() for sequential request/reply, @pw.on(SignalType.X) for reactive trace-scoped callbacks, and async for sig in pw: for streaming. Pathway(scope=\"terminal\") filters to FINAL / ERROR / CLARIFICATION only  -  the decentralised pattern where the Cortex only wakes for events that need attention. observe_pathway(trace_id) opens one in observer role to watch a trace another peer started.",
      },
      {
        name: "Synapse",
        map: "Channel / stream",
        desc: "The transport layer all Signals cross. Pluggable: MemorySynapse for tests, DevSynapse for local multi-process dev, NatsSynapse or KafkaSynapse for production. Capability-routed TASKs publish on cosmonapse.<ns>.TASK.routed with queue groups so the broker delivers each one exactly once within a matching cap profile.",
      },
      {
        name: "Signal",
        map: "Envelope",
        desc: "A single message crossing the Synapse. The shared contract  -  two components that produce valid Signals can always interoperate.",
      },
    ],
  },
  {
    product: "Cosmonapse Engram",
    tagline: "Context, memory & persistence",
    color: "#a78bfa",
    status: "active",
    concepts: [
      {
        name: "Recall",
        map: "Read path · RECALL signal",
        desc: "Reads bound memory before a Neuron acts. The Axon emits a RECALL signal; the Engram replies with RECALLED carrying Hits. EngramClient.recall() is the in-Neuron API. Ships in 0.1.0 with InMemory, SQLite, and Postgres backends. Vector-backed semantic search is on the Echo roadmap.",
      },
      {
        name: "Imprint",
        map: "Write path · IMPRINT signal",
        desc: "Durable writes to bound memory. The Axon emits an IMPRINT signal; the Engram replies with IMPRINTED carrying a receipt. EngramClient.imprint() is the in-Neuron API. Operations: add, append, merge, upsert, delete. Ships in 0.1.0.",
      },
      {
        name: "Echo",
        map: "Replay & snapshots (next)",
        desc: "Records and replays Signal streams and Engram states. Time-travel debugging, snapshot diffing, deterministic re-runs of any workflow. Planned for a follow-up release.",
      },
    ],
  },
  {
    product: "Cosmonapse Doppler",
    tagline: "Observability & telemetry",
    color: "#22d3ee",
    status: "active",
    concepts: [
      {
        name: "Pulse",
        map: "Live telemetry",
        desc: "Real-time stream of Signal metrics  -  latency, throughput, error rates, and cost per Neuron. Named for the heartbeat of the system.",
      },
      {
        name: "Prism",
        map: "Visualization layer",
        desc: "Breaks the Pulse stream into human-readable dashboards, trace graphs, and audit views. Builds on Doppler's read-only Synapse tap without disturbing the flow.",
      },
    ],
    subProject: {
      product: "Cosmonapse Resonance",
      tagline: "Cognition analytics",
      color: "#818cf8",
      status: "scoping",
      concepts: [
        {
          name: "Flux",
          map: "Signal propagation analysis",
          desc: "Tracks how Signals travel through the Brain  -  measuring path lengths, bottlenecks, and propagation velocity between Neurons.",
        },
        {
          name: "Field",
          map: "Neuron influence mapping",
          desc: "Models the influence each Neuron exerts on others  -  building a directed graph of cognitive dependencies from the observed Signal stream.",
        },
        {
          name: "Topology",
          map: "Emergent pattern detection",
          desc: "Surfaces emergent structural patterns in the Brain  -  clusters, hubs, and unexpected collaboration paths that arise from Signal behavior over time.",
        },
        {
          name: "Affinity",
          map: "Collaboration efficiency",
          desc: "Scores how efficiently pairs and groups of Neurons collaborate  -  latency, success rate, and resource cost per cognitive handoff.",
        },
        {
          name: "Coherence",
          map: "Cognitive synchronization",
          desc: "Measures the degree to which Neurons operate in temporal alignment  -  detecting desynchronization, phase drift, and coordination breakdowns across the Brain.",
        },
      ],
    },
  },
  {
    product: "Cosmonapse Immune",
    tagline: "Identity, security & threat response",
    color: "#f87171",
    status: "not-planned",
    concepts: [
      {
        name: "Genome",
        map: "Identity management",
        desc: "Defines and enforces the identity of every Neuron and Brain  -  API keys, roles, capability scopes, and namespace boundaries.",
      },
      {
        name: "Myelin",
        map: "Encryption & security",
        desc: "The insulating layer around every Signal path. Handles transport encryption, at-rest Engram encryption, and key rotation without touching application logic.",
      },
      {
        name: "Reflex",
        map: "Automated threat response",
        desc: "Monitors Signal patterns for anomalies and executes pre-defined countermeasures automatically  -  rate limiting, circuit breaking, Neuron quarantine.",
      },
      {
        name: "AntiBody",
        map: "Anomaly detection",
        desc: "The learning surface of the Immune system. Builds baseline models of normal Signal flow and flags deviations for Reflex to act on or operators to review.",
      },
    ],
  },
  {
    product: "Cosmonapse Cloud",
    tagline: "Managed cognition platform",
    color: "#fb923c",
    status: "not-planned",
    concepts: [
      {
        name: "Membrane",
        map: "Sandboxing & isolation",
        desc: "The boundary layer in the managed platform. Isolates each Brain in its own execution context  -  resource quotas, network policies, and credential scoping enforced at the infrastructure level.",
      },
    ],
  },
];

export default function ConceptsPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Concepts</div>
          <h1 className="page-title">The biology of distributed cognition.</h1>
          <p className="page-sub">
            Cosmonapse names its primitives after the parts of a nervous system. The metaphor is
            precise, not decorative  -  each term maps exactly to a conventional distributed-systems
            concept. These names are canonical across the spec, SDK, CLI, docs, and every product in
            the Cosmonapse line.
          </p>
        </div>
      </header>

      {/* Product line  -  big cards */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Product line</div>
          <h2 className="sub-title">Five layers. One nervous system.</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginTop: 36,
            }}
          >
            {productLine.map((p) => {
              const dim = p.status === "not-planned";
              return (
                <div
                  key={p.product}
                  style={{
                    border: `1px solid ${dim ? "var(--border)" : p.color + "44"}`,
                    borderRadius: 12,
                    padding: "28px 28px 24px",
                    background: dim ? "var(--surface)" : STATUS_BG[p.status],
                    opacity: dim ? 0.65 : 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                  }}
                >
                  {/* Status badge */}
                  <div style={{ marginBottom: 16 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        color: STATUS_COLOR[p.status],
                        background: STATUS_COLOR[p.status] + "18",
                        border: `1px solid ${STATUS_COLOR[p.status]}44`,
                        padding: "3px 10px",
                        borderRadius: 20,
                        letterSpacing: "0.04em",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: STATUS_COLOR[p.status],
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>

                  {/* Product name */}
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: p.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                    }}
                  >
                    {p.product.replace("Cosmonapse ", "")}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "var(--text)",
                      lineHeight: 1.3,
                      marginBottom: 10,
                    }}
                  >
                    {p.product}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--text-dim)",
                      lineHeight: 1.6,
                      marginBottom: 20,
                    }}
                  >
                    {p.tagline}
                  </div>

                  {/* Concept chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: "auto" }}>
                    {p.concepts.map((c) => (
                      <span
                        key={c.name}
                        style={{
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          padding: "4px 10px",
                          borderRadius: 6,
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          color: dim ? "var(--text-faint)" : "var(--text-dim)",
                        }}
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>

                  {/* Nested sub-project (e.g. Resonance under Doppler) */}
                  {p.subProject && (
                    <div
                      style={{
                        marginTop: 20,
                        paddingTop: 18,
                        borderTop: `1px solid ${p.subProject.color}33`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "var(--font-mono)",
                            color: p.subProject.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {p.subProject.product.replace("Cosmonapse ", "")}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 10,
                            fontFamily: "var(--font-mono)",
                            color: STATUS_COLOR[p.subProject.status],
                            background: STATUS_COLOR[p.subProject.status] + "18",
                            border: `1px solid ${STATUS_COLOR[p.subProject.status]}44`,
                            padding: "2px 8px",
                            borderRadius: 20,
                            letterSpacing: "0.04em",
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: STATUS_COLOR[p.subProject.status],
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          {STATUS_LABEL[p.subProject.status]}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--text)",
                          marginBottom: 4,
                        }}
                      >
                        {p.subProject.product}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-dim)",
                          letterSpacing: "0.05em",
                          marginBottom: 12,
                        }}
                      >
                        {p.subProject.tagline}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {p.subProject.concepts.map((c) => (
                          <span
                            key={c.name}
                            style={{
                              fontSize: 11,
                              fontFamily: "var(--font-mono)",
                              padding: "3px 9px",
                              borderRadius: 5,
                              background: p.subProject!.color + "12",
                              border: `1px solid ${p.subProject!.color}33`,
                              color: p.subProject!.color + "cc",
                            }}
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Per-product concept cards */}
      {productLine.map((p) => (
        <section className="section-sm" key={p.product}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div className="sub-eyebrow" style={{ color: p.color, margin: 0 }}>
                {p.product}
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: STATUS_COLOR[p.status],
                  background: STATUS_COLOR[p.status] + "18",
                  border: `1px solid ${STATUS_COLOR[p.status]}44`,
                  padding: "2px 8px",
                  borderRadius: 20,
                  letterSpacing: "0.04em",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: STATUS_COLOR[p.status],
                    display: "inline-block",
                  }}
                />
                {STATUS_LABEL[p.status]}
              </span>
            </div>
            <h2 className="sub-title" style={{ marginBottom: 24 }}>
              {p.tagline}
            </h2>
            <div className="grid-3" style={{ opacity: p.status === "not-planned" ? 0.6 : 1 }}>
              {p.concepts.map((c) => (
                <div className="concept-card" key={c.name}>
                  <div className="concept-name">{c.name}</div>
                  <div className="concept-map">→ {c.map}</div>
                  <div className="concept-desc">{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Nested sub-project concept section */}
            {p.subProject && (
              <div style={{ marginTop: 40, paddingTop: 32, borderTop: `1px solid ${p.subProject.color}33` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div className="sub-eyebrow" style={{ color: p.subProject.color, margin: 0 }}>
                    {p.subProject.product}
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: STATUS_COLOR[p.subProject.status],
                      background: STATUS_COLOR[p.subProject.status] + "18",
                      border: `1px solid ${STATUS_COLOR[p.subProject.status]}44`,
                      padding: "2px 8px",
                      borderRadius: 20,
                      letterSpacing: "0.04em",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: STATUS_COLOR[p.subProject.status],
                        display: "inline-block",
                      }}
                    />
                    {STATUS_LABEL[p.subProject.status]}
                  </span>
                </div>
                <h3 className="sub-title" style={{ marginBottom: 20, fontSize: 18 }}>
                  {p.subProject.tagline}
                </h3>
                <div className="grid-3">
                  {p.subProject.concepts.map((c) => (
                    <div className="concept-card" key={c.name} style={{ borderColor: p.subProject!.color + "33" }}>
                      <div className="concept-name" style={{ color: p.subProject!.color }}>{c.name}</div>
                      <div className="concept-map">→ {c.map}</div>
                      <div className="concept-desc">{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Narrative */}
      <section className="section">
        <div className="container">
          <div className="sub-eyebrow">How they fit together</div>
          <h2 className="sub-title">A Brain in motion.</h2>
          <p className="prose">
            A <strong>Brain</strong> is a team of <strong>Neurons</strong>. Each Neuron is reached
            through a Dendrite  -  the only component that touches the <strong>Synapse</strong>. The
            Dendrite carries <strong>Signals</strong> between participants and exposes orchestration
            primitives for whoever needs them.
          </p>
          <p className="prose">
            Persistent state lives in <strong>Engram</strong>  -  written via <strong>Imprint</strong>,
            retrieved via <strong>Recall</strong>, and replayed or snapshotted via{" "}
            <strong>Echo</strong>. Observability comes from <strong>Doppler</strong>:{" "}
            <strong>Pulse</strong> streams live telemetry and <strong>Prism</strong> turns it into
            dashboards and traces. <strong>Resonance</strong>, a sub-project within Doppler, goes
            deeper  -  it is cognition analytics for the Brain, analyzing how Neurons influence each
            other, how Signals propagate, and surfacing emergent patterns, collaboration efficiency,
            and cognitive synchronization.
          </p>
          <p className="prose">
            Security will eventually be enforced by <strong>Immune</strong>:{" "}
            <strong>Genome</strong> governs identity and access, <strong>Myelin</strong> encrypts
            every path, and <strong>Reflex</strong> with <strong>AntiBody</strong> detect and respond
            to threats automatically. In the managed cloud, <strong>Membrane</strong> wraps the whole
            runtime in an isolated execution boundary  -  resource quotas, network policies, and
            credential scoping enforced at the infrastructure level.
          </p>

          <div className="layer-stack" style={{ marginTop: 40 }}>
            <div className="layer">
              <div className="layer-name">Workflow trigger</div>
              <div className="layer-desc">
                A user request, a scheduled job, or another Brain  -  dispatches the root TASK Signal
                onto the Synapse.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer highlight">
              <div className="layer-name">Dendrite  -  synapse-side connector + orchestration</div>
              <div className="layer-desc">
                Receives the TASK. Routes it to the attached Axon matching the target neuron_id.
                Emits FINAL when done. Every Dendrite can orchestrate  -  no separate Cortex class
                (Cortex is a back-compat alias).
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer">
              <div className="layer-name">Neuron  -  agent, MCP server, or function</div>
              <div className="layer-desc">
                Receives (input, context). Returns a plain dict. Anything that interacts with the
                real world  -  an LLM agent, a wrapped MCP server, or a plain function  -  knowing
                nothing about the Synapse, envelopes, trace IDs, or the rest of this picture.
                (An HTTP API is not a Neuron; it sits at the edge, in front of an orchestrator
                Dendrite.)
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer">
              <div className="layer-name">Engram  -  Recall · Imprint · Echo</div>
              <div className="layer-desc">
                Persistent shared state written by Imprint, queried by Recall before each Neuron
                call, and snapshotted by Echo for replay and debugging.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer">
              <div className="layer-name">Immune  -  Genome · Myelin · Reflex · AntiBody</div>
              <div className="layer-desc">
                Identity and access enforced by Genome. Encryption handled by Myelin. Anomalies
                surfaced by AntiBody and acted on automatically by Reflex.
              </div>
            </div>
          </div>

          <p className="prose" style={{ marginTop: 40 }}>
            <strong>Doppler</strong> (Pulse + Prism) sits beside this whole picture, not inside it.
            It subscribes to the Synapse as a non-competing read-only consumer and sees every Signal
            flow past. <strong>Resonance</strong>  -  a sub-project of Doppler  -  builds on that stream
            to deliver cognition analytics: Flux maps propagation paths, Field models Neuron
            influence, Topology surfaces emergent structure, Affinity scores collaboration, and
            Coherence measures synchronization. In <strong>Cosmonapse Cloud</strong>, the entire
            stack runs inside a <strong>Membrane</strong>  -  sandboxed, quota-enforced, and
            credential-scoped at the infrastructure level.
          </p>
        </div>
      </section>

      {/* Glossary  -  grouped by product with status rows */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Glossary cheatsheet</div>
          <table className="spec-table">
            <thead>
              <tr>
                <th>Cosmonapse term</th>
                <th>Conventional term</th>
                <th>One-line</th>
              </tr>
            </thead>
            <tbody>
              {productLine.map((p) => (
                <>
                  {/* Product group header row */}
                  <tr key={`${p.product}-header`}>
                    <td
                      colSpan={3}
                      style={{
                        padding: "10px 14px 8px",
                        background: STATUS_BG[p.status],
                        borderTop: `2px solid ${p.color}44`,
                        borderBottom: `1px solid ${p.color}22`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: p.color,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {p.product}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 10,
                            fontFamily: "var(--font-mono)",
                            color: STATUS_COLOR[p.status],
                            background: STATUS_COLOR[p.status] + "18",
                            border: `1px solid ${STATUS_COLOR[p.status]}44`,
                            padding: "2px 8px",
                            borderRadius: 20,
                            letterSpacing: "0.04em",
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: STATUS_COLOR[p.status],
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          {STATUS_LABEL[p.status]}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                          {p.tagline}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Concept rows */}
                  {p.concepts.map((c) => (
                    <tr
                      key={c.name}
                      style={{
                        opacity: p.status === "not-planned" ? 0.55 : 1,
                        background:
                          p.status === "not-planned" ? "transparent" : STATUS_BG[p.status] + "80",
                      }}
                    >
                      <td style={{ paddingLeft: 24 }}>
                        <span style={{ color: p.color, opacity: 0.9 }}>{c.name}</span>
                      </td>
                      <td style={{ color: "var(--text-dim)" }}>{c.map}</td>
                      <td style={{ color: "var(--text-dim)" }}>{c.desc.split(".")[0]}.</td>
                    </tr>
                  ))}

                  {/* Sub-project group header + rows */}
                  {p.subProject && (
                    <>
                      <tr key={`${p.subProject.product}-header`}>
                        <td
                          colSpan={3}
                          style={{
                            padding: "8px 14px 6px 28px",
                            background: STATUS_BG[p.subProject.status],
                            borderTop: `1px dashed ${p.subProject.color}44`,
                            borderBottom: `1px solid ${p.subProject.color}22`,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: p.subProject.color,
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {p.subProject.product}
                            </span>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 10,
                                fontFamily: "var(--font-mono)",
                                color: STATUS_COLOR[p.subProject.status],
                                background: STATUS_COLOR[p.subProject.status] + "18",
                                border: `1px solid ${STATUS_COLOR[p.subProject.status]}44`,
                                padding: "2px 8px",
                                borderRadius: 20,
                                letterSpacing: "0.04em",
                              }}
                            >
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: STATUS_COLOR[p.subProject.status],
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                              {STATUS_LABEL[p.subProject.status]}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                              {p.subProject.tagline}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {p.subProject.concepts.map((c) => (
                        <tr
                          key={c.name}
                          style={{ background: STATUS_BG[p.subProject!.status] + "60" }}
                        >
                          <td style={{ paddingLeft: 36 }}>
                            <span style={{ color: p.subProject!.color, opacity: 0.9 }}>{c.name}</span>
                          </td>
                          <td style={{ color: "var(--text-dim)" }}>{c.map}</td>
                          <td style={{ color: "var(--text-dim)" }}>{c.desc.split(".")[0]}.</td>
                        </tr>
                      ))}
                    </>
                  )}
                </>
              ))}
            </tbody>
          </table>
          <p className="prose" style={{ marginTop: 24, fontSize: 13, color: "var(--text-faint)" }}>
            Note: <strong>Cortex</strong> is kept as a back-compat alias for Dendrite. New code
            should use Dendrite directly. <strong>Axon</strong> (the agent-side tool that wraps a
            Neuron) remains part of the Core runtime but is an implementation detail  -  applications
            interact with Dendrites and Neurons directly.
          </p>
        </div>
      </section>
    </>
  );
}