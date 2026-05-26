import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

const heroSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, connect_synapse

<span class="tk-cm"># 1. Write a Neuron — a pure function, zero protocol knowledge.</span>
<span class="tk-kw">async def</span> <span class="tk-fn">hello_neuron</span>(input, context):
    <span class="tk-kw">return</span> {<span class="tk-str">"message"</span>: <span class="tk-fn">f</span><span class="tk-str">"Hello, {input['name']}!"</span>}

<span class="tk-cm"># 2. Wrap it in an Axon — the agent-side tool.</span>
axon <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"hello-neuron"</span>, neuron_fn<span class="tk-op">=</span>hello_neuron,
           capabilities<span class="tk-op">=</span>[<span class="tk-str">"greet"</span>])

<span class="tk-cm"># 3. Attach to a Dendrite — the only thing that touches the Synapse.</span>
synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>)
dendrite.<span class="tk-fn">attach_axon</span>(axon)

<span class="tk-kw">async with</span> dendrite:
    <span class="tk-cm"># REGISTER → HEARTBEAT → route TASKs → DEREGISTER. Done.</span>
    ...`;

type Status = "active" | "scoping" | "not-planned";

const STATUS_LABEL: Record<Status, string> = {
  active: "Active Development",
  scoping: "Scoping",
  "not-planned": "Planned",
};
const STATUS_COLOR: Record<Status, string> = {
  active: "#4ade80",
  scoping: "#fbbf24",
  "not-planned": "#6b7280",
};
const STATUS_BG: Record<Status, string> = {
  active: "rgba(74,222,128,0.07)",
  scoping: "rgba(251,191,36,0.07)",
  "not-planned": "rgba(107,114,128,0.05)",
};

const products: {
  name: string;
  short: string;
  tagline: string;
  color: string;
  status: Status;
  concepts: string[];
  desc: string;
  subProject?: {
    name: string;
    short: string;
    tagline: string;
    color: string;
    status: Status;
    concepts: string[];
    desc: string;
  };
}[] = [
  {
    name: "Cosmonapse Core",
    short: "Core",
    tagline: "Distributed cognition runtime",
    color: "var(--accent)",
    status: "active",
    concepts: ["Brain", "Neuron", "Dendrite", "Synapse", "Signal"],
    desc: "The open protocol and SDK. One envelope, one Synapse, replaceable Neurons. Everything else is built on top.",
  },
  {
    name: "Cosmonapse Engram",
    short: "Engram",
    tagline: "Context, memory & persistence",
    color: "#a78bfa",
    status: "scoping",
    concepts: ["Recall", "Echo", "Imprint"],
    desc: "Semantic memory for agent systems — vector search over context, snapshot replay, and durable cross-Neuron state.",
  },
  {
    name: "Cosmonapse Doppler",
    short: "Doppler",
    tagline: "Observability & telemetry",
    color: "#22d3ee",
    status: "active",
    concepts: ["Pulse", "Prism"],
    desc: "Live telemetry and visualization over the Signal stream. Reads the wave without disturbing the source.",
    subProject: {
      name: "Cosmonapse Resonance",
      short: "Resonance",
      tagline: "Cognition analytics",
      color: "#818cf8",
      status: "scoping",
      concepts: ["Flux", "Field", "Topology", "Affinity", "Coherence"],
      desc: "Cognition analytics built on the Doppler stream. Analyzes how Neurons influence each other, how Signals propagate through a Brain, and surfaces emergent patterns, collaboration efficiency, and cognitive synchronization.",
    },
  },
  {
    name: "Cosmonapse Immune",
    short: "Immune",
    tagline: "Identity, security & threat response",
    color: "#f87171",
    status: "not-planned",
    concepts: ["Genome", "Myelin", "Reflex", "AntiBody"],
    desc: "Identity management, encryption, anomaly detection, and automated threat response for production agent infrastructure.",
  },
  {
    name: "Cosmonapse Cloud",
    short: "Cloud",
    tagline: "Managed cognition platform",
    color: "#fb923c",
    status: "not-planned",
    concepts: ["Membrane"],
    desc: "The fully managed runtime — Brains in isolated Membranes, quota-enforced, credential-scoped at the infrastructure level.",
  },
];

export default function HomePage() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <div className="badge">
            <span className="dot" />
            v0.2 — Research preview
          </div>
          <h1 className="hero-title">
            The nervous system
            <br />
            for <span className="gradient-text">autonomous AI agents</span>.
          </h1>
          <p className="hero-lead">
            Cosmonapse is a distributed cognition platform. Start with the open protocol — one
            envelope, one Synapse, replaceable Neurons. Layer in memory, observability, security, and
            managed infrastructure as you scale.
          </p>
          <div className="hero-ctas">
            <Link href="/quickstart" className="btn btn-primary">
              Read the quickstart <span className="arrow">→</span>
            </Link>
            <Link href="/protocol" className="btn btn-ghost">
              View envelope spec
            </Link>
          </div>

          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "left" }}>
            <CodeBlock filename="main.py" html={heroSnippet} variant="elevated" />
          </div>
        </div>
      </header>

      {/* Product line */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Product line</div>
          <h2 className="section-title">Five layers. One nervous system.</h2>
          <p className="section-sub">
            Cosmonapse Core ships today as an open protocol and SDK. Engram, Doppler, Immune, and
            Cloud extend it — each a self-contained product with its own primitives, all speaking the
            same Signal envelope.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginTop: 40,
            }}
          >
            {products.map((p) => {
              const dim = p.status === "not-planned";
              return (
                <div
                  key={p.name}
                  style={{
                    border: `1px solid ${dim ? "var(--border)" : p.color + "44"}`,
                    borderRadius: 12,
                    padding: "28px 28px 24px",
                    background: dim ? "var(--surface)" : STATUS_BG[p.status],
                    opacity: dim ? 0.6 : 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                  }}
                >
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
                        letterSpacing: "0.06em",
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
                    {p.short}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "var(--text)",
                      lineHeight: 1.3,
                      marginBottom: 8,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-dim)",
                      letterSpacing: "0.06em",
                      marginBottom: 12,
                    }}
                  >
                    {p.tagline}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-dim)",
                      lineHeight: 1.65,
                      marginBottom: 20,
                    }}
                  >
                    {p.desc}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: "auto" }}>
                    {p.concepts.map((c) => (
                      <span
                        key={c}
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          padding: "4px 10px",
                          borderRadius: 6,
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          color: dim ? "var(--text-faint)" : "var(--text-dim)",
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {p.subProject && (
                    <div
                      style={{
                        marginTop: 20,
                        paddingTop: 18,
                        borderTop: `1px solid ${p.subProject.color}33`,
                      }}
                    >
                      {/* Sub-project status + label row */}
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
                          {p.subProject.short}
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
                        {p.subProject.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-dim)",
                          letterSpacing: "0.05em",
                          marginBottom: 10,
                        }}
                      >
                        {p.subProject.tagline}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-dim)",
                          lineHeight: 1.6,
                          marginBottom: 12,
                        }}
                      >
                        {p.subProject.desc}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {p.subProject.concepts.map((c) => (
                          <span
                            key={c}
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
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/concepts" className="btn btn-ghost">
              Explore all concepts <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* What ships today */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// What ships today</div>
          <h2 className="section-title">Core — open protocol and SDK.</h2>
          <p className="section-sub">
            The protocol and the primitives. Routing decisions, workflow rules, and lifecycle
            policies stay with you — build the system that fits your team.
          </p>
          <div className="grid-2">
            <div className="card">
              <div className="card-icon">01</div>
              <h3>Envelope spec</h3>
              <p>
                The single shared contract. Two components that produce valid Signals can always talk
                to each other. That is the only guarantee Cosmonapse makes.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">02</div>
              <h3>Axon — agent-side tool</h3>
              <p>
                Owns the Neuron&rsquo;s identity and wraps its output into protocol-valid Signals.
                Never touches the Synapse — that boundary is enforced in code, not convention.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">03</div>
              <h3>Dendrite — synapse-side connector</h3>
              <p>
                The only thing that touches the Synapse. Hosts Axons, emits REGISTER / HEARTBEAT /
                DEREGISTER, routes inbound TASKs, and exposes every orchestration primitive.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">04</div>
              <h3>RegistryStore</h3>
              <p>
                Live view of every Neuron on a namespace — capabilities, status, last heartbeat.
                Backed by memory, SQLite, or Postgres. The only mandatory persistent surface the SDK
                owns.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">05</div>
              <h3>cosmo CLI</h3>
              <p>
                <code className="inline">cosmo synapse start memory</code> boots a local TCP broker.{" "}
                <code className="inline">cosmo doppler</code> streams every Signal to stdout.{" "}
                <code className="inline">cosmo validate</code> checks envelope conformance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Building the platform */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Where we&rsquo;re going</div>
          <h2 className="section-title">Building the platform.</h2>
          <p className="section-sub">
            Core is the foundation. The full Cosmonapse platform adds memory, observability,
            security, and managed infrastructure — each layer speaking the same Signal envelope.
          </p>
          <div className="grid-2">
            <div className="card">
              <h3>Neurons are black boxes</h3>
              <p>
                A Neuron is a pure function —{" "}
                <code className="inline">async fn(input, context) → output</code>. Zero protocol
                knowledge. Wrap any existing LLM agent with an Axon and it becomes a protocol
                participant with no modification.
              </p>
            </div>
            <div className="card">
              <h3>Memory is a product layer</h3>
              <p>
                The Core protocol defines <code className="inline">MEMORY_APPEND</code> and{" "}
                <code className="inline">CONTEXT_SYNC</code> signals. Cosmonapse Engram — Recall,
                Echo, and Imprint — is the full implementation. Bring your own context layer, or let
                Engram handle it.
              </p>
            </div>
            <div className="card">
              <h3>Observability & cognition analytics</h3>
              <p>
                Doppler is a non-competing read-only tap on the Synapse. Pulse streams live
                telemetry — latency, throughput, cost per Neuron. Prism turns it into dashboards and
                traces. Resonance builds on the Doppler stream to go deeper — mapping how Neurons
                influence each other (Field), tracking Signal propagation (Flux), detecting emergent
                Brain patterns (Topology), scoring collaboration efficiency (Affinity), and measuring
                cognitive synchronization (Coherence). If Doppler is observability, Resonance is
                cognition analytics.
              </p>
            </div>
            <div className="card">
              <h3>Secure and managed at scale</h3>
              <p>
                Immune will handle identity, encryption, and automated threat response. Cloud will
                run the entire stack inside Membrane — isolated, quota-enforced, credential-scoped at
                the infrastructure level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <h2>Build the substrate for agent swarms.</h2>
            <p>
              Cosmonapse Core is in research preview — the protocol is drafted, the SDK is taking
              shape, and the first five minutes work today. Engram and Doppler are next.
            </p>
            <div className="hero-ctas" style={{ marginBottom: 0 }}>
              <Link href="/quickstart" className="btn btn-primary">
                Try the quickstart <span className="arrow">→</span>
              </Link>
              <Link href="/concepts" className="btn btn-ghost">
                Explore the product line
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
