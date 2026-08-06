import { Bus, Figure, Primitive } from "./Fig";

/**
 * The vocabulary, in one line: four silhouettes on one Synapse. A component
 * keeps its outline everywhere in the suite, so this is also the legend for
 * every other figure on the site.
 */
export default function PrimitivesOnTheBus() {
  return (
    <Figure
      width={900}
      height={300}
      title="Four participants on one synapse bus. A Receptor, drawn as a cup, sits above the bus; a Neuron drawn as a circle, an Engram drawn as a diamond and an Effector drawn as a triangle hang below it."
      caption="Neurons think · Engrams remember · Effectors act · Receptors listen. One silhouette per kind, kept the same in Genesis, in Prism and here."
    >
      <Primitive x={180} y={58} kind="receptor" label="Receptor" sub="listens" above />
      <line x1={180} y1={80} x2={180} y2={114} className="fig-hair" />

      <Bus y={128} x0={60} x1={840} label="Synapse · one bus, one envelope" />

      <line x1={352} y1={135} x2={352} y2={190} className="fig-hair" />
      <line x1={530} y1={135} x2={530} y2={188} className="fig-hair" />
      <line x1={708} y1={135} x2={708} y2={192} className="fig-hair" />

      <Primitive x={352} y={208} kind="neuron" label="Neuron" sub="thinks" />
      <Primitive x={530} y={208} kind="engram" label="Engram" sub="remembers" />
      <Primitive x={708} y={208} kind="effector" label="Effector" sub="acts" />
    </Figure>
  );
}
