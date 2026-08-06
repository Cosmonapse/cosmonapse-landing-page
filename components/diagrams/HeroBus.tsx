import { Bus, Figure, Primitive, Pulse, Spark } from "./Fig";

/**
 * The marquee figure: one bus, four participants, and traffic. Nothing is
 * claimed here that the rest of the page does not go on to explain - it is
 * the shape of a Cosmonapse system, moving.
 */
export default function HeroBus() {
  return (
    <Figure
      width={920}
      height={286}
      title="A synapse bus with a Receptor above it and a Neuron, an Engram and an Effector below it. Signals travel from the Receptor into the Neuron, from the Neuron to the Engram and to the Effector, and back again."
      caption="One bus. A request from the edge, a memory read, a tool call and its result - each one a Signal that every participant could have seen."
    >
      <Primitive x={170} y={72} kind="receptor" label="terminal" sub="receptor" above />
      <line x1={170} y1={94} x2={170} y2={128} className="fig-hair" />

      <Bus y={142} x0={60} x1={860} label="Synapse" />

      <line x1={330} y1={149} x2={330} y2={206} className="fig-hair" />
      <line x1={540} y1={149} x2={540} y2={204} className="fig-hair" />
      <line x1={740} y1={149} x2={740} y2={208} className="fig-hair" />

      <Primitive x={330} y={224} kind="neuron" label="planner" />
      <Primitive x={540} y={224} kind="engram" label="memory" />
      <Primitive x={740} y={224} kind="effector" label="search" />

      <Pulse x={330} y={224} delay={1.15} tone="accent" />
      <Pulse x={540} y={224} delay={2.5} tone="engram" />
      <Pulse x={740} y={224} delay={3.9} tone="accent3" />

      <Spark
        route={[[170, 96], [170, 142], [330, 142], [330, 206]]}
        tone="accent2"
        dur={5.4}
        delay={0}
      />
      <Spark
        route={[[330, 206], [330, 142], [540, 142], [540, 204]]}
        tone="engram"
        dur={5.4}
        delay={1.35}
      />
      <Spark
        route={[[330, 206], [330, 142], [740, 142], [740, 208]]}
        tone="accent3"
        dur={5.4}
        delay={2.7}
      />
      <Spark
        route={[[740, 208], [740, 142], [330, 142], [330, 206]]}
        tone="accent3"
        dur={5.4}
        delay={4.05}
      />
    </Figure>
  );
}
