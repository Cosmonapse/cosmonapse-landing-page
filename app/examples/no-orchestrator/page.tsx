import type { Metadata } from "next";
import NoOrchestratorClient from "./NoOrchestratorClient";

export const metadata: Metadata = {
  title: "No Orchestrator — Examples — Cosmonapse",
  description:
    "Decentralised load distribution with no Cortex: every worker runs the same pure owner_of(trace_id) and claims its share with zero coordination. The same topology across five language × transport stacks.",
};

export default function NoOrchestratorPage() {
  return <NoOrchestratorClient />;
}
