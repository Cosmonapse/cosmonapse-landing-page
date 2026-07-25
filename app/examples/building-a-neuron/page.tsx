import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import BuildingNeuronClient from "./BuildingNeuronClient";

export const metadata: Metadata = pageMetadata({
  title: "Building a Neuron",
  description:
    "The smallest Cosmonapse program: one Neuron, one Axon, one Dendrite, one TASK, one reply. Single process, in-memory Synapse, no broker to install.",
  path: "/examples/building-a-neuron",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "how to build an AI agent",
    "minimal agent example",
    "first agent tutorial",
  ],
});

export default function BuildingNeuronPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Building a Neuron", path: "/examples/building-a-neuron" },
        ]}
      />
      <BuildingNeuronClient />
    </>
  );
}
