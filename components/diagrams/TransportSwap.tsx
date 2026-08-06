import { Box, Bus, Edge, Figure, Note } from "./Fig";

/** Same brain, four floors. The URL is the only thing that changes. */
export default function TransportSwap() {
  return (
    <Figure
      width={900}
      height={340}
      title="A Neuron, an Engram and an Effector sit on one synapse bus. Below the bus, four interchangeable transports are shown: memory colon slash slash, cosmo colon slash slash, nats colon slash slash and kafka colon slash slash."
      caption="The Synapse is an adapter, not an architecture decision. Your components never learn which transport is underneath them."
    >
      <Box x={300} y={46} w={130} h={40} label="Neuron" plain />
      <Box x={450} y={46} w={130} h={40} label="Engram" plain />
      <Box x={600} y={46} w={130} h={40} label="Effector" plain />
      <line x1={300} y1={66} x2={300} y2={106} className="fig-hair" />
      <line x1={450} y1={66} x2={450} y2={106} className="fig-hair" />
      <line x1={600} y1={66} x2={600} y2={106} className="fig-hair" />

      <Bus y={120} x0={220} x1={680} label="Synapse" />

      <Edge x1={450} y1={128} x2={450} y2={186} tone="accent2" label="one URL" labelDx={44} labelDy={4} labelAnchor="start" />

      <line x1={80} y1={196} x2={820} y2={196} className="fig-hair fig-dash" />
      <line x1={140} y1={196} x2={140} y2={224} className="fig-hair" />
      <line x1={346} y1={196} x2={346} y2={224} className="fig-hair" />
      <line x1={554} y1={196} x2={554} y2={224} className="fig-hair" />
      <line x1={760} y1={196} x2={760} y2={224} className="fig-hair" />

      <Box x={140} y={250} w={186} h={52} mono label="memory://" sub="in-process" tone="muted" />
      <Box x={346} y={250} w={186} h={52} mono label="cosmo://" sub="local broker" tone="muted" />
      <Box x={554} y={250} w={186} h={52} mono label="nats://" sub="production default" tone="accent2" />
      <Box x={760} y={250} w={186} h={52} mono label="kafka://" sub="durable, replayable" tone="muted" />

      <Note x={450} y={316}>
        swapping one for another is a string change, not a rewrite
      </Note>
    </Figure>
  );
}
