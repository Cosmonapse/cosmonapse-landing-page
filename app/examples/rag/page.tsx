import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

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
          { name: "RAG", path: "/examples/rag" },
        ]}
      />
      <ExampleDoc
        number="11"
        difficulty="Advanced"
        title="A full RAG system."
        folder="11-rag"
        namespace="rag"
        runArgs={`"What is a Dendrite?"`}
        prismSrc="/prism/rag.mp4"
        lede={
          <>
            Retrieval-augmented generation from Cosmonapse primitives only: four Neurons and three
            Engrams, a node each, run as retrieve, rerank, generate on one trace. Hybrid semantic
            and lexical recall fused by reciprocal rank, and an answer cache two Neurons share.
          </>
        }
        install={install({ pkgs: "'cosmonapse[receptor]' httpx python-dotenv", hf: true })}
        run={`$ python brain.py "What is a Dendrite and what role does it play?"
$ python brain.py stats
$ python brain.py            # REPL + the HTTP API on :8000 - ask twice to hit the cache

$ curl -s localhost:8000/ask -H 'content-type: application/json' -d '{"question": "What is a Dendrite?"}'
$ curl -s localhost:8000/ingest -H 'content-type: application/json' -d '{"doc_id": "notes", "text": "..."}'
$ curl -s localhost:8000/stats`}
        output={`  indexed cosmonapse-core          2 chunks
  indexed memory-and-pathways      2 chunks
  indexed routing-and-bidding      2 chunks
A Dendrite is the Synapse-side participant that hosts Axons ... [cosmonapse-core#0]
sources: cosmonapse-core#0 (1.577), memory-and-pathways#1 (1.4569), ...`}
        outputNote="The answer text varies; the pipeline shape does not."
        tree={`11-rag/
  config.py              models, TOP_K / FETCH_K / MIN_SCORE, cache_key()
  embeddings.py          HF embedding client + chunker
  engram/vector_engram.py   VectorEngram - cosine, over the Engram ABC
  engram/keyword_engram.py  KeywordEngram - BM25
  engram/indexes.py      VECTORS, KEYWORDS, CACHE
  neurons/               ingester, retriever, reranker, generator
  helpers.py             ask_pipeline(), ingest_samples(), stats()
  receptors/terminal.py  ask, stats
  receptors/api.py       POST /ingest, POST /ask, GET /stats
  brain.py               a node per Engram, per Neuron, per interface`}
        sections={[
          {
            eyebrow: "01 · The indexes",
            title: "Two Engrams, one protocol.",
            prose: (
              <p>
                <code className="inline">VectorEngram</code> and{" "}
                <code className="inline">KeywordEngram</code> implement the Engram ABC, so RECALL and
                IMPRINT carry vector search and BM25 without new Signal types. Each answers only
                queries in its own language (<code className="inline">can_serve</code>), so they never
                answer each other&apos;s. The cache is a stock <code className="inline">InMemoryEngram</code>.
              </p>
            ),
            snippets: [
              { name: "engram/indexes.py", code: stripDocstring(CODE["engram/indexes.py"]) },
              { name: "engram/vector_engram.py", code: blocks(CODE["engram/vector_engram.py"], ["VectorEngram"]).split("    # -- write")[0].trimEnd() + "\n\n    # ... imprint(): add / merge / upsert / delete, with a per-trace saga journal\n" },
            ],
          },
          {
            eyebrow: "02 · Ingest",
            title: "One chunk, two indexes.",
            prose: (
              <p>
                The ingester chunks and embeds, then imprints every chunk into both indexes under
                the same <code className="inline">merge_key</code>, so re-ingesting a document
                upserts instead of duplicating.
              </p>
            ),
            snippets: [{ name: "neurons/ingester.py", code: stripDocstring(CODE["neurons/ingester.py"]) }],
          },
          {
            eyebrow: "03 · Retrieve",
            title: "Recall both, fuse the ranks.",
            prose: (
              <p>
                The retriever checks the answer cache, then recalls from both indexes in their
                native query shapes and merges the ranked lists with reciprocal-rank fusion.
              </p>
            ),
            snippets: [{ name: "neurons/retriever.py", code: stripDocstring(CODE["neurons/retriever.py"]) }],
          },
          {
            eyebrow: "04 · Rerank and generate",
            title: "A cheap rescore, a grounded answer, cached on the way out.",
            prose: (
              <p>
                The reranker is lexical overlap; replace it with a cross-encoder Neuron and nothing
                else changes. The generator answers from the chunks only and upserts the answer into
                the same cache the retriever reads.
              </p>
            ),
            snippets: [
              { name: "neurons/reranker.py", code: stripDocstring(CODE["neurons/reranker.py"]) },
              { name: "neurons/generator.py", code: stripDocstring(CODE["neurons/generator.py"]) },
            ],
          },
          {
            eyebrow: "05 · The pipeline",
            title: "Three TASKs, one trace.",
            prose: (
              <p>
                <code className="inline">ask_pipeline</code> chains the stages with an explicit{" "}
                <code className="inline">trace_id</code> and <code className="inline">parent_id</code>,
                so Prism shows one lineage per question. Both interfaces call it from the node they
                are mounted on.
              </p>
            ),
            snippets: [{ name: "helpers.py", code: blocks(CODE["helpers.py"], ["ask_pipeline"]) }],
          },
          {
            eyebrow: "06 · Two interfaces",
            title: "A terminal and an API onto the same nodes.",
            prose: (
              <p>
                <code className="inline">POST /ingest</code> is the ApiReceptor&apos;s own
                endpoint: one TASK, with send, wait and stream modes. <code className="inline">/ask</code>{" "}
                and <code className="inline">/stats</code> are extra routes, because the pipeline is
                three TASKs rather than one. See{" "}
                <Link href="/examples/receptors" className="inline-link">Receptors</Link> for the
                interface layer on its own.
              </p>
            ),
            snippets: [
              { name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) },
              { name: "receptors/api.py", code: stripDocstring(CODE["receptors/api.py"]) },
            ],
          },
          {
            eyebrow: "07 · The brain",
            title: "Nine nodes, three builders.",
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
            after: (
              <p>
                <code className="inline">main()</code> passes every Engram, every Neuron and both
                interfaces to <code className="inline">run_brain</code>. Set{" "}
                <code className="inline">RAG_GEN_MODEL</code>, <code className="inline">RAG_TOP_K</code>,{" "}
                <code className="inline">RAG_FETCH_K</code> or <code className="inline">RAG_MIN_SCORE</code>{" "}
                to tune.
              </p>
            ),
          },
        ]}
        related={[
          { href: "/examples/rag-mcp", title: "RAG + MCP", desc: "The same retrieval stack grounding a coding agent." },
          { href: "/examples/retry", title: "Retry & rollback", desc: "Undo a half-finished ingest with the saga journal." },
          { href: "/examples/rag-cli", title: "RAG CLI", desc: "One Neuron, one Engram, one Effector - a RAG that fills its own memory." },
        ]}
      />
    </>
  );
}
