import type { Metadata } from "next";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import PrimitivesOnTheBus from "@/components/diagrams/PrimitivesOnTheBus";
import TransportSwap from "@/components/diagrams/TransportSwap";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS, KW_PRODUCT } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Core - Protocol, SDK & Runtime Engine",
  description:
    "Cosmonapse Core is the open Apache 2.0 protocol and runtime for event-driven AI systems: one Signal envelope, one Synapse, replaceable Neurons, a Python SDK.",
  path: "/core",
  keywords: [...KW_EVENT_DRIVEN, ...KW_HARNESS, ...KW_PRODUCT],
});

const GITHUB = "https://github.com/Cosmonapse/cosmonapse-core";

/** The six primitives. Order matters - it's the order you meet them in. */
const PRIMITIVES: { n: string; name: string; line: string; body: string }[] = [
  {
    n: "01",
    name: "Signal",
    line: "The envelope",
    body:
      "One shared contract for everything that crosses the bus - TASK, AGENT_OUTPUT, TOOL_CALL, RECALL, IMPRINT, FINAL. Two components that emit valid Signals can always talk to each other. That is the only guarantee Core makes, and everything else is built on it.",
  },
  {
    n: "02",
    name: "Neuron",
    line: "The unit of work",
    body:
      "A pure async function - fn(input, context) → output - with zero protocol knowledge. The Neuron factory wraps OpenAI, Anthropic, HuggingFace, Groq, Ollama or an MCP server behind that same signature, so swapping a provider never touches the system around it.",
  },
  {
    n: "03",
    name: "Axon",
    line: "Agent-side identity",
    body:
      "Owns a Neuron's identity and capabilities and wraps its output into protocol-valid Signals. An Axon never touches the Synapse - that boundary is enforced in code, not by convention, which is what keeps a Neuron portable.",
  },
  {
    n: "04",
    name: "Dendrite",
    line: "Synapse-side connector",
    body:
      "The only component that touches the Synapse. It hosts Axons, emits REGISTER / HEARTBEAT / DEREGISTER, routes inbound TASKs to the right Neuron, and exposes every dispatch primitive: fire-and-forget, dispatch_and_wait, capability routing, competitive bidding.",
  },
  {
    n: "05",
    name: "Engram",
    line: "Memory",
    body:
      "Shared memory as a protocol citizen rather than a library you import. Recall and Imprint are Signals on the same bus, backed by InMemory, SQLite or Postgres - which means memory access shows up in your traces like everything else.",
  },
  {
    n: "06",
    name: "Effector",
    line: "Tools and side effects",
    body:
      "Anything that reaches out of the system. An Effector services TOOL_CALL Signals and mirrors what it did into an Engram, so the record of a side effect is part of the run and not a line in a log file somewhere.",
  },
];

const TRANSPORTS = [
  { url: "memory://", name: "MemorySynapse", body: "In-process. Tests, prototypes, single-host demos." },
  { url: "cosmo://", name: "DevSynapse", body: "Local TCP + NDJSON broker. cosmo synapse start boots it in a second." },
  { url: "nats://", name: "NatsSynapse", body: "The production default - the cleanest fit for the protocol's shape." },
  { url: "kafka://", name: "KafkaSynapse", body: "A durable, replayable log of every Signal that ever crossed the bus." },
];

export default function CorePage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Cosmonapse Core</div>
          <h1 className="page-title">The protocol and the runtime.</h1>
          <p className="page-sub">
            Core is the open, Apache 2.0 licensed foundation the rest of the suite is built on: a
            Signal envelope, a Synapse to carry it, and six primitives that cover work, identity,
            transport, memory, tools and interfaces. Genesis writes against it and Prism reads from
            it, but Core stands on its own - and always will.
          </p>
          <div className="hero-ctas" style={{ marginTop: 28 }}>
            <Link href="/core/quickstart" className="btn btn-primary">
              Quickstart <span className="arrow">→</span>
            </Link>
            <Link href="/core/protocol" className="btn btn-ghost">
              Envelope spec
            </Link>
            <Link href="/core/concepts" className="btn btn-ghost">
              Concepts
            </Link>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <span aria-hidden>★</span> GitHub
            </a>
          </div>
        </div>
      </header>

      {/* ── Primitives ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Primitives</div>
          <h2 className="section-title">Six pieces. Nothing hidden.</h2>
          <p className="section-sub">
            There is no framework object that runs your system. Routing decisions, workflow rules and
            lifecycle policy stay with you - Core gives you the parts and the contract they speak.
          </p>
          <div className="grid-2">
            {PRIMITIVES.map((p) => (
              <div className="card" key={p.name}>
                <div className="card-icon">{p.n}</div>
                <h3>
                  {p.name}{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-faint)",
                      letterSpacing: "0.06em",
                      fontWeight: 400,
                    }}
                  >
                    {p.line}
                  </span>
                </h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
          <PrimitivesOnTheBus />

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/core/concepts" className="btn btn-ghost">
              Every concept in the protocol <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Receptors ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// The edge</div>
          <h2 className="section-title">Receptors: where people come in.</h2>
          <p className="section-sub">
            A system nobody can talk to is not a product. A Receptor is an interface - a CLI, an HTTP
            API, a chat or voice surface - that funnels an outside request into the same dispatch
            trio every internal component uses. Same Signals, same traces, no special path for
            &ldquo;the user-facing bit&rdquo;.
          </p>
          <div className="grid-2">
            <div className="card">
              <h3>One entry point</h3>
              <p>
                <code className="inline">brain.py</code> attaches Receptors and calls{" "}
                <code className="inline">Dendrite.run()</code>. That is the whole entry point - no
                separate CLI script, no second server, no drift between how you test the system and
                how it runs.
              </p>
            </div>
            <div className="card">
              <h3>Interfaces are not special</h3>
              <p>
                A Receptor is caller-side and introduces no new wire types. Whether a TASK came from
                a terminal, an HTTP request or another Neuron, it is the same TASK - which is why
                Prism can show you a user-initiated run and an internal one side by side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Transports ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Transport</div>
          <h2 className="section-title">Scale is a URL change.</h2>
          <p className="section-sub">
            The Synapse is an adapter, not an architecture decision you have to make on day one.
            Your Neuron code does not know or care which one is underneath it.
          </p>
          <div className="usecases">
            {TRANSPORTS.map((t) => (
              <div className="usecase" key={t.url}>
                <div
                  className="usecase-title"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent-soft)" }}
                >
                  {t.url}
                </div>
                <div className="usecase-body">
                  <strong style={{ color: "var(--text)" }}>{t.name}</strong>
                  <br />
                  {t.body}
                </div>
              </div>
            ))}
          </div>

          <TransportSwap />
        </div>
      </section>

      {/* ── CLI + SDKs ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Tooling</div>
          <h2 className="section-title">One CLI, two SDKs.</h2>
          <div className="grid-2">
            <div className="card">
              <h3>cosmo</h3>
              <p>
                <code className="inline">cosmo init</code> scaffolds a project.{" "}
                <code className="inline">cosmo synapse start</code> boots a local broker.{" "}
                <code className="inline">cosmo dispatch</code> fires a TASK from the terminal.{" "}
                <code className="inline">cosmo validate</code> checks envelope conformance. One
                implementation, installable from pip.
              </p>
            </div>
            <div className="card">
              <h3>The wire, not the language</h3>
              <p>
                The Python SDK is the reference implementation, but nothing about the protocol is
                Python. Any component that emits and accepts valid Signals is a participant on the
                bus  -  the envelope is the whole contract.
              </p>
            </div>
            <div className="card">
              <h3>Read the spec</h3>
              <p>
                The <Link href="/core/protocol" className="inline-link">envelope specification</Link>{" "}
                is short on purpose. If you want to write a Cosmonapse implementation in a third
                language, that page plus{" "}
                <code className="inline">cosmo schema</code> is everything you need.
              </p>
            </div>
            <div className="card">
              <h3>Learn by running something</h3>
              <p>
                <Link href="/examples" className="inline-link">Fourteen examples</Link> cover routing,
                bidding, retries, RAG, MCP tools, memory and full agents - each one a project you can
                clone and run rather than a snippet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Rest of the suite ────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// The rest of the suite</div>
          <h2 className="section-title">Core is the floor, not the ceiling.</h2>
          <ProductGrid exclude="/core" />
        </div>
      </section>
    </>
  );
}
