import type { Metadata } from "next";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import GliaGate from "@/components/diagrams/GliaGate";
import { py } from "@/lib/highlight";
import { pageMetadata, KW_GOVERNANCE, KW_HARNESS, KW_PRODUCT } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Glia - A Policy Card for Every Component",
  description:
    "Glia, new in Cosmonapse 0.1.14: a two-way policy gate inserted into each Axon, Effector and Engram. Policies refuse, redact or escalate signals in either direction, and every violation emits an AUDIT record.",
  path: "/core/glia",
  keywords: [...KW_GOVERNANCE, ...KW_HARNESS, ...KW_PRODUCT],
});

const DESIGN = "https://github.com/Cosmonapse/cosmonapse-core/blob/main/design/GLIA_DESIGN.md";
const EXAMPLE = "https://github.com/Cosmonapse/cosmonapse-examples/tree/main/14-agent";

// Taken from cosmonapse-examples/14-agent/glia/memory.json, trimmed to two patterns.
const cardJson = `{
  "card_id": "agent-memory",
  "version": "1",
  "issued_to": "agent-memory",
  "mode": "enforce",
  "journal": {"path": "report/glia/memory.jsonl"},
  "policies": [
    {
      "id": "no-credentials-in-memory",
      "types": ["IMPRINT", "RECALLED"],
      "verdict": "redact",
      "match": ["sk-[A-Za-z0-9_-]{20,}", "AKIA[0-9A-Z]{16}"],
      "replacement": "[credential removed]"
    }
  ]
}`;

// Taken from cosmonapse-examples/14-agent/glia/files.py.
const cardPy = `from cosmonapse import Glia, Verdict

CARD = Glia.load("glia/files.json")

@CARD.on_signal(direction="inbound", types=["TOOL_CALL"])
def writes_stay_in_report(sig):
    if sig.payload.get("tool") != "write_file":
        return Verdict.deny("this Effector serves write_file only")
    path = (sig.payload.get("args") or {}).get("path") or ""
    if not (ROOT / path).resolve().is_relative_to(REPORT_DIR):
        return Verdict.deny("writes are confined to report/")
    return None   # no opinion: the next policy decides`;

const mountPy = `Axon(neuron_id="research", neuron_fn=research, glia=research_card)
Effector.serve(effector_id="files", glia=files_card)
Engram.serve(engram_id="agent-memory", glia=memory_card)`;

const GATES: { component: string; inbound: string; outbound: string }[] = [
  { component: "Axon", inbound: "TASK", outbound: "AGENT_OUTPUT, CLARIFICATION, PERMISSION, ERROR" },
  { component: "Axon, its own calls", inbound: "TOOL_RESULT, RECALLED, IMPRINTED", outbound: "TOOL_CALL, RECALL, IMPRINT" },
  { component: "Effector", inbound: "TOOL_CALL", outbound: "TOOL_RESULT" },
  { component: "Engram", inbound: "RECALL, IMPRINT", outbound: "RECALLED, IMPRINTED" },
];

const FIELDS: { name: string; values: string; body: string }[] = [
  {
    name: "direction",
    values: "inbound · outbound · both",
    body:
      "Which way the signal is crossing this component. The default is both. The same IMPRINT is outbound for the Axon that sent it and inbound for the Engram that receives it, so each side can hold its own rule about it.",
  },
  {
    name: "types",
    values: "signal types, or *",
    body:
      "Which signals the policy reads. The default is all of them. A policy scoped to TOOL_CALL reads tool calls and nothing else, and a signal no policy selects costs one set lookup.",
  },
  {
    name: "verdict",
    values: "allow · deny · redact · escalate",
    body:
      "What happens on a match. Redact rewrites the payload on a copy and the run continues on the copy. Escalate raises PERMISSION. A handler sees a read-only view of the whole envelope, not only the payload, and cannot write to it.",
  },
  {
    name: "retry",
    values: "reask · resend · none",
    body:
      "What a deny does next. reask re-runs the Axon's Neuron with the refusal as the correction. resend repeats the request behind a TOOL_RESULT or RECALLED. none refuses now, and is the default. Each policy carries its own max_attempts.",
  },
];

const MODES: { verb: string; title: string; body: string }[] = [
  {
    verb: "off",
    title: "Nothing is read",
    body:
      "The default. A card in off mode binds no gate, so mounting one changes nothing. Every brain written before 0.1.14 runs exactly as it did.",
  },
  {
    verb: "audit",
    title: "Read and record",
    body:
      "Policies run and record what they would have done. Nothing is blocked and nothing is retried. This is the shadow period, and turning on enforce without one is a guess.",
  },
  {
    verb: "enforce",
    title: "Apply",
    body:
      "Verdicts are applied. A policy handler that raises fails closed unless the card opts into fail_open. COSMONAPSE_POLICY_MODE overrides the card's mode for a whole deployment.",
  },
];

const AUDIT_KINDS: { kind: string; domain: string; when: string }[] = [
  { kind: "GUARD_RETRY", domain: "security", when: "A deny that was retried, or whose retries ran out" },
  { kind: "GUARDED", domain: "security", when: "A refusal, redaction or escalation with no retry" },
  { kind: "EVAL_RETRY", domain: "eval", when: "An output nothing claimed, sent back to the Neuron" },
  { kind: "TOOL_RETRY", domain: "tool", when: "Tool arguments that failed their schema" },
  { kind: "TRANSIENT_RETRY", domain: "reliability", when: "An Effector or Engram retrying a transient failure" },
  { kind: "DEADLINE_ABANDONED", domain: "reliability", when: "A repair that ran past its deadline" },
  { kind: "LIMIT_REFUSED", domain: "governance", when: "A trace limit on the Dendrite declined an action" },
];

const LIMITS: { title: string; body: string }[] = [
  {
    title: "Glia does not authenticate signals",
    body:
      "directed.id is a claim. Until envelopes are signed, any participant on a broker can publish as any id, so a policy on identity stops mistakes and misrouted traffic, not an attacker. Treat a shared broker as a trusted zone. Signing is the next phase.",
  },
  {
    title: "An empty card does nothing",
    body:
      "Cosmonapse ships the seam, not a PII library or an injection detector. The regex lists in the examples show where such a check goes. They are not presented as one.",
  },
  {
    title: "Code that holds the Dendrite can go around an Axon's gate",
    body:
      "A Neuron that calls the Dendrite's publish methods directly is not read by its own Axon's card. The card on the receiving Effector or Engram still reads what arrives.",
  },
  {
    title: "Older peers drop AUDIT",
    body:
      "A peer on an SDK before 0.1.14 logs one warning and drops an AUDIT signal it does not know. The verdict also rides the reply as meta.glia, correlated by parent_id, so that copy is never lost.",
  },
];

/** Two columns on a desktop, one on a phone: four cards should not wrap 3 + 1. */
const TWO_UP = { gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))" };

export default function GliaPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Cosmonapse Core · New in 0.1.14</div>
          <h1 className="page-title">Glia: a policy card for every component.</h1>
          <p className="page-sub">
            A Glia card is inserted into an Axon, an Effector or an Engram. It reads every signal
            going into that component and every signal coming out of it, and refuses, redacts or
            escalates the ones its policies match. There is no orchestrator and no central policy
            process. A card is a local object, and it is never consulted over the wire.
          </p>
          <div className="hero-ctas" style={{ marginTop: 28 }}>
            <a href={EXAMPLE} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              See it in an agent <span className="arrow">→</span>
            </a>
            <a href={DESIGN} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Design document
            </a>
            <Link href="/core/concepts#governance" className="btn btn-ghost">
              Concepts
            </Link>
          </div>
        </div>
      </header>

      {/* ── The gate ─────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// The gate</div>
          <h2 className="section-title">The policy sits on the component, not on the bus.</h2>
          <p className="section-sub">
            A guard written into a component is a guard you rewrite for every component. A card is
            written once, issued to one component, and travels with it. Each component carries at
            most one, so there is one answer to the question of what protects it.
          </p>
          <GliaGate />

          <div className="table-scroll" style={{ marginTop: 32 }}>
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Inbound</th>
                  <th>Outbound</th>
                </tr>
              </thead>
              <tbody>
                {GATES.map((g) => (
                  <tr key={g.component}>
                    <td>{g.component}</td>
                    <td>{g.inbound}</td>
                    <td>{g.outbound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="prose" style={{ marginTop: 20 }}>
            The Dendrite routes and publishes, and has no policy role. A card on a Dendrite is read
            for trace-wide limits only, because those count a whole trace rather than one
            component.
          </p>
        </div>
      </section>

      {/* ── A policy ─────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// A policy</div>
          <h2 className="section-title">Four fields. No checkpoints.</h2>
          <p className="section-sub">
            By default a policy reads every signal, both ways. Scope is something you narrow, not
            something you pick from a list of hook points.
          </p>
          <div className="grid-2" style={TWO_UP}>
            {FIELDS.map((f) => (
              <div className="card" key={f.name}>
                <h3>
                  <code className="inline">{f.name}</code>{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-faint)",
                      letterSpacing: "0.06em",
                      fontWeight: 400,
                    }}
                  >
                    {f.values}
                  </span>
                </h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginTop: 32, alignItems: "start" }}>
            <div>
              <div className="sub-eyebrow">Declared</div>
              <p className="prose">
                A card is a versioned artifact first. It is parsed at load, reports its version on
                REGISTER, and an audit record names the policy version that fired. With twenty
                components, reading twenty cards tells you what is enforced.
              </p>
              <CodeBlock filename="glia/memory.json" html={py(cardJson)} />
            </div>
            <div>
              <div className="sub-eyebrow">In code</div>
              <p className="prose">
                What a declaration cannot say goes in a decorator on the card, so it still travels
                with the card rather than living in the component. Handlers run in order and the
                first one that returns a verdict answers.
              </p>
              <CodeBlock filename="glia/files.py" html={py(cardPy)} />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="sub-eyebrow">Mounted</div>
            <CodeBlock filename="brain.py" html={py(mountPy)} maxWidth={720} />
          </div>
        </div>
      </section>

      {/* ── Modes ────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Modes</div>
          <h2 className="section-title">Off, then audit, then enforce.</h2>
          <p className="section-sub">
            The library default is off. The deployment chooses when a card starts reading and when
            it starts blocking.
          </p>
          <div className="lifecycle">
            {MODES.map((m) => (
              <div className="lifecycle-step" key={m.verb}>
                <div className="lifecycle-verb">{m.verb}</div>
                <h4>{m.title}</h4>
                <p>{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audit ────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Audit</div>
          <h2 className="section-title">No AUDIT on a trace means nothing fired.</h2>
          <p className="section-sub">
            AUDIT is a new signal type on its own subject, so a compliance consumer can subscribe to{" "}
            <code className="inline">cosmonapse.&lt;ns&gt;.AUDIT</code> and nothing else. One record
            is emitted at each event, including the refusal that exhausts a retry budget. That is
            what makes the absence of a record mean something.
          </p>
          <div className="table-scroll">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Domain</th>
                  <th>Emitted when</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_KINDS.map((a) => (
                  <tr key={a.kind}>
                    <td>{a.kind}</td>
                    <td>{a.domain}</td>
                    <td>{a.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid-2" style={{ marginTop: 28 }}>
            <div className="card">
              <h3>On the bus, thin</h3>
              <p>
                The AUDIT record and the reply&apos;s <code className="inline">meta.glia</code> carry
                the verdict, the policy id and version, the direction, the component and a hash of
                what matched. Never the matched text.
              </p>
            </div>
            <div className="card">
              <h3>On disk, full</h3>
              <p>
                The matched content goes to the card&apos;s own append-only journal on the
                component&apos;s host. It never crosses the Synapse. A collector ships it to wherever
                compliance lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Repair ───────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// The repair loop</div>
          <h2 className="section-title">One loop for three kinds of wrong.</h2>
          <p className="section-sub">
            The Axon now has a correction loop. It re-asks the Neuron when a policy refuses with{" "}
            <code className="inline">retry: &quot;reask&quot;</code>, when tool arguments fail their
            schema, and when an output matches nothing under the opt-in{" "}
            <code className="inline">strict_output</code>.
          </p>
          <div className="grid-3">
            <div className="card">
              <h3>Bounded</h3>
              <p>
                A re-ask is bounded by the lower of the policy&apos;s max_attempts and the
                card&apos;s repair budget, and optionally by a deadline. An attempt whose input
                would be identical to the last one is not made.
              </p>
            </div>
            <div className="card">
              <h3>Kept apart from transient retry</h3>
              <p>
                Effector and Engram transient retry is a separate setting. A policy refusal never
                feeds it, because resending an identical request to a deterministic policy is the
                same denial each time.
              </p>
            </div>
            <div className="card">
              <h3>Refusals are typed</h3>
              <p>
                When retries run out, the component answers in its own reply type: an AGENT_OUTPUT
                with <code className="inline">refused_by: &quot;policy&quot;</code>, a TOOL_RESULT
                or RECALLED with an error. A refusal does not become an ERROR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Limits ───────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// What Glia is not</div>
          <h2 className="section-title">The limits, stated plainly.</h2>
          <p className="section-sub">
            What a card can and cannot promise in 0.1.14.
          </p>
          <div className="grid-2" style={TWO_UP}>
            {LIMITS.map((l) => (
              <div className="card" key={l.title}>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/core" className="btn btn-ghost">
              Back to Core <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
