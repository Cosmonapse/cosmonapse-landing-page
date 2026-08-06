import { Edge, Figure, Note, Tag } from "./Fig";

const PARTS: { y: number; band: string; tone: string; title: string; sub: string }[] = [
  {
    y: 92,
    band: "declaration",
    tone: "t-accent",
    title: "rendered as a form",
    sub: "one field per constructor keyword",
  },
  {
    y: 166,
    band: "behaviours",
    tone: "t-accent3",
    title: "rendered as code boxes",
    sub: "grouped by the protocol they serve",
  },
  {
    y: 240,
    band: "everything else",
    tone: "t-muted",
    title: "shown verbatim",
    sub: "nothing is silently dropped",
  },
];

/** What Genesis models, what it edits, and what it refuses to touch. */
export default function ModuleInThreeParts() {
  return (
    <Figure
      width={900}
      height={320}
      title="A source file, neurons slash planner dot py, split into three horizontal bands: declaration, behaviours, and everything else. Each band points right to what Genesis does with it - a form, editable code boxes, and content shown verbatim."
      caption="Genesis reads a component module as three parts and edits only the two it models. Anything it does not understand is handed back exactly as written rather than reformatted or dropped."
    >
      <rect x={48} y={52} width={310} height={228} rx={12} className="fig-plain" />
      <Tag x={68} y={42} anchor="start" tone="accent3">
        neurons/planner.py
      </Tag>

      {PARTS.map((p) => (
        <g key={p.band} className={p.tone}>
          <rect x={68} y={p.y - 24} width={270} height={48} rx={8} className="fig-box" />
          <text className="fig-tag" x={88} y={p.y + 4} textAnchor="start">
            {p.band}
          </text>
        </g>
      ))}

      {PARTS.map((p) => (
        <Edge
          key={p.band}
          x1={372}
          y1={p.y}
          x2={512}
          y2={p.y}
          tone={p.tone === "t-accent" ? "accent" : p.tone === "t-accent3" ? "accent3" : "muted"}
        />
      ))}

      {PARTS.map((p) => (
        <g key={p.band}>
          <text className="fig-title" x={528} y={p.y - 2} textAnchor="start">
            {p.title}
          </text>
          <text className="fig-sub" x={528} y={p.y + 16} textAnchor="start">
            {p.sub}
          </text>
        </g>
      ))}

      <Note x={450} y={306}>
        every structured edit posts to the server and gets the re-read model back
      </Note>
    </Figure>
  );
}
