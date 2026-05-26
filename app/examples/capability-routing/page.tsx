import type { Metadata } from "next";
import CapabilityRoutingClient from "./CapabilityRoutingClient";

export const metadata: Metadata = {
  title: "Capability-based Routing — Examples — Cosmonapse",
  description:
    "A router Dendrite uses a RegistryStore to discover workers by capability and dispatch each task to a live neuron that advertises it. The same topology across five language × transport stacks: Python and TypeScript over devsynapse, NATS, and Kafka.",
};

export default function CapabilityRoutingPage() {
  return <CapabilityRoutingClient />;
}
