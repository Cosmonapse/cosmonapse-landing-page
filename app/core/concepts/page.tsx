import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS, KW_REACTIVE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Event-Driven Agent Concepts",
  description:
    "The vocabulary of Cosmonapse Core - Signal, Synapse, Neuron, Engram, Effector, Receptor, Axon, Dendrite, Pathway - grouped by the job each one does.",
  path: "/core/concepts",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    ...KW_HARNESS,
    "agent architecture glossary",
    "what is an agent harness",
    "orchestration vs choreography",
    "multi-agent design patterns",
  ],
});

/**
 * One vocabulary, one package.
 *
 * Every term below is Cosmonapse Core. They are grouped by the job they do -
 * not by product - because there is only one product they can come from.
 * Genesis and Prism are tools built over this vocabulary; they add no terms
 * of their own.
 */
type Concept = { name: string; map: string; desc: string };

type Group = {
  id: string;
  /** Eyebrow label. */
  title: string;
  /** Short headline for the group's own section. */
  heading: string;
  /** One sentence on what the group is for. */
  purpose: string;
  color: string;
  concepts: Concept[];
};

const GROUPS: Group[] = [
  {
    id: "contract",
    title: "The contract",
    heading: "Agree on a format, or nothing else works.",
    purpose: "What every part of the system agrees on before it can say anything.",
    color: "var(--accent-2)",
    concepts: [
      {
        name: "Signal",
        map: "Envelope",
        desc: "A single message crossing the Synapse, and the only thing Cosmonapse guarantees. Two components that produce valid Signals can always interoperate, whatever language each is written in. Every Signal carries its own id, a trace_id, and the parent_id of whatever caused it, so causality is in the envelope rather than reconstructed later.",
      },
      {
        name: "Synapse",
        map: "Channel · transport",
        desc: "The transport all Signals cross, and a swappable one: MemorySynapse for tests, DevSynapse for local multi-process work, NatsSynapse or KafkaSynapse in production. Your components do not know which is underneath them - the scale path is a URL change. Capability-routed TASKs publish on cosmonapse.<ns>.TASK.routed with queue groups, so the broker delivers each one exactly once within a matching capability profile.",
      },
      {
        name: "Namespace",
        map: "Isolation boundary",
        desc: "Every Signal is published under a namespace, and a Dendrite serves exactly one. Two namespaces on the same broker never see each other's traffic, so a staging system and a production system can share infrastructure without sharing a bus. A running system is addressed everywhere - the CLI, Prism, Genesis - as a Synapse URL plus a namespace.",
      },
    ],
  },
  {
    id: "participants",
    title: "The participants",
    heading: "Neurons think. Engrams remember. Effectors act. Receptors listen.",
    purpose:
      "The four kinds of thing a Signal can be addressed to. The division of labour between them is the whole design.",
    color: "var(--accent)",
    concepts: [
      {
        name: "Neuron",
        map: "Thinks · LLM provider · async function",
        desc: "The thinking layer, behind a pure-function interface: it receives (input, context), returns output, and knows nothing about the protocol. The Neuron(source=...) factory wraps OpenAI, Anthropic, HuggingFace, Groq, Mistral, Together, OpenRouter or Ollama - or a plain async function - behind that one callable. A Neuron decides; it never opens a file, calls an API or spawns a subprocess. A tool is not a Neuron, and neither is an HTTP API.",
      },
      {
        name: "Engram",
        map: "Remembers · memory backend",
        desc: "Shared memory as a participant on the bus rather than a library you import, which is why memory access shows up in a trace like everything else. A backend either subclasses Engram or is built from decorators with Engram.serve(engram_id=...). InMemory, SQLite and Postgres ship today, and a backend failure rides the reply instead of raising a separate ERROR.",
      },
      {
        name: "Effector",
        map: "Acts · tool · MCP server",
        desc: "The action layer, modelled deliberately on Engram: same addressing (effector_id or effector_kind), same mounting (dendrite.attach_effector), same rule that failures ride the reply. It services TOOL_CALL and answers with TOOL_RESULT, so a failing tool never terminates the parent TASK. An MCP server is an Effector. Cosmonapse does not build your tools - dispatch tables, MCP sessions, subprocesses and sandboxing stay your code.",
      },
      {
        name: "Receptor",
        map: "Listens · the outside edge",
        desc: "An interface primitive: outside world → TASK → outside world. CliReceptor turns a typed command into a dispatch and derives its argparse surface and REPL from the function signature; ApiReceptor exposes one HTTP endpoint across all three dispatch modes; ChatReceptor handles one turn per dispatch with a served page. A Receptor is caller-side and adds no new Signal types, so a request that arrived from a terminal is indistinguishable on the wire from one dispatched by a Neuron.",
      },
    ],
  },
  {
    id: "wiring",
    title: "The connective tissue",
    heading: "One component touches the bus. Exactly one.",
    purpose: "What joins a participant to the bus - and what deliberately keeps it away from it.",
    color: "var(--p-pathway)",
    concepts: [
      {
        name: "Axon",
        map: "Agent-side tool",
        desc: "The only piece of Cosmonapse that lives inside the Neuron's process. It wraps the Neuron function, validates its output into a Signal (AGENT_OUTPUT, CLARIFICATION, PERMISSION or ERROR), and hands it to the Dendrite - the Neuron itself never touches the protocol. Axon(effectors=[...], tool_standard='hermes'|'claude'|'codex') is also where a model's native tool-call dialect is recognised and turned into a TOOL_CALL.",
      },
      {
        name: "Dendrite",
        map: "Synapse-side connector",
        desc: "The only component that touches the Synapse. It hosts Axons, owns routing decisions, exposes the aggregate of its Axons' capabilities, and emits REGISTER / HEARTBEAT / DEREGISTER for each one. Its role is orchestrator (may dispatch TASKs) or worker (hosts Axons only) - and workers are guarded, so they can serve TASKs and bid in capability routing but cannot emit orchestration signals.",
      },
      {
        name: "Brain",
        map: "Team of agents",
        desc: "A collection of participants sharing one Synapse and namespace. Brain is an organising idea rather than a class you instantiate: in a project it is the brain.py that attaches everything and calls Dendrite.run(). It is the unit teams reach for when grouping components by capability or domain.",
      },
    ],
  },
  {
    id: "verbs",
    title: "The verbs",
    heading: "Three calls cover dispatch and memory.",
    purpose: "What you actually call. Three primitives cover dispatch and memory.",
    color: "var(--p-engram)",
    concepts: [
      {
        name: "Pathway",
        map: "Per-trace event handle",
        desc: "Returned by dendrite.dispatch(...). One primitive with three consumption shapes: await pw.wait() for sequential request/reply, @pw.on(SignalType.X) for reactive trace-scoped callbacks, and async for sig in pw for streaming. Pathway(scope=\"terminal\") filters to FINAL / ERROR / CLARIFICATION only - the decentralised pattern where the caller wakes only for events that need attention. observe_pathway(trace_id) opens one in observer role to watch a trace someone else started.",
      },
      {
        name: "Recall",
        map: "Read path · RECALL signal",
        desc: "Reads bound memory before a Neuron acts. The Axon emits RECALL; the Engram replies RECALLED carrying hits. EngramClient.recall() is the in-Neuron API, and a Neuron that declares a recall= parameter gets the helper injected by its Axon. With Engram.serve(), the return value of @on_recall becomes the hits.",
      },
      {
        name: "Imprint",
        map: "Write path · IMPRINT signal",
        desc: "Durable writes to bound memory. The Axon emits IMPRINT; the Engram replies IMPRINTED carrying a receipt. Operations are add, append, merge, upsert and delete. With Engram.serve(), @on_imprint runs the write and its return value becomes the receipt - distinct from @engram.host.on_imprint_signal, which only observes writes the Dendrite has already serviced.",
      },
    ],
  },
  {
    id: "observation",
    title: "The read-only seat",
    heading: "Watch everything. Take nothing.",
    purpose: "How anything watches the system without becoming part of it.",
    color: "var(--accent-3)",
    concepts: [
      {
        name: "Doppler",
        map: "Non-competing subscriber",
        desc: "Not a class but a stance on the bus: a subscriber that joins no queue group. Every ordinary consumer competes for a message, so exactly one of them gets it; a Doppler competes for nothing, so it sees every Signal and can never take work away from a participant. That single property is what makes observability safe to attach to a running system - and it is what Prism is built on. cosmo prism --tail streams the same feed to stdout.",
      },
    ],
  },
];

/** Flat list for the cheatsheet, keeping group order. */
const ALL = GROUPS.flatMap((g) => g.concepts.map((c) => ({ ...c, group: g })));

export default function ConceptsPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Concepts</div>
          <h1 className="page-title">The Biology of Distributed Cognition.</h1>
          <p className="page-sub">
            Cosmonapse names its primitives after the parts of a nervous system. The metaphor is
            precise, not decorative - each term maps exactly to a conventional distributed-systems
            concept. Every one of them belongs to <strong>Cosmonapse Core</strong>; they are grouped
            here by the job they do, because there is only one place they can come from.
          </p>
        </div>
      </header>

      {/* Orientation */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">One vocabulary</div>
          <h2 className="sub-title">Five jobs. One package.</h2>
          <p className="prose">
            There is no separate memory product, no separate observability product and no separate
            tooling vocabulary. <code className="inline">pip install cosmonapse</code> gives you
            every term on this page. What differs between them is not where they ship from but what
            they are for: agreeing on a format, doing work, connecting that work to the bus, being
            called, and being watched.
          </p>
          <p className="prose">
            <Link href="/genesis" className="inline-link">Genesis</Link> and{" "}
            <Link href="/prism" className="inline-link">Prism</Link> are tools built over this
            vocabulary rather than additions to it. Genesis lays these primitives out on a canvas and
            writes them into your project; Prism reads them off the bus. Neither introduces a concept
            you would have to learn twice.
          </p>

          <div className="usecases" style={{ marginTop: 36 }}>
            {GROUPS.map((g) => (
              <a href={`#${g.id}`} className="usecase" key={g.id} style={{ textDecoration: "none" }}>
                <div className="usecase-title" style={{ color: g.color }}>
                  {g.title}
                </div>
                <div className="usecase-body">{g.purpose}</div>
                <div className="usecase-shape">
                  {g.concepts.map((c) => c.name).join(" · ")}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Per-group concept cards */}
      {GROUPS.map((g) => (
        <section className="section-sm" key={g.id} id={g.id}>
          <div className="container">
            <div className="sub-eyebrow" style={{ color: g.color }}>
              {g.title}
            </div>
            <h2 className="sub-title" style={{ marginBottom: 10 }}>
              {g.heading}
            </h2>
            <p className="prose" style={{ marginBottom: 10 }}>
              {g.purpose}
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                color: "var(--text-faint)",
                letterSpacing: "0.06em",
                marginBottom: 24,
              }}
            >
              Cosmonapse Core
            </p>
            <div className="grid-3">
              {g.concepts.map((c) => (
                <div className="concept-card" key={c.name}>
                  <div className="concept-name" style={{ color: g.color }}>
                    {c.name}
                  </div>
                  <div className="concept-map">→ {c.map}</div>
                  <div className="concept-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Narrative */}
      <section className="section">
        <div className="container">
          <div className="sub-eyebrow">How they fit together</div>
          <h2 className="sub-title">A Brain in motion.</h2>
          <p className="prose">
            A <strong>Brain</strong> is a set of participants sharing one <strong>Synapse</strong>{" "}
            and one <strong>Namespace</strong>. Each is reached through a{" "}
            <strong>Dendrite</strong> - the only component that touches the Synapse - which carries{" "}
            <strong>Signals</strong> between them and exposes the orchestration primitives for
            whoever needs them.
          </p>
          <p className="prose">
            Four kinds of participant hang off that Synapse, and the division of labour is the whole
            design: <strong>Neurons think, Engrams remember, Effectors act, Receptors listen.</strong>{" "}
            A Neuron is a pure function that decides; when it decides to act, it emits a{" "}
            <code className="inline">TOOL_CALL</code> and an <strong>Effector</strong> answers with a{" "}
            <code className="inline">TOOL_RESULT</code>. That is where tools and{" "}
            <strong>MCP servers</strong> live - an MCP server is an Effector, not a Neuron. Effector
            is modelled on Engram deliberately: same addressing, same mounting, and the same rule
            that a backend failure rides the reply rather than raising a separate{" "}
            <code className="inline">ERROR</code> and killing the TASK.
          </p>
          <p className="prose">
            Persistent state lives in an <strong>Engram</strong>, written via{" "}
            <strong>Imprint</strong> and read via <strong>Recall</strong> - both of them Signals on
            the same bus, which is why a memory read is visible in a trace. Requests from outside
            arrive through a <strong>Receptor</strong>, which turns a command, an HTTP call or a chat
            turn into the same TASK an orchestrator would have dispatched. It adds no new wire types,
            so nothing downstream has to know the difference.
          </p>
          <p className="prose">
            Nothing in that picture is a supervisor. A <strong>Pathway</strong> is a handle on one
            trace, not a controller of it: whoever dispatched can await a terminal Signal, subscribe
            to events on that trace, or stream them - and can walk away entirely, because the work
            proceeds whether or not anyone is listening.
          </p>

          <div className="layer-stack" style={{ marginTop: 40 }}>
            <div className="layer">
              <div className="layer-name">Receptor  -  CLI · HTTP · chat</div>
              <div className="layer-desc">
                A person, a scheduled job or another system arrives here. The Receptor turns the
                request into a root TASK Signal and dispatches it through an orchestrator Dendrite.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer highlight">
              <div className="layer-name">Dendrite  -  synapse-side connector + orchestration</div>
              <div className="layer-desc">
                Receives the TASK. Routes it to the attached Axon matching the target neuron_id, or
                to whoever matches the requested capabilities. Emits FINAL when done. Every Dendrite
                can orchestrate  -  there is no separate Cortex class.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer">
              <div className="layer-name">Neuron   -   LLM provider · async function</div>
              <div className="layer-desc">
                Receives (input, context). Returns a plain dict. The Neuron factory wraps any
                provider  -  OpenAI, Anthropic, HuggingFace, Groq, Ollama  -  or a plain async
                function, knowing nothing about the Synapse, envelopes or trace IDs.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer">
              <div className="layer-name">Effector  -  tools · MCP servers · side effects</div>
              <div className="layer-desc">
                Services TOOL_CALL, replies TOOL_RESULT. When a Neuron decides to act, its Axon
                recognises the model&rsquo;s native tool-call dialect and the call is dispatched to the
                bound Effector, whose result is fed back on the same trace. Tool errors ride the
                TOOL_RESULT, so a failing tool never terminates the TASK.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer">
              <div className="layer-name">Engram  -  Recall · Imprint</div>
              <div className="layer-desc">
                Persistent shared state, written by Imprint and queried by Recall. Both are Signals,
                so both appear in the trace beside the reasoning that needed them.
              </div>
            </div>
          </div>

          <p className="prose" style={{ marginTop: 40 }}>
            A <strong>Doppler</strong> sits beside this whole picture rather than inside it. It
            subscribes to the Synapse without joining a queue group, so it competes for nothing and
            sees every Signal flow past.{" "}
            <Link href="/prism" className="inline-link">Prism</Link> is that stream rendered in a
            browser; <code className="inline">cosmo prism --tail</code> is the same stream on stdout.
            Neither is privileged - anything willing to speak the envelope can take the same seat.
          </p>
        </div>
      </section>

      {/* Resolution & retry */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Resolution &amp; retry</div>
          <h2 className="sub-title">How a Pathway resolves  -  and retries.</h2>
          <p className="prose">
            Every dispatch opens a <strong>Pathway</strong>  -  a per-trace handle scoped to one{" "}
            <code className="inline">trace_id</code>. In the request/reply shape, the Dendrite owns the
            whole arc: it dispatches the TASK, waits for the first <strong>terminal</strong> Signal,
            then closes the Pathway. A Pathway <em>resolves</em> the moment a terminal arrives  -  a{" "}
            <code className="inline">FINAL</code> (success), an <code className="inline">ERROR</code>,
            or an interactive <code className="inline">CLARIFICATION</code> /{" "}
            <code className="inline">PERMISSION</code> the caller must answer. With{" "}
            <code className="inline">{`scope: "terminal"`}</code> only those are delivered; with{" "}
            <code className="inline">{`scope: "all"`}</code> the cognition stream (THOUGHT_DELTA, PLAN,
            TOOL_CALL…) flows past first and the terminal still closes it.
          </p>
          <p className="prose">
            A Pathway is considered <strong>stuck</strong> in three cases: no terminal arrives within{" "}
            <code className="inline">timeout_s</code> (a timeout on the wait), the Pathway closes
            before any terminal (a <code className="inline">PathwayClosedError</code>, e.g. the worker
            died), or it resolves to an <code className="inline">ERROR</code> flagged{" "}
            <code className="inline">recoverable</code>. A <code className="inline">FINAL</code>,
            AGENT_OUTPUT, CLARIFICATION, or PERMISSION is never &ldquo;stuck&rdquo;  -  each is a result
            or a decision the caller must handle, not something to retry behind their back.
          </p>
          <p className="prose">
            <strong>Retry</strong> is a declarative policy  -  a{" "}
            <code className="inline">RetryStrategy</code>  -  handed to{" "}
            <code className="inline">dispatch_and_wait(retry=…)</code> or{" "}
            <code className="inline">run_with_retry(…)</code>. It controls how many attempts to make,
            the per-attempt timeout, the backoff between tries, and the predicate that decides whether a
            given outcome is worth retrying. Because retry transparently re-dispatches, it only fits the
            request/reply shape: the streaming shapes (<code className="inline">dispatch</code> /{" "}
            <code className="inline">dispatch_and_subscribe</code>) hand the live Pathway back to the
            caller, so retrying there would orphan their subscriptions  -  wrap those in a
            resilient-pathway pattern instead.
          </p>
          <p className="prose">
            The subtle part is what happens to the <em>abandoned</em> attempt. By default each retry
            runs on a <strong>fresh trace</strong>, and before launching it the Dendrite broadcasts a{" "}
            <strong>STOP</strong> on the old trace. STOP is cooperative cancellation: every Dendrite
            hosting work on that trace cancels its in-flight Neuron call and Engram I/O, and  -  when{" "}
            <code className="inline">rollback_on_retry</code> is set  -  replays that trace&rsquo;s
            per-trace <strong>saga journal</strong> in reverse to undo half-finished Engram writes,
            then acks with <strong>STOPPED</strong>. This is what stops a stalled worker from
            continuing to run (and keep writing memory) behind a retry that has already moved on.
            Rollback reverses Engram state only  -  a side effect a Neuron caused in the outside world
            (a sent email, an external write) is reversed only if that Neuron registered its own
            compensator.
          </p>

          <div className="layer-stack" style={{ marginTop: 40 }}>
            <div className="layer">
              <div className="layer-name">1 · Dispatch &amp; wait</div>
              <div className="layer-desc">
                Open a Pathway on a fresh trace, dispatch the TASK, and await the first terminal Signal
                within <code className="inline">timeout_s</code>.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer highlight">
              <div className="layer-name">2 · Evaluate the outcome</div>
              <div className="layer-desc">
                If the outcome is terminal-and-final (FINAL / AGENT_OUTPUT / CLARIFICATION /
                PERMISSION), return it. If it is a timeout, an early close, or a{" "}
                <code className="inline">recoverable</code> ERROR  -  and attempts remain  -  retry.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer">
              <div className="layer-name">3 · Preempt the abandoned attempt</div>
              <div className="layer-desc">
                Broadcast STOP on the old trace. Hosts cancel in-flight work, optionally roll back
                Engram writes via the saga journal, and ack with STOPPED.
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer">
              <div className="layer-name">4 · Back off &amp; re-dispatch</div>
              <div className="layer-desc">
                Sleep <code className="inline">backoff(attempt)</code>, fire the optional{" "}
                <code className="inline">on_retry</code> hook, and loop with a new trace until a
                non-retryable outcome or attempts are exhausted.
              </div>
            </div>
          </div>

          <p className="prose" style={{ marginTop: 32, fontSize: 13, color: "var(--text-faint)" }}>
            See <strong>STOP</strong> / <strong>STOPPED</strong> in the{" "}
            <a href="/core/protocol" style={{ color: "var(--accent)" }}>envelope spec</a>, and{" "}
            <code className="inline">RetryStrategy</code> / <code className="inline">run_with_retry</code>{" "}
            in the <a href="/docs/python/dendrite" style={{ color: "var(--accent)" }}>SDK reference</a>.
          </p>
        </div>
      </section>


      {/* Glossary  -  grouped by purpose, one product */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Glossary cheatsheet</div>
          <h2 className="sub-title" style={{ marginBottom: 24 }}>
            Every term, and what it is called elsewhere.
          </h2>
          <div className="table-scroll">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Cosmonapse term</th>
                  <th>Conventional term</th>
                  <th>One-line</th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((g) => (
                  <React.Fragment key={g.id}>
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          padding: "10px 14px 8px",
                          borderTop: `2px solid ${g.color}44`,
                          borderBottom: `1px solid ${g.color}22`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: g.color,
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {g.title}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                            {g.purpose}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {g.concepts.map((c) => (
                      <tr key={c.name}>
                        <td style={{ paddingLeft: 24 }}>
                          <span style={{ color: g.color, opacity: 0.9 }}>{c.name}</span>
                        </td>
                        <td style={{ color: "var(--text-dim)" }}>{c.map}</td>
                        <td style={{ color: "var(--text-dim)" }}>{c.desc.split(". ")[0]}.</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="prose" style={{ marginTop: 24, fontSize: 13, color: "var(--text-faint)" }}>
            All {ALL.length} terms ship in <strong>Cosmonapse Core</strong> today.{" "}
            <strong>Cortex</strong> is kept as a back-compat alias for Dendrite; new code should use
            Dendrite directly. <strong>Axon</strong> remains part of the Core runtime but is largely
            an implementation detail  -  applications interact with Dendrites, Neurons and Receptors.
            Names that appear on the{" "}
            <Link href="/roadmap" className="inline-link">roadmap</Link> but nowhere in the SDK are
            deliberately kept off this page.
          </p>
        </div>
      </section>
    </>
  );
}
