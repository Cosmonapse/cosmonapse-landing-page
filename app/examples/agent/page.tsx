import type { Metadata } from "next";
import AgentClient from "./AgentClient";

export const metadata: Metadata = {
  title: "Agent  -  Examples  -  Cosmonapse",
  description:
    "A choreographed, capability-routed agent with no supervisor loop. run_agent dispatches one TASK and awaits the trace's FINAL; each node's @on_agent_output handler creates the next TASK. Stock Neurons, decorator-specified behaviour, Dendrite-owned memory.",
};

export default function AgentPage() {
  return <AgentClient />;
}
