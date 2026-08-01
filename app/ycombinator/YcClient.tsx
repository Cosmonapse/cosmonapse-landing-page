"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COLD, NODES, SIG_TONE, WARM, type NodeId, type Run, type Sig } from "./trace";
import {
  AXON_CODE,
  BRAIN_CODE,
  EFFECTOR_CODE,
  ENGRAM_CODE,
  NEURON_CODE,
  type Line,
  type Part,
} from "./code";
import Paradigm from "./Paradigm";

// ---------------------------------------------------------------------------
// Tooltip - one hoverable token. Pure CSS reveal; `below` flips it under the
// token on the top rows so it never leaves the card.
// ---------------------------------------------------------------------------
function Tip({
  children,
  tip,
  below,
}: {
  children: React.ReactNode;
  tip: string;
  below?: boolean;
}) {
  return (
    <span className="yc-tip" tabIndex={0}>
      {children}
      <span className={below ? "yc-tipbox yc-tipbox-below" : "yc-tipbox"} role="tooltip">
        {tip}
      </span>
    </span>
  );
}

function CodeBlock({ lines, title, sub }: { lines: Line[]; title: string; sub: string }) {
  return (
    <div className="yc-codecard">
      <div className="yc-codehead">
        <span className="yc-codetitle">{title}</span>
        <span className="yc-codesub">{sub}</span>
      </div>
      <pre className="yc-pre">
        {lines.map((line, i) => (
          <div className="yc-line" key={i}>
            {line.length === 0 ? (
              <>&nbsp;</>
            ) : (
              line.map((part: Part, j) => {
                if (typeof part === "string") return <span key={j}>{part}</span>;
                if (!part.tip) {
                  return (
                    <span className={part.cls} key={j}>
                      {part.t}
                    </span>
                  );
                }
                return (
                  <Tip key={j} tip={part.tip} below={i < 3}>
                    <span className={part.cls ? `${part.cls} yc-tok` : "yc-tok"}>
                      {part.t}
                    </span>
                  </Tip>
                );
              })
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}

const SPEEDS = [
  { label: "0.5x", ms: 1500 },
  { label: "1x", ms: 800 },
  { label: "2x", ms: 380 },
];

export default function YcClient() {
  const [tab, setTab] = useState<"demo" | "why">("demo");
  const [runId, setRunId] = useState<"cold" | "warm">("cold");
  const [step, setStep] = useState(0); // how many Signals have fired
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [learned, setLearned] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const run: Run = runId === "cold" ? COLD : WARM;
  const total = run.signals.length;
  const done = step >= total;

  useEffect(() => {
    if (!playing || done) return;
    const t = setTimeout(() => setStep((s) => s + 1), SPEEDS[speed].ms);
    return () => clearTimeout(t);
  }, [playing, step, done, speed]);

  useEffect(() => {
    if (done) {
      setPlaying(false);
      if (runId === "cold") setLearned(true);
    }
  }, [done, runId]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [step]);

  const select = useCallback((id: "cold" | "warm") => {
    setRunId(id);
    setStep(0);
    setHover(null);
    setPlaying(true);
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setPlaying(false);
    setHover(null);
  }, []);

  const activeIdx = hover !== null ? hover : step - 1;
  const active: Sig | null =
    activeIdx >= 0 && activeIdx < total ? run.signals[activeIdx] : null;

  const touched = useMemo(() => {
    const seen = new Set<NodeId>();
    run.signals.slice(0, step).forEach((s) => {
      seen.add(s.from);
      seen.add(s.to);
    });
    return seen;
  }, [run, step]);

  const termLines = useMemo(() => {
    const out: string[] = [];
    run.signals.slice(0, step).forEach((s) => {
      if (s.term) out.push(...s.term);
    });
    return out;
  }, [run, step]);

  const counts = useMemo(() => {
    let tools = 0;
    let mem = 0;
    run.signals.slice(0, step).forEach((s) => {
      const n = s.times ?? 1;
      if (s.type === "TOOL_CALL") tools += n;
      if (s.type === "IMPRINT" || s.type === "RECALL") mem += n;
    });
    return { tools, mem };
  }, [run, step]);

  const edgeOf = (s: Sig | null): string | null => {
    if (!s) return null;
    if (s.from === "rag" && s.to === "engram") return "mem";
    if (s.from === "engram" && s.to === "rag") return "mem";
    if (s.from === "rag" && s.to === "web") return "web";
    if (s.from === "web" && s.to === "rag") return "web";
    return "cli";
  };
  const edge = edgeOf(active);

  const nodeClass = (id: NodeId) => {
    const cls = ["yc-node"];
    if (!touched.has(id)) cls.push("yc-node-dark");
    if (active && (active.from === id || active.to === id)) cls.push("yc-node-live");
    return cls.join(" ");
  };

  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// The smallest useful agent</div>
          <h1 className="page-title">One Neuron. One Engram. One Effector.</h1>
          <p className="page-sub">
            A RAG that goes and gets what it does not know. Below is a real run of{" "}
            <code className="inline">cosmonapse-examples/16-rag-cli</code>, replayed
            Signal by Signal - then the code that produced it, with every primitive
            annotated. Hover anything.
          </p>
        </div>
      </header>

      <div className="container">
        <div className="yc-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "demo"}
            className={tab === "demo" ? "yc-tab yc-tab-on" : "yc-tab"}
            onClick={() => setTab("demo")}
          >
            Watch it run
            <span className="yc-tab-sub">a real trace, Signal by Signal</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === "why"}
            className={tab === "why" ? "yc-tab yc-tab-on" : "yc-tab"}
            onClick={() => setTab("why")}
          >
            Why event-driven
            <span className="yc-tab-sub">the paradigm, the papers, the alternatives</span>
          </button>
        </div>
      </div>

      {tab === "why" && <Paradigm />}

      {tab === "demo" && (
      <>
      <section className="section-sm">
        <div className="container">
          <div className="yc-asks">
            <button
              className={runId === "cold" ? "yc-ask yc-ask-on" : "yc-ask"}
              onClick={() => select("cold")}
            >
              <span className="yc-ask-q">? {COLD.question}</span>
              <span className="yc-ask-tag">cold index</span>
            </button>
            <button
              className={`yc-ask${runId === "warm" ? " yc-ask-on" : ""}${
                learned ? "" : " yc-ask-locked"
              }`}
              onClick={() => {
                if (learned) select("warm");
              }}
              disabled={!learned}
            >
              <span className="yc-ask-q">? {WARM.question}</span>
              <span className="yc-ask-tag">
                {learned ? "warm index" : "locked until the index has something in it"}
              </span>
            </button>
          </div>

          <div className="yc-stage">
            <div className="yc-topo">
              <div className="yc-topo-head">
                <span>3 Dendrites, 1 Synapse</span>
                <span className="yc-topo-ns">namespace: rag-cli</span>
              </div>

              <div className="yc-topo-body">
                <div className="yc-node-topwrap">
                  <Tip tip={NODES.rag.tip} below>
                    <div className={`${nodeClass("rag")} yc-node-top`}>
                      <span className="yc-node-name">{NODES.rag.name}</span>
                      <span className="yc-node-role">{NODES.rag.role}</span>
                      <span className="yc-node-hosts">{NODES.rag.hosts}</span>
                    </div>
                  </Tip>
                </div>

                <div className="yc-wires">
                  <div className={`yc-wire yc-wire-l${edge === "mem" ? " yc-wire-live" : ""}`}>
                    <span className="yc-wire-label">
                      {edge === "mem" ? active?.type : "RECALL / IMPRINT"}
                    </span>
                  </div>
                  <div className={`yc-wire yc-wire-r${edge === "web" ? " yc-wire-live" : ""}`}>
                    <span className="yc-wire-label">
                      {edge === "web" ? active?.type : "TOOL_CALL"}
                    </span>
                  </div>
                </div>

                <div className="yc-node-row">
                  <Tip tip={NODES.engram.tip}>
                    <div className={nodeClass("engram")}>
                      <span className="yc-node-name">{NODES.engram.name}</span>
                      <span className="yc-node-role">{NODES.engram.role}</span>
                      <span className="yc-node-hosts">{NODES.engram.hosts}</span>
                    </div>
                  </Tip>
                  <Tip tip={NODES.web.tip}>
                    <div className={nodeClass("web")}>
                      <span className="yc-node-name">{NODES.web.name}</span>
                      <span className="yc-node-role">{NODES.web.role}</span>
                      <span className="yc-node-hosts">{NODES.web.hosts}</span>
                    </div>
                  </Tip>
                </div>
              </div>

              <div className="yc-meter">
                <span>
                  <b>{Math.min(step, total)}</b>/{total} Signals
                </span>
                <span>
                  <b>{counts.tools}</b> tool calls
                </span>
                <span>
                  <b>{counts.mem}</b> memory ops
                </span>
              </div>

              <div className="yc-transport">
                <button
                  className="yc-btn yc-btn-primary"
                  onClick={() => {
                    if (done) {
                      setStep(0);
                      setPlaying(true);
                    } else {
                      setPlaying(!playing);
                    }
                  }}
                >
                  {done ? "Replay" : playing ? "Pause" : "Play"}
                </button>
                <button
                  className="yc-btn"
                  onClick={() => {
                    setPlaying(false);
                    setStep((s) => Math.min(s + 1, total));
                  }}
                  disabled={done}
                >
                  Step
                </button>
                <button className="yc-btn" onClick={reset}>
                  Reset
                </button>
                <div className="yc-speeds">
                  {SPEEDS.map((s, i) => (
                    <button
                      key={s.label}
                      className={i === speed ? "yc-speed yc-speed-on" : "yc-speed"}
                      onClick={() => setSpeed(i)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="yc-log">
              <div className="yc-log-head">
                <span>cosmo prism --tail -n rag-cli</span>
                <span className="yc-log-hint">hover a Signal</span>
              </div>
              <div className="yc-log-body" ref={logRef}>
                {run.signals.slice(0, step).map((s, i) => (
                  <div
                    key={i}
                    className={`yc-sig yc-sig-${SIG_TONE[s.type] ?? "task"}${
                      hover === i ? " yc-sig-hot" : ""
                    }`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="yc-sig-type">
                      {s.type}
                      {s.times ? <em className="yc-sig-x">x{s.times}</em> : null}
                    </span>
                    <span className="yc-sig-path">
                      {s.from} <span className="yc-sig-arrow">-&gt;</span> {s.to}
                    </span>
                    <span className="yc-sig-label">{s.label}</span>
                  </div>
                ))}
                {step === 0 && (
                  <div className="yc-log-empty">
                    Press Play. Every line that appears is one Signal that actually
                    crossed the bus.
                  </div>
                )}
              </div>
              <div className="yc-detail">
                {active ? (
                  <>
                    <span className="yc-detail-type">{active.type}</span>
                    <span>{active.detail}</span>
                  </>
                ) : (
                  <span className="yc-detail-idle">
                    The trace is 17 Signals cold, 5 warm. That difference is the whole
                    demo.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="yc-term">
            <div className="yc-term-head">
              <span className="yc-dot" />
              <span className="yc-dot" />
              <span className="yc-dot" />
              <span className="yc-term-title">python cli.py</span>
            </div>
            <pre className="yc-term-body">
              {termLines.length === 0 ? (
                <span className="yc-term-idle">waiting...</span>
              ) : (
                termLines.map((l, i) => (
                  <div key={i} className={l.startsWith("?") ? "yc-term-q" : "yc-term-l"}>
                    {l}
                  </div>
                ))
              )}
              {done && (
                <>
                  <div className="yc-term-answer">
                    <span className="yc-term-strong">answer</span>{" "}
                    <span
                      className={
                        run.source === "memory"
                          ? "yc-badge yc-badge-mem"
                          : "yc-badge yc-badge-web"
                      }
                    >
                      {run.source}
                    </span>{" "}
                    <span className="yc-term-dim">
                      {run.elapsed}
                      {run.source === "web" ? ", 24 chunks indexed from 3 pages" : ""}
                    </span>
                  </div>
                  {run.answer.map((l, i) => (
                    <div key={i} className="yc-term-l">
                      {l}
                    </div>
                  ))}
                  <div className="yc-term-sources">sources</div>
                  {run.sources.map((s) => (
                    <div key={s.n} className="yc-term-src">
                      [{s.n}] {s.title}
                      <br />
                      <span className="yc-term-url">{`    ${s.url}`}</span>{" "}
                      <span className="yc-term-dim">(bm25 {s.score})</span>
                    </div>
                  ))}
                </>
              )}
            </pre>
          </div>

          {done && runId === "cold" && (
            <div className="yc-nudge">
              It knew nothing, so it went and found out - and kept what it read. Now ask
              the second question and watch <b>web-node stay dark</b>.
            </div>
          )}
          {done && runId === "warm" && (
            <div className="yc-nudge yc-nudge-warm">
              Four Signals. Same code path, same recall, no network - the index answered
              it. That decision is two numbers in{" "}
              <code className="inline">config.py</code>.
            </div>
          )}
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// the code that did that</div>
          <h2 className="section-title">
            Every primitive is a decorated reaction to a Signal.
          </h2>
          <p className="section-sub">
            Every underlined token is hoverable. This is the whole system - not an
            excerpt chosen to look small.
          </p>

          <div className="yc-symmetry">
            <div className="yc-sym-head">
              <span>side</span>
              <span>does the work</span>
              <span>watches it happen</span>
            </div>
            <div className="yc-sym-row">
              <span className="yc-sym-name">agent</span>
              <code className="inline">@AXON.before_task</code>
              <code className="inline">@AXON.host.on_agent_output</code>
            </div>
            <div className="yc-sym-row">
              <span className="yc-sym-name">memory</span>
              <code className="inline">@ENGRAM.on_recall</code>
              <code className="inline">@ENGRAM.host.on_recalled</code>
            </div>
            <div className="yc-sym-row">
              <span className="yc-sym-name">action</span>
              <code className="inline">@EFFECTOR.on_tool_call</code>
              <code className="inline">@EFFECTOR.host.on_final</code>
            </div>
            <p className="yc-sym-note">
              The left column runs <em>inside</em> the request and its return
              value becomes the reply. The right column fires after the reply is
              already on the wire - it can observe, count and annotate, but it
              cannot answer. Confusing the two is how you write to a store twice.
            </p>
          </div>

          <div className="yc-codegrid">
            <CodeBlock
              lines={NEURON_CODE}
              title="neurons/rag.py"
              sub="the Neuron - a stock model + three decorators"
            />
            <CodeBlock
              lines={AXON_CODE}
              title="neurons/rag.py"
              sub="the declaration - what it may touch"
            />
            <CodeBlock
              lines={ENGRAM_CODE}
              title="engram/web_memory.py"
              sub="the Engram - Engram.serve()"
            />
            <CodeBlock
              lines={EFFECTOR_CODE}
              title="effector/web.py"
              sub="the Effector - Effector.serve()"
            />
            <CodeBlock
              lines={BRAIN_CODE}
              title="brain.py"
              sub="the wiring - three Dendrites"
            />
          </div>

          <div className="yc-close">
            <div className="yc-close-l">
              <h3>Same three primitives, an order of magnitude more system.</h3>
              <p>
                <code className="inline">15-claude-harness</code> is a claude-code-style
                coding agent: 3 Neurons, 4 Effectors, 1 Engram, model-driven tool calls,
                and a compaction chain. Same file layout. Still no agent loop anywhere.
              </p>
            </div>
            <div className="yc-close-r">
              <a className="btn btn-primary" href="/examples">
                All examples
              </a>
              <a className="btn btn-ghost" href="/core/quickstart">
                Quickstart
              </a>
            </div>
          </div>
        </div>
      </section>
      </>
      )}
    </>
  );
}
