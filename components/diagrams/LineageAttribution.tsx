import { Figure, Note, Tag } from "./Fig";

/** One trace, two workers. Order alone would credit the wrong one. */
const MARKS: { x: number; label: string; lane: 0 | 1 }[] = [
  { x: 140, label: "TASK", lane: 0 },
  { x: 300, label: "TOOL_CALL", lane: 0 },
  { x: 452, label: "TASK", lane: 1 },
  { x: 604, label: "AGENT_OUTPUT", lane: 1 },
  { x: 756, label: "FINAL", lane: 1 },
];

export default function LineageAttribution() {
  return (
    <Figure
      width={900}
      height={310}
      title="A single trace line carrying five Signals in order: TASK, TOOL_CALL, a second TASK, AGENT_OUTPUT and FINAL. Dotted lines drop each Signal into one of two lanes below, labelled intake and specialist, according to its nearest TASK ancestor."
      caption="A capability-routed run lives on one trace, so ordering alone would credit whoever spoke first with all of it. Each Signal is attributed to the worker of its nearest TASK ancestor instead - which is what makes a handoff read correctly."
    >
      <Tag x={60} y={44} anchor="start" tone="accent2">
        one trace_id
      </Tag>
      <line x1={60} y1={72} x2={840} y2={72} className="fig-hair" />

      {MARKS.map((m) => (
        <g key={m.label + m.x} className="t-accent2">
          <circle cx={m.x} cy={72} r={6} className="fig-fill" />
          <text className="fig-sub" x={m.x} y={56} textAnchor="middle">
            {m.label}
          </text>
          <line
            x1={m.x}
            y1={80}
            x2={m.x}
            y2={m.lane === 0 ? 158 : 226}
            className="fig-hair fig-dash"
          />
        </g>
      ))}

      <g className="t-accent">
        <rect x={60} y={158} width={330} height={46} rx={10} className="fig-box" />
        <text className="fig-title" x={80} y={186} textAnchor="start">
          intake
        </text>
      </g>
      <g className="t-accent">
        <rect x={396} y={226} width={444} height={46} rx={10} className="fig-box" />
        <text className="fig-title" x={416} y={254} textAnchor="start">
          specialist
        </text>
      </g>

      <Note x={450} y={298}>
        the handoff is the second TASK - everything after it belongs to whoever took it
      </Note>
    </Figure>
  );
}
