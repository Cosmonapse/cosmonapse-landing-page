import { Box, Bus, Figure, Note, Primitive, Pulse, Spark } from "./Fig";

/**
 * The shape every boutique system on this page turns out to have: an
 * interface people use, domain memory, tools that touch real systems, and
 * a policy for when a person gets involved. The escalation is drawn as the
 * one edge leaving the brain, because that is the part you are selling.
 */
export default function BoutiqueSystem() {
  return (
    <Figure
      width={900}
      height={344}
      title="An API Receptor above a synapse bus feeds a classifier Neuron, a policy history Engram and a fraud checks Effector below it. A dashed escalation path rises from the bus to a human adjuster."
      caption="Claims triage, drawn out: an interface people use, memory that is yours, tools that touch real systems, and a policy for when a person gets involved. The model is the cheapest part of it."
    >
      <Primitive x={140} y={104} kind="receptor" label="intake" sub="API receptor" above />
      <line x1={140} y1={126} x2={140} y2={162} className="fig-hair" />

      <Box x={720} y={82} w={196} h={50} label="adjuster" sub="human review" plain />
      <g className="t-accent2">
        <line x1={720} y1={168} x2={720} y2={121} className="fig-line fig-dash fig-flow" />
        <polygon className="fig-fill" points="720,110 725,124 715,124" />
        <text className="fig-tag" x={736} y={150} textAnchor="start">
          ESCALATION
        </text>
      </g>

      <Bus y={176} x0={60} x1={840} label="Synapse" />

      <line x1={280} y1={183} x2={280} y2={238} className="fig-hair" />
      <line x1={480} y1={183} x2={480} y2={236} className="fig-hair" />
      <line x1={660} y1={183} x2={660} y2={240} className="fig-hair" />

      <Primitive x={280} y={256} kind="neuron" label="classifier" />
      <Primitive x={480} y={256} kind="engram" label="policy history" />
      <Primitive x={660} y={256} kind="effector" label="fraud checks" />

      <Pulse x={280} y={256} delay={1.2} tone="accent" />
      <Pulse x={480} y={256} delay={2.6} tone="engram" />

      <Spark
        route={[[140, 128], [140, 176], [280, 176], [280, 238]]}
        tone="accent2"
        dur={6}
        delay={0}
      />
      <Spark
        route={[[280, 238], [280, 176], [480, 176], [480, 236]]}
        tone="engram"
        dur={6}
        delay={1.4}
      />
      <Spark
        route={[[280, 238], [280, 176], [660, 176], [660, 240]]}
        tone="accent3"
        dur={6}
        delay={2.8}
      />
      <Spark route={[[280, 238], [280, 176], [720, 176], [720, 112]]} tone="accent2" dur={6} delay={4.3} />

      <Note x={450} y={326}>
        nothing here is a graph - the escalation is a Signal arriving, not an edge you drew
      </Note>
    </Figure>
  );
}
