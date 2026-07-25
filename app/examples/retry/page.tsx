import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_HARNESS, KW_REACTIVE } from "@/lib/seo";
import RetryClient from "./RetryClient";

export const metadata: Metadata = pageMetadata({
  title: "Retry, STOP and Rollback",
  description:
    "Fault tolerance on the event channel: bounded retries with backoff, cooperative STOP propagation down a trace, and compensating rollback when a step fails.",
  path: "/examples/retry",
  keywords: [
    ...KW_HARNESS,
    ...KW_REACTIVE,
    "agent error handling",
    "retry with backoff",
    "cancelling an agent run",
    "compensating transactions",
    "resilient AI pipelines",
  ],
});

export default function RetryPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Retry, STOP & Rollback", path: "/examples/retry" },
        ]}
      />
      <RetryClient />
    </>
  );
}
