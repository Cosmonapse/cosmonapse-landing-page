import { Bus, Figure, Note, Primitive, Tag } from "./Fig";

/**
 * A request and its reply are two Signals. Prism holds the outbound leg for
 * a few seconds and pairs it with whatever answers on the same trace, so a
 * round trip reads as one arc rather than two unrelated blips.
 *
 * The two legs hug opposite faces of the bar rather than sharing a lane:
 * they are the same journey in opposite directions, and drawing them on top
 * of each other would hide exactly the thing the figure is about.
 */
export default function TwoLegJourney() {
  return (
    <Figure
      width={900}
      height={330}
      title="A Neuron labelled planner and an Engram labelled memory hang below a synapse bus. A RECALL signal travels up from the planner, along the underside of the bus, and down into the memory; a dashed RECALLED signal returns along the top of the bus to the planner."
      caption="Two Signals on one trace, drawn as one journey. Prism holds the outbound leg for a few seconds and pairs it with whatever answers, so a round trip is legible instead of being two unrelated blips."
    >
      <Bus y={128} x0={60} x1={840} />
      <Tag x={60} y={172} anchor="start" tone="accent2">
        Synapse
      </Tag>

      {/* outbound: planner → memory, along the underside */}
      <g className="t-engram">
        <path d="M238 228 L238 150 L650 150 L650 214" className="fig-line" />
        <polygon className="fig-fill" points="650,224 655,210 645,210" />
      </g>
      <Tag x={300} y={168} anchor="start" tone="engram">
        RECALL
      </Tag>

      {/* return: memory → planner, along the top */}
      <g className="t-engram">
        <path d="M670 218 L670 100 L258 100 L258 214" className="fig-line fig-dash" />
        <polygon className="fig-fill" points="258,224 263,210 253,210" />
      </g>
      <Tag x={620} y={90} anchor="end" tone="engram">
        RECALLED
      </Tag>

      <Primitive x={248} y={246} kind="neuron" label="planner" />
      <Primitive x={660} y={246} kind="engram" label="memory" />

      <Note x={450} y={314}>
        same trace_id, so the pairing needs no cooperation from either side
      </Note>
    </Figure>
  );
}
