import { Edge, Figure, Note, Tag } from "./Fig";

const FIELDS: { name: string; note: string; lineage?: boolean }[] = [
  { name: "v", note: "envelope version" },
  { name: "id", note: "this Signal", lineage: true },
  { name: "trace_id", note: "the run it belongs to", lineage: true },
  { name: "parent_id", note: "what caused it", lineage: true },
  { name: "type", note: "TASK · TOOL_CALL · FINAL …" },
  { name: "directed", note: "who it is addressed to" },
  { name: "payload · meta", note: "the content, and everything else" },
];

/**
 * Why tracing costs nothing here: three of the nine fields are lineage, and
 * they are in the envelope whether or not anybody intends to look at them.
 */
export default function EnvelopeAnatomy() {
  const top = 58;
  const row = 30;
  return (
    <Figure
      width={900}
      height={330}
      title="The Signal envelope drawn as a card listing its fields: v, id, trace_id, parent_id, type, directed, payload and meta. The id, trace_id and parent_id fields are highlighted and point to a small causal tree of Signals on the right."
      caption="Three of the envelope's fields are lineage, and they are filled in whether or not anyone intends to look at them. The causal tree on the right is read out of them - not reconstructed by a tracing library."
    >
      <rect x={48} y={34} width={430} height={252} rx={12} className="fig-plain" />
      <Tag x={68} y={24} anchor="start" tone="accent2">
        one Signal envelope
      </Tag>

      {FIELDS.map((f, i) => {
        const y = top + i * row;
        return (
          <g key={f.name} className={f.lineage ? "t-accent2" : "t-neutral"}>
            {f.lineage && <rect x={60} y={y - 15} width={406} height={24} rx={6} className="fig-box" />}
            <text className="fig-tag" x={76} y={y + 2} textAnchor="start">
              {f.name}
            </text>
            <text className="fig-sub" x={250} y={y + 2} textAnchor="start">
              {f.note}
            </text>
          </g>
        );
      })}

      {/* the tree those three fields already describe */}
      <Edge x1={486} y1={118} x2={556} y2={118} tone="accent2" />

      <g className="t-accent2">
        <circle cx={640} cy={70} r={7} className="fig-fill" />
        <circle cx={716} cy={140} r={7} className="fig-fill" />
        <circle cx={716} cy={206} r={7} className="fig-fill" />
        <circle cx={800} cy={140} r={7} className="fig-fill" />
        <path d="M640 77 L640 140 L709 140" className="fig-line" />
        <path d="M640 140 L640 206 L709 206" className="fig-line" />
        <path d="M723 140 L793 140" className="fig-line" />
      </g>
      <text className="fig-sub" x={654} y={62} textAnchor="start">
        TASK
      </text>
      <text className="fig-sub" x={716} y={126} textAnchor="middle">
        TOOL_CALL
      </text>
      <text className="fig-sub" x={812} y={144} textAnchor="start">
        RESULT
      </text>
      <text className="fig-sub" x={730} y={210} textAnchor="start">
        FINAL
      </text>

      <Note x={704} y={280}>
        you never passed a trace ID anywhere to get this
      </Note>
    </Figure>
  );
}
