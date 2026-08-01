import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import OrchestratorApiClient from "./OrchestratorApiClient";

export const metadata: Metadata = pageMetadata({
  title: "Orchestrator API - Flask, FastAPI, WSGI",
  description:
    "Wire a Dendrite into Flask, FastAPI or raw WSGI. Your HTTP framework stays at the edge; the Dendrite dispatches TASKs and returns the reply.",
  path: "/examples/orchestrator-api",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "FastAPI AI agent",
    "Flask LLM agent",
    "agent HTTP endpoint",
  ],
});

export default function OrchestratorApiPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Building an Orchestrator API", path: "/examples/orchestrator-api" },
        ]}
      />
      <OrchestratorApiClient />
    </>
  );
}
