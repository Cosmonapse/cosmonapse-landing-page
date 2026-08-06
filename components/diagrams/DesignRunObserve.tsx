import { Figure, Spark, Tag } from "./Fig";
import type { Kind, Tone } from "./Fig";

/**
 * The lifecycle drawn as the three things actually on your screen: the
 * Genesis canvas, a terminal running brain.py, and Prism's Brain View.
 *
 * The point of drawing the real tools rather than three labelled boxes is
 * that the same four silhouettes appear in the first panel and the third -
 * you place a shape in Genesis and watch that exact shape light up in
 * Prism, with nothing in between but your own source file running.
 *
 * The miniatures are deliberately not readable. They are there to be
 * recognised by anyone who has seen the tools, and to show the reader who
 * has not that there is something concrete on the other side of the words.
 */

const PANEL = { y: 62, w: 280, h: 200 };
const CHROME = 24;
const P1 = 18;
const P2 = 320;
const P3 = 622;

/* ── the silhouettes, at canvas-node size ─────────────────────────────── */

function Mini({ x, y, kind, r = 8 }: { x: number; y: number; kind: Kind; r?: number }) {
  const tone: Tone =
    kind === "engram" ? "engram" : kind === "effector" ? "accent3" : kind === "receptor" ? "accent2" : "accent";
  const shape =
    kind === "engram" ? (
      <polygon points={`0,${-r} ${r},0 0,${r} ${-r},0`} className="fig-hollow" />
    ) : kind === "effector" ? (
      <polygon points={`0,${-r} ${r * 0.866},${r * 0.5} ${-r * 0.866},${r * 0.5}`} className="fig-hollow" />
    ) : kind === "receptor" ? (
      <path
        d={`M ${-r},0 A ${r},${r} 0 0 0 ${r},0 L ${r * 0.62},0 A ${r * 0.62},${r * 0.62} 0 0 1 ${-r * 0.62},0 Z`}
        className="fig-hollow"
      />
    ) : (
      <circle r={r} className="fig-hollow" />
    );
  return (
    <g className={`t-${tone}`} transform={`translate(${x},${y})`}>
      {shape}
    </g>
  );
}

/** The Synapse soma, as both tools draw it: concentric rings and a nucleus. */
function Soma({ x, y }: { x: number; y: number }) {
  return (
    <g className="t-accent2" transform={`translate(${x},${y})`}>
      <circle r={17} className="fig-box" />
      <circle r={11} className="fig-line" />
      <circle r={4} className="fig-fill" />
    </g>
  );
}

/** Window chrome: a card, a tab strip, and a rule under it. */
function Panel({ x, children }: { x: number; children: React.ReactNode }) {
  return (
    <>
      <rect x={x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={10} className="fig-plain" />
      <line
        x1={x}
        y1={PANEL.y + CHROME}
        x2={x + PANEL.w}
        y2={PANEL.y + CHROME}
        className="fig-hair"
      />
      {children}
    </>
  );
}

function Station({ x, label, product, tone }: { x: number; label: string; product: string; tone: Tone }) {
  return (
    <g className={`t-${tone}`}>
      <text className="fig-title" x={x + PANEL.w / 2} y={30} textAnchor="middle">
        {label}
      </text>
      <text className="fig-tag" x={x + PANEL.w / 2} y={46} textAnchor="middle">
        {product}
      </text>
    </g>
  );
}

/* ── panel bodies ─────────────────────────────────────────────────────── */

const GENESIS_TABS = ["Canvas", "Code", "Test"];
const PRISM_TABS = ["Brain", "Tree", "Metrics"];

const TERMINAL: { text: string; cls: string }[] = [
  { text: "$ python brain.py", cls: "fig-term" },
  { text: "synapse   cosmo://127.0.0.1:7070", cls: "fig-term dim" },
  { text: "REGISTER  planner · memory · search", cls: "fig-term dim" },
  { text: "TASK      → planner", cls: "fig-term hot" },
  { text: "TOOL_CALL → search", cls: "fig-term hot" },
  { text: "FINAL     ok  1.4s", cls: "fig-term" },
];

export default function DesignRunObserve() {
  const gx = P1 + 140;
  const gy = PANEL.y + CHROME + 88;
  // Prism's canvas gives up its right edge to the signal list.
  const px = P3 + 118;
  const py = PANEL.y + CHROME + 88;

  return (
    <Figure
      width={920}
      height={342}
      title="Three windows side by side. The Genesis canvas shows a Synapse with a Neuron, an Engram, an Effector and a Receptor placed around it. A terminal runs brain.py and prints REGISTER, TASK, TOOL_CALL and FINAL lines. Prism's Brain View shows the same four components around the same Synapse with Signals travelling between them. An arrow returns from Prism back to Genesis."
      caption="The same four shapes in the first window and the third, with nothing between them but your own file running. Genesis writes the source, Core runs it, Prism watches it - and what you see sends you back to the canvas."
    >
      {/* ── Design · Genesis ───────────────────────────────────────── */}
      <Station x={P1} label="Design" product="Genesis" tone="accent3" />
      <Panel x={P1}>
        {GENESIS_TABS.map((t, i) => (
          <g key={t} className="t-accent3">
            <text className={`fig-chrome${i === 0 ? " on" : ""}`} x={P1 + 14 + i * 46} y={PANEL.y + 16}>
              {t}
            </text>
          </g>
        ))}

        <line x1={gx} y1={gy} x2={gx} y2={gy - 46} className="fig-hair" />
        <line x1={gx} y1={gy} x2={gx + 46} y2={gy} className="fig-hair" />
        <line x1={gx} y1={gy} x2={gx} y2={gy + 46} className="fig-hair" />
        <line x1={gx} y1={gy} x2={gx - 46} y2={gy} className="fig-hair" />

        <Soma x={gx} y={gy} />
        <Mini x={gx} y={gy - 52} kind="neuron" />
        <Mini x={gx + 52} y={gy} kind="engram" />
        <Mini x={gx} y={gy + 52} kind="effector" />
        <Mini x={gx - 52} y={gy} kind="receptor" />

        <g className="t-accent3">
          <rect x={P1 + 14} y={PANEL.y + PANEL.h - 30} width={72} height={18} rx={9} className="fig-box" />
          <text className="fig-chrome on" x={P1 + 24} y={PANEL.y + PANEL.h - 17}>
            + Neuron
          </text>
        </g>
        <text className="fig-chrome" x={P1 + PANEL.w - 14} y={PANEL.y + PANEL.h - 17} textAnchor="end">
          neurons/planner.py
        </text>
      </Panel>

      {/* ── Run · Core ─────────────────────────────────────────────── */}
      <Station x={P2} label="Run" product="Core" tone="accent" />
      <Panel x={P2}>
        <text className="fig-chrome" x={P2 + 14} y={PANEL.y + 16}>
          brain.py
        </text>
        <g className="t-accent">
          <circle cx={P2 + PANEL.w - 20} cy={PANEL.y + 13} r={3} className="fig-fill" />
        </g>
        {TERMINAL.map((l, i) => (
          <g key={l.text} className={i >= 3 ? "t-accent" : "t-neutral"}>
            <text
              className={`${l.cls} fig-type`}
              x={P2 + 14}
              y={PANEL.y + CHROME + 26 + i * 22}
              style={{ animationDuration: "6.4s", animationDelay: `${i * 0.42}s` }}
            >
              {l.text}
            </text>
          </g>
        ))}
        <g className="t-accent">
          <rect x={P2 + 14} y={PANEL.y + CHROME + 148} width={5} height={11} className="fig-caret" />
        </g>
      </Panel>

      {/* ── Observe · Prism ────────────────────────────────────────── */}
      <Station x={P3} label="Observe" product="Prism" tone="accent2" />
      <Panel x={P3}>
        {PRISM_TABS.map((t, i) => (
          <g key={t} className="t-accent2">
            <text className={`fig-chrome${i === 0 ? " on" : ""}`} x={P3 + 14 + i * 42} y={PANEL.y + 16}>
              {t}
            </text>
          </g>
        ))}

        <line x1={px} y1={py} x2={px} y2={py - 46} className="fig-hair" />
        <line x1={px} y1={py} x2={px + 46} y2={py} className="fig-hair" />
        <line x1={px} y1={py} x2={px} y2={py + 46} className="fig-hair" />
        <line x1={px} y1={py} x2={px - 46} y2={py} className="fig-hair" />

        <Soma x={px} y={py} />
        <Mini x={px} y={py - 52} kind="neuron" />
        <Mini x={px + 52} y={py} kind="engram" />
        <Mini x={px} y={py + 52} kind="effector" />
        <Mini x={px - 52} y={py} kind="receptor" />

        {/* the same journeys the terminal is printing */}
        <Spark route={[[px - 52, py], [px, py], [px, py - 52]]} tone="accent2" dur={6.4} delay={0.6} r={2.6} />
        <Spark route={[[px, py - 52], [px, py], [px, py + 52]]} tone="accent3" dur={6.4} delay={2.4} r={2.6} />
        <Spark route={[[px, py + 52], [px, py], [px, py - 52]]} tone="accent3" dur={6.4} delay={4.2} r={2.6} />

        {/* the signal list down the right edge */}
        <line
          x1={P3 + PANEL.w - 58}
          y1={PANEL.y + CHROME}
          x2={P3 + PANEL.w - 58}
          y2={PANEL.y + PANEL.h}
          className="fig-hair"
        />
        {["accent2", "accent", "accent3", "engram", "accent", "accent2", "accent"].map((t, i) => (
          <g key={i} className={`t-${t}`}>
            <rect
              x={P3 + PANEL.w - 50}
              y={PANEL.y + CHROME + 14 + i * 20}
              width={i % 3 === 0 ? 38 : 28}
              height={7}
              rx={3.5}
              className="fig-box"
            />
          </g>
        ))}
      </Panel>

      {/* ── the return leg ─────────────────────────────────────────── */}
      <g className="t-accent2">
        <path
          d={`M${P3 + 140} ${PANEL.y + PANEL.h} L${P3 + 140} 312 L${P1 + 140} 312 L${P1 + 140} ${PANEL.y + PANEL.h + 9}`}
          className="fig-line"
        />
        <polygon className="fig-fill" points={`${P1 + 140},${PANEL.y + PANEL.h} ${P1 + 145},${PANEL.y + PANEL.h + 14} ${P1 + 135},${PANEL.y + PANEL.h + 14}`} />
      </g>
      <Spark
        route={[[P3 + 140, PANEL.y + PANEL.h + 4], [P3 + 140, 312], [P1 + 140, 312], [P1 + 140, PANEL.y + PANEL.h + 4]]}
        tone="accent2"
        dur={6.4}
        delay={5}
        r={2.8}
      />
      <Tag x={460} y={298} tone="accent2">
        what you watch sends you back to the canvas
      </Tag>
    </Figure>
  );
}
