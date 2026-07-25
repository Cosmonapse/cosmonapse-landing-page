import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS, KW_REACTIVE } from "@/lib/seo";
import AgentClient from "./AgentClient";

export const metadata: Metadata = pageMetadata({
  title: "Agent - Choreographed, No Loop",
  description:
    "A capability-routed agent with no supervisor loop. Dispatch one TASK, await the trace's FINAL; each on_agent_output handler creates the next TASK.",
  path: "/examples/agent",
  keywords: [
    ...KW_REACTIVE,
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "agent without a while loop",
    "autonomous agent architecture",
    "agentic workflow",
    "ReAct alternative",
  ],
});

export default function AgentPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Agent", path: "/examples/agent" },
        ]}
      />
      <AgentClient />
    </>
  );
}
