import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import RoundRobinClient from "./RoundRobinClient";

export const metadata: Metadata = pageMetadata({
  title: "Round Robin - Load-Balanced Agents",
  description:
    "A Cortex spreads TASKs across interchangeable worker Neurons round-robin. Same topology on three transports: devsynapse, NATS, Kafka.",
  path: "/examples/round-robin",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    "agent load balancing",
    "round robin workers",
    "NATS AI agents",
    "Kafka AI agents",
    "scaling LLM workers",
  ],
});

export default function RoundRobinPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Orchestrator + Round Robin", path: "/examples/round-robin" },
        ]}
      />
      <RoundRobinClient />
    </>
  );
}
