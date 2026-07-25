import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import RealWorldNeuronsClient from "./RealWorldNeuronsClient";

export const metadata: Metadata = pageMetadata({
  title: "Real-World Neurons - APIs and MCP",
  description:
    "A Neuron is anything that touches the real world. One Cortex dispatches to an HTTP API and a wrapped stdio MCP server behind the identical Axon interface.",
  path: "/examples/real-world-neurons",
  keywords: [
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "MCP server agent",
    "Model Context Protocol",
    "wrapping an API as an agent",
    "tool-using agents",
  ],
});

export default function RealWorldNeuronsPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Real-world Neurons", path: "/examples/real-world-neurons" },
        ]}
      />
      <RealWorldNeuronsClient />
    </>
  );
}
