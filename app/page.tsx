import Link from "next/link";
import BuildOnCosmonapse from "@/components/BuildOnCosmonapse";
import BoutiqueSystem from "@/components/diagrams/BoutiqueSystem";
import CallStackVsBus from "@/components/diagrams/CallStackVsBus";
import HeroBus from "@/components/diagrams/HeroBus";
import DesignRunObserve from "@/components/diagrams/DesignRunObserve";
import SuiteStream from "@/components/diagrams/SuiteStream";
import SuiteEditions from "@/components/diagrams/SuiteEditions";
import DemoFrame from "@/components/DemoFrame";
import InstallCommands from "@/components/InstallCommands";
import ProductGrid from "@/components/ProductGrid";
import { NEXT_UP } from "@/lib/products";
import { EARLY_ACCESS_HREF } from "@/lib/early-access";

const GITHUB = "https://github.com/Cosmonapse/cosmonapse-core";

// One package, two commands: install it, then open the designer. Repeated
// verbatim in the closing CTA rather than varied, so the thing you scrolled
// past at the top is the thing you copy at the bottom.
const INSTALL = [
  { cmd: "pip install cosmonapse", note: "the cosmo CLI ships with it" },
  { cmd: "cosmo genesis", note: "opens the designer at 127.0.0.1:7072" },
];

// The three bets, as one row each: what everyone else does, and what we do
// instead. Two are about the systems people are building today; the third is
// about the ones they cannot build yet. Kept short on purpose - the long
// version of the argument lives on /core/concepts.
const BETS: { num: string; claim: string; problem: string; solution: string }[] = [
  {
    num: "Bet 01",
    claim: "A graph is a diagram. It is not a program.",
    problem:
      "Graph and loop frameworks make you declare control flow before you know what the system does - nodes, edges, branches, and a supervisor that turns the crank. Then something arrives that you did not draw: a tool returns late, a human answers halfway through, a second model disagrees with the first. Every new case is a new edge, and the supervisor becomes the thing you cannot change.",
    solution:
      "Components emit Signals and react to Signals on one bus. Nobody holds the loop, so an agent can act the moment something happens rather than waiting for its turn in a graph. Concurrency, fan-out, retries, ordering and backpressure are properties of the transport - the same ones that have run distributed systems for twenty years.",
  },
  {
    num: "Bet 02",
    claim: "Wrappers do not have moats. Systems do.",
    problem:
      "A prompt, a vector store and a UI over somebody else's model is cheap to clone and hard to price. The teams stuck here have already solved which model to use; what they cannot do is get from a demo to something with a shape - observable, ownable, operable by a team, and defensible enough to charge for.",
    solution:
      "Build the system instead of the wrapper: domain memory that is yours, tools that touch real systems, interfaces people actually use, and an explicit policy for when a human steps in. Boutique AI, assembled from parts you own and running on an open protocol you can read.",
  },
  {
    num: "Bet 03",
    claim: "The domains that are coming have no prompt to wait for.",
    problem:
      "Physical intelligence, AI-native software and operating systems, communities of agents that outlive any one session - all of it is continuous and concurrent. A robot revises its picture of the world many times a second. An AI-native OS has to answer a file changing, a process dying, a peer coming online. A community of agents has members joining, disagreeing and dropping offline while the work carries on. None of it begins with a person typing, and none of it fits a request, a traversal and an answer. So every team working in these areas writes its own bus, its own scheduler and its own trace format before it gets near the actual domain problem.",
    solution:
      "For those systems an event substrate is not an optimisation, it is the only shape they have. Cosmonapse is that layer with agent semantics already in the envelope: a Signal knows whether it is a tool call, a memory write or a model output, so a sensor loop, an OS event stream and a community's membership churn are the same primitive rather than three bespoke integrations. Change the transport URL and what you prototyped on a laptop runs across a fleet. We are not building those products. The bet is that the substrate they need does not exist yet, and that whoever builds them should not have to build it twice.",
  },
];

// Where the open source line falls. Left column is what you get for free and
// keep; right column is what gets sold. Nothing here is shipping yet except
// the two free tiers, and the status labels say so.
const EDITIONS: {
  side: "open" | "commercial";
  name: string;
  status: string;
  body: string;
  items: string[];
}[] = [
  {
    side: "open",
    name: "Core",
    status: "Ships today",
    body:
      "The protocol, the Python SDK and the runtime. Apache 2.0, and it stays that way - the substrate your system is built on is not something we intend to sell you back later.",
    items: [
      "Signal envelope spec and the reference SDK",
      "Neuron, Axon, Dendrite, Engram, Effector, Receptor",
      "In-process, NATS and Kafka transports behind one URL",
    ],
  },
  {
    side: "open",
    name: "Genesis + Prism, essential builds",
    status: "Ships today",
    body:
      "Enough of the designer and the observability plane to build, run and debug a real system on your own machine, free, in the same pip install. No account, no key, no seat count.",
    items: [
      "Genesis: canvas, code editing through the AST, run and test a brain",
      "Prism: live brain view, signal tree, the raw stream and core metrics",
      "Local only, single developer, your source on your disk",
    ],
  },
  {
    side: "commercial",
    name: "Pro",
    status: "Planned",
    body:
      "The deeper end of Genesis and Prism for people doing this full time - the surface that pays for itself in a working week rather than the surface you need to get started.",
    items: [
      "Advanced Genesis workflows and larger-system tooling",
      "Retained history, comparison and analysis in Prism",
      "Per-seat, self-serve",
    ],
  },
  {
    side: "commercial",
    name: "Cloud",
    status: "Planned",
    body:
      "The hosted version of the same loop. Design and observe in a browser, deploy a brain as a service, and let a team work on one project at once.",
    items: [
      "Managed deploy with quotas and scoped credentials",
      "Shared projects, presence and a persistent Signal history",
      "Usage-based",
    ],
  },
  {
    side: "commercial",
    name: "Enterprise",
    status: "Planned",
    body:
      "What a regulated buyer needs before any of this is allowed near production, distributed as a licensed wheel off a private index.",
    items: [
      "RBAC, audit trails, multi-tenancy and HA",
      "Offline-verifiable licensing, airgap friendly",
      "Support, SLA and architecture review",
    ],
  },
];

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
  const openEditions = EDITIONS.filter((e) => e.side === "open");
  const paidEditions = EDITIONS.filter((e) => e.side === "commercial");

  return (
    <>
      <header className="hero">
        <div className="container">
          <div className="badge">
            <span className="dot" />
            v0.1.12 · Research preview
          </div>
          <h1 className="hero-title">
            The platform to build
            <br />
            <span className="gradient-text">proactive agents</span>.
          </h1>
          <p className="hero-lead">
            A proactive agent acts when something happens - a document lands, a threshold trips,
            another agent disagrees - not when someone types. That is an event problem, not a graph
            problem. Cosmonapse gives you the substrate: design the system on a canvas in{" "}
            <strong>Genesis</strong>, run it on the open <strong>Core</strong> protocol and runtime,
            and watch it think in <strong>Prism</strong>. No supervisor loop, no control-flow graph
            to maintain - just components reacting to Signals on one bus.
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
          <InstallCommands
            commands={INSTALL}
            caption="Python 3.11+ · Apache 2.0 · Core, Genesis and Prism all ship in the one package"
          />

          <HeroBus />
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
          <h2 className="section-title">Three bets.</h2>
          <p className="section-sub">
            Cosmonapse is not a nicer wrapper around the same idea. It starts from three positions
            that most of the current tooling disagrees with: two about the systems people are
            building today, and one about the ones they cannot build yet.
          </p>

          <div className="bets">
            {BETS.map((b) => (
              <div className="bet" key={b.num}>
                <div className="bet-head">
                  <span className="bet-num">// {b.num}</span>
                  <h3>{b.claim}</h3>
                </div>
                <div className="bet-side bet-problem">
                  <div className="bet-label">The problem</div>
                  <p>{b.problem}</p>
                </div>
                <div className="bet-side bet-solution">
                  <div className="bet-label">What we do instead</div>
                  <p>{b.solution}</p>
                </div>
              </div>
            ))}
          </div>

          <CallStackVsBus />
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

          <SuiteStream />
        </div>
      </section>

      {/* ── Open source line ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// What is free, what gets sold</div>
          <h2 className="section-title">Where the open source line falls.</h2>
          <p className="section-sub">
            Core is Apache 2.0 and always will be. The essential builds of Genesis and Prism are
            free with it, in the same pip install, and they are enough to build and run a real
            system on your own machine. What gets sold later is Pro, Cloud and Enterprise - the
            deeper product surface and the operating burden around it, never the protocol.
          </p>

          <div className="editions">
            <div className="edition-col">
              <div className="edition-col-head" style={{ color: "var(--accent)" }}>
                Open source · Apache 2.0 · forever
              </div>
              {openEditions.map((e) => (
                <EditionCard key={e.name} edition={e} />
              ))}
            </div>
            <div className="edition-col">
              <div className="edition-col-head" style={{ color: "var(--accent-3)" }}>
                Commercial · none of it shipping yet
              </div>
              {paidEditions.map((e) => (
                <EditionCard key={e.name} edition={e} />
              ))}
            </div>
          </div>

          <SuiteEditions />

          <p
            style={{
              marginTop: 8,
              fontSize: 13.5,
              color: "var(--text-dim)",
              lineHeight: 1.75,
              maxWidth: 760,
            }}
          >
            The rule we are holding ourselves to: nothing on the paid side is load-bearing for
            anything on the free side. A system you build today keeps running on an open protocol,
            an open runtime and a local toolchain whether or not you ever pay us.{" "}
            <Link href={EARLY_ACCESS_HREF} className="inline-link">
              Early access
            </Link>{" "}
            is where the commercial tiers get shaped, so if you have an opinion about what belongs
            on which side, that is the room.
          </p>
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

          <DesignRunObserve />
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

          <BoutiqueSystem />
        </div>
      </section>

      {/* ── Early access ─────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="ea-band">
            <div className="ea-band-copy">
              <div className="ea-band-eyebrow">// Early Access Program</div>
              <h3>Building something real on this? Come talk to us.</h3>
              <p>
                We run architecture sessions with early adopters on the system they are actually
                building - free, framework-agnostic, and with the people writing the protocol.
                The first 50 members accepted also get credits and a standing discount on
                Cosmonapse Cloud when it launches.
              </p>
            </div>
            <div className="ea-band-actions">
              <Link href={EARLY_ACCESS_HREF} className="btn btn-primary">
                Early access <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <h2>Build a system, not a demo.</h2>
            <p>
              Core 0.1.12 is a research preview: the envelope is drafted, the Python SDK implements
              it, and Genesis and Prism run locally today off the same CLI. It is open source under Apache
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

            <InstallCommands commands={INSTALL} center />
          </div>
        </div>
      </section>
    </>
  );
}

function EditionCard({ edition: e }: { edition: (typeof EDITIONS)[number] }) {
  const open = e.side === "open";
  const color = open ? "var(--accent)" : "var(--accent-3)";
  return (
    <div className={`edition ${open ? "edition-open" : "edition-paid"}`}>
      <div className="edition-name">
        <span>{e.name}</span>
        <span
          className="edition-status"
          style={{ color: open ? "var(--ok-strong)" : "var(--status-none)" }}
        >
          {e.status}
        </span>
      </div>
      <p className="edition-body">{e.body}</p>
      <ul className="edition-items">
        {e.items.map((i) => (
          <li key={i}>
            <span style={{ color }} aria-hidden>
              ▸
            </span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
