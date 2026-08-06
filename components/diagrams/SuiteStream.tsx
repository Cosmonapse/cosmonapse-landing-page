import { Box, Bus, Edge, Figure, Note, Primitive, Spark } from "./Fig";

/**
 * What the three products actually share. Genesis writes components onto
 * the bus, Prism reads Signals off it, and Core *is* the bus - which is why
 * the only contract between them is the envelope.
 */
export default function SuiteStream() {
  return (
    <Figure
      width={900}
      height={340}
      title="A synapse bus labelled Core carries three participants below it. Above the bus, Genesis writes components onto it and Prism reads every Signal off it."
      caption="Genesis writes onto the bus, Prism reads off it, and Core is the bus. The Signal envelope is the only thing the three of them have to agree on."
    >
      <Box x={190} y={66} w={200} h={50} label="Genesis" sub="writes onto it" tone="accent3" />
      <Box x={700} y={66} w={200} h={50} label="Prism" sub="reads off it" tone="accent2" />

      <Edge x1={190} y1={92} x2={190} y2={170} tone="accent3" />
      <Edge x1={700} y1={170} x2={700} y2={94} tone="accent2" dashed />

      <Bus y={184} x0={60} x1={840} label="Core · one Signal envelope" tone="accent" />

      <line x1={286} y1={191} x2={286} y2={240} className="fig-hair" />
      <line x1={452} y1={191} x2={452} y2={238} className="fig-hair" />
      <line x1={618} y1={191} x2={618} y2={242} className="fig-hair" />

      <Primitive x={286} y={258} kind="neuron" label="classifier" />
      <Primitive x={452} y={258} kind="engram" label="policy" />
      <Primitive x={618} y={258} kind="effector" label="lookup" />

      <Spark route={[[190, 96], [190, 178]]} tone="accent3" dur={5.6} delay={0} />
      <Spark
        route={[[286, 240], [286, 184], [452, 184], [452, 238]]}
        tone="accent"
        dur={5.6}
        delay={1.4}
      />
      <Spark route={[[452, 184], [700, 184], [700, 98]]} tone="accent2" dur={5.6} delay={2.9} />
      <Spark
        route={[[618, 242], [618, 184], [286, 184], [286, 240]]}
        tone="accent"
        dur={5.6}
        delay={4.2}
      />

      <Note x={450} y={324}>
        none of the three owns the system - they all read the same envelope
      </Note>
    </Figure>
  );
}
