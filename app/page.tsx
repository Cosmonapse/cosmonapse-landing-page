import Link from "next/link";
import BuildOnCosmonapse from "@/components/BuildOnCosmonapse";
import DemoFrame from "@/components/DemoFrame";
import ProductGrid from "@/components/ProductGrid";
import { NEXT_UP } from "@/lib/products";

const GITHUB = "https://github.com/Cosmonapse/cosmonapse-core";

// The lifecycle strip: which product you are in at each stage of the work.
const LIFECYCLE: { verb: string; product: string; color: string; body: string }[] = [
  {
    verb: "Design",
    product: "Genesis",
    color: "var(--accent-3)",
    body:
      "Lay the system out on a canvas - Neurons that think, Engrams that remember, Effectors that act, Receptors that listen. Genesis writes real source into your project and edits it through the AST as the shape changes.",
  },
  {
    verb: "Run",
    product: "Core",
    color: "var(--accent)",
    body:
      "Everything talks over one Signal envelope on one Synapse. Start in-process, move to NATS or Kafka by changing a URL. No orchestrator holds the loop, so nothing has to be rewritten to scale out.",
  },
  {
    verb: "Observe",
    product: "Prism",
    color: "var(--accent-2)",
    body:
      "Attach a read-only tap to the same bus and watch the system think: the live graph, the causal tree behind a single task, where a task's wall clock actually went. Tracing is free because the bus already saw it.",
  },
];

const USE_CASES: { title: string; body: string; shape: string }[] = [
  {
    title: "Claims triage",
    body:
      "A first-notice-of-loss intake that reads the document, pulls policy history, flags the fraud signals a generalist model would miss, and escalates to a human with the reasoning attached.",
    shape: "Receptor (API) → classifier Neuron → policy Engram → fraud Effector → adjuster escalation",
  },
  {
    title: "Clinical intake",
    body:
      "A patient-facing conversation that gathers history, checks it against a coded protocol, and hands a structured summary to a clinician - with every step in the record.",
    shape: "Receptor (chat) → intake Neuron → protocol Engram → summariser → clinician review",
  },
  {
    title: "Research desk",
    body:
      "Several models working the same question in parallel from different sources, disagreeing on the record, with the reconciliation step doing real work instead of a supervisor picking one.",
    shape: "fan-out TASK → n Neurons → competing AGENT_OUTPUTs → reconciler → FINAL",
  },
  {
    title: "Contract review",
    body:
      "Clause-by-clause analysis against a firm's own precedent library, where the value is the precedent and the escalation policy - not the model underneath it.",
    shape: "Receptor (upload) → splitter → clause Neurons → precedent Engram → risk report",
  },
];

export default function HomePage() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <div className="badge">
            <span className="dot" />
            v0.1.11 · Research preview
          </div>
          <h1 className="hero-title">
            AI systems don&rsquo;t run on graphs.
            <br />
            They run on <span className="gradient-text">events</span>.
          </h1>
          <p className="hero-lead">
            Cosmonapse is a platform suite for building event-driven AI systems. Design them on a
            canvas in <strong>Genesis</strong>, run them on the open <strong>Core</strong> protocol
            and runtime, and watch them think in <strong>Prism</strong>. No supervisor loop, no
            control-flow graph to maintain - just components reacting to Signals on one bus.
          </p>
          <div className="hero-ctas">
            <Link href="/core/quickstart" className="btn btn-primary">
              Get started <span className="arrow">→</span>
            </Link>
            <Link href="/genesis" className="btn btn-ghost">
              See Genesis
            </Link>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <span aria-hidden>★</span> Star on GitHub
            </a>
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
            Open source · Apache 2.0 licensed · Python SDK
          </p>
        </div>
      </header>

      {/* ── Hero demo - hidden for now, no recording captured yet ─────────── */}
      {false && (
        <section className="section-sm">
          <div className="container">
            <div className="demo-hero">
              <DemoFrame
                src="/demo/loop.mp4"
                address="cosmo genesis  ·  brain.py  ·  cosmo prism"
                badge="THE LOOP"
                caption="Design a system on the Genesis canvas, run it on Core, and watch the same components light up in Prism - one project, three windows."
                maxWidth={1000}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── The two bets ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Why this exists</div>
          <h2 className="section-title">Two bets.</h2>
          <p className="section-sub">
            Cosmonapse is not a nicer wrapper around the same idea. It starts from two positions
            that most of the current tooling disagrees with.
          </p>

          <div className="thesis">
            <div className="thesis-card">
              <div className="thesis-num">// Bet 01</div>
              <h3>A graph is a diagram. It is not a program.</h3>
              <p>
                Graph and loop frameworks ask you to declare control flow before you know what the
                system does - nodes, edges, conditional branches, and a supervisor that turns the
                crank. That holds until something arrives that you didn&rsquo;t draw: a tool returns
                late, a human answers halfway through, a second model disagrees with the first.
              </p>
              <p>
                Real systems are concurrent and only partially ordered. Encoding them as a graph
                means encoding <em>time</em> as topology, and you end up maintaining a state machine
                larger than the problem it solves. Every new branch is a new edge, and the supervisor
                becomes the thing you can&rsquo;t change.
              </p>
              <p className="thesis-turn">
                Cosmonapse takes the other side. Components emit Signals and react to Signals on one
                bus. Nobody holds the loop. Concurrency, fan-out, retries, ordering and backpressure
                are properties of the transport - the same properties that have run distributed
                systems for twenty years - rather than branches you drew in advance.
              </p>
            </div>

            <div className="thesis-card">
              <div className="thesis-num">// Bet 02</div>
              <h3>Wrappers don&rsquo;t have moats. Systems do.</h3>
              <p>
                Most AI products are a prompt, a vector store and a UI over somebody else&rsquo;s
                model - which is exactly why they are so cheap to clone and so hard to price. The
                teams getting past that are building something narrower and deeper: a system that
                knows one domain properly, with its own memory, its own tools, its own escalation
                paths and its own opinion about the work.
              </p>
              <p>
                That is an architecture problem, and it is the one we keep hearing about from
                founders, early adopters and enterprise architects alike. Not &ldquo;which model&rdquo; -
                they solved that. They can&rsquo;t get from a demo to something with a shape:
                observable, ownable, operable by a team, and defensible enough to charge for.
              </p>
              <p className="thesis-turn">
                Cosmonapse is the substrate for those systems. Boutique AI - domain-specialised,
                built from parts you own, running on an open protocol, and legible enough that you
                can sell it with a straight face.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The suite ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// The suite</div>
          <h2 className="section-title">Three products. One event stream.</h2>
          <p className="section-sub">
            Genesis, Core and Prism are separate products with separate jobs, and they share exactly
            one thing: the Signal envelope. That is what lets the designer, the runtime and the
            observability plane stay honest about the same system without any of them owning it.
          </p>

          <ProductGrid />

          <div
            style={{
              marginTop: 24,
              padding: "18px 22px",
              border: "1px dashed var(--border-strong)",
              borderRadius: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--status-none)",
                flexShrink: 0,
              }}
            >
              Next up · {NEXT_UP.name}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.65, flex: 1, minWidth: 260 }}>
              {NEXT_UP.desc}{" "}
              <Link href="/roadmap" className="inline-link">
                See the roadmap
              </Link>
            </span>
          </div>
        </div>
      </section>

      {/* ── Lifecycle ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// How they fit</div>
          <h2 className="section-title">Design it. Run it. Watch it.</h2>
          <p className="section-sub">
            You are never handed off between tools. The canvas, the runtime and the traces are three
            views of the same running system, and the source on disk is the only artifact.
          </p>
          <div className="lifecycle">
            {LIFECYCLE.map((s) => (
              <div className="lifecycle-step" key={s.verb}>
                <div className="lifecycle-verb" style={{ color: s.color }}>
                  {s.verb} · {s.product}
                </div>
                <h4>{s.verb}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proof: the code ──────────────────────────────────────────────── */}
      <BuildOnCosmonapse />

      {/* ── Boutique systems ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// What you build with it</div>
          <h2 className="section-title">Boutique AI systems, not another wrapper.</h2>
          <p className="section-sub">
            The shape is always the same: an interface people actually use, domain memory that is
            yours, tools that touch real systems, and a policy for when a human gets involved. The
            model is the cheapest part. Everything around it is the product.
          </p>
          <div className="usecases">
            {USE_CASES.map((u) => (
              <div className="usecase" key={u.title}>
                <div className="usecase-title">{u.title}</div>
                <div className="usecase-body">{u.body}</div>
                <div className="usecase-shape">{u.shape}</div>
              </div>
            ))}
          </div>
          <p
            style={{
              marginTop: 28,
              fontSize: 13.5,
              color: "var(--text-dim)",
              lineHeight: 1.75,
              maxWidth: 760,
            }}
          >
            None of these are graphs. Each one is a set of independent components reacting to
            Signals, where the interesting behaviour - escalation, disagreement, a late tool result,
            a human in the middle - is a Signal arriving rather than an edge you drew.{" "}
            <Link href="/examples" className="inline-link">
              Fourteen runnable examples
            </Link>{" "}
            show the patterns end to end.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <h2>Build a system, not a demo.</h2>
            <p>
              Core 0.1.11 is a research preview: the envelope is drafted, both SDKs are at parity, and
              Genesis and Prism run locally today off the same CLI. It is open source under Apache
              2.0 - read the spec, disagree with it in public, and build on it either way.
            </p>
            <div className="hero-ctas" style={{ marginBottom: 0 }}>
              <Link href="/core/quickstart" className="btn btn-primary">
                Get started <span className="arrow">→</span>
              </Link>
              <Link href="/core/protocol" className="btn btn-ghost">
                Read the envelope spec
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
