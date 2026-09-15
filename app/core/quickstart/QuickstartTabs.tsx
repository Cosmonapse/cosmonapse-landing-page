"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import DemoFrame from "@/components/DemoFrame";
import { brainBuilders, py, sh, stripDocstring } from "@/lib/highlight";
import { CODE } from "./code";

// ── Core path snippets ───────────────────────────────────────────────────
// Code blocks render from ./code.ts, synced from cosmonapse-examples/01-quickstart
// by scripts/sync-examples.mjs - the page shows exactly what the repo runs.

const installSh = `# Python 3.11+. The cosmo CLI ships inside the package.
$ pip install 'cosmonapse[receptor]' httpx`;

const initSh = `$ cosmo init my-app -n quickstart

  Scaffolded my-app in ./my-app
    + config.py        + neurons/hello.py      + effector/tools.py
    + engram/store.py  + receptors/terminal.py + brain.py

$ cd my-app
$ python brain.py greet --name Ada   # one process, in-process bus - no setup
Hello, Ada!
$ python brain.py                    # a REPL on the same brain`;

const runSh = `$ export HF_TOKEN=hf_xxxxxxxxxxxxxxxx
$ python brain.py
  api-receptor on http://127.0.0.1:8000

$ curl -s localhost:8000/task -H 'content-type: application/json' \\
       -d '{"prompt": "Say hello to Cosmonapse."}'
{"response": "Hello! Great to meet you, Cosmonapse ...", "meta": {...}}

# the same endpoint, the other two shapes
$ curl -s  localhost:8000/task -H 'content-type: application/json' -d '{"input": "hi", "mode": "send"}'
$ curl -sN localhost:8000/task -H 'content-type: application/json' -d '{"input": "hi", "mode": "stream"}'`;

const watchSh = `# terminal 1 - a dev synapse (TCP + NDJSON, no Docker)
$ cosmo synapse start memory --namespace=quickstart

# terminal 2 - the same brain over it; nothing in the code changes
$ SYNAPSE_URL=cosmo://127.0.0.1:7070 python brain.py

# terminal 3 - every Signal as it crosses
$ cosmo prism --tail --url=cosmo://127.0.0.1:7070 -n quickstart
  REGISTER      neuron=llama  capabilities=['chat']
  TASK          trace=trc_01...  neuron=llama
  AGENT_OUTPUT  trace=trc_01...  neuron=llama

# ...or Prism in the browser (http://127.0.0.1:7071)
$ cosmo prism --url=cosmo://127.0.0.1:7070 -n quickstart`;

const CORE_STEPS = [
  { id: "step-01", label: "Install" },
  { id: "step-02", label: "Scaffold" },
  { id: "step-03", label: "Axon" },
  { id: "step-04", label: "Receptor" },
  { id: "step-05", label: "Brain" },
  { id: "step-06", label: "Run" },
  { id: "step-07", label: "Watch" },
];

const NEEDS = [
  { title: "Python 3.11+", body: "The cosmo CLI ships inside the cosmonapse package - one install gets you both." },
  { title: "An HF token", body: "Free at huggingface.co/settings/tokens. Swap Axon.huggingface for .openai, .anthropic or .ollama if you'd rather use those." },
  { title: "One terminal", body: "The brain runs in one process on an in-process bus. A synapse and Prism are two more terminals, when you want to watch." },
];

// ── Genesis path snippets ────────────────────────────────────────────────

const genesisOpenSnippet = `<span class="tk-cm"># same install as Core - Genesis ships in the same package</span>
<span class="tk-op">$</span> pip install cosmonapse

<span class="tk-op">$</span> cosmo genesis

<span class="tk-cm">  Genesis running at http://127.0.0.1:7072</span>
<span class="tk-cm">  Opening in your browser...</span>`;

const GENESIS_STEPS = [
  { id: "gs-01", label: "Install" },
  { id: "gs-02", label: "Canvas" },
  { id: "gs-03", label: "Add primitives" },
  { id: "gs-04", label: "Run + Connect" },
];

export default function QuickstartTabs() {
  const [tab, setTab] = React.useState<"core" | "genesis">("core");

  return (
    <div className="qs-tabs">
      <div className="qs-tablist" role="tablist" aria-label="Quickstart path">
        <button
          type="button"
          role="tab"
          id="tab-core"
          aria-selected={tab === "core"}
          aria-controls="panel-core"
          className={`qs-tab${tab === "core" ? " active" : ""}`}
          style={{ ["--qs-tab-color" as unknown as string]: "var(--accent)" } as React.CSSProperties}
          onClick={() => setTab("core")}
        >
          <span className="qs-tab-dot" />
          Core <span className="qs-tab-sub">&mdash; wire it by hand</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-genesis"
          aria-selected={tab === "genesis"}
          aria-controls="panel-genesis"
          className={`qs-tab${tab === "genesis" ? " active" : ""}`}
          style={{ ["--qs-tab-color" as unknown as string]: "var(--accent-3)" } as React.CSSProperties}
          onClick={() => setTab("genesis")}
        >
          <span className="qs-tab-dot" />
          Genesis <span className="qs-tab-sub">&mdash; build it on a canvas</span>
        </button>
      </div>

      {tab === "core" ? (
        <div role="tabpanel" id="panel-core" aria-labelledby="tab-core">
          <p className="prose" style={{ marginBottom: 28, maxWidth: 720 }}>
            The seven steps below build a working brain by hand, so
            you see every wire before anything writes code for you. If you&apos;d rather place
            components on a canvas and let Genesis generate the same files, switch to the{" "}
            <button
              type="button"
              onClick={() => setTab("genesis")}
              className="inline-link"
              style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
            >
              Genesis tab
            </button>
            .
          </p>

          <div className="grid-3" style={{ marginBottom: 40 }}>
            {NEEDS.map((n) => (
              <div className="card" key={n.title}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </div>
            ))}
          </div>

          <nav className="qs-jumpnav" aria-label="Jump to a step">
            {CORE_STEPS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`}>
                {String(i + 1).padStart(2, "0")} {s.label}
              </a>
            ))}
          </nav>

          <section className="section-sm" id="step-01" style={{ paddingTop: 0 }}>
            <div className="sub-eyebrow">01 · Install</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Python 3.11+. The <code className="inline">[receptor]</code> extra brings FastAPI and
              uvicorn for the HTTP interface below.
            </p>
            <CodeBlock html={sh(installSh)} maxWidth={720} />
          </section>

          <section className="section-sm" id="step-02">
            <div className="sub-eyebrow">02 · Scaffold, then code</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              <code className="inline">cosmo init</code> writes the skeleton every example follows:
              one of each primitive, a component per module, and{" "}
              <code className="inline">brain.py</code> as the only entry. It runs before you write a
              line. The steps below code the quickstart on top of it: a Hugging Face Axon under{" "}
              <code className="inline">neurons/</code>, an HTTP Receptor under{" "}
              <code className="inline">receptors/</code>, and the wiring in{" "}
              <code className="inline">brain.py</code>.
            </p>
            <CodeBlock html={sh(initSh)} maxWidth={760} />
          </section>

          <section className="section-sm" id="step-03">
            <div className="sub-eyebrow">03 · Build an Axon</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              <code className="inline">Axon.huggingface()</code> pairs a Neuron (a pure async
              callable around the model) with the Axon that gives it an identity on the bus and
              validates its output into a Signal. The Neuron never sees the protocol.{" "}
              <code className="inline">.openai()</code>, <code className="inline">.anthropic()</code>,{" "}
              <code className="inline">.ollama()</code> and <code className="inline">.mcp()</code>{" "}
              are the same shape. Set <code className="inline">HF_TOKEN</code> to your{" "}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link"
              >
                Hugging Face access token
              </a>
              .
            </p>
            <CodeBlock html={py(stripDocstring(CODE["neurons/llama.py"]))} filename="neurons/llama.py" maxWidth={760} />
          </section>

          <section className="section-sm" id="step-04">
            <div className="sub-eyebrow">04 · Add a Receptor</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              A <strong>Receptor</strong> is the interface: here an HTTP request becomes a TASK. The
              lifespan, body parsing, 504 on timeout and SSE streaming are the Receptor&apos;s job,
              so your web framework never touches the Synapse and the Neuron never sees HTTP.
            </p>
            <CodeBlock html={py(stripDocstring(CODE["receptors/api.py"]))} filename="receptors/api.py" maxWidth={760} />
          </section>

          <section className="section-sm" id="step-05">
            <div className="sub-eyebrow">05 · Wire the brain</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              A <strong>Dendrite</strong> is a node&apos;s attachment to the Synapse: it hosts
              components, emits REGISTER / HEARTBEAT / DEREGISTER, and routes inbound TASKs. One
              node hosts the Axon as a <code className="inline">worker</code>; the Receptor
              originates TASKs, so it gets an orchestrator node of its own.{" "}
              <code className="inline">main()</code> hands both to{" "}
              <code className="inline">run_brain</code>, which starts every node before serving any
              interface.
            </p>
            <CodeBlock html={py(brainBuilders(CODE["brain.py"]))} filename="brain.py" maxWidth={820} />
          </section>

          <section className="section-sm" id="step-06">
            <div className="sub-eyebrow">06 · Run it</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              One process. The endpoint takes the TASK input as its body, or{" "}
              <code className="inline">{`{"input": ..., "mode": ...}`}</code> for fire-and-forget
              and streaming.
            </p>
            <CodeBlock html={sh(runSh)} maxWidth={840} />
          </section>

          <section className="section-sm" id="step-07">
            <div className="sub-eyebrow">07 · Watch the Signals flow</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Point the same brain at a real synapse with <code className="inline">SYNAPSE_URL</code>{" "}
              and attach Prism. It is a passive, read-only subscriber: it never competes with
              Dendrites for messages. Swap the URL for <code className="inline">nats://</code> or{" "}
              <code className="inline">kafka://</code> in production.
            </p>
            <CodeBlock html={sh(watchSh)} maxWidth={760} />
            <p className="prose" style={{ marginTop: 16 }}>
              The full example is{" "}
              <a
                href="https://github.com/Cosmonapse/cosmonapse-examples/tree/main/01-quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link"
              >
                cosmonapse-examples/01-quickstart
              </a>
              ; <Link href="/examples" className="inline-link">the examples</Link> build on it.
            </p>
          </section>
        </div>
      ) : (
        <div role="tabpanel" id="panel-genesis" aria-labelledby="tab-genesis">
          <p className="prose" style={{ marginBottom: 28, maxWidth: 720 }}>
            Same install, same primitives, same <code className="inline">brain.py</code> - Genesis
            just writes the files for you. Place a Neuron on the canvas instead of typing the
            seven steps on the{" "}
            <button
              type="button"
              onClick={() => setTab("core")}
              className="inline-link"
              style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
            >
              Core tab
            </button>
            , and Genesis wires the same Axon + Dendrite round-trip into your project.
          </p>

          <DemoFrame
            src="/genesis/quickstart.jpg"
            address="http://127.0.0.1:7072"
            badge="GENESIS PREVIEW"
            accent="var(--accent-3)"
            caption="Install, open the canvas, drop a Neuron and a Receptor, then Run and Connect - the whole first five minutes in one shot."
            maxWidth={860}
          />

          <nav className="qs-jumpnav" style={{ marginTop: 40 }} aria-label="Jump to a step">
            {GENESIS_STEPS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`}>
                {String(i + 1).padStart(2, "0")} {s.label}
              </a>
            ))}
          </nav>

          <section className="section-sm" id="gs-01" style={{ paddingTop: 0 }}>
            <div className="sub-eyebrow" style={{ color: "var(--accent-3)" }}>01 · Install</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Genesis ships inside the same package as the runtime - there is nothing extra to
              install. <code className="inline">cosmo genesis</code> opens it in your browser at{" "}
              <code className="inline">127.0.0.1:7072</code>.
            </p>
            <CodeBlock html={genesisOpenSnippet} maxWidth={720} />
          </section>

          <section className="section-sm" id="gs-02">
            <div className="sub-eyebrow" style={{ color: "var(--accent-3)" }}>02 · Open the canvas</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Name a brain and pick a folder - Genesis scaffolds the same standard skeleton{" "}
              <code className="inline">cosmo init</code> does. You land on an empty ring with one
              Synapse at the centre; everything you add orbits it.
            </p>
          </section>

          <section className="section-sm" id="gs-03">
            <div className="sub-eyebrow" style={{ color: "var(--accent-3)" }}>03 · Add primitives</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Pick a Neuron from the palette, point it at Hugging Face, OpenAI, Anthropic or
              Ollama, and name it. Genesis writes{" "}
              <code className="inline">neurons/&lt;name&gt;.py</code> and wires it into{" "}
              <code className="inline">brain.py</code> for you - the name you type becomes the
              component&apos;s id on the bus. Add a Receptor the same way to give the brain a CLI,
              an API, or a chat front door.
            </p>
          </section>

          <section className="section-sm" id="gs-04">
            <div className="sub-eyebrow" style={{ color: "var(--accent-3)" }}>04 · Run and Connect</div>
            <p className="prose" style={{ marginBottom: 16 }}>
              Press Run to start <code className="inline">brain.py</code> as a real process - the
              liveness pill goes green once it&apos;s actually serving. Connect opens the
              Receptor&apos;s own surface: a terminal for a CLI Receptor, a request builder for an
              API one, a chat panel for a chat one. What you exercise here is the production path,
              not a mock of it.
            </p>
            <div className="hero-ctas" style={{ marginTop: 8, marginBottom: 0 }}>
              <Link href="/genesis" className="btn btn-primary">
                Read the full Genesis walkthrough <span className="arrow">→</span>
              </Link>
              <Link href="/prism" className="btn btn-ghost">
                Then watch it run in Prism
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
