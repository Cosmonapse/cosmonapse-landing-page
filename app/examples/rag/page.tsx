import type { Metadata } from "next";
import RagClient from "./RagClient";

export const metadata: Metadata = {
  title: "Full RAG System  -  Examples  -  Cosmonapse",
  description:
    "Retrieval-augmented generation built entirely on Cosmonapse primitives  -  four Neurons, three Engrams, hybrid semantic + lexical retrieval fused by reciprocal rank, an answer cache, and a staged retrieve / rerank / generate pipeline on one trace.",
};

export default function RagPage() {
  return <RagClient />;
}
