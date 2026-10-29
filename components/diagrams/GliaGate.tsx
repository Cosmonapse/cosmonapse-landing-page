import { Bus, Edge, Figure, Note, Primitive, Tag } from "./Fig";

/**
 * Glia as a gate on the component, not on the bus. Each participant wears
 * its own card; the arrows in and out of a participant cross that card and
 * nothing else does. The Synapse and the Dendrite are drawn without one,
 * because they have no policy role.
 */

const COLS: {
  x: number;
  kind: "neuron" | "effector" | "engram";
  label: string;
  sub: string;
  inbound: string;
  outbound: string;
}[] = [
  { x: 180, kind: "neuron", label: "research", sub: "Axon", inbound: "TASK · TOOL_RESULT · RECALLED", outbound: "AGENT_OUTPUT · TOOL_CALL · RECALL" },
  { x: 450, kind: "effector", label: "files", sub: "Effector", inbound: "TOOL_CALL", outbound: "TOOL_RESULT" },
  { x: 720, kind: "engram", label: "memory", sub: "Engram", inbound: "RECALL · IMPRINT", outbound: "RECALLED · IMPRINTED" },
];

const GATE_Y = 238;
const GATE_W = 210;
const GATE_H = 134;

export default function GliaGate() {
  return (
    <Figure
      width={900}
      height={420}
      title="A synapse bus across the top. Below it, three participants: an Axon, an Effector and an Engram. Each sits inside its own dashed frame labelled glia card. Every arrow between the bus and a participant passes through that participant's frame, one arrow inbound and one outbound."
      caption="One card per component. It reads what arrives and what leaves, both ways, and the bus between components carries no policy of its own."
    >
      <Bus y={64} x0={60} x1={840} label="Synapse" />

      {COLS.map((c) => (
        <g key={c.label}>
          <g className="t-accent">
            <rect
              x={c.x - GATE_W / 2}
              y={GATE_Y - GATE_H / 2}
              width={GATE_W}
              height={GATE_H}
              rx={14}
              className="fig-line fig-dash"
            />
          </g>
          <Tag x={c.x - GATE_W / 2 + 12} y={GATE_Y - GATE_H / 2 + 18} anchor="start" tone="accent">
            glia card
          </Tag>

          <Edge x1={c.x - 30} y1={72} x2={c.x - 30} y2={GATE_Y - GATE_H / 2} tone="neutral" />
          <Edge x1={c.x + 30} y1={GATE_Y - GATE_H / 2} x2={c.x + 30} y2={72} tone="neutral" />
          <Tag x={c.x - 38} y={124} anchor="end">in</Tag>
          <Tag x={c.x + 38} y={124} anchor="start">out</Tag>

          <Primitive x={c.x} y={GATE_Y + 2} kind={c.kind} label={c.label} sub={c.sub} />

          <Tag x={c.x} y={GATE_Y + GATE_H / 2 + 24}>{`in: ${c.inbound}`}</Tag>
          <Tag x={c.x} y={GATE_Y + GATE_H / 2 + 42}>{`out: ${c.outbound}`}</Tag>
        </g>
      ))}

      <Note x={450} y={404}>
        a violation emits one AUDIT record, then the policy decides: re-ask, resend, or refuse
      </Note>
    </Figure>
  );
}
