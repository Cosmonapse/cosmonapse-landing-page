import type { Metadata } from "next";
import RoundRobinClient from "./RoundRobinClient";

export const metadata: Metadata = {
  title: "Orchestrator + Round Robin  -  Examples  -  Cosmonapse",
  description:
    "A Cortex load-balances prompts across two workers in a round-robin rotation. The same topology across five language × transport stacks: Python and TypeScript over devsynapse, NATS, and Kafka.",
};

export default function RoundRobinPage() {
  return <RoundRobinClient />;
}
