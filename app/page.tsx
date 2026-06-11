import Link from "next/link";
import CodeSwitcher from "@/components/CodeSwitcher";
import BuildOnCosmonapse from "@/components/BuildOnCosmonapse";

const GITHUB = "https://github.com/Cosmonapse/cosmonapse-core";

// ─── Hero code snippets ────────────────────────────────────────────────────

const heroPy = `<span class="tk-kw">import</span> os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, connect_synapse

<span class="tk-cm"># 1.  Axon.huggingface() wires the Neuron and protocol identity in one call.</span>
axon <span class="tk-op">=</span> Axon.<span class="tk-fn">huggingface</span>(<span class="tk-str">"llama"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
    use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>, capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>])

<span class="tk-cm"># 2.  Dendrite  -  the only component that touches the Synapse.</span>
synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>)
dendrite.<span class="tk-fn">attach_axon</span>(axon)

<span class="tk-kw">async with</span> dendrite:
    pw <span class="tk-op">=</span> <span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatch_task</span>(
        neuron<span class="tk-op">=</span><span class="tk-str">"llama"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: <span class="tk-str">"Say hello to Cosmonapse."</span>})`;

const heroTs = `<span class="tk-kw">import</span> { Axon, Dendrite, connectSynapse } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// 1.  Axon.huggingface() wires the Neuron and protocol identity in one call.</span>
<span class="tk-kw">const</span> axon <span class="tk-op">=</span> Axon.<span class="tk-fn">huggingface</span>(<span class="tk-str">"llama"</span>,
  { endpoint: <span class="tk-str">"https://router.huggingface.co"</span>,
    model: <span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    apiKey: process.env.<span class="tk-fn">HF_TOKEN</span>, useChatApi: <span class="tk-kw">true</span> },
  { capabilities: [<span class="tk-str">"chat"</span>] });

<span class="tk-cm">// 2.  Dendrite  -  the only component that touches the Synapse.</span>
<span class="tk-kw">await using</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({
  synapse: <span class="tk-kw">await</span> <span class="tk-fn">connectSynapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>),
  namespace: <span class="tk-str">"quickstart"</span>,
});
dendrite.<span class="tk-fn">attachAxon</span>(axon); <span class="tk-kw">await</span> dendrite.<span class="tk-fn">start</span>();

<span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatchTask</span>({
  neuron: <span class="tk-str">"llama"</span>,
  input: { prompt: <span class="tk-str">"Say hello to Cosmonapse."</span> },
});`;

// ─── Product line data ─────────────────────────────────────────────────────

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
}[] = [
  {
    name: "Cosmonapse Core",
    short: "Core",
    tagline: "Distributed cognition runtime",
    color: "var(--accent)",
    status: "active",
    concepts: ["Brain", "Neuron", "Axon", "Dendrite", "Synapse", "Signal", "Pathway"],
    desc: "The open protocol and SDK. One envelope, one Synapse, replaceable Neurons  -  backed by OpenAI, Anthropic, HuggingFace, Groq, Ollama, or any async function. Everything else is built on top.",
  },
  {
    name: "Cosmonapse Engram",
    short: "Engram",
    tagline: "Context, memory & persistence",
    color: "#a78bfa",
    status: "active",
    concepts: ["Recall", "Echo", "Imprint"],
    desc: "Shared memory for agent systems. Recall and Imprint primitives ship in 0.1.0 with InMemory, SQLite, and Postgres backends. Vector search and snapshot replay (Echo) are next.",
  },
  {
    name: "Cosmonapse Doppler",
    short: "Doppler",
    tagline: "Observability, telemetry & cognition analytics",
    color: "#22d3ee",
    status: "active",
    concepts: ["Pulse", "Prism", "Resonance"],
    desc: "Live telemetry and visualization over the Signal stream, reading the wave without disturbing the source. Pulse streams metrics, Prism turns them into dashboards, and Resonance adds cognition analytics  -  how Neurons influence each other and how Signals propagate through a Brain.",
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
    desc: "The fully managed runtime  -  Brains in isolated Membranes, quota-enforced, credential-scoped at the infrastructure level.",
  },
];

export default function HomePage() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <div className="badge">
            <span className="dot" />
            v0.1.3 · Research preview
          </div>
          <h1 className="hero-title">
            The Nervous System
            <br />
            for <span className="gradient-text">Autonomous AI Agents</span>.
          </h1>
          <p className="hero-lead">
            Cosmonapse is an open protocol and SDK for autonomous AI agents. Start with the Core
            today  -  one envelope, one Synapse, replaceable Neurons backed by any LLM provider, and a
            CLI that boots a local broker in seconds.
          </p>
          <div className="hero-ctas">
            <Link href="/quickstart" className="btn btn-primary">
              Get started <span className="arrow">→</span>
            </Link>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <span aria-hidden>★</span> Star on GitHub
            </a>
            <Link href="/protocol" className="btn btn-ghost">
              View envelope spec
            </Link>
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              color: "var(--text-faint)",
              letterSpacing: "0.04em",
              marginBottom: 36,
            }}
          >
            Open source · MIT licensed · Python + TypeScript SDK
          </p>

          {/* <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "left" }}>
            <CodeSwitcher
              python={{ html: heroPy, filename: "main.py" }}
              typescript={{ html: heroTs, filename: "main.ts" }}
              variant="elevated"
            />
          </div> */}
        </div>
      </header>

      {/* Build on Cosmonapse */}
      <BuildOnCosmonapse />

      {/* Product line */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Product line</div>
          <h2 className="section-title">Five layers. One nervous system.</h2>
          <p className="section-sub">
            Cosmonapse Core ships today as an open protocol and SDK, with Engram primitives landed in
            0.1.0. Doppler, Immune, and Cloud extend it  -  each a self-contained product with its own
            primitives, all speaking the same Signal envelope.
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
          <h2 className="section-title">Core  -  open protocol and SDK.</h2>
          <p className="section-sub">
            The protocol and the primitives. Routing decisions, workflow rules, and lifecycle
            policies stay with you  -  build the system that fits your team.
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
              <h3>Neuron factory</h3>
              <p>
                <code className="inline">Neuron(source=&quot;huggingface&quot;)</code>,{" "}
                <code className="inline">&quot;openai&quot;</code>,{" "}
                <code className="inline">&quot;anthropic&quot;</code>,{" "}
                <code className="inline">&quot;groq&quot;</code>,{" "}
                <code className="inline">&quot;ollama&quot;</code>, and more  -  or any plain async
                function. All behind the same signature. Zero protocol knowledge required.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">03</div>
              <h3>Axon  -  agent-side tool</h3>
              <p>
                Owns the Neuron&rsquo;s identity and wraps its output into protocol-valid Signals.
                Never touches the Synapse  -  that boundary is enforced in code, not convention.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">04</div>
              <h3>Dendrite  -  synapse-side connector</h3>
              <p>
                The only thing that touches the Synapse. Hosts Axons, emits REGISTER / HEARTBEAT /
                DEREGISTER, routes inbound TASKs, and exposes every orchestration primitive.
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
            security, and managed infrastructure  -  each layer speaking the same Signal envelope.
          </p>
          <div className="grid-2">
            <div className="card">
              <h3>Neurons are black boxes</h3>
              <p>
                A Neuron is a pure function -{" "}
                <code className="inline">async fn(input, context) → output</code>. Zero protocol
                knowledge. The <code className="inline">Neuron(source=...)</code> factory wraps any
                LLM provider or MCP server behind that interface without modification.
              </p>
            </div>
            <div className="card">
              <h3>Memory is a product layer</h3>
              <p>
                The Core protocol defines <code className="inline">MEMORY_APPEND</code>,{" "}
                <code className="inline">CONTEXT_SYNC</code>,{" "}
                <code className="inline">RECALL</code>, and{" "}
                <code className="inline">IMPRINT</code>{" "}
                signals. Cosmonapse Engram ships Recall and Imprint in 0.1.0 with InMemory, SQLite,
                and Postgres backends; Echo (snapshot replay) is next.
              </p>
            </div>
            <div className="card">
              <h3>Observability &amp; cognition analytics</h3>
              <p>
                Doppler is a non-competing read-only tap on the Synapse. Pulse streams live
                telemetry  -  latency, throughput, cost per Neuron. Prism turns it into dashboards
                and traces. Resonance maps Neuron influence, tracks Signal propagation, and scores
                collaboration efficiency.
              </p>
            </div>
            <div className="card">
              <h3>Secure and managed at scale</h3>
              <p>
                Immune will handle identity, encryption, and automated threat response. Cloud runs
                the entire stack inside Membrane  -  isolated, quota-enforced, credential-scoped at
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
              Cosmonapse Core 0.1.3 is in research preview  -  the protocol is drafted, the SDK ships
              with Engram, Pathway, capability-routed dispatch, competitive bidding, and first-class
              LLM provider Neurons. Doppler is next.
            </p>
            <div className="hero-ctas" style={{ marginBottom: 0 }}>
              <Link href="/quickstart" className="btn btn-primary">
                Get started <span className="arrow">→</span>
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
