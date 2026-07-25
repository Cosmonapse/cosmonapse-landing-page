import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import RagClient from "./RagClient";

export const metadata: Metadata = pageMetadata({
  title: "Full RAG System on an Event Bus",
  description:
    "RAG built entirely from Cosmonapse primitives: four Neurons, three Engrams, hybrid retrieval fused by reciprocal rank, an answer cache, one staged trace.",
  path: "/examples/rag",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "RAG architecture",
    "hybrid retrieval",
    "reciprocal rank fusion",
    "event-driven RAG pipeline",
    "vector search agents",
  ],
});

export default function RagPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Full RAG System", path: "/examples/rag" },
        ]}
      />
      <RagClient />
    </>
  );
}
