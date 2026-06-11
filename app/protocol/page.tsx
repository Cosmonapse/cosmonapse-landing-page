import type { Metadata } from "next";
import CodeBlock from "@/components/CodeBlock";
import CodeSwitcher from "@/components/CodeSwitcher";

export const metadata: Metadata = {
  title: "Envelope Specification — Cosmonapse Protocol",
  description:
    "The envelope is the single shared contract of Cosmonapse. Every Signal on the channel is a valid envelope.",
};

const envelopeSnippet = `{
  <span class="tk-fn">"v"</span>:         <span class="tk-str">"1"</span>,
  <span class="tk-fn">"id"</span>:        <span class="tk-str">"evt_01JVBCDEF1234567890ABCDEF"</span>,
  <span class="tk-fn">"trace_id"</span>:  <span class="tk-str">"trc_01JVBCDEF0000000000000000"</span>,
  <span class="tk-fn">"parent_id"</span>: <span class="tk-str">"evt_01JVBCDEF0000000000000001"</span>,
  <span class="tk-fn">"type"</span>:      <span class="tk-str">"THOUGHT_DELTA"</span>,
  <span class="tk-fn">"directed"</span>:  { <span class="tk-fn">"id"</span>: <span class="tk-str">"claude-debug"</span> },
  <span class="tk-fn">"ts"</span>:        <span class="tk-str">"2026-05-16T14:22:01.391Z"</span>,
  <span class="tk-fn">"payload"</span>: {
    <span class="tk-fn">"delta"</span>: <span class="tk-str">"reading the traceback..."</span>,
    <span class="tk-fn">"seq"</span>:   <span class="tk-num">1</span>
  },
  <span class="tk-fn">"meta"</span>: {
    <span class="tk-fn">"model"</span>:  <span class="tk-str">"claude-sonnet-4-6"</span>,
    <span class="tk-fn">"tokens"</span>: { <span class="tk-fn">"out"</span>: <span class="tk-num">12</span> }
  }
}`;

// Connect + validate snippets shown in the switcher alongside the envelope
const connectPy = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Signal, connect_synapse

<span class="tk-cm"># Connect to any Synapse — memory, NATS, Kafka.</span>
synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)

<span class="tk-cm"># Validate an envelope against the spec (pydantic raises on violation).</span>
sig <span class="tk-op">=</span> Signal.<span class="tk-fn">model_validate</span>(envelope_dict)

<span class="tk-cm"># Or use the CLI:</span>
<span class="tk-cm"># $ cosmo validate &lt; signals.ndjson</span>`;

const connectTs = `<span class="tk-kw">import</span> { connectSynapse, validateSignal } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// Connect to any Synapse — memory, NATS, Kafka.</span>
<span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connectSynapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>);

<span class="tk-cm">// Validate an envelope against the spec (throws on violation).</span>
<span class="tk-fn">validateSignal</span>(envelopeObj);

<span class="tk-cm">// Or use the CLI:</span>
<span class="tk-cm">// $ cosmo validate &lt; signals.ndjson</span>`;

type MsgProps = {
  name: string;
  by: string;
  children: React.ReactNode;
};
const Msg = ({ name, by, children }: MsgProps) => (
  <div className="msg">
    <div className="msg-name">
      <span>{name}</span>
      <span className="msg-by">{by}</span>
    </div>
    <div className="msg-desc">{children}</div>
  </div>
);

// Product tag shown above message group headings
const ProductTag = ({
  label,
  color,
  status,
  statusColor,
}: {
  label: string;
  color: string;
  status: string;
  statusColor: string;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
    <span
      style={{
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        color,
        background: color + "14",
        border: `1px solid ${color}44`,
        padding: "2px 10px",
        borderRadius: 20,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
      }}
    >
      {label}
    </span>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        color: statusColor,
        background: statusColor + "14",
        border: `1px solid ${statusColor}44`,
        padding: "2px 8px",
        borderRadius: 20,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: statusColor,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  </div>
);

export default function ProtocolPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Protocol</div>
          <h1 className="page-title">Envelope specification</h1>
          <p className="page-sub">
            The envelope is the single shared contract of Cosmonapse. Every Signal crossing a Synapse
            is a valid envelope  -  regardless of which Neuron produced it, which Synapse carries it,
            or which Dendrite is on the other side.
          </p>

          {/* Product context strip */}
          <div
            style={{
              marginTop: 32,
              padding: "16px 20px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              flexWrap: "wrap" as const,
              gap: 12,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              Signal types by product →
            </span>
            {[
              { label: "Core", color: "var(--accent)", desc: "Lifecycle · Cognition · Agent management" },
              { label: "Engram", color: "#a78bfa", desc: "Memory · Context" },
              { label: "Doppler", color: "#22d3ee", desc: "Observability surface" },
              { label: "Immune", color: "#f87171", desc: "Identity · Security (planned)" },
            ].map((p) => (
              <span
                key={p.label}
                title={p.desc}
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: p.color,
                  background: p.color + "14",
                  border: `1px solid ${p.color}36`,
                  padding: "3px 10px",
                  borderRadius: 20,
                  cursor: "default",
                }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">The envelope</div>

          <div className="envelope-grid">
            <div>
              <CodeBlock filename="signal.json" html={envelopeSnippet} variant="elevated" />
              <div style={{ marginTop: 16 }}>
                <CodeSwitcher
                  python={{ html: connectPy, filename: "connect.py" }}
                  typescript={{ html: connectTs, filename: "connect.ts" }}
                />
              </div>
            </div>

            <div className="field-ref">
              <div className="field-ref-title">Field reference</div>
              <div className="field">
                <div className="field-name">
                  v<span className="req">●</span>
                </div>
                <div className="field-desc">Envelope version. Always &ldquo;1&rdquo; for this revision.</div>
              </div>
              <div className="field">
                <div className="field-name">
                  id<span className="req">●</span>
                </div>
                <div className="field-desc">
                  Unique event ID  -  prefixed ULID. Consumers dedupe by this within a 60s window.
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  trace_id<span className="req">●</span>
                </div>
                <div className="field-desc">
                  Root workflow ID. Stable across the entire delegation tree.
                </div>
              </div>
              <div className="field">
                <div className="field-name">parent_id</div>
                <div className="field-desc">
                  ID of the event that caused this one. Absent only on the root TASK or TASK_OFFER.
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  type<span className="req">●</span>
                </div>
                <div className="field-desc">Message type. One of the values catalogued below.</div>
              </div>
              <div className="field">
                <div className="field-name">directed</div>
                <div className="field-desc">
                  Unified addressing: <code className="inline">id</code> (direct  -  a neuron_id or
                  engram_id), <code className="inline">type</code> (a neuron type or engram_kind), and{" "}
                  <code className="inline">capabilities</code>. Precedence on receive: id &gt; type &gt;
                  capabilities. Also carries producer identity on replies (an AGENT_OUTPUT&rsquo;s{" "}
                  <code className="inline">directed.id</code> is the producing neuron). Omitted when no
                  addressing applies.
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  ts<span className="req">●</span>
                </div>
                <div className="field-desc">RFC 3339 UTC timestamp with millisecond precision.</div>
              </div>
              <div className="field">
                <div className="field-name">payload</div>
                <div className="field-desc">Type-specific shape. Open object; consumers ignore unknown keys.</div>
              </div>
              <div className="field">
                <div className="field-name">meta</div>
                <div className="field-desc">
                  Non-semantic: model, tokens, cost_micro_usd, seq, transport_hops.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Layers</div>
          <h2 className="sub-title">Three layers. Non-overlapping responsibilities.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, marginBottom: 8 }}>
            The envelope flows top to bottom; agent output flows bottom to top. Each layer has exactly one job.
          </p>
          <div className="layer-stack">
            <div className="layer highlight">
              <div className="layer-name">Dendrite  -  synapse-side connector + orchestration</div>
              <div className="layer-desc">
                The only component that touches the Synapse. Hosts Axons; owns routing decisions; exposes
                the aggregate of its Axons&rsquo; capabilities; emits REGISTER / HEARTBEAT / DEREGISTER;
                routes inbound TASKs (addressed by neuron_id or by capabilities); opens Pathways. A
                Dendrite has a <code className="inline">role</code>: <code className="inline">&quot;orchestrator&quot;</code>{" "}
                (full dispatch / emit surface) or <code className="inline">&quot;worker&quot;</code>{" "}
                (hosts Axons and bids in capability routing, but cannot emit TASK or any cognition signal).
                The role guard sits on <code className="inline">emit()</code> itself  -  every cognition
                emitter funnels through it. Every orchestrator-role Dendrite can drive workflows; there is
                no separate Cortex class.
              </div>
            </div>
            <div className="layer-arrow">↕</div>
            <div className="layer">
              <div className="layer-name">Axon  -  agent-side tool</div>
              <div className="layer-desc">
                Unwraps TASK → calls Neuron. Wraps Neuron output → AGENT_OUTPUT / CLARIFICATION / PERMISSION / ERROR →
                returns to Dendrite. Never touches the Synapse directly.
              </div>
            </div>
            <div className="layer-arrow">↕</div>
            <div className="layer">
              <div className="layer-name">Neuron  -  pure function</div>
              <div className="layer-desc">
                async fn(input, context) → output. No protocol knowledge. Fully testable in isolation.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Identifiers</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, lineHeight: 1.65 }}>
            All identifiers are <strong style={{ color: "var(--text)" }}>prefixed ULIDs</strong>: a short
            lowercase type prefix, an underscore, and a 26-character canonical ULID. Globally unique without
            coordination; lexicographically sortable by creation time.
          </p>
          <table className="spec-table">
            <thead>
              <tr>
                <th>Prefix</th>
                <th>Used for</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>evt_</td>
                <td>Any envelope id</td>
                <td>
                  <code className="inline">evt_01JVBCDEF1234567890ABCDEF</code>
                </td>
              </tr>
              <tr>
                <td>trc_</td>
                <td>Any trace_id</td>
                <td>
                  <code className="inline">trc_01JVBCDEF0000000000000000</code>
                </td>
              </tr>
              <tr>
                <td>call_</td>
                <td>TOOL_CALL / TOOL_RESULT pairs</td>
                <td>
                  <code className="inline">call_01JVBCDEF0000000000000002</code>
                </td>
              </tr>
              <tr>
                <td>prop_</td>
                <td>CONSENSUS proposal IDs</td>
                <td>
                  <code className="inline">prop_01JVXAMPLE0000000000000001</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Transport routing ── */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Subjects &amp; delivery</div>
          <h2 className="sub-title">Two TASK subjects. Two delivery modes.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, lineHeight: 1.65 }}>
            The protocol exposes two transport-level routing modes for TASKs. The mode is chosen at
            dispatch time; both ride the same envelope.
          </p>
          <table className="spec-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Subject</th>
                <th>Delivery</th>
                <th>Selected when</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Addressed</td>
                <td><code className="inline">cosmonapse.&lt;ns&gt;.TASK</code></td>
                <td>Broadcast (every Dendrite subscribes, only the named host acts)</td>
                <td>TASK sets <code className="inline">directed.id</code></td>
              </tr>
              <tr>
                <td>Capability-routed</td>
                <td><code className="inline">cosmonapse.&lt;ns&gt;.TASK.routed</code></td>
                <td>Queue group <code className="inline">caps:&lt;sorted-aggregate&gt;</code>  -  broker delivers exactly once per matching cap profile</td>
                <td>TASK omits <code className="inline">directed.id</code> and sets <code className="inline">payload.capabilities</code></td>
              </tr>
            </tbody>
          </table>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, lineHeight: 1.65, marginTop: 24 }}>
            The split exists because a single queue group on a shared subject would break addressed
            routing (the broker could deliver an addressed TASK to a Dendrite that doesn&rsquo;t host
            the target Axon, which would silently drop it). With two subjects, addressed broadcast
            and capability load-balancing coexist cleanly. Heterogeneous deployments  -  Dendrites with
            different but overlapping cap profiles  -  still get at-least-once across profiles; for
            atomic claim use TASK_OFFER / BID / TASK_AWARDED instead.
          </p>
        </div>
      </section>

      {/* ── CORE message types ── */}
      <section className="section-sm">
        <div className="container">

          <ProductTag label="Cosmonapse Core" color="var(--accent)" status="Active Development" statusColor="#4ade80" />
          <div className="sub-eyebrow" style={{ marginTop: 0 }}>Message types  -  Lifecycle</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, marginBottom: 32 }}>
            The mandatory types. Any compliant implementation must handle all of them.
          </p>
          <div className="msg-grid">
            <Msg name="TASK" by="Dendrite · external">
              Assigns a unit of work. Root TASK has no parent_id; delegated TASK points to the triggering event.
              Payload: <code className="inline">{`{ intent, input, context_ref?, deadline?, budget_usd? }`}</code>
            </Msg>
            <Msg name="AGENT_OUTPUT" by="Dendrite (Axon data)">
              The Axon&rsquo;s only output envelope for normal agent work. Neutral  -  workflow-semantic-free.
              The orchestrating Dendrite decides what it becomes. Payload:{" "}
              <code className="inline">{`{ output }`}</code>
            </Msg>
            <Msg name="FINAL" by="Dendrite">
              Successful completion of a task. Produced by the orchestrating Dendrite, never the Axon. Exactly one per task.
              Payload: <code className="inline">{`{ result }`}</code>
            </Msg>
            <Msg name="ERROR" by="Axon · Dendrite">
              Task failure  -  agent exception, timeout, no-capable-agent, budget exceeded. First terminal event
              wins. Payload: <code className="inline">{`{ kind, message, retriable? }`}</code>
            </Msg>
            <Msg name="TASK_OFFER" by="Dendrite">
              Broadcast to candidates capable of handling an intent. Agents respond with BID or stay silent.
              Payload: includes <code className="inline">required_caps</code>,{" "}
              <code className="inline">bid_window_ms</code>.
            </Msg>
            <Msg name="BID" by="Dendrite">
              An agent&rsquo;s self-assessment in response to a TASK_OFFER. Payload:{" "}
              <code className="inline">{`{ offer_id, confidence, cost_estimate_usd?, eta_ms? }`}</code>
            </Msg>
            <Msg name="TASK_AWARDED" by="Dendrite">
              Sent to the winning agent after bid evaluation. Payload:{" "}
              <code className="inline">{`{ offer_id }`}</code>
            </Msg>
            <Msg name="TASK_DECLINED" by="Dendrite">
              Sent to the losers  -  signal to discard any speculative work.
            </Msg>
          </div>

          <div style={{ marginTop: 56 }}>
            <ProductTag label="Cosmonapse Core" color="var(--accent)" status="Active Development" statusColor="#4ade80" />
          </div>
          <div className="sub-eyebrow" style={{ marginTop: 0 }}>Message types  -  Cognition</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, marginBottom: 32 }}>
            Produced by the Dendrite, not the Axon or Neuron. Optional  -  a Dendrite that simply forwards
            TASK → FINAL with no intermediate events is fully compliant.
          </p>
          <div className="msg-grid">
            <Msg name="THOUGHT_DELTA" by="Dendrite">
              A chunk of streaming reasoning. <code className="inline">meta.seq</code> must be monotonic per
              (trace_id, agent). Payload: <code className="inline">{`{ delta, final? }`}</code>
            </Msg>
            <Msg name="PLAN" by="Dendrite">
              Structured plan the agent has decided to follow. Supervisors may interrupt before execution.
              Payload: <code className="inline">{`{ steps, revision }`}</code>
            </Msg>
            <Msg name="TOOL_CALL" by="Dendrite">
              The agent is invoking a tool. A matching TOOL_RESULT is expected. Payload:{" "}
              <code className="inline">{`{ tool, args, call_id }`}</code>
            </Msg>
            <Msg name="TOOL_RESULT" by="Dendrite">
              Tool response, parent_id pointing to the corresponding TOOL_CALL. Payload:{" "}
              <code className="inline">{`{ call_id, ok, value?, error? }`}</code>
            </Msg>
            <Msg name="ESCALATION" by="Dendrite">
              Agent cannot complete and is requesting re-dispatch to a more capable agent. Caller is excluded
              from the new candidate set. Payload: <code className="inline">{`{ reason, hints? }`}</code>
            </Msg>
            <Msg name="CONSENSUS" by="Dendrite">
              Publishes the outcome of a multi-agent vote. Payload:{" "}
              <code className="inline">{`{ proposal_id, outcome, votes, threshold? }`}</code>
            </Msg>
            <Msg name="CRITIQUE" by="Dendrite">
              A review of another envelope&rsquo;s output, pinned via target_event_id. Payload:{" "}
              <code className="inline">{`{ target_event_id, severity, note }`}</code>
            </Msg>
            <Msg name="CLARIFICATION" by="Dendrite (Axon data)">
              The Axon recognises a <code className="inline">__clarification__</code> marker in the
              agent&rsquo;s raw output and emits this directly. The Dendrite never has to inspect
              AGENT_OUTPUT for it. Payload:{" "}
              <code className="inline">{`{ question, context? }`}</code>
            </Msg>
            <Msg name="PERMISSION" by="Dendrite (Axon data)">
              A Neuron asks to perform an action before doing it  -  the same return-and-resume shape
              as CLARIFICATION, via a <code className="inline">__permission__</code> marker (typically
              only after an Engram recall misses). Payload:{" "}
              <code className="inline">{`{ action, scope?, reason? }`}</code>
            </Msg>
            <Msg name="PERMISSION_DECISION / CLARIFICATION_ANSWER" by="Dendrite">
              The verdict / answer to a request. <code className="inline">parent_id</code> is the
              request&rsquo;s id. No correlation client: the answering Dendrite either re-dispatches a
              TASK with the decision (so the Neuron resumes and can imprint/recall it) or emits this
              discrete reply. Payload:{" "}
              <code className="inline">{`{ granted, reason?, ttl_ms? }`}</code> /{" "}
              <code className="inline">{`{ answer }`}</code>
            </Msg>
            <Msg name="DISCOVER" by="Dendrite">
              Capability discovery probe. Peers that match respond on the discovery subject; the originator
              aggregates them into a registry snapshot.
            </Msg>
          </div>

          <div style={{ marginTop: 56 }}>
            <ProductTag label="Cosmonapse Core" color="var(--accent)" status="Active Development" statusColor="#4ade80" />
          </div>
          <div className="sub-eyebrow" style={{ marginTop: 0 }}>Message types  -  Agent management</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, marginBottom: 32 }}>
            Emitted by the <strong style={{ color: "var(--text)" }}>Dendrite</strong> on behalf of each
            attached Axon. The Axon owns the metadata (neuron_id, capabilities, version); the Dendrite
            publishes these Signals onto the Synapse.
          </p>
          <div className="msg-grid">
            <Msg name="REGISTER" by="Dendrite (Axon data)">
              An agent announces its capabilities and constraints. Re-emit with updated fields is valid
              (upsert). Payload: <code className="inline">{`{ capabilities, cost_hint?, max_concurrent?, max_latency_ms? }`}</code>
            </Msg>
            <Msg name="DEREGISTER" by="Dendrite (Axon data)">
              Graceful exit. Nuclei stop routing to this agent. Payload:{" "}
              <code className="inline">{`{ reason }`}</code>
            </Msg>
            <Msg name="HEARTBEAT" by="Dendrite (Axon data)">
              Periodic liveness. Missing N (default 3) consecutive heartbeats = treated as dead. Payload:{" "}
              <code className="inline">{`{ status, load?, in_flight? }`}</code>
            </Msg>
          </div>
        </div>
      </section>

      {/* ── ENGRAM message types ── */}
      <section className="section-sm">
        <div className="container">
          <ProductTag label="Cosmonapse Engram" color="#a78bfa" status="Active Development" statusColor="#4ade80" />
          <div className="sub-eyebrow" style={{ marginTop: 0 }}>Message types  -  Engram (shared memory)</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, marginBottom: 16 }}>
            The Engram surface is request/reply: an Axon asks for context with{" "}
            <code className="inline">RECALL</code> or commits a write with{" "}
            <code className="inline">IMPRINT</code>, and the bound backend replies with{" "}
            <code className="inline">RECALLED</code> or <code className="inline">IMPRINTED</code>.
            Identifiers use the <code className="inline">eng_</code> ULID prefix. The Neuron never
            writes to the memory fabric directly  -  <code className="inline">EngramClient</code> is the
            in-Neuron API.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#a78bfa",
              background: "#a78bfa14",
              border: "1px solid #a78bfa36",
              padding: "6px 14px",
              borderRadius: 8,
              marginBottom: 32,
              fontFamily: "var(--font-mono)",
            }}
          >
            Engram primitives → Recall · Imprint &nbsp;|&nbsp; Echo (next)
          </div>
          <div className="msg-grid">
            <Msg name="RECALL" by="Axon (via EngramClient)">
              Asks the bound Engram to return relevant context for a Neuron. Payload:{" "}
              <code className="inline">{`{ engram_id, query, mode?, k?, deadline_ms? }`}</code>
              {" "}where <code className="inline">mode</code> is{" "}
              <code className="inline">first | merge | all</code>.
            </Msg>
            <Msg name="RECALLED" by="Engram backend">
              Reply to a RECALL, parent_id pointing at the original request. Payload:{" "}
              <code className="inline">{`{ hits, partial? }`}</code> where each Hit carries{" "}
              <code className="inline">{`{ id, content, score?, tags? }`}</code>.
            </Msg>
            <Msg name="IMPRINT" by="Axon (via EngramClient)">
              Commits a write to the bound Engram. Payload:{" "}
              <code className="inline">{`{ engram_id, op, entry, deadline_ms? }`}</code>
              {" "}where <code className="inline">op</code> is{" "}
              <code className="inline">add | append | merge | upsert | delete</code>.
            </Msg>
            <Msg name="IMPRINTED" by="Engram backend">
              Reply to an IMPRINT. Payload:{" "}
              <code className="inline">{`{ id, ok, error? }`}</code>.
            </Msg>
          </div>
        </div>
      </section>

      {/* ── DOPPLER + future ── */}
      <section className="section-sm">
        <div className="container">
          <ProductTag label="Cosmonapse Doppler" color="#22d3ee" status="Active Development" statusColor="#4ade80" />
          <div className="sub-eyebrow" style={{ marginTop: 0 }}>Observability surface</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, marginBottom: 32 }}>
            Doppler is a non-competing, read-only consumer of the Synapse. It does not define its own
            Signal types  -  it taps every Signal emitted by Core and Engram. Pulse streams the raw
            telemetry; Prism renders it as dashboards and trace graphs.{" "}
            <code className="inline">cosmo doppler</code> in the CLI is the baseline implementation.
          </p>
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 10,
              border: "1px solid #22d3ee36",
              background: "#22d3ee08",
              color: "var(--text-dim)",
              fontSize: 13,
              lineHeight: 1.65,
            }}
          >
            <strong style={{ color: "#22d3ee" }}>Pulse</strong>  -  real-time Signal metrics: latency,
            throughput, error rates, cost per Neuron.{" "}
            <strong style={{ color: "#22d3ee" }}>Prism</strong>  -  the visualization layer: trace graphs,
            audit logs, dashboard views. Both build on the existing Synapse subscription model  -  no new
            envelope types required.
          </div>

          {/* Future / planned */}
          <div style={{ marginTop: 56 }}>
            <ProductTag label="Cosmonapse Immune" color="#f87171" status="Not Planned" statusColor="#6b7280" />
          </div>
          <div className="sub-eyebrow" style={{ marginTop: 0 }}>Future signal extensions</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 720, marginBottom: 32 }}>
            These signal types are reserved for future Cosmonapse products. They are not part of the
            current envelope spec but are documented here for planning purposes.
          </p>
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              opacity: 0.65,
              fontSize: 13,
              lineHeight: 1.75,
              color: "var(--text-dim)",
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: "#f87171", fontFamily: "var(--font-mono)" }}>Immune</strong>{" "}
               — Genome · Myelin · Reflex · AntiBody
            </div>
            <div>
              Planned signal types include{" "}
              <code className="inline">IDENTITY_ASSERT</code> (Genome — neuron identity proof),{" "}
              <code className="inline">KEY_ROTATE</code> (Myelin — in-band key refresh), and{" "}
              <code className="inline">THREAT_SIGNAL</code> (Reflex/AntiBody — anomaly broadcast).
              These will extend the envelope spec in a future revision and remain backwards-compatible
              with v1 consumers.
            </div>
            <div style={{ marginTop: 16 }}>
              <strong style={{ color: "#fb923c", fontFamily: "var(--font-mono)" }}>Cloud</strong>{" "}
               — Membrane
            </div>
            <div style={{ marginTop: 4 }}>
              Membrane isolation signals are infrastructure-layer only and will not appear on the
              application Synapse. They operate below the envelope boundary.
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Validation</div>
          <h2 className="sub-title">An envelope is valid if and only if…</h2>
          <ol className="prose" style={{ paddingLeft: 24 }}>
            <li>It is well-formed JSON.</li>
            <li>
              <code className="inline">v</code> is present and equals{" "}
              <code className="inline">&quot;1&quot;</code>.
            </li>
            <li>
              <code className="inline">id</code> is present and matches{" "}
              <code className="inline">^evt_[0-9A-Z]{"{26}"}$</code>.
            </li>
            <li>
              <code className="inline">trace_id</code> is present and matches{" "}
              <code className="inline">^trc_[0-9A-Z]{"{26}"}$</code>.
            </li>
            <li>
              <code className="inline">parent_id</code>, if present, matches the event pattern.
            </li>
            <li>
              <code className="inline">type</code> is present and is one of the catalogued values.
            </li>
            <li>
              <code className="inline">ts</code> is a valid RFC 3339 UTC timestamp ending in{" "}
              <code className="inline">Z</code>.
            </li>
            <li>
              <code className="inline">payload</code> and{" "}
              <code className="inline">meta</code>, if present, are JSON objects.
            </li>
            <li>Required payload fields for the given type are present and correctly typed.</li>
          </ol>
          <p className="prose" style={{ marginTop: 16 }}>
            <code className="inline">cosmo validate</code> checks these rules against a stream of
            envelopes. Validity is purely structural — Cosmonapse does not enforce sequencing or
            lifecycle rules. What constitutes a completed task, what happens after an error, and how
            envelopes flow over time are decisions you make in your Dendrite.
          </p>
        </div>
      </section>
    </>
  );
}
