"use client";

import React from "react";
import Link from "next/link";
import ComboExample, {
  type Combo,
  type ComboData,
} from "@/components/ComboExample";
import { PY_URL, installStep, brokerStep, runStep } from "../_shared";

// ===========================================================================
// Python  -  self-selecting worker + a routing-free producer.
// Both workers run the SAME owner_of(trace_id); exactly one claims each task.
// Only SYNAPSE_URL changes between dev / NATS / Kafka.
// ===========================================================================

const pyWorker = (url: string) => `<span class="tk-kw">import</span> asyncio, hashlib, os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron, Dendrite, SignalType, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>   <span class="tk-cm"># ← the only line that changes per transport</span>
NAMESPACE   <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>
MY_ID       <span class="tk-op">=</span> <span class="tk-str">"worker-a"</span>                 <span class="tk-cm"># worker-b differs only here</span>
PEERS       <span class="tk-op">=</span> (<span class="tk-str">"worker-a"</span>, <span class="tk-str">"worker-b"</span>)   <span class="tk-cm"># every peer knows the pool</span>

<span class="tk-kw">def</span> <span class="tk-fn">owner_of</span>(trace_id: str) <span class="tk-op">-&gt;</span> str:
    <span class="tk-str">"""Pure function: every peer computes the SAME owner  -  no coordination."""</span>
    h <span class="tk-op">=</span> <span class="tk-fn">int</span>(hashlib.<span class="tk-fn">sha1</span>(trace_id.<span class="tk-fn">encode</span>()).<span class="tk-fn">hexdigest</span>(), <span class="tk-num">16</span>)
    <span class="tk-kw">return</span> PEERS[h <span class="tk-op">%</span> <span class="tk-fn">len</span>(PEERS)]

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    <span class="tk-cm"># The Axon is NOT attached  -  we route by hash, not by neuron-id.</span>
    axon <span class="tk-op">=</span> Axon(
        neuron_id<span class="tk-op">=</span>MY_ID,
        neuron_fn<span class="tk-op">=</span>Neuron(
            source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
            endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
            model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
            api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
            use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>, max_new_tokens<span class="tk-op">=</span><span class="tk-num">128</span>,
        ),
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>],
    )

    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                        dendrite_id<span class="tk-op">=</span>MY_ID, heartbeat_s<span class="tk-op">=</span><span class="tk-num">0</span>)

    <span class="tk-kw">async def</span> <span class="tk-fn">on_task</span>(task):
        <span class="tk-kw">if</span> <span class="tk-fn">owner_of</span>(task.trace_id) <span class="tk-op">!=</span> MY_ID:
            <span class="tk-kw">return</span>                              <span class="tk-cm"># a peer owns this one</span>
        <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{MY_ID}] claims {task.trace_id[4:12]}"</span>)
        reply <span class="tk-op">=</span> <span class="tk-kw">await</span> axon.<span class="tk-fn">handle_task</span>(task)   <span class="tk-cm"># run the Neuron</span>
        <span class="tk-kw">await</span> dendrite.<span class="tk-fn">publish</span>(reply)          <span class="tk-cm"># emit AGENT_OUTPUT</span>

    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            <span class="tk-kw">await</span> dendrite.<span class="tk-fn">subscribe</span>(SignalType.TASK, on_task)
            <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"{MY_ID} listening  -  no cortex, no queue"</span>)
            <span class="tk-kw">await</span> asyncio.<span class="tk-fn">Event</span>().<span class="tk-fn">wait</span>()
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const pyProducer = (url: string) => `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse, new_trace_id

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"quickstart"</span>,
                        dendrite_id<span class="tk-op">=</span><span class="tk-str">"producer"</span>, heartbeat_s<span class="tk-op">=</span><span class="tk-num">0</span>)
    pending <span class="tk-op">=</span> {}

    <span class="tk-op">@</span>dendrite.<span class="tk-fn">on_agent_output</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">_on_output</span>(sig):
        fut <span class="tk-op">=</span> pending.<span class="tk-fn">pop</span>(sig.trace_id, <span class="tk-kw">None</span>)
        <span class="tk-kw">if</span> fut <span class="tk-kw">and not</span> fut.<span class="tk-fn">done</span>():
            who <span class="tk-op">=</span> sig.directed.id <span class="tk-kw">if</span> sig.directed <span class="tk-kw">else</span> <span class="tk-str">"?"</span>
            fut.<span class="tk-fn">set_result</span>((who, sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"output"</span>, {})))

    prompts <span class="tk-op">=</span> [<span class="tk-str">"the sun"</span>, <span class="tk-str">"the moon"</span>, <span class="tk-str">"the sea"</span>, <span class="tk-str">"the wind"</span>]
    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            <span class="tk-kw">for</span> p <span class="tk-kw">in</span> prompts:
                trace_id <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()
                fut <span class="tk-op">=</span> asyncio.<span class="tk-fn">get_running_loop</span>().<span class="tk-fn">create_future</span>()
                pending[trace_id] <span class="tk-op">=</span> fut
                <span class="tk-cm"># The producer does NO routing  -  it just drops work in.</span>
                <span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatch_task</span>(neuron<span class="tk-op">=</span><span class="tk-str">"pool"</span>,
                                             input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: p}, trace_id<span class="tk-op">=</span>trace_id)
                who, out <span class="tk-op">=</span> <span class="tk-kw">await</span> asyncio.<span class="tk-fn">wait_for</span>(fut, timeout<span class="tk-op">=</span><span class="tk-num">60</span>)
                <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"{who} answered: {out.get('response', '').strip()}"</span>)
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

// ===========================================================================
// TypeScript  -  NATS variant (cross-process: worker.ts + producer.ts)
// ===========================================================================

const tsWorkerNats = `<span class="tk-kw">import</span> { Axon, Dendrite, NatsSynapse, SignalType } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;
<span class="tk-kw">import</span> { createHash } <span class="tk-kw">from</span> <span class="tk-str">"node:crypto"</span>;

<span class="tk-kw">const</span> MY_ID <span class="tk-op">=</span> process.argv[<span class="tk-num">2</span>] <span class="tk-op">??</span> <span class="tk-str">"worker-a"</span>;
<span class="tk-kw">const</span> PEERS <span class="tk-op">=</span> [<span class="tk-str">"worker-a"</span>, <span class="tk-str">"worker-b"</span>];
<span class="tk-kw">const</span> NAMESPACE <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>;

<span class="tk-cm">// Pure function: every peer computes the SAME owner  -  no coordination.</span>
<span class="tk-kw">const</span> <span class="tk-fn">ownerOf</span> <span class="tk-op">=</span> (traceId: string) <span class="tk-op">=&gt;</span> {
  <span class="tk-kw">const</span> h <span class="tk-op">=</span> <span class="tk-fn">createHash</span>(<span class="tk-str">"sha1"</span>).<span class="tk-fn">update</span>(traceId).<span class="tk-fn">digest</span>();
  <span class="tk-kw">return</span> PEERS[h.<span class="tk-fn">readUInt32BE</span>(<span class="tk-num">0</span>) <span class="tk-op">%</span> PEERS.length];
};

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">NatsSynapse</span>({ url: <span class="tk-str">"nats://127.0.0.1:4222"</span> });
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>();

  <span class="tk-kw">const</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({
    synapse, namespace: NAMESPACE, dendriteId: MY_ID, heartbeatMs: <span class="tk-num">0</span>,
  });
  <span class="tk-cm">// The Axon is NOT attached  -  we route by hash, not by neuron-id.</span>
  <span class="tk-kw">const</span> axon <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Axon</span>({
    neuronId: MY_ID,
    neuronFn: <span class="tk-kw">async</span> (input: any) <span class="tk-op">=&gt;</span> ({ response: <span class="tk-str">\`[\${MY_ID}] line about \${input.prompt}\`</span> }),
    capabilities: [<span class="tk-str">"chat"</span>],
  });

  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">start</span>();
  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">subscribe</span>(SignalType.TASK, <span class="tk-kw">async</span> (task) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">if</span> (<span class="tk-fn">ownerOf</span>(task.trace_id) <span class="tk-op">!==</span> MY_ID) <span class="tk-kw">return</span>;   <span class="tk-cm">// a peer owns it</span>
    console.<span class="tk-fn">log</span>(<span class="tk-str">\`[\${MY_ID}] claims \${task.trace_id.slice(4, 12)}\`</span>);
    <span class="tk-kw">await</span> dendrite.<span class="tk-fn">publish</span>(<span class="tk-kw">await</span> axon.<span class="tk-fn">handleTask</span>(task));   <span class="tk-cm">// AGENT_OUTPUT</span>
  });

  console.<span class="tk-fn">log</span>(<span class="tk-str">\`\${MY_ID} listening  -  no cortex, no queue\`</span>);
  <span class="tk-kw">await</span> <span class="tk-kw">new</span> <span class="tk-fn">Promise</span>(() <span class="tk-op">=&gt;</span> {});
}

<span class="tk-fn">main</span>();`;

const tsProducerNats = `<span class="tk-kw">import</span> { Dendrite, NatsSynapse, newTraceId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">NatsSynapse</span>({ url: <span class="tk-str">"nats://127.0.0.1:4222"</span> });
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>();

  <span class="tk-kw">const</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({
    synapse, namespace: <span class="tk-str">"quickstart"</span>, dendriteId: <span class="tk-str">"producer"</span>, heartbeatMs: <span class="tk-num">0</span>,
  });
  <span class="tk-kw">const</span> pending <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Map</span>();
  dendrite.<span class="tk-fn">onAgentOutput</span>((sig) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">const</span> r <span class="tk-op">=</span> pending.<span class="tk-fn">get</span>(sig.trace_id);
    <span class="tk-kw">if</span> (r) { pending.<span class="tk-fn">delete</span>(sig.trace_id); <span class="tk-fn">r</span>([sig.directed?.id, (sig.payload <span class="tk-kw">as</span> any).output]); }
  });
  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">start</span>();

  <span class="tk-kw">for</span> (<span class="tk-kw">const</span> prompt <span class="tk-kw">of</span> [<span class="tk-str">"the sun"</span>, <span class="tk-str">"the moon"</span>, <span class="tk-str">"the sea"</span>, <span class="tk-str">"the wind"</span>]) {
    <span class="tk-kw">const</span> traceId <span class="tk-op">=</span> <span class="tk-fn">newTraceId</span>();
    <span class="tk-kw">const</span> done: any <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Promise</span>((res) <span class="tk-op">=&gt;</span> pending.<span class="tk-fn">set</span>(traceId, res));
    <span class="tk-cm">// No routing here  -  the workers decide who answers.</span>
    <span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatchTask</span>({ neuron: <span class="tk-str">"pool"</span>, input: { prompt }, traceId });
    <span class="tk-kw">const</span> [who, out] <span class="tk-op">=</span> <span class="tk-kw">await</span> done;
    console.<span class="tk-fn">log</span>(<span class="tk-str">\`\${who} answered: \${out.response}\`</span>);
  }
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>();
}

<span class="tk-fn">main</span>();`;

// ===========================================================================
// TypeScript  -  devsynapse variant (MemorySynapse, single in-process file)
// ===========================================================================

const tsDev = `<span class="tk-kw">import</span> { Axon, Dendrite, MemorySynapse, SignalType, newTraceId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;
<span class="tk-kw">import</span> { createHash } <span class="tk-kw">from</span> <span class="tk-str">"node:crypto"</span>;

<span class="tk-kw">const</span> NS <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>;
<span class="tk-kw">const</span> PEERS <span class="tk-op">=</span> [<span class="tk-str">"worker-a"</span>, <span class="tk-str">"worker-b"</span>];

<span class="tk-cm">// Every peer runs this identically  -  exactly one claims each trace.</span>
<span class="tk-kw">const</span> <span class="tk-fn">ownerOf</span> <span class="tk-op">=</span> (t: string) <span class="tk-op">=&gt;</span> {
  <span class="tk-kw">const</span> h <span class="tk-op">=</span> <span class="tk-fn">createHash</span>(<span class="tk-str">"sha1"</span>).<span class="tk-fn">update</span>(t).<span class="tk-fn">digest</span>();
  <span class="tk-kw">return</span> PEERS[h.<span class="tk-fn">readUInt32BE</span>(<span class="tk-num">0</span>) <span class="tk-op">%</span> PEERS.length];
};

<span class="tk-kw">const</span> <span class="tk-fn">makeWorker</span> <span class="tk-op">=</span> <span class="tk-kw">async</span> (synapse: MemorySynapse, id: string) <span class="tk-op">=&gt;</span> {
  <span class="tk-kw">const</span> d <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({ synapse, namespace: NS, dendriteId: id, heartbeatMs: <span class="tk-num">0</span> });
  <span class="tk-kw">const</span> axon <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Axon</span>({
    neuronId: id,
    neuronFn: <span class="tk-kw">async</span> (input: any) <span class="tk-op">=&gt;</span> ({ response: <span class="tk-str">\`[\${id}] line about \${input.prompt}\`</span> }),
    capabilities: [<span class="tk-str">"chat"</span>],
  });
  <span class="tk-kw">await</span> d.<span class="tk-fn">start</span>();
  <span class="tk-kw">await</span> d.<span class="tk-fn">subscribe</span>(SignalType.TASK, <span class="tk-kw">async</span> (task) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">if</span> (<span class="tk-fn">ownerOf</span>(task.trace_id) <span class="tk-op">!==</span> id) <span class="tk-kw">return</span>;
    <span class="tk-kw">await</span> d.<span class="tk-fn">publish</span>(<span class="tk-kw">await</span> axon.<span class="tk-fn">handleTask</span>(task));
  });
  <span class="tk-kw">return</span> d;
};

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">MemorySynapse</span>();   <span class="tk-cm">// in-process  -  no broker</span>
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>();
  <span class="tk-kw">await</span> Promise.<span class="tk-fn">all</span>(PEERS.<span class="tk-fn">map</span>((id) <span class="tk-op">=&gt;</span> <span class="tk-fn">makeWorker</span>(synapse, id)));

  <span class="tk-kw">const</span> producer <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({ synapse, namespace: NS, dendriteId: <span class="tk-str">"producer"</span>, heartbeatMs: <span class="tk-num">0</span> });
  <span class="tk-kw">const</span> pending <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Map</span>();
  producer.<span class="tk-fn">onAgentOutput</span>((sig) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">const</span> r <span class="tk-op">=</span> pending.<span class="tk-fn">get</span>(sig.trace_id);
    <span class="tk-kw">if</span> (r) { pending.<span class="tk-fn">delete</span>(sig.trace_id); <span class="tk-fn">r</span>([sig.directed?.id, (sig.payload <span class="tk-kw">as</span> any).output]); }
  });
  <span class="tk-kw">await</span> producer.<span class="tk-fn">start</span>();

  <span class="tk-kw">for</span> (<span class="tk-kw">const</span> prompt <span class="tk-kw">of</span> [<span class="tk-str">"the sun"</span>, <span class="tk-str">"the moon"</span>, <span class="tk-str">"the sea"</span>, <span class="tk-str">"the wind"</span>]) {
    <span class="tk-kw">const</span> traceId <span class="tk-op">=</span> <span class="tk-fn">newTraceId</span>();
    <span class="tk-kw">const</span> done: any <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Promise</span>((res) <span class="tk-op">=&gt;</span> pending.<span class="tk-fn">set</span>(traceId, res));
    <span class="tk-kw">await</span> producer.<span class="tk-fn">dispatchTask</span>({ neuron: <span class="tk-str">"pool"</span>, input: { prompt }, traceId });
    <span class="tk-kw">const</span> [who, out] <span class="tk-op">=</span> <span class="tk-kw">await</span> done;
    console.<span class="tk-fn">log</span>(<span class="tk-str">\`\${who} answered: \${out.response}\`</span>);
  }
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>();
}

<span class="tk-fn">main</span>();`;

const outputSnippet = `<span class="tk-op">$</span> python producer.py
<span class="tk-cm"># …meanwhile, in the two worker terminals:</span>
[worker-b] claims a3f2c1d8
[worker-a] claims 7b1e0942
[worker-a] claims 11ce88a4
[worker-b] claims 92aa5b30

<span class="tk-cm"># producer.py prints, in order:</span>
worker-b answered: Golden disc ascends  -  silence breaks into light.
worker-a answered: Pale lantern in the dark  -  tides remember her face.
worker-a answered: Salt sighs against stone, an old song the wind forgot.
worker-b answered: Invisible river  -  it bends the wheat into prayer.`;

// ---------------------------------------------------------------------------
// Per-combo step assembly
// ---------------------------------------------------------------------------

const noAttachNote = (
  <>
    Note the Axon is built but{" "}
    <strong>never attached to the Dendrite</strong>. Attaching would make the
    Dendrite auto-handle every TASK addressed to its{" "}
    <code className="inline">neuron_id</code>; here we want the worker to decide
    for itself, so we subscribe to <code className="inline">TASK</code> directly
    and run the Neuron only when the hash names us.
  </>
);

function pyData(combo: "py-dev" | "py-nats" | "py-kafka"): ComboData {
  const url = PY_URL[combo];
  const broker = brokerStep(combo);
  const last = runStep(combo, [
    { label: "first worker", cmd: "python worker_a.py" },
    { label: "second worker", cmd: "python worker_b.py" },
    { label: "the producer", cmd: "python producer.py" },
  ]);
  last.afterProse = (
    <>
      Ownership is decided by the trace id, so the split is deterministic  -  not
      strictly alternating:
    </>
  );
  last.html2 = outputSnippet;
  return {
    steps: [
      installStep(combo),
      ...(broker ? [broker] : []),
      {
        eyebrow: "Worker  -  it decides for itself",
        prose: noAttachNote,
        filename: "worker_a.py",
        html: pyWorker(url),
      },
      {
        eyebrow: "Producer  -  drops work in, routes nothing",
        prose: (
          <>
            The producer fires tasks addressed to a logical{" "}
            <code className="inline">&quot;pool&quot;</code> and waits for
            results. It never picks a worker  -  the{" "}
            <code className="inline">AGENT_OUTPUT</code> tells it who answered
            via <code className="inline">sig.directed.id</code>.
          </>
        ),
        filename: "producer.py",
        html: pyProducer(url),
      },
      last,
    ],
    extend: extendBody(combo),
  };
}

function tsNatsData(): ComboData {
  const broker = brokerStep("ts-nats");
  return {
    steps: [
      installStep("ts-nats"),
      ...(broker ? [broker] : []),
      {
        eyebrow: "Worker  -  it decides for itself",
        prose: (
          <>
            Same idea as Python: subscribe to{" "}
            <code className="inline">SignalType.TASK</code>, gate on{" "}
            <code className="inline">ownerOf(traceId)</code>, and only then run
            the Neuron and <code className="inline">publish</code> the result.
            One file serves both workers.
          </>
        ),
        filename: "worker.ts",
        html: tsWorkerNats,
      },
      {
        eyebrow: "Producer  -  drops work in, routes nothing",
        prose: (
          <>
            Dispatches to the logical{" "}
            <code className="inline">&quot;pool&quot;</code> neuron and reads{" "}
            <code className="inline">sig.directed.id</code> off each output to see who
            answered.
          </>
        ),
        filename: "producer.ts",
        html: tsProducerNats,
      },
      runStep("ts-nats", [
        { label: "first worker", cmd: "npx tsx worker.ts worker-a" },
        { label: "second worker", cmd: "npx tsx worker.ts worker-b" },
        { label: "the producer", cmd: "npx tsx producer.ts" },
      ]),
    ],
    extend: extendBody("ts-nats"),
  };
}

function tsDevData(): ComboData {
  return {
    steps: [
      installStep("ts-dev"),
      {
        eyebrow: "Everything in one file",
        prose: (
          <>
            <code className="inline">MemorySynapse</code> is in-process, so both
            self-selecting workers and the producer share one Node program. The
            ownership rule is identical to the multi-process version.
          </>
        ),
        filename: "no-orchestrator.ts",
        html: tsDev,
      },
      runStep("ts-dev", [
        { label: "everything", cmd: "npx tsx no-orchestrator.ts" },
      ]),
    ],
    extend: extendBody("ts-dev"),
  };
}

function extendBody(combo: Combo): React.ReactNode {
  return (
    <>
      <p>
        <strong>More peers.</strong> Add an id to{" "}
        <code className="inline">PEERS</code> on every worker. The hash spreads
        load across the new size automatically  -  no central change.
      </p>
      <p>
        <strong>Smoother rebalancing.</strong> Swap the modulo for{" "}
        consistent hashing with virtual nodes, so adding or removing a peer only
        moves a fraction of traces instead of reshuffling all of them.
      </p>
      <p>
        <strong>Broker-side balancing instead.</strong> If you don&apos;t need
        the workers to <em>decide</em>, give them the same{" "}
        <code className="inline">queue_group</code> on{" "}
        <code className="inline">subscribe(...)</code> and let the Synapse hand
        each task to exactly one  -  no hashing required.
      </p>
      <p>
        <strong>Live membership.</strong> Attach a{" "}
        <code className="inline">registry_store</code> and derive{" "}
        <code className="inline">PEERS</code> from{" "}
        <code className="inline">REGISTER</code> /{" "}
        <code className="inline">DEREGISTER</code> so the pool tracks workers
        joining and leaving.
      </p>
      {combo === "ts-dev" && (
        <p>
          <strong>Go multi-process.</strong> Swap{" "}
          <code className="inline">MemorySynapse</code> for{" "}
          <code className="inline">NatsSynapse</code> (the NATS tab) and split
          into <code className="inline">worker.ts</code> +{" "}
          <code className="inline">producer.ts</code>.
        </p>
      )}
    </>
  );
}

const DATA: Record<Combo, ComboData> = {
  "py-dev": pyData("py-dev"),
  "py-nats": pyData("py-nats"),
  "py-kafka": pyData("py-kafka"),
  "ts-dev": tsDevData(),
  "ts-nats": tsNatsData(),
};

export default function NoOrchestratorClient() {
  return (
    <>
      <div className="example-breadcrumb">
        <div className="container">
          <Link href="/examples" className="breadcrumb-back">
            ← Examples
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">No Orchestrator</span>
        </div>
      </div>

      <header className="page-header" style={{ marginBottom: 24 }}>
        <div className="container">
          <div className="page-eyebrow">// 02 · Decentralised</div>
          <h1 className="page-title">
            No Cortex.
            <br />
            The Dendrites Decide.
          </h1>
          <p className="page-sub">
            Drop the orchestrator entirely. A producer drops tasks into the
            namespace and every worker hears all of them  -  but each runs the
            same pure <code className="inline">owner_of(trace_id)</code>, so
            exactly one claims each task with zero coordination. No cortex, no
            queue, no shared state. Pick a stack below.
          </p>
        </div>
      </header>

      <ComboExample data={DATA} defaultCombo="py-dev" />

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/round-robin" className="card">
              <div className="card-icon">←</div>
              <h3>Orchestrator + Round Robin</h3>
              <p>
                The centralised counterpart  -  one Cortex assigns every task in a
                rotation.
              </p>
            </Link>
            <Link href="/concepts" className="card">
              <div className="card-icon">→</div>
              <h3>Concepts</h3>
              <p>Neuron, Axon, Dendrite, Synapse  -  what each one is and isn&apos;t.</p>
            </Link>
            <Link href="/docs" className="card">
              <div className="card-icon">→</div>
              <h3>API reference</h3>
              <p>Complete SDK and CLI reference for every primitive.</p>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .example-breadcrumb { padding: 20px 0 0; position: relative; z-index: 1; }
        .example-breadcrumb .container {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-family: var(--font-mono, ui-monospace, monospace);
        }
        .breadcrumb-back { color: var(--accent); transition: color 0.15s; }
        .breadcrumb-back:hover { color: #c4b5fd; }
        .breadcrumb-sep { color: var(--text-faint); }
        .breadcrumb-current { color: var(--text-dim); }
      `}</style>
    </>
  );
}
