import type { Metadata } from "next";
import Link from "next/link";
import DemoFrame from "@/components/DemoFrame";
import ProductGrid from "@/components/ProductGrid";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Genesis - Design & Build AI Systems",
  description:
    "Genesis is the Cosmonapse designer: lay an event-driven AI system out on a canvas, let it write and surgically edit real source in your project, then run it and talk to it.",
  path: "/genesis",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "AI agent builder",
    "visual agent designer",
    "multi-agent IDE",
    "agent scaffolding tool",
    "AI system architecture tool",
  ],
});

/** The four primitives, in the words the Add panel uses. */
const PRIMITIVES: { name: string; verb: string; blurb: string; shape: string; color: string }[] = [
  {
    name: "Neuron",
    verb: "thinks",
    blurb: "an async function behind an Axon",
    shape: "circle",
    color: "var(--accent)",
  },
  {
    name: "Engram",
    verb: "remembers",
    blurb: "a memory backend",
    shape: "diamond",
    color: "var(--p-engram)",
  },
  {
    name: "Effector",
    verb: "acts",
    blurb: "a tool family",
    shape: "triangle",
    color: "var(--accent-3)",
  },
  {
    name: "Receptor",
    verb: "listens",
    blurb: "the edge a turn arrives at",
    shape: "cup",
    color: "var(--accent-2)",
  },
];

const TABS: { label: string; tagline: string; what: string[] }[] = [
  {
    label: "Canvas",
    tagline: "Place a primitive. Genesis writes the module.",
    what: [
      "One Synapse at the centre of the canvas with everything it hosts in orbit around it. Each node wears the same silhouette Prism gives it - Neurons are circles, Engrams diamonds, Effectors triangles, Receptors cups - so the thing you laid out and the thing you later watch run are visibly the same system.",
      "Pick a primitive from the palette, name it, and Genesis writes neurons/<name>.py (or engram/, effector/, receptors/) and wires it into brain.py. The name you type is used verbatim as the component's id on the bus, so the file, the node and the Signal all say the same thing.",
      "A Receptor asks one extra question - CLI, API or chat - because that choice is not switchable afterwards. The three take different constructor keywords and expose different decorators, so turning one into another is a rewrite, and Genesis would rather ask once than offer a toggle that lies.",
      "Nodes you drag keep their position per project, and a newly added component walks the ring in 15-degree steps to find a free slot rather than landing on top of something you already placed.",
    ],
  },
  {
    label: "Code",
    tagline: "Declarations as forms. Handlers as code. Everything else, verbatim.",
    what: [
      "Genesis reads a component module into three parts: the declaration (rendered as a form, one field per constructor keyword, with its blurb, suggestions and placeholder - credentials masked with a reveal toggle), the behaviours you have written (rendered as editable code boxes, grouped into the protocols this component can serve), and everything Genesis does not model, shown verbatim so nothing is silently dropped.",
      "Every structured edit posts to the server and gets the re-read model back. Genesis never guesses what the file now looks like - the file on disk is the only source of truth, which is why you can hand-edit a module in your own editor and reopen it here without a resync step.",
      "An Engram's shape is switchable in place: served over a working backend (the default), served-only if you want to decide where the data lives, or a prebuilt backend where recall() and imprint() are real methods and there are no hooks to add. InMemory, SQLite and Postgres are one dropdown, and the backend's own keywords - Postgres's dsn= and so on - get their own form.",
      "An Axon carries two axes, source and form. Source is which provider builds the Neuron - Ollama, HuggingFace, OpenAI, Anthropic, Groq, OpenRouter, Together, Mistral, MCP, or a plain custom function. Form is how the pairing was written, which matters because only the from_source path attaches a recogniser and teaches the model the cosmo intent convention. Genesis knows which providers have a sugar classmethod and which can only be written the long way, instead of offering a button that cannot work.",
      "Behaviour bodies that cannot be safely dedented are round-tripped exactly as they were. Genesis would rather hand a block back untouched than reformat code it did not fully understand.",
    ],
  },
  {
    label: "Test",
    tagline: "Run the brain. Drive it through its own front door.",
    what: [
      "The Receptor list is read off your source, not off a running process - which is why it is populated before you press Run, and why a CLI Receptor is drivable at all. Its surface is a set of decorated functions with signatures; a browser could never discover that over HTTP.",
      "Run starts brain.py as a real process, one per project, with its pid, uptime and exit code on screen. Connect then opens whatever that Receptor actually is: a terminal wired to the process's stdin and stdout over a WebSocket, a request builder for an HTTP one, or a chat panel.",
      "For a CLI Receptor, Genesis has already parsed each command's parameters into what they become on the command line - a positional, a --flag or a switch - along with which commands are answered locally without ever dispatching a TASK.",
      "HTTP calls are relayed through the Genesis server rather than fired from the tab. An ApiReceptor sends no CORS header, so a direct call would be blocked before it left the browser; going through the server that served the page also turns transport failures into readable errors instead of an opaque TypeError.",
      "Because Receptors funnel into the same dispatch trio as every internal component, what you exercise here is the production path rather than a mock of it.",
    ],
  },
];

/**
 * Demo slots. Each renders framed browser chrome now and the screenshot as
 * soon as the file lands at public/genesis/<name>.jpg - see the README there
 * for what each shot should show.
 */
const DEMOS: { src: string; caption: string }[] = [
  {
    src: "/genesis/canvas.jpg",
    caption:
      "Canvas - adding a Neuron from the palette: Genesis writes the module, wires it into brain.py, and the node lands on the ring around the Synapse.",
  },
  {
    src: "/genesis/code.jpg",
    caption:
      "Code - the declaration as a form and the handlers as code boxes, with an edit applied through the AST and the file re-read from disk.",
  },
  {
    src: "/genesis/test.jpg",
    caption:
      "Test - Run starts brain.py, the liveness pill goes green, and Connect opens the Receptor's own surface to drive it.",
  },
];

export default function GenesisPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Cosmonapse Genesis</div>
          <h1 className="page-title">Design the system. Keep the source.</h1>
          <p className="page-sub">
            Genesis is the designer and coder for event-driven AI systems. Name a brain, pick a
            folder, and grow it on a canvas - then read every component as the file it really is,
            run it, and talk to it. It writes into your project and gets out of the way: there is no
            runtime dependency on Genesis and nothing to export.
          </p>
          <div className="hero-ctas" style={{ marginTop: 28 }}>
            <Link href="/core/quickstart" className="btn btn-primary">
              Install and run it <span className="arrow">→</span>
            </Link>
            <Link href="/core" className="btn btn-ghost">
              What it builds on
            </Link>
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              color: "var(--text-faint)",
              letterSpacing: "0.04em",
            }}
          >
            cosmo genesis · opens on 127.0.0.1:7072 · ships in 0.1.11
          </p>
        </div>
      </header>

      {/* Demos */}
      <section className="section-sm" id="demos">
        <div className="container">
          <div className="section-eyebrow">// Demos</div>
          <h2 className="section-title">Genesis, running.</h2>
          <p className="section-sub">
            All three views ship today in 0.1.11. These are the three moments worth watching: a
            component being created, that same component edited as source, and the finished brain
            answering through its own interface.
          </p>
          <div className="demo-grid">
            {DEMOS.map((d) => (
              <DemoFrame
                key={d.src}
                src={d.src}
                address="http://127.0.0.1:7072"
                badge="GENESIS PREVIEW"
                accent="var(--accent-3)"
                caption={d.caption}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Four primitives */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// What a brain is made of</div>
          <h2 className="section-title">Four primitives. Four silhouettes.</h2>
          <p className="section-sub">
            A project grows from four parts, and each one keeps a single shape across the whole
            product. You place it in Genesis and then watch that exact shape light up in Prism.
          </p>
          <div className="usecases">
            {PRIMITIVES.map((p) => (
              <div className="usecase" key={p.name}>
                <div className="usecase-title" style={{ color: p.color }}>
                  {p.name} <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>{p.verb}</span>
                </div>
                <div className="usecase-body">{p.blurb}</div>
                <div className="usecase-shape">silhouette: {p.shape}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why a designer at all */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Why a designer at all</div>
          <h2 className="section-title">The hard part was never the model call.</h2>
          <p className="section-sub">
            Wiring a model into a script takes an afternoon. Deciding what the components are, where
            memory lives, which tool a given step is allowed to reach, and how a person gets pulled
            in - that is the work, and it is where almost every team stalls. Genesis makes that
            structure something you can see and move around without turning it into a format you can
            never leave.
          </p>
          <div className="grid-2">
            <div className="card">
              <h3>Not a code generator</h3>
              <p>
                A generator writes a wall of code once and then fights you every time you edit it.
                Genesis parses the module you already own, changes the one declaration or handler you
                touched, and leaves your comments, imports and hand-written logic exactly where they
                were.
              </p>
            </div>
            <div className="card">
              <h3>Not a graph builder</h3>
              <p>
                The canvas is a picture of what exists, not a control-flow diagram you have to keep
                accurate. There are no edges encoding &ldquo;then&rdquo; - components sit around the
                Synapse they share, because that is genuinely how the system runs.
              </p>
            </div>
            <div className="card">
              <h3>Your repo is the artifact</h3>
              <p>
                Genesis scaffolds the same standard skeleton as{" "}
                <code className="inline">cosmo init</code> and writes into it.{" "}
                <code className="inline">brain.py</code> is the single entry point, and the project
                runs under python, in Docker, or in CI with Genesis nowhere in the picture.
              </p>
            </div>
            <div className="card">
              <h3>It says what it can&rsquo;t do</h3>
              <p>
                Open a project someone else laid out and Genesis tells you where its assumptions
                don&rsquo;t hold - no <code className="inline">brain.py</code> to wire into,
                components outside the folders it reads, a module that builds its component in a
                factory. None of that blocks you. All of it is said out loud, because the
                alternative is a button that appears to work and doesn&rsquo;t.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The three views */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Three views</div>
          <h2 className="section-title">Canvas, Code, Test.</h2>
          <p className="section-sub">
            Three ways of looking at one project - the shape, the source, and the running thing. No
            build step and no export between them.
          </p>
          {TABS.map((t, i) => (
            <div
              key={t.label}
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 28,
                marginTop: i === 0 ? 40 : 32,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent-3)",
                  marginBottom: 8,
                }}
              >
                0{i + 1} · {t.label}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", margin: "0 0 18px" }}>
                {t.tagline}
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                {t.what.map((w) => (
                  <li
                    key={w}
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.7,
                      color: "var(--text-dim)",
                      background: "var(--bg-card-soft)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: 18,
                    }}
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* The synapse */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// The bus underneath</div>
          <h2 className="section-title">Genesis never hosts the Synapse.</h2>
          <p className="section-sub">
            It probes one, spawns one when you ask, and points Prism at it. Every status you see is a
            fresh probe rather than remembered state - so a Synapse you started from a terminal reads
            exactly the same as one started from this UI, and closing Genesis never takes your bus
            down with it.
          </p>
          <div className="grid-2">
            <div className="card">
              <h3>A liveness pill, not a guess</h3>
              <p>
                The header shows whether a Synapse is actually serving your namespace right now,
                with its transport, uptime and Signal count - and, when it isn&rsquo;t, the reason in
                words. Starting one resolves only once the namespace is genuinely registered, so the
                indicator never has to walk back a green light it showed too early.
              </p>
            </div>
            <div className="card">
              <h3>Prism is one click away</h3>
              <p>
                Open Prism from the same menu and Genesis starts a Prism server if none is running,
                then hands you a tab already pointed at that Synapse and namespace. Design, run and
                observe end up being three windows onto one process, not three setups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <h2>Open a canvas in about a minute.</h2>
            <p>
              Genesis ships inside the same package as the runtime.{" "}
              <code className="inline">pip install cosmonapse</code>, then{" "}
              <code className="inline">cosmo genesis</code> - it opens in your browser, and the
              project it makes is one you can delete Genesis and still run.
            </p>
            <div className="hero-ctas" style={{ marginBottom: 0 }}>
              <Link href="/core/quickstart" className="btn btn-primary">
                Quickstart <span className="arrow">→</span>
              </Link>
              <Link href="/prism" className="btn btn-ghost">
                Then watch it run
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// The rest of the suite</div>
          <h2 className="section-title">What Genesis writes for, and what watches it.</h2>
          <ProductGrid exclude="/genesis" />
        </div>
      </section>
    </>
  );
}
