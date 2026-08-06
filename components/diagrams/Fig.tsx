/**
 * The drawing kit every figure on the site is built from.
 *
 * Three rules hold across all of it:
 *
 *   - Colour is never a literal. A group carries a tone class and the
 *     shapes inside read `--fig-c` / `--fig-wash` from it, so a figure
 *     flips with the theme along with the rest of the page.
 *   - Arrowheads are polygons, not <marker>s. A marker is resolved in the
 *     document rather than in the group referencing it, so a shared marker
 *     id would take its colour from whichever figure rendered first.
 *   - Everything is a server component. A diagram that needs JavaScript to
 *     appear is a diagram that is missing when someone reads with it off.
 *
 * See the `.figure` block in globals.css for the tokens these classes use.
 */

import type { CSSProperties, ReactNode } from "react";

export type Tone = "neutral" | "accent" | "accent2" | "accent3" | "engram" | "muted";

/** The silhouette a participant wears everywhere in the suite. */
export type Kind = "neuron" | "engram" | "effector" | "receptor";

const KIND_TONE: Record<Kind, Tone> = {
  neuron: "accent",
  engram: "engram",
  effector: "accent3",
  receptor: "accent2",
};

export function Figure({
  title,
  caption,
  width,
  height,
  children,
}: {
  /** Read in place of the drawing by a screen reader. */
  title: string;
  caption: string;
  width: number;
  height: number;
  children: ReactNode;
}) {
  return (
    <figure className="figure">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <title>{title}</title>
        {children}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** Wraps children in a tone, so one colour decision covers a whole cluster. */
export function Toned({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <g className={`t-${tone}`}>{children}</g>;
}

/* ─────────────────────────────── boxes ─────────────────────────────── */

export function Box({
  x,
  y,
  w = 150,
  h = 54,
  label,
  sub,
  tone = "neutral",
  plain,
  mono,
}: {
  /** Centre of the box. */
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  tone?: Tone;
  /** Card surface instead of a tone wash - for things that are not participants. */
  plain?: boolean;
  /** Monospace label, for anything that is literally a string in the source. */
  mono?: boolean;
}) {
  return (
    <g className={`t-${tone}`} transform={`translate(${x},${y})`}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={10}
        className={plain ? "fig-plain" : "fig-box"}
      />
      <text className={mono ? "fig-tag" : "fig-title"} textAnchor="middle" y={sub ? -1 : 5}>
        {label}
      </text>
      {sub && (
        <text className="fig-sub" textAnchor="middle" y={16}>
          {sub}
        </text>
      )}
    </g>
  );
}

/** The Synapse, drawn flat: one shared medium with participants tapping it. */
export function Bus({
  y,
  x0,
  x1,
  label,
  tone = "accent2",
}: {
  y: number;
  x0: number;
  x1: number;
  label?: string;
  tone?: Tone;
}) {
  const H = 13;
  return (
    <g className={`t-${tone}`}>
      <rect x={x0} y={y - H / 2} width={x1 - x0} height={H} rx={H / 2} className="fig-box" />
      {label && (
        <text className="fig-tag" x={x0} y={y - H} dominantBaseline="auto">
          {label}
        </text>
      )}
    </g>
  );
}

/* ────────────────────────────── silhouettes ────────────────────────── */

const R = 17;

function shape(kind: Kind) {
  switch (kind) {
    case "engram": {
      const D = R * 1.15;
      return <polygon points={`0,${-D} ${D},0 0,${D} ${-D},0`} className="fig-hollow" />;
    }
    case "effector": {
      const r = R * 1.15;
      const dx = r * 0.8660254;
      const dy = r * 0.5;
      return <polygon points={`0,${-r} ${dx},${dy} ${-dx},${dy}`} className="fig-hollow" />;
    }
    case "receptor": {
      // A bowl - the lower half-annulus - with its mouth opening away from
      // the bus. The one open outline in the set, because a Receptor is the
      // only primitive that faces outward.
      const r = R * 1.15;
      const i = r * 0.62;
      return (
        <path
          d={`M ${-r},0 A ${r},${r} 0 0 0 ${r},0 L ${i},0 A ${i},${i} 0 0 1 ${-i},0 Z`}
          className="fig-hollow"
        />
      );
    }
    default:
      return <circle r={R} className="fig-hollow" />;
  }
}

/**
 * Where a silhouette hangs its caption. A triangle's ink stops well above a
 * circle's, but a row of participants has to share a caption baseline, so an
 * Effector is measured as if it were as deep as a Neuron.
 */
const REACH: Record<Kind, number> = {
  neuron: R,
  engram: R * 1.15,
  effector: R,
  receptor: R * 1.15,
};

export function Primitive({
  x,
  y,
  kind,
  label,
  sub,
  above,
}: {
  x: number;
  y: number;
  kind: Kind;
  label: string;
  sub?: string;
  /** Caption above the shape - for anything sitting over the bus. */
  above?: boolean;
}) {
  const reach = REACH[kind];
  const top = kind === "receptor" ? 4 : reach;
  return (
    <g className={`t-${KIND_TONE[kind]}`} transform={`translate(${x},${y})`}>
      {shape(kind)}
      <text
        className="fig-title"
        textAnchor="middle"
        y={above ? -(top + 20) : reach + 19}
      >
        {label}
      </text>
      {sub && (
        <text className="fig-tag" textAnchor="middle" y={above ? -(top + 6) : reach + 33}>
          {sub}
        </text>
      )}
    </g>
  );
}

/* ─────────────────────────────── edges ─────────────────────────────── */

const HEAD_L = 9;
const HEAD_W = 5;

function head(x: number, y: number, ux: number, uy: number) {
  const bx = x - ux * HEAD_L;
  const by = y - uy * HEAD_L;
  const px = -uy;
  const py = ux;
  return (
    <polygon
      className="fig-fill"
      points={`${x},${y} ${bx + px * HEAD_W},${by + py * HEAD_W} ${bx - px * HEAD_W},${by - py * HEAD_W}`}
    />
  );
}

export function Edge({
  x1,
  y1,
  x2,
  y2,
  tone = "neutral",
  dashed,
  arrow = "end",
  label,
  labelDx = 0,
  labelDy = -8,
  labelAnchor = "middle",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone?: Tone;
  dashed?: boolean;
  arrow?: "end" | "start" | "both" | "none";
  label?: string;
  labelDx?: number;
  labelDy?: number;
  labelAnchor?: "start" | "middle" | "end";
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const endArrow = arrow === "end" || arrow === "both";
  const startArrow = arrow === "start" || arrow === "both";
  // Stop the stroke at the base of each head so it does not show through it.
  const sx = startArrow ? x1 + ux * HEAD_L : x1;
  const sy = startArrow ? y1 + uy * HEAD_L : y1;
  const ex = endArrow ? x2 - ux * HEAD_L : x2;
  const ey = endArrow ? y2 - uy * HEAD_L : y2;
  return (
    <g className={`t-${tone}`}>
      <line x1={sx} y1={sy} x2={ex} y2={ey} className={`fig-line${dashed ? " fig-dash" : ""}`} />
      {endArrow && head(x2, y2, ux, uy)}
      {startArrow && head(x1, y1, -ux, -uy)}
      {label && (
        <text
          className="fig-tag"
          x={(x1 + x2) / 2 + labelDx}
          y={(y1 + y2) / 2 + labelDy}
          textAnchor={labelAnchor}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** An L-shaped edge: out along one axis, then along the other. */
export function Elbow({
  x1,
  y1,
  x2,
  y2,
  via = "v",
  tone = "neutral",
  dashed,
  arrow = "end",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** "v" leaves vertically first, "h" horizontally. */
  via?: "v" | "h";
  tone?: Tone;
  dashed?: boolean;
  arrow?: "end" | "none";
}) {
  const cx = via === "v" ? x1 : x2;
  const cy = via === "v" ? y2 : y1;
  const ux = Math.sign(x2 - cx);
  const uy = Math.sign(y2 - cy);
  const ex = arrow === "end" ? x2 - ux * HEAD_L : x2;
  const ey = arrow === "end" ? y2 - uy * HEAD_L : y2;
  return (
    <g className={`t-${tone}`}>
      <path
        d={`M${x1} ${y1} L${cx} ${cy} L${ex} ${ey}`}
        className={`fig-line${dashed ? " fig-dash" : ""}`}
      />
      {arrow === "end" && head(x2, y2, ux, uy)}
    </g>
  );
}

/* ─────────────────────────────── captions ──────────────────────────── */

export function Note({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text className="fig-note" x={x} y={y} textAnchor={anchor}>
      {children}
    </text>
  );
}

/** A small monospace label, coloured by the tone it sits in. */
export function Tag({
  x,
  y,
  children,
  anchor = "middle",
  tone = "neutral",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  tone?: Tone;
}) {
  return (
    <g className={`t-${tone}`}>
      <text className="fig-tag" x={x} y={y} textAnchor={anchor}>
        {children}
      </text>
    </g>
  );
}

/* ─────────────────────────────── motion ────────────────────────────── */

/** An orthogonal route: node, junction on the bus, junction, node. */
export type Route = [number, number][];

/**
 * A Signal travelling a route.
 *
 * The route is handed to CSS as `--x0/--y0 …` rather than compiled into
 * per-figure keyframes, so the three generic animations in globals.css
 * cover every path on the site. Up to four points; anything longer is a
 * sign the figure is trying to say two things at once.
 *
 * The start point is also written as a plain transform, so under
 * prefers-reduced-motion the spark simply rests at the beginning of its
 * route instead of collapsing to the origin.
 */
export function Spark({
  route,
  dur = 4.5,
  delay = 0,
  tone = "accent2",
  r = 3.4,
}: {
  route: Route;
  dur?: number;
  delay?: number;
  tone?: Tone;
  r?: number;
}) {
  const pts = route.slice(0, 4);
  const name = pts.length >= 4 ? "fig-run4" : pts.length === 3 ? "fig-run3" : "fig-run2";
  const vars: Record<string, string> = {};
  pts.forEach(([x, y], i) => {
    vars[`--x${i}`] = `${x}px`;
    vars[`--y${i}`] = `${y}px`;
  });
  const style = {
    ...vars,
    transform: `translate(${pts[0][0]}px, ${pts[0][1]}px)`,
    animationName: name,
    animationDuration: `${dur}s`,
    animationDelay: `${delay}s`,
  } as CSSProperties;
  return (
    <g className={`t-${tone}`}>
      <circle className="fig-spark-halo" r={r * 2.7} style={style} />
      <circle className="fig-spark" r={r} style={style} />
    </g>
  );
}

/** A node acknowledging that something arrived. */
export function Pulse({
  x,
  y,
  r = 24,
  dur = 4.5,
  delay = 0,
  tone = "accent2",
}: {
  x: number;
  y: number;
  r?: number;
  dur?: number;
  delay?: number;
  tone?: Tone;
}) {
  return (
    <g className={`t-${tone}`} transform={`translate(${x},${y})`}>
      <circle
        className="fig-halo"
        r={r}
        style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
      />
    </g>
  );
}
