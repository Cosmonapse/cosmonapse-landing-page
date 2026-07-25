import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import NoOrchestratorClient from "./NoOrchestratorClient";

export const metadata: Metadata = pageMetadata({
  title: "No Orchestrator - Agent Choreography",
  description:
    "Decentralised load distribution with no Cortex: every worker runs the same pure owner_of(trace_id) and claims its share with zero coordination.",
  path: "/examples/no-orchestrator",
  keywords: [
    ...KW_REACTIVE,
    ...KW_EVENT_DRIVEN,
    "decentralised agents",
    "choreography over orchestration",
    "leaderless agent coordination",
    "agents without a supervisor loop",
  ],
});

export default function NoOrchestratorPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "No Orchestrator", path: "/examples/no-orchestrator" },
        ]}
      />
      <NoOrchestratorClient />
    </>
  );
}
