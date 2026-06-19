import type { Metadata } from "next";
import RetryClient from "./RetryClient";

export const metadata: Metadata = {
  title: "Retry, STOP & Rollback  -  Examples  -  Cosmonapse",
  description:
    "Resilience patterns over the RAG primitives, fully offline. run_with_retry re-dispatches a stuck stage on a fresh trace, stop_trace cooperatively cancels a workflow, and stop_trace(rollback=True) replays each Engram's saga journal to undo a half-finished write.",
};

export default function RetryPage() {
  return <RetryClient />;
}
