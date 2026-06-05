"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

// ---------------------------------------------------------------------------
// Snippets  -  kept in sync with cosmonapse-core/examples/building_a_neuron/main.py
// ---------------------------------------------------------------------------

const installSnippet = `<span class="tk-cm"># Python 3.11+. httpx powers the HuggingFace Neuron source.</span>
<span class="tk-op">$</span> pip install cosmonapse httpx

<span class="tk-cm"># Read scope is enough  -  the token grants access to the public</span>
<span class="tk-cm"># Inference Providers router at https://router.huggingface.co.</span>
<span class="tk-op">$</span> <span class="tk-kw">export</span> HF_TOKEN<span class="tk-op">=</span>hf_xxxxxxxxxxxxxxxxxxxxxxxx`;

const neuronSnippet = `<span class="tk-cm"># A Neuron is anything that satisfies the NeuronFn contract:</span>
<span class="tk-cm">#   async fn(input, context) -> output</span>
<span class="tk-cm">#</span>
<span class="tk-cm"># The unified factory wraps any source behind that interface. Here it's</span>
<span class="tk-cm"># a HuggingFace endpoint; it could equally be Ollama, a Flask app, or an</span>
<span class="tk-cm"># MCP server  -  the Axon never knows the difference.</span>
<span class="tk-kw">import</span> os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Neuron

greeter <span class="tk-op">=</span> Neuron(
    source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
    use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>,
    max_new_tokens<span class="tk-op">=</span><span class="tk-num">128</span>,
    temperature<span class="tk-op">=</span><span class="tk-num">0.7</span>,
)

<span class="tk-cm"># Input the orchestrator sends: {"prompt": "..."} or {"messages": [...]}</span>
<span class="tk-cm"># Output the Neuron returns:    {"response": "&lt;text&gt;", "meta": &lt;raw&gt;}</span>`;

const axonSnippet = `<span class="tk-cm"># The Axon declares identity + capabilities and owns the Neuron.</span>
<span class="tk-cm"># It doesn't know it's wrapping an LLM  -  this code is byte-for-byte the</span>
<span class="tk-cm"># same as it would be for a hand-written async function.</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon

axon <span class="tk-op">=</span> Axon(
    neuron_id<span class="tk-op">=</span><span class="tk-str">"greeter"</span>,
    neuron_fn<span class="tk-op">=</span>greeter,
    capabilities<span class="tk-op">=</span>[<span class="tk-str">"text-generation"</span>, <span class="tk-str">"chat"</span>, <span class="tk-str">"greet"</span>],
)`;

const dendriteSnippet = `<span class="tk-cm"># The Dendrite is the only component that touches the Synapse.</span>
<span class="tk-cm"># role="worker" is a protocol guard: workers can serve TASKs and bid,</span>
<span class="tk-cm"># but cannot emit orchestration signals (TASK / FINAL / etc.).</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, MemorySynapse

synapse <span class="tk-op">=</span> MemorySynapse()         <span class="tk-cm"># in-process  -  no socket</span>
<span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>()

worker <span class="tk-op">=</span> Dendrite(
    synapse<span class="tk-op">=</span>synapse,
    namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>,
    role<span class="tk-op">=</span><span class="tk-str">"worker"</span>,
)
worker.<span class="tk-fn">attach_axon</span>(axon)

orchestrator <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)`;

const dispatchSnippet = `<span class="tk-cm"># dispatch_and_wait is sugar over a Pathway:</span>
<span class="tk-cm">#   1. emit a TASK on this trace_id</span>
<span class="tk-cm">#   2. open a Pathway scoped to the trace</span>
<span class="tk-cm">#   3. await the first terminal Signal (AGENT_OUTPUT here)</span>
<span class="tk-cm">#   4. close the Pathway, return the Signal</span>
<span class="tk-kw">async with</span> worker, orchestrator:
    reply <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(
        neuron<span class="tk-op">=</span><span class="tk-str">"greeter"</span>,
        input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: <span class="tk-str">"Say hello to a project called Cosmonapse in one line."</span>},
        timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>,
    )
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{reply.type.value}] {reply.payload['output']['response']}"</span>)`;

const fullSnippet = `<span class="tk-kw">import</span> asyncio, os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, MemorySynapse, Neuron


greeter <span class="tk-op">=</span> Neuron(
    source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
    use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>,
    max_new_tokens<span class="tk-op">=</span><span class="tk-num">128</span>,
    temperature<span class="tk-op">=</span><span class="tk-num">0.7</span>,
)


<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> MemorySynapse()
    <span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>()
    <span class="tk-kw">try</span>:
        axon <span class="tk-op">=</span> Axon(
            neuron_id<span class="tk-op">=</span><span class="tk-str">"greeter"</span>,
            neuron_fn<span class="tk-op">=</span>greeter,
            capabilities<span class="tk-op">=</span>[<span class="tk-str">"text-generation"</span>, <span class="tk-str">"chat"</span>, <span class="tk-str">"greet"</span>],
        )
        worker <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
        worker.<span class="tk-fn">attach_axon</span>(axon)

        orchestrator <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"demo"</span>)

        <span class="tk-kw">async with</span> worker, orchestrator:
            reply <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(
                neuron<span class="tk-op">=</span><span class="tk-str">"greeter"</span>,
                input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: <span class="tk-str">"Say hello to a project called Cosmonapse in one line."</span>},
                timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>,
            )
            <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{reply.type.value}] {reply.payload['output']['response']}"</span>)
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()


asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const outputSnippet = `<span class="tk-op">$</span> python main.py
[AGENT_OUTPUT] Hello, Cosmonapse! Welcome aboard  -  let's build something cool.`;

const swapEndpointSnippet = `<span class="tk-cm"># The endpoint is the only HF-specific line. Point it elsewhere for any</span>
<span class="tk-cm"># OpenAI-compatible chat server  -  your Neuron code never changes.</span>
endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>                          <span class="tk-cm"># default</span>
endpoint<span class="tk-op">=</span><span class="tk-str">"https://&lt;your-endpoint&gt;.endpoints.huggingface.cloud"</span>   <span class="tk-cm"># dedicated HF endpoint</span>
endpoint<span class="tk-op">=</span><span class="tk-str">"http://localhost:8080"</span>                                 <span class="tk-cm"># local TGI / vLLM / LM Studio</span>

<span class="tk-cm"># For Ollama, switch source  -  same Axon, same Dendrite.</span>
greeter <span class="tk-op">=</span> Neuron(source<span class="tk-op">=</span><span class="tk-str">"ollama"</span>, model<span class="tk-op">=</span><span class="tk-str">"llama3"</span>)`;

export default function BuildingNeuronClient() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Example 01 · Beginner</div>
          <h1 className="page-title">Building a Neuron.</h1>
          <p className="page-sub">
            The smallest possible Cosmonapse program  -  one LLM Neuron backed by
            Hugging Face, one Axon, one Dendrite, one TASK, one reply. Single
            process, in-memory{" "}
            <Link href="/concepts" className="inline-link">Synapse</Link>, no
            broker to start. Read this first; every other example adds
            something on top of this shape, and the LLM doesn&apos;t add any
            boilerplate.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">00 · Install</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 16 }}>
            Python 3.11 or newer. <code className="inline">httpx</code> powers
            the HuggingFace Neuron source. Grab a token at{" "}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              huggingface.co/settings/tokens
            </a>{" "}
             -  read scope is enough.
          </p>
          <CodeBlock html={installSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">01 · The Neuron</div>
          <h2 className="sub-title">An LLM, behind the same interface.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            A <Link href="/concepts" className="inline-link">Neuron</Link> is
            anything that satisfies{" "}
            <code className="inline">async fn(input, context) → output</code>.{" "}
            <code className="inline">Neuron(source=&quot;huggingface&quot;, ...)</code>{" "}
            is the unified factory: it returns an async callable with that
            shape, wrapped around any OpenAI-compatible chat endpoint. Switch{" "}
            <code className="inline">source=&quot;ollama&quot;</code> or{" "}
            <code className="inline">source=&quot;flask&quot;</code> and the
            rest of the program is unchanged.
          </p>
          <CodeBlock filename="greeter.py" html={neuronSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">02 · The Axon</div>
          <h2 className="sub-title">Identity, capabilities, validation.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The <Link href="/concepts" className="inline-link">Axon</Link> wraps
            the Neuron, gives it an addressable id on the bus, and turns return
            values into protocol-valid AGENT_OUTPUT Signals. It never touches
            the Synapse itself  -  that boundary is enforced in code, not
            convention. This snippet is identical whether the Neuron is an LLM,
            a function, or a Flask app.
          </p>
          <CodeBlock filename="axon.py" html={axonSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">03 · The Dendrite</div>
          <h2 className="sub-title">The only thing that touches the Synapse.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The <Link href="/concepts" className="inline-link">Dendrite</Link>{" "}
            hosts Axons, emits REGISTER / HEARTBEAT / DEREGISTER on their
            behalf, routes inbound TASKs, and exposes the dispatch API. We
            build two  -  a{" "}
            <code className="inline">role=&quot;worker&quot;</code> that serves
            requests, and an orchestrator (default role) that sends them. Both
            share the same in-memory Synapse.
          </p>
          <CodeBlock filename="dendrite.py" html={dendriteSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">04 · The dispatch</div>
          <h2 className="sub-title">One TASK, one Pathway, one reply.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">dispatch_and_wait</code> is sugar over a{" "}
            <Link href="/examples/pathway" className="inline-link">Pathway</Link>: emit
            a TASK on a new trace_id, open a Pathway scoped to that trace,
            await the first terminal Signal, close the Pathway, and return the
            Signal. The LLM Neuron returns{" "}
            <code className="inline">{`{"response": "...", "meta": {...}}`}</code>,
            so the answer lives at{" "}
            <code className="inline">reply.payload[&quot;output&quot;][&quot;response&quot;]</code>.
          </p>
          <CodeBlock filename="dispatch.py" html={dispatchSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">05 · Putting it together</div>
          <h2 className="sub-title">The whole program.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            About 25 lines of real code, including the LLM. Save as{" "}
            <code className="inline">main.py</code> and run.
          </p>
          <CodeBlock filename="main.py" html={fullSnippet} maxWidth={880} />
          <div style={{ marginTop: 24 }}>
            <CodeBlock html={outputSnippet} maxWidth={880} />
          </div>
          <p style={{ color: "var(--text-faint)", maxWidth: 760, marginTop: 8, fontSize: 12.5 }}>
            Exact text varies  -  the model is stochastic.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">06 · Swap the model</div>
          <h2 className="sub-title">One line moves between providers.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The endpoint is the only HuggingFace-specific line. Point it at a
            dedicated HF endpoint, a local TGI / vLLM server, or LM Studio  - 
            the Neuron, Axon, and Dendrite code never changes. For Ollama, swap
            the <code className="inline">source</code>.
          </p>
          <CodeBlock filename="providers.py" html={swapEndpointSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/engram-integration" className="card">
              <div className="card-icon">→</div>
              <h3>Integrating an Engram</h3>
              <p>Bind shared memory and call recall() / imprint() from inside the Neuron.</p>
            </Link>
            <Link href="/examples/pathway" className="card">
              <div className="card-icon">→</div>
              <h3>Pathway  -  three shapes</h3>
              <p>The full surface dispatch_and_wait is built on. Sequential, reactive, streaming.</p>
            </Link>
            <Link href="/examples/round-robin" className="card">
              <div className="card-icon">→</div>
              <h3>Round-robin orchestrator</h3>
              <p>Split worker and orchestrator across processes, load-balance HuggingFace workers.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
