import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import EngramIntegrationClient from "./EngramIntegrationClient";

export const metadata: Metadata = pageMetadata({
  title: "Engram - Shared Multi-Agent Memory",
  description:
    "Bind shared memory to a Neuron with EngramBinding. Call recall() and imprint() without touching the protocol - in-memory, SQLite or Postgres, one API.",
  path: "/examples/engram-integration",
  keywords: [
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "shared agent memory",
    "multi-agent memory",
    "vector memory for agents",
    "agent state management",
    "context engineering",
  ],
});

export default function EngramIntegrationPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Integrating an Engram", path: "/examples/engram-integration" },
        ]}
      />
      <EngramIntegrationClient />
    </>
  );
}
