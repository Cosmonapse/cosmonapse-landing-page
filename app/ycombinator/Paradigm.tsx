"use client";

import React, { useState } from "react";
import { COMPARISON, CONTRASTS, DECOUPLINGS, PAPER_GROUPS } from "./paradigm-data";

function Tip({ children, tip }: { children: React.ReactNode; tip: string }) {
  return (
    <span className="yc-tip" tabIndex={0}>
      {children}
      <span className="yc-tipbox" role="tooltip">
        {tip}
      </span>
    </span>
  );
}

const FLOW_RR = [
  "caller -> agent.step()",
  "  agent -> tool.run()      caller blocked",
  "  agent -> memory.get()    caller blocked",
  "caller <- result",
  "caller -> agent.step()     ...and again",
];

const FLOW_ED = [
  "TASK         -> whoever advertises the capability",
  "RECALL       -> whoever hosts the memory",
  "TOOL_CALL    -> whoever hosts the tool",
  "AGENT_OUTPUT -> whoever cared enough to subscribe",
];

export default function Paradigm() {
  const [openRow, setOpenRow] = useState<string | null>(null);

  return (
    <>
      {/* ----------------------------------------------------------- */}
      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// two shapes</div>
          <h2 className="section-title">Request/response, and the other one.</h2>
          <p className="section-sub">
            Almost every agent framework is a caller holding a loop. That is not a flaw -
            it is the right shape for a single agent doing one task. It stops being the
            right shape the moment you want two agents, shared memory, or one of them
            somewhere else.
          </p>

          <div className="yc-para-flows">
            <div className="yc-flow yc-flow-rr">
              <div className="yc-flow-head">
                <span className="yc-flow-tag yc-flow-tag-rr">request / response</span>
                <span className="yc-flow-sub">the caller owns the control flow</span>
              </div>
              <pre className="yc-flow-body">
                {FLOW_RR.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </pre>
              <p className="yc-flow-note">
                Every arrow is a function call. To find out what happened you instrument
                the stack; to move a step elsewhere you invent a transport.
              </p>
            </div>

            <div className="yc-flow yc-flow-ed">
              <div className="yc-flow-head">
                <span className="yc-flow-tag yc-flow-tag-ed">event driven</span>
                <span className="yc-flow-sub">nobody owns the control flow</span>
              </div>
              <pre className="yc-flow-body">
                {FLOW_ED.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </pre>
              <p className="yc-flow-note">
                Every arrow is a message. It is already a record, already inspectable,
                already routable to another machine.
              </p>
            </div>
          </div>

          <div className="yc-contrast">
            {CONTRASTS.map((c) => (
              <div className="yc-contrast-row" key={c.q}>
                <div className="yc-contrast-q">{c.q}</div>
                <div className="yc-contrast-a yc-contrast-rr">{c.rr}</div>
                <div className="yc-contrast-a yc-contrast-ed">{c.ed}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// what a bus actually buys</div>
          <h2 className="section-title">Three decouplings, not one.</h2>
          <p className="section-sub">
            Eugster et al. surveyed every publish/subscribe variant in existence and
            isolated what they all have in common. It is not &ldquo;messages&rdquo; - it
            is decoupling along three independent axes. A design that only gets one of
            them is not really event-driven; it is a callback.
          </p>

          <div className="yc-decoup">
            {DECOUPLINGS.map((d) => (
              <div className="yc-decoup-card" key={d.name}>
                <div className="yc-decoup-name">{d.name}</div>
                <div className="yc-decoup-gloss">{d.gloss}</div>
                <div className="yc-decoup-cosmo">{d.cosmo}</div>
              </div>
            ))}
          </div>

          <div className="yc-mech">
            <h3 className="yc-mech-title">How the bus does it</h3>
            <div className="yc-mech-grid">
              <div className="yc-mech-step">
                <span className="yc-mech-n">1</span>
                <b>One envelope.</b> Every interaction - a task, a tool call, a memory
                read, a thought, an error - is the same{" "}
                <Tip tip="Signal: type, trace_id, parent_id, directed, payload, meta. One codec, one schema, one thing to validate. The full spec is on the protocol page.">
                  <code className="inline yc-tok">Signal</code>
                </Tip>{" "}
                envelope. Not a method signature per interaction.
              </div>
              <div className="yc-mech-step">
                <span className="yc-mech-n">2</span>
                <b>One channel.</b> Signals are published to subjects on a{" "}
                <Tip tip="Synapse is an adapter, not a service you run. MemorySynapse is in-process; DevSynapse is TCP + NDJSON for a laptop; NATS and Kafka are for production. Caller-owned: built and closed outside the Dendrite.">
                  <code className="inline yc-tok">Synapse</code>
                </Tip>
                . Swap memory for NATS and the agents do not know.
              </div>
              <div className="yc-mech-step">
                <span className="yc-mech-n">3</span>
                <b>Subscribers, not callees.</b> A{" "}
                <Tip tip="A Dendrite subscribes to the signal types it has handlers for, and services RECALL / IMPRINT / TOOL_CALL for whatever is attached to it. Attaching is the whole registration API.">
                  <code className="inline yc-tok">Dendrite</code>
                </Tip>{" "}
                reacts to what it subscribed to. It is never called.
              </div>
              <div className="yc-mech-step">
                <span className="yc-mech-n">4</span>
                <b>Routing by capability.</b> Dispatch names{" "}
                <Tip tip='Capability-routed TASKs publish on a separate subject with a queue group keyed on each Dendrite&apos;s capability profile, so identical replicas load-balance and the broker delivers each TASK exactly once within the group.'>
                  <code className="inline yc-tok">what is needed</code>
                </Tip>
                , not who does it. Replicas load-balance for free.
              </div>
              <div className="yc-mech-step">
                <span className="yc-mech-n">5</span>
                <b>One trace.</b> Every Signal carries{" "}
                <Tip tip="trace_id groups a whole workflow; parent_id gives you the causal chain inside it. The demo tab is that data, replayed - which is only possible because the interactions were messages to begin with.">
                  <code className="inline yc-tok">trace_id</code>
                </Tip>{" "}
                and <code className="inline">parent_id</code>, so the workflow is
                reconstructable without instrumenting anything.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// where it leads</div>
          <h2 className="section-title">Reactive, rather than driven.</h2>
          <p className="section-sub">
            Harel and Pnueli drew the line in 1985: a transformational system computes
            an output from its inputs, a reactive one is defined by how it responds to
            events - their variety, order, timing and arrival rate. An agent loop is
            transformational. Everything below is the case that agent systems are
            reactive systems, and have been treated as such for fifty years.
          </p>

          <div className="yc-react">
            <div className="yc-react-card">
              <h4>Behaviour becomes composition</h4>
              <p>
                Adding a critic that watches every <code className="inline">AGENT_OUTPUT</code>{" "}
                is starting a process. No orchestrator learns it exists, and no existing
                node is edited. In a loop, the same change is a new branch in the loop.
              </p>
            </div>
            <div className="yc-react-card">
              <h4>Observation is free</h4>
              <p>
                The interactions are already messages, so a monitor is just another
                subscriber. This is the argument AutoGen&rsquo;s team made for their own
                rewrite: an event-driven core &ldquo;provides affordances to observe and
                control agent behavior.&rdquo;
              </p>
            </div>
            <div className="yc-react-card">
              <h4>Memory becomes a participant</h4>
              <p>
                Hearsay-II&rsquo;s knowledge sources watched a shared blackboard and acted
                when they saw something they could contribute to. A 2025 paper applies
                exactly that to LLM agents and reports competitive accuracy at lower token
                cost.
              </p>
            </div>
            <div className="yc-react-card">
              <h4>Distribution stops being a rewrite</h4>
              <p>
                If interactions are already messages on a bus, moving a node to another
                machine is a config change. If they are function calls, it is a
                re-architecture - which is why frameworks tend to add a transport later
                and call it deployment.
              </p>
            </div>
          </div>

          <div className="yc-papers">
            <div className="yc-papers-head">
              <h3 className="yc-mech-title">The reading</h3>
              <span className="yc-papers-count">
                {PAPER_GROUPS.reduce((n, g) => n + g.papers.length, 0)} sources,
                1973 - 2026
              </span>
            </div>

            {PAPER_GROUPS.map((g) => (
              <div className="yc-pgroup" key={g.group}>
                <div className="yc-pgroup-head">
                  <span className="yc-pgroup-name">{g.group}</span>
                  <span className="yc-pgroup-n">{g.papers.length}</span>
                </div>
                <p className="yc-pgroup-blurb">{g.blurb}</p>
                <div className="yc-pgroup-list">
                  {g.papers.map((p) => (
                    <a
                      className="yc-paper"
                      key={p.url}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="yc-paper-top">
                        <span className="yc-paper-title">{p.title}</span>
                        <span className="yc-paper-venue">{p.venue}</span>
                      </div>
                      <div className="yc-paper-cite">{p.cite}</div>
                      <div className="yc-paper-why">{p.why}</div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// honestly compared</div>
          <h2 className="section-title">Where everyone actually sits.</h2>
          <p className="section-sub">
            Cosmonapse is not the only event-driven design here, and pretending otherwise
            would be the fastest way to lose an argument with someone who has read the
            docs. AutoGen v0.4 is a genuine actor system. CrewAI Flows are event-driven
            in style. The distinction worth drawing is narrower: whether the decoupling
            reaches the wire, or stops at the process boundary. Click a row.
          </p>

          <div className="yc-table">
            <div className="yc-table-head">
              <span>Framework</span>
              <span>Execution model</span>
              <span>Across processes</span>
            </div>
            {COMPARISON.map((r) => (
              <div key={r.name} className={r.self ? "yc-trow yc-trow-self" : "yc-trow"}>
                <button
                  className="yc-trow-btn"
                  onClick={() => setOpenRow(openRow === r.name ? null : r.name)}
                  aria-expanded={openRow === r.name}
                >
                  <span className="yc-tname">
                    {r.name}
                    {r.self && <em className="yc-tself">this one</em>}
                  </span>
                  <span className="yc-tmodel">{r.model}</span>
                  <span className={`yc-tacross yc-tacross-${r.across}`}>
                    {r.across === "yes" ? "yes" : r.across === "partial" ? "partly" : "no"}
                  </span>
                </button>
                {openRow === r.name && (
                  <div className="yc-tdetail">
                    <div>
                      <b>What drives a step</b>
                      <p>{r.drives}</p>
                    </div>
                    <div>
                      <b>Across processes</b>
                      <p>{r.acrossNote}</p>
                    </div>
                    <a
                      href={r.src}
                      target={r.src.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="yc-tsrc"
                    >
                      source
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="yc-fair">
            <b>Where a graph is the better answer.</b> If your workflow is known in
            advance and you want deterministic replay, LangGraph&rsquo;s BSP supersteps
            give you a barrier and a checkpoint at every step - stronger consistency
            guarantees than a bus, on purpose. If you want one agent with tools and no
            distribution story, a runner loop is less machinery than a protocol. A bus
            earns its keep when participants outnumber the workflow you can draw.
          </div>
        </div>
      </section>
    </>
  );
}
