import type { Metadata } from "next";
import OrchestratorApiClient from "./OrchestratorApiClient";

export const metadata: Metadata = {
  title: "Building an Orchestrator API  -  Examples  -  Cosmonapse",
  description:
    "Wire a Dendrite into Flask, FastAPI, Express, or raw WSGI. Your HTTP framework stays at the edge; the Dendrite dispatches TASKs to Neurons and returns the reply.",
};

export default function OrchestratorApiPage() {
  return <OrchestratorApiClient />;
}
