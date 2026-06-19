"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

const topology = `POST /ask  -  one trace_id, three stages

  orchestrator "rag-api"
        |
        v
   retriever  --->  reranker  --->  generator      (worker-a / worker-b)
    |     |                             |
  RECALL RECALL                      IMPRINT
    |     |                             |
 vectors keywords  (two Engrams)     answer cache  (third Engram)`;

const retrieverSnippet = `<span class="tk-cm"># retriever: recall BOTH indexes in their native query languages,</span>
<span class="tk-cm"># then fuse the ranked lists with reciprocal-rank fusion (RRF).</span>
<span class="tk-kw">async def</span> <span class="tk-fn">retriever</span>(input, context, *, recall, imprint):
    <span class="tk-cm"># answer-cache short-circuit  -  same Engram the generator writes to</span>
    cached <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"rag-cache"</span>, query<span class="tk-op">=</span>{<span class="tk-str">"text"</span>: input[<span class="tk-str">"question"</span>]})
    <span class="tk-kw">if</span> cached.hits:
        <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: cached.hits[<span class="tk-num">0</span>].entry[<span class="tk-str">"answer"</span>], <span class="tk-str">"source"</span>: <span class="tk-str">"cache"</span>}

    semantic <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"rag-vectors"</span>,  query<span class="tk-op">=</span>{<span class="tk-str">"embedding"</span>: <span class="tk-fn">embed</span>(input[<span class="tk-str">"question"</span>])})
    lexical  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"rag-keywords"</span>, query<span class="tk-op">=</span>{<span class="tk-str">"text"</span>: input[<span class="tk-str">"question"</span>]})
    <span class="tk-kw">return</span> {<span class="tk-str">"chunks"</span>: <span class="tk-fn">rrf</span>(semantic.hits, lexical.hits)}`;

const pipelineSnippet = `<span class="tk-cm"># ask_pipeline chains retrieve -> rerank -> generate on ONE trace,</span>
<span class="tk-cm"># passing trace_id / parent_id so doppler shows it as a single workflow.</span>
<span class="tk-kw">async def</span> <span class="tk-fn">ask_pipeline</span>(orch, question):
    got  <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_wait</span>(capabilities<span class="tk-op">=</span>[<span class="tk-str">"retrieve"</span>],
                                       input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: question})
    tid  <span class="tk-op">=</span> got.trace_id
    rank <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_wait</span>(capabilities<span class="tk-op">=</span>[<span class="tk-str">"rerank"</span>], trace_id<span class="tk-op">=</span>tid,
                                       parent_id<span class="tk-op">=</span>got.id,
                                       input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: question, **got.payload[<span class="tk-str">"output"</span>]})
    <span class="tk-kw">return</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_wait</span>(capabilities<span class="tk-op">=</span>[<span class="tk-str">"generate"</span>], trace_id<span class="tk-op">=</span>tid,
                                       parent_id<span class="tk-op">=</span>rank.id,
                                       input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: question, **rank.payload[<span class="tk-str">"output"</span>]})`;

const runSnippet = `<span class="tk-cm"># one-shot: ingest a doc, ask 3 questions, watch a cache hit</span>
<span class="tk-op">$</span> pip install cosmonapse httpx python-dotenv fastapi uvicorn
<span class="tk-op">$</span> python demo.py

<span class="tk-cm"># or run the API and watch the whole 3-stage trace flow past</span>
<span class="tk-op">$</span> uvicorn app:app <span class="tk-op">--</span>port 8000
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">-n</span> rag`;

export default function RagClient() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Example 10 · RAG</div>
          <h1 className="page-title">A Full RAG System, Built From Primitives.</h1>
          <p className="page-sub">
            Retrieval-augmented generation with nothing but Cosmonapse parts: four{" "}
            <Link href="/concepts" className="inline-link">Neurons</Link> across two worker
            Dendrites, three <Link href="/docs/engram" className="inline-link">Engrams</Link>{" "}
            across two hosts, run as a staged retrieve → rerank → generate pipeline on one
            trace. Hybrid retrieval (semantic + lexical) fused by reciprocal rank, plus an
            answer cache two different Neurons share through one binding.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Topology</div>
          <h2 className="sub-title">Three stages, one trace.</h2>
          <CodeBlock filename="topology" html={topology} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Hybrid retrieval</div>
          <h2 className="sub-title">Recall two indexes, fuse the ranks.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The retriever recalls from a semantic VectorEngram and a lexical KeywordEngram in
            their own query languages, then fuses the two ranked lists. Each Engram&apos;s{" "}
            <code className="inline">can_serve()</code> keeps it from answering the other&apos;s
            queries. A cache hit short-circuits the whole pipeline.
          </p>
          <CodeBlock filename="retriever.py" html={retrieverSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Staged pipeline</div>
          <h2 className="sub-title">retrieve → rerank → generate.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Each stage is an ordinary capability-routed dispatch. Threading{" "}
            <code className="inline">trace_id</code> and <code className="inline">parent_id</code>{" "}
            through the calls gives the whole workflow one lineage, so{" "}
            <code className="inline">cosmo doppler -n rag</code> renders it as a single trace.
            The reranker is a cheap lexical-overlap Neuron  -  swap it for a cross-encoder without
            touching anything else.
          </p>
          <CodeBlock filename="pipeline.py" html={pipelineSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Run it</div>
          <h2 className="sub-title">One script, or the API.</h2>
          <CodeBlock filename="terminal" html={runSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/rag-mcp" className="card">
              <div className="card-icon">→</div>
              <h3>RAG + MCP coding agent</h3>
              <p>Ground an MCP filesystem Neuron with the same VectorEngram and write runnable code to disk.</p>
            </Link>
            <Link href="/examples/retry" className="card">
              <div className="card-icon">→</div>
              <h3>Retry, STOP &amp; rollback</h3>
              <p>Resilience over these RAG primitives  -  retry stuck stages and roll back partial Engram writes.</p>
            </Link>
            <Link href="/examples/engram-integration" className="card">
              <div className="card-icon">→</div>
              <h3>Integrating an Engram</h3>
              <p>The recall / imprint binding model the retriever and generator are built on.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
