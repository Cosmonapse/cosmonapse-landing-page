"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";

// ---------------------------------------------------------------------------
// Snippets  -  kept in sync with cosmonapse-examples/11-rag/
// ---------------------------------------------------------------------------

const topologySnippet = `POST /ask   -   one trace_id, three stages

  orchestrator <span class="tk-str">"rag-api"</span>
        |
        v
   retriever  ---&gt;  reranker  ---&gt;  generator       (worker-a / worker-b)
    |     |                            |
  RECALL RECALL                     IMPRINT
    |     |                            |
 vectors keywords  (two Engrams)    answer cache   (third Engram)`;
const installSnippet = `<span class="tk-cm"># Python 3.11+. httpx drives the HF embedding + generator calls;</span>
<span class="tk-cm"># fastapi / uvicorn are only needed for the /ask API in step 08.</span>
<span class="tk-op">$</span> pip install cosmonapse httpx python-dotenv fastapi uvicorn

<span class="tk-cm"># A real token in cosmonapse-examples/.env  -  read scope is enough.</span>
<span class="tk-op">$</span> export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxx`;
const engramsSnippet = `<span class="tk-cm"># Two Engram backends, both implementing the Engram ABC, so the standard</span>
<span class="tk-cm"># RECALL / IMPRINT protocol can carry vector search AND keyword search.</span>
<span class="tk-cm"># can_serve() is the trick that keeps each from answering the other's query.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Hit
<span class="tk-kw">from</span> cosmonapse.engram.base <span class="tk-kw">import</span> Engram, ImprintReceipt

<span class="tk-kw">class</span> VectorEngram(Engram):                      <span class="tk-cm"># semantic, cosine similarity</span>
    capabilities <span class="tk-op">=</span> [<span class="tk-str">"vector"</span>, <span class="tk-str">"cosine"</span>, <span class="tk-str">"merge_key"</span>]

    <span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">can_serve</span>(self, query) -&gt; bool:
        <span class="tk-kw">return</span> <span class="tk-str">"embedding"</span> <span class="tk-kw">in</span> query              <span class="tk-cm"># only vector queries</span>

    <span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">recall</span>(self, query, *, min_confidence<span class="tk-op">=</span><span class="tk-kw">None</span>, **kw):
        qvec <span class="tk-op">=</span> query[<span class="tk-str">"embedding"</span>]
        hits <span class="tk-op">=</span> []
        <span class="tk-kw">for</span> eid, e <span class="tk-kw">in</span> self._entries.<span class="tk-fn">items</span>():
            score <span class="tk-op">=</span> <span class="tk-fn">cosine</span>(qvec, e[<span class="tk-str">"embedding"</span>])
            <span class="tk-kw">if</span> min_confidence <span class="tk-kw">is</span> <span class="tk-kw">not</span> <span class="tk-kw">None</span> <span class="tk-kw">and</span> score &lt; min_confidence:
                <span class="tk-kw">continue</span>
            slim <span class="tk-op">=</span> {k: v <span class="tk-kw">for</span> k, v <span class="tk-kw">in</span> e.<span class="tk-fn">items</span>() <span class="tk-kw">if</span> k != <span class="tk-str">"embedding"</span>}
            hits.<span class="tk-fn">append</span>(Hit(id<span class="tk-op">=</span>eid, entry<span class="tk-op">=</span>slim, score<span class="tk-op">=</span>score))
        hits.<span class="tk-fn">sort</span>(key<span class="tk-op">=</span><span class="tk-kw">lambda</span> h: h.score, reverse<span class="tk-op">=</span><span class="tk-kw">True</span>)
        <span class="tk-kw">return</span> hits[: query.<span class="tk-fn">get</span>(<span class="tk-str">"top_k"</span>, <span class="tk-num">4</span>)]

<span class="tk-kw">class</span> KeywordEngram(Engram):                     <span class="tk-cm"># lexical, BM25 (k1=1.5, b=0.75)</span>
    <span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">can_serve</span>(self, query) -&gt; bool:
        <span class="tk-kw">return</span> <span class="tk-str">"text"</span> <span class="tk-kw">in</span> query <span class="tk-kw">and</span> <span class="tk-str">"embedding"</span> <span class="tk-kw">not</span> <span class="tk-kw">in</span> query
    <span class="tk-cm"># recall() scores BM25 over an inverted index; full code in keyword_engram.py.</span>
    <span class="tk-cm"># imprint() also records a per-trace inverse-op journal (saga) - see Example 12.</span>`;
const ingestSnippet = `<span class="tk-cm"># ingester: chunk + embed, then DUAL-write each chunk into both indexes</span>
<span class="tk-cm"># under a stable merge_key so a re-ingest upserts instead of duplicating.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">ingest_neuron</span>(input, context, *, imprint):
    doc_id <span class="tk-op">=</span> input[<span class="tk-str">"doc_id"</span>]
    chunks <span class="tk-op">=</span> <span class="tk-fn">chunk_text</span>(input[<span class="tk-str">"text"</span>])
    vectors <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">embed</span>(chunks, api_key<span class="tk-op">=</span><span class="tk-fn">_hf_token</span>())

    <span class="tk-kw">for</span> i, (chunk, vec) <span class="tk-kw">in</span> <span class="tk-fn">enumerate</span>(<span class="tk-fn">zip</span>(chunks, vectors)):
        last <span class="tk-op">=</span> i == <span class="tk-fn">len</span>(chunks) - <span class="tk-num">1</span>
        entry <span class="tk-op">=</span> {<span class="tk-str">"doc_id"</span>: doc_id, <span class="tk-str">"chunk_index"</span>: i, <span class="tk-str">"text"</span>: chunk}
        <span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"vectors"</span>, op<span class="tk-op">=</span><span class="tk-str">"upsert"</span>, entry<span class="tk-op">=</span>{**entry, <span class="tk-str">"embedding"</span>: vec},
                      merge_key<span class="tk-op">=</span><span class="tk-str">f"{doc_id}:{i}"</span>, await_ack<span class="tk-op">=</span>last, deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)
        <span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"keywords"</span>, op<span class="tk-op">=</span><span class="tk-str">"upsert"</span>, entry<span class="tk-op">=</span>entry,
                      merge_key<span class="tk-op">=</span><span class="tk-str">f"{doc_id}:{i}"</span>, await_ack<span class="tk-op">=</span>last, deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"doc_id"</span>: doc_id, <span class="tk-str">"chunks"</span>: <span class="tk-fn">len</span>(chunks)}`;
const retrieveSnippet = `<span class="tk-cm"># retriever: answer-cache short-circuit, then hybrid recall (semantic +</span>
<span class="tk-cm"># lexical) fused with reciprocal-rank fusion (RRF_K = 60).</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">retrieve_neuron</span>(input, context, *, recall):
    question <span class="tk-op">=</span> input[<span class="tk-str">"question"</span>]

    cached <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"cache"</span>, query<span class="tk-op">=</span>{<span class="tk-str">"merge_key"</span>: <span class="tk-fn">_cache_key</span>(question)},
                          deadline_ms<span class="tk-op">=</span><span class="tk-num">500</span>)
    <span class="tk-kw">if</span> cached.hits:
        <span class="tk-kw">return</span> {<span class="tk-str">"cache_hit"</span>: <span class="tk-kw">True</span>, <span class="tk-str">"answer"</span>: cached.hits[<span class="tk-num">0</span>].entry[<span class="tk-str">"content"</span>]}

    qvec <span class="tk-op">=</span> (<span class="tk-kw">await</span> <span class="tk-fn">embed</span>([question], api_key<span class="tk-op">=</span><span class="tk-fn">_hf_token</span>()))[<span class="tk-num">0</span>]
    sem <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"vectors"</span>, query<span class="tk-op">=</span>{<span class="tk-str">"embedding"</span>: qvec, <span class="tk-str">"top_k"</span>: FETCH_K},
                       min_confidence<span class="tk-op">=</span>MIN_SCORE, deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)
    lex <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">recall</span>(<span class="tk-str">"keywords"</span>, query<span class="tk-op">=</span>{<span class="tk-str">"text"</span>: question, <span class="tk-str">"top_k"</span>: FETCH_K},
                       deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)

    fused <span class="tk-op">=</span> {}
    <span class="tk-kw">for</span> hits <span class="tk-kw">in</span> (sem.hits, lex.hits):
        <span class="tk-kw">for</span> rank, h <span class="tk-kw">in</span> <span class="tk-fn">enumerate</span>(hits):
            key <span class="tk-op">=</span> <span class="tk-str">f"{h.entry['doc_id']}#{h.entry['chunk_index']}"</span>
            slot <span class="tk-op">=</span> fused.<span class="tk-fn">setdefault</span>(key, {**h.entry, <span class="tk-str">"id"</span>: key, <span class="tk-str">"rrf"</span>: <span class="tk-num">0.0</span>})
            slot[<span class="tk-str">"rrf"</span>] += <span class="tk-num">1.0</span> / (RRF_K + rank + <span class="tk-num">1</span>)

    candidates <span class="tk-op">=</span> <span class="tk-fn">sorted</span>(fused.<span class="tk-fn">values</span>(), key<span class="tk-op">=</span><span class="tk-kw">lambda</span> c: c[<span class="tk-str">"rrf"</span>], reverse<span class="tk-op">=</span><span class="tk-kw">True</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"cache_hit"</span>: <span class="tk-kw">False</span>, <span class="tk-str">"candidates"</span>: candidates}`;
const rerankSnippet = `<span class="tk-cm"># reranker: a cheap lexical-overlap rescoring of the fused candidates.</span>
<span class="tk-cm"># Swap in a cross-encoder Neuron later without touching anything else.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">rerank_neuron</span>(input, context):
    qterms <span class="tk-op">=</span> <span class="tk-fn">set</span>(<span class="tk-fn">tokenize</span>(input[<span class="tk-str">"question"</span>]))
    top_k <span class="tk-op">=</span> <span class="tk-fn">int</span>(input.<span class="tk-fn">get</span>(<span class="tk-str">"top_k"</span>, TOP_K))

    rescored <span class="tk-op">=</span> []
    <span class="tk-kw">for</span> c <span class="tk-kw">in</span> input[<span class="tk-str">"candidates"</span>]:
        terms <span class="tk-op">=</span> <span class="tk-fn">set</span>(<span class="tk-fn">tokenize</span>(c[<span class="tk-str">"text"</span>]))
        overlap <span class="tk-op">=</span> <span class="tk-fn">len</span>(qterms &amp; terms) / (<span class="tk-fn">len</span>(qterms) <span class="tk-kw">or</span> <span class="tk-num">1</span>)
        rescored.<span class="tk-fn">append</span>({**c, <span class="tk-str">"score"</span>: <span class="tk-fn">round</span>(<span class="tk-num">0.7</span> * c[<span class="tk-str">"rrf"</span>] * RRF_K + <span class="tk-num">0.3</span> * overlap, <span class="tk-num">4</span>)})
    rescored.<span class="tk-fn">sort</span>(key<span class="tk-op">=</span><span class="tk-kw">lambda</span> c: c[<span class="tk-str">"score"</span>], reverse<span class="tk-op">=</span><span class="tk-kw">True</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"chunks"</span>: rescored[:top_k]}`;
const generateSnippet = `<span class="tk-cm"># generator: a HuggingFace Neuron grounds its answer in the chunks, then</span>
<span class="tk-cm"># imprints it into the SAME cache the retriever reads from - two Neurons</span>
<span class="tk-cm"># sharing one Engram through one binding name.</span>
<span class="tk-kw">def</span> <span class="tk-fn">make_generate_neuron</span>():
    llm <span class="tk-op">=</span> Neuron(source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>, endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
                 model<span class="tk-op">=</span>GEN_MODEL, api_key<span class="tk-op">=</span><span class="tk-fn">_hf_token</span>(), use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>,
                 max_new_tokens<span class="tk-op">=</span><span class="tk-num">512</span>, temperature<span class="tk-op">=</span><span class="tk-num">0.2</span>)

    <span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">generate_neuron</span>(input, context, *, imprint):
        chunks <span class="tk-op">=</span> input[<span class="tk-str">"chunks"</span>]
        <span class="tk-kw">if</span> <span class="tk-kw">not</span> chunks:
            <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: <span class="tk-str">"No relevant context found."</span>, <span class="tk-str">"sources"</span>: []}

        blocks <span class="tk-op">=</span> [<span class="tk-str">f"[{c['id']}]\n{c['text']}"</span> <span class="tk-kw">for</span> c <span class="tk-kw">in</span> chunks]
        messages <span class="tk-op">=</span> [
            {<span class="tk-str">"role"</span>: <span class="tk-str">"system"</span>, <span class="tk-str">"content"</span>: SYSTEM_PROMPT},
            {<span class="tk-str">"role"</span>: <span class="tk-str">"user"</span>, <span class="tk-str">"content"</span>: <span class="tk-str">"Context:\n\n"</span> + <span class="tk-str">"\n\n---\n\n"</span>.<span class="tk-fn">join</span>(blocks)
                                        + <span class="tk-str">f"\n\nQuestion: {input['question']}"</span>},
        ]
        out <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">llm</span>({<span class="tk-str">"messages"</span>: messages}, [])
        answer <span class="tk-op">=</span> out[<span class="tk-str">"response"</span>].<span class="tk-fn">strip</span>()

        <span class="tk-kw">await</span> <span class="tk-fn">imprint</span>(<span class="tk-str">"cache"</span>, op<span class="tk-op">=</span><span class="tk-str">"upsert"</span>,
                      entry<span class="tk-op">=</span>{<span class="tk-str">"content"</span>: answer, <span class="tk-str">"tags"</span>: [<span class="tk-str">"answer"</span>]},
                      merge_key<span class="tk-op">=</span><span class="tk-fn">_cache_key</span>(input[<span class="tk-str">"question"</span>]), await_ack<span class="tk-op">=</span><span class="tk-kw">False</span>)
        <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: answer, <span class="tk-str">"sources"</span>: [...]}

    <span class="tk-kw">return</span> generate_neuron`;
const wireSnippet = `<span class="tk-cm"># build_rag: 2 engram hosts + 2 workers + 1 orchestrator on one Synapse.</span>
<span class="tk-kw">def</span> <span class="tk-fn">build_rag</span>(synapse):
    vectors  <span class="tk-op">=</span> VectorEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"rag-vectors"</span>,  engram_kind<span class="tk-op">=</span><span class="tk-str">"semantic"</span>)
    keywords <span class="tk-op">=</span> KeywordEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"rag-keywords"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"lexical"</span>)
    cache    <span class="tk-op">=</span> InMemoryEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"rag-cache"</span>,   engram_kind<span class="tk-op">=</span><span class="tk-str">"context"</span>)

    host_a <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"rag"</span>,
                      dendrite_id<span class="tk-op">=</span><span class="tk-str">"engram-host-a"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    host_a.<span class="tk-fn">attach_engram</span>(vectors)
    host_b <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"rag"</span>,
                      dendrite_id<span class="tk-op">=</span><span class="tk-str">"engram-host-b"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    host_b.<span class="tk-fn">attach_engram</span>(keywords); host_b.<span class="tk-fn">attach_engram</span>(cache)

    bind_vec   <span class="tk-op">=</span> EngramBinding(name<span class="tk-op">=</span><span class="tk-str">"vectors"</span>,  directed_id<span class="tk-op">=</span><span class="tk-str">"rag-vectors"</span>)
    bind_kw    <span class="tk-op">=</span> EngramBinding(name<span class="tk-op">=</span><span class="tk-str">"keywords"</span>, directed_id<span class="tk-op">=</span><span class="tk-str">"rag-keywords"</span>)
    bind_cache <span class="tk-op">=</span> EngramBinding(name<span class="tk-op">=</span><span class="tk-str">"cache"</span>,    directed_id<span class="tk-op">=</span><span class="tk-str">"rag-cache"</span>)

    worker_a <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"rag"</span>,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"worker-a"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker_a.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"ingester"</span>, neuron_fn<span class="tk-op">=</span>ingest_neuron,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"rag-ingest"</span>], engrams<span class="tk-op">=</span>[bind_vec, bind_kw]))
    worker_a.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"retriever"</span>, neuron_fn<span class="tk-op">=</span>retrieve_neuron,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"rag-retrieve"</span>], engrams<span class="tk-op">=</span>[bind_vec, bind_kw, bind_cache]))

    worker_b <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"rag"</span>,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"worker-b"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    worker_b.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"reranker"</span>, neuron_fn<span class="tk-op">=</span>rerank_neuron,
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"rag-rerank"</span>]))
    worker_b.<span class="tk-fn">attach_axon</span>(Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"generator"</span>, neuron_fn<span class="tk-op">=</span><span class="tk-fn">make_generate_neuron</span>(),
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"rag-generate"</span>], engrams<span class="tk-op">=</span>[bind_cache]))

    orchestrator <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"rag"</span>,
                            dendrite_id<span class="tk-op">=</span><span class="tk-str">"rag-api"</span>, role<span class="tk-op">=</span><span class="tk-str">"orchestrator"</span>)
    <span class="tk-kw">return</span> [host_a, host_b, worker_a, worker_b, orchestrator], engrams, orchestrator`;
const pipelineSnippet = `<span class="tk-cm"># retrieve -&gt; rerank -&gt; generate, chained on ONE trace_id, so a doppler</span>
<span class="tk-cm"># renders the whole workflow as a single coherent trace.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">ask_pipeline</span>(orchestrator, question, *, top_k<span class="tk-op">=</span>TOP_K, timeout_s<span class="tk-op">=</span><span class="tk-num">60.0</span>):
    tid <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()

    r <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(neuron<span class="tk-op">=</span><span class="tk-str">"retriever"</span>,
        input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: question, <span class="tk-str">"top_k"</span>: top_k},
        trace_id<span class="tk-op">=</span>tid, timeout_s<span class="tk-op">=</span>timeout_s)
    out <span class="tk-op">=</span> r.payload[<span class="tk-str">"output"</span>]
    <span class="tk-kw">if</span> out.<span class="tk-fn">get</span>(<span class="tk-str">"cache_hit"</span>):                       <span class="tk-cm"># short-circuit</span>
        <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: out[<span class="tk-str">"answer"</span>], <span class="tk-str">"sources"</span>: [], <span class="tk-str">"cached"</span>: <span class="tk-kw">True</span>}

    r <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(neuron<span class="tk-op">=</span><span class="tk-str">"reranker"</span>,
        input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: question, <span class="tk-str">"candidates"</span>: out[<span class="tk-str">"candidates"</span>], <span class="tk-str">"top_k"</span>: top_k},
        trace_id<span class="tk-op">=</span>tid, parent_id<span class="tk-op">=</span>r.id, timeout_s<span class="tk-op">=</span>timeout_s)
    chunks <span class="tk-op">=</span> r.payload[<span class="tk-str">"output"</span>][<span class="tk-str">"chunks"</span>]

    r <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(neuron<span class="tk-op">=</span><span class="tk-str">"generator"</span>,
        input<span class="tk-op">=</span>{<span class="tk-str">"question"</span>: question, <span class="tk-str">"chunks"</span>: chunks},
        trace_id<span class="tk-op">=</span>tid, parent_id<span class="tk-op">=</span>r.id, timeout_s<span class="tk-op">=</span>timeout_s)
    <span class="tk-kw">return</span> {**r.payload[<span class="tk-str">"output"</span>], <span class="tk-str">"cached"</span>: <span class="tk-kw">False</span>}`;
const appSnippet = `<span class="tk-cm"># app.py - the FastAPI edge. Same build_rag(), one process. Set SYNAPSE_URL</span>
<span class="tk-cm"># to split the workers across machines without changing the pipeline.</span>
<span class="tk-op">@</span>asynccontextmanager
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">lifespan</span>(app):
    synapse <span class="tk-op">=</span> MemorySynapse(); <span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>()
    dendrites, engrams, orchestrator <span class="tk-op">=</span> <span class="tk-fn">build_rag</span>(synapse)
    <span class="tk-kw">async</span> <span class="tk-kw">with</span> AsyncExitStack() <span class="tk-kw">as</span> stack:
        <span class="tk-kw">for</span> d <span class="tk-kw">in</span> dendrites:
            <span class="tk-kw">await</span> stack.<span class="tk-fn">enter_async_context</span>(d)
        state.orchestrator <span class="tk-op">=</span> orchestrator
        <span class="tk-kw">yield</span>
    <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

<span class="tk-op">@</span>app.<span class="tk-fn">post</span>(<span class="tk-str">"/ask"</span>)
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">ask</span>(body: AskBody):
    <span class="tk-kw">return</span> <span class="tk-kw">await</span> <span class="tk-fn">ask_pipeline</span>(state.orchestrator, body.question, top_k<span class="tk-op">=</span>body.top_k)`;
const runSnippet = `<span class="tk-cm"># One-shot: boots everything in-process, ingests sample_docs/, asks 3</span>
<span class="tk-cm"># questions, then repeats one to show the answer-cache short-circuit.</span>
<span class="tk-op">$</span> python demo.py
ingested cosmonapse-core        6 chunks
ingested memory-and-pathways    5 chunks
index: 16 vector chunks, 16 keyword chunks

Q: What is a Dendrite and what role does it play?
A: A Dendrite is the only component that touches the Synapse [memory-and-pathways#1]
Q: What is a Dendrite and what role does it play?
A (cached): A Dendrite is the only component that touches the Synapse

<span class="tk-cm"># Or run the API and watch the 3-stage trace flow past in doppler.</span>
<span class="tk-op">$</span> uvicorn app:app <span class="tk-op">--</span>port 8000
<span class="tk-op">$</span> curl <span class="tk-op">-X</span> POST localhost:8000/ask <span class="tk-op">-H</span> "Content-Type: application/json" \
       <span class="tk-op">-d</span> '{"question": "What is a Dendrite?"}'
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">-n</span> rag`;

const prismWatchSnippet = `<span class="tk-cm"># This demo runs in-process on a MemorySynapse, which Prism can't attach to.</span>
<span class="tk-cm"># To watch it live, start a dev synapse and point the code at it:</span>

<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace=rag

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url=cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> rag

<span class="tk-cm"># in the code  -  swap one line:</span>
<span class="tk-cm"># synapse = MemorySynapse()</span>
synapse = await connect_synapse("cosmo://127.0.0.1:7070")`;

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
            trace. We build it bottom-up  -  the two index backends first, then each Neuron,
            then the wiring and the pipeline  -  and end with a one-command demo and a FastAPI
            edge. Every snippet is the real code from{" "}
            <code className="inline">cosmonapse-examples/11-rag</code>.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Topology</div>
          <h2 className="sub-title">Three stages, one trace.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            One <code className="inline">POST /ask</code> fans out across two workers and three
            Engrams, all stitched onto a single <code className="inline">trace_id</code>. Keep
            this picture in mind  -  the steps below build it one box at a time.
          </p>
          <CodeBlock filename="topology" html={topologySnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">00 · Install</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 16 }}>
            Python 3.11 or newer. <code className="inline">httpx</code> drives the Hugging Face
            embedding and generator calls; <code className="inline">fastapi</code> /{" "}
            <code className="inline">uvicorn</code> are only needed for the API in step 08. Grab
            a token at{" "}
            <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="inline-link">huggingface.co/settings/tokens</a>{" "}
             -  read scope is enough.
          </p>
          <CodeBlock html={installSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">01 · The index backends</div>
          <h2 className="sub-title">Two Engrams, one protocol.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            An <Link href="/docs/engram" className="inline-link">Engram</Link> is just a class
            that implements <code className="inline">recall()</code> /{" "}
            <code className="inline">imprint()</code>. <code className="inline">VectorEngram</code>{" "}
            does cosine similarity over embeddings; <code className="inline">KeywordEngram</code>{" "}
            does BM25 over an inverted index. <code className="inline">can_serve()</code> reports
            which query shapes each one understands, so a semantic query never reaches the lexical
            index and vice-versa.
          </p>
          <CodeBlock filename="vector_engram.py · keyword_engram.py" html={engramsSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">02 · The ingester</div>
          <h2 className="sub-title">One chunk, two indexes.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The ingester chunks the document, embeds the chunks once, and dual-writes each one to
            both indexes under the same <code className="inline">merge_key</code>. Re-ingesting a
            document upserts in place instead of duplicating. <code className="inline">imprint()</code>{" "}
            is injected into the Neuron by the Axon&apos;s Engram bindings  -  the Neuron never
            holds a connection itself.
          </p>
          <CodeBlock filename="rag_system.py" html={ingestSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">03 · The retriever</div>
          <h2 className="sub-title">Recall two indexes, fuse the ranks.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The retriever checks the answer cache first  -  a hit short-circuits the whole
            pipeline. Otherwise it recalls from the semantic and lexical indexes in their own
            query languages and fuses the two ranked lists with reciprocal-rank fusion, so a chunk
            that ranks well on either leg surfaces.
          </p>
          <CodeBlock filename="rag_system.py" html={retrieveSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">04 · The reranker</div>
          <h2 className="sub-title">A cheap rescore you can replace.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            A plain capability-routed Neuron  -  no Engram, no model. It rescores the fused
            candidates by lexical overlap and keeps the top <code className="inline">k</code>.
            Because it is just another stage on the bus, swapping it for a cross-encoder is a
            one-line change to the topology, not a rewrite.
          </p>
          <CodeBlock filename="rag_system.py" html={rerankSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">05 · The generator</div>
          <h2 className="sub-title">Grounded answer, cached on the way out.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            A HuggingFace <Link href="/concepts" className="inline-link">Neuron</Link> answers
            using only the reranked chunks, then imprints the answer into the same{" "}
            <code className="inline">cache</code> binding the retriever reads from. That shared
            binding is the entire mechanism behind the step-03 short-circuit  -  no special cache
            API, just two Neurons pointed at one Engram.
          </p>
          <CodeBlock filename="rag_system.py" html={generateSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">06 · Wire the topology</div>
          <h2 className="sub-title">Two hosts, two workers, one orchestrator.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">build_rag()</code> places the three Engrams on two host
            Dendrites, attaches the four Neurons across two workers, and binds each Neuron to only
            the Engrams it needs. <code className="inline">role=&quot;worker&quot;</code> guards
            keep workers from emitting orchestration Signals; the lone{" "}
            <code className="inline">role=&quot;orchestrator&quot;</code> drives the pipeline.
          </p>
          <CodeBlock filename="rag_system.py" html={wireSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">07 · The staged pipeline</div>
          <h2 className="sub-title">retrieve → rerank → generate, one lineage.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Each stage is an ordinary <code className="inline">dispatch_and_wait</code>. Threading
            one <code className="inline">trace_id</code> and the previous Signal&apos;s{" "}
            <code className="inline">parent_id</code> through the calls gives the whole workflow a
            single lineage, so <code className="inline">cosmo doppler -n rag</code> renders it as
            one trace instead of three disconnected tasks.
          </p>
          <CodeBlock filename="rag_system.py" html={pipelineSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">08 · Run it</div>
          <h2 className="sub-title">One script, or the API.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">demo.py</code> boots all five Dendrites in-process on a{" "}
            <code className="inline">MemorySynapse</code>, ingests the sample docs, and runs the
            pipeline  -  the repeated question returns from cache. The same{" "}
            <code className="inline">build_rag()</code> backs a FastAPI edge; set{" "}
            <code className="inline">SYNAPSE_URL</code> to split the workers across machines
            without touching the pipeline.
          </p>
          <CodeBlock filename="app.py" html={appSnippet} maxWidth={880} />
          <div style={{ marginTop: 24 }}>
            <CodeBlock filename="terminal" html={runSnippet} maxWidth={880} />
          </div>
          <p style={{ color: "var(--text-faint)", maxWidth: 760, marginTop: 8, fontSize: 12.5 }}>
            Exact answers vary  -  the generator is stochastic.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Watch it in Prism</div>
          <h2 className="sub-title">See the Signals fire in the browser.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">cosmo doppler --prism</code> opens a live, read-only view of
            every Signal on the bus  -  REGISTER, TASK, AGENT_OUTPUT, FINAL  -  as the workflow
            runs. The demo runs in-process on a <code className="inline">MemorySynapse</code>,
            which Prism can&apos;t attach to, so start a dev synapse and point the code at it.
          </p>
          <CodeBlock filename="terminal" html={prismWatchSnippet} maxWidth={880} />
          <div style={{ marginTop: 24 }}>
            <PrismPreview namespace="rag" src="/prism/rag.gif" />
          </div>
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
