import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import CapabilityRoutingClient from "./CapabilityRoutingClient";

export const metadata: Metadata = pageMetadata({
  title: "Capability-Based Agent Routing",
  description:
    "A router Dendrite uses a RegistryStore to discover workers by capability and dispatch each task to a live Neuron that advertises it. Five stacks, one topology.",
  path: "/examples/capability-routing",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    "agent routing",
    "capability discovery",
    "service registry for agents",
    "dynamic agent dispatch",
  ],
});

export default function CapabilityRoutingPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Capability-based Routing", path: "/examples/capability-routing" },
        ]}
      />
      <CapabilityRoutingClient />
    </>
  );
}
