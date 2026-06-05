import type { Metadata } from "next";
import BuildingNeuronClient from "./BuildingNeuronClient";

export const metadata: Metadata = {
  title: "Building a Neuron  -  Examples  -  Cosmonapse",
  description:
    "The smallest possible Cosmonapse program  -  one Neuron, one Axon, one Dendrite, one TASK, one reply. Single process, in-memory Synapse, no broker.",
};

export default function BuildingNeuronPage() {
  return <BuildingNeuronClient />;
}
