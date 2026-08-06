import { Bus, Edge, Figure, Note, Primitive, Tag } from "./Fig";
import { Box } from "./Fig";

/**
 * A Pathway is a handle on one trace, not a controller of it. The dispatcher
 * is drawn detaching on purpose: the interesting claim is that the run below
 * the bus is unaffected by whether anyone is still listening.
 */
export default function NobodyHoldsTheLoop() {
  return (
    <Figure
      width={900}
      height={330}
      title="A dispatcher emits a TASK onto the synapse bus and then closes its Pathway, marked with a cross. Below the bus a Neuron, an Effector and an Engram continue to exchange Signals."
      caption="A Pathway is a handle on one trace, not a controller of it. The dispatcher can await the terminal Signal, subscribe to the trace, or close it and walk away - the work proceeds either way."
    >
      <Box x={168} y={62} w={190} h={46} label="dispatcher" sub="opens a Pathway" tone="muted" />
      <Edge x1={168} y1={85} x2={168} y2={150} tone="accent2" label="TASK" labelDx={12} labelDy={4} labelAnchor="start" />

      <g className="t-muted">
        <line x1={286} y1={54} x2={302} y2={70} className="fig-strike" />
        <line x1={302} y1={54} x2={286} y2={70} className="fig-strike" />
      </g>
      <Tag x={312} y={66} anchor="start" tone="muted">
        closes it here
      </Tag>

      <Bus y={164} x0={60} x1={840} label="Synapse" />

      <line x1={330} y1={171} x2={330} y2={226} className="fig-hair" />
      <line x1={520} y1={171} x2={520} y2={228} className="fig-hair" />
      <line x1={700} y1={171} x2={700} y2={224} className="fig-hair" />

      <Primitive x={330} y={244} kind="neuron" label="planner" />
      <Primitive x={520} y={244} kind="effector" label="search" />
      <Primitive x={700} y={244} kind="engram" label="memory" />

      <Note x={450} y={314}>
        no supervisor is turning the crank - the Signals are
      </Note>
    </Figure>
  );
}
