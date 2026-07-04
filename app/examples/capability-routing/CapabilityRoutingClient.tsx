"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";
import ComboExample, {
  type Combo,
  type ComboData,
  type Step,
} from "@/components/ComboExample";
import { PY_URL, brokerStep, runStep } from "../_shared";

// ===========================================================================
// Install  -  plain-function Neurons (no provider, so no HF_TOKEN / httpx).
// Only the SDK (+ optional transport driver) and, for TS, tsx.
// ===========================================================================

const INSTALL_HTML: Record<Combo, string> = {
  "py-dev": `<span class="tk-cm"># SDK + the bundled cosmo CLE  -  the devsynapse needs no broker.</span>
pip install cosmonapse`,
  "py-nats": `<span class="tk-cm"># SDK with the NATS extra.</span>
pip install <span class="tk-str">"cosmonapse"</span>`,
  "py-kafka": `<span class="tk-cm"># SDK + the Kafka driver (KafkaSynapse imports aiokafka lazily).</span>
pip install cosmonapse
pip install aiokafka`,
  "ts-dev": `<span class="tk-cm"># The TypeScript SDK. MemorySynapse needs no broker.</span>
npm install <span class="tk-op">@</span>cosmonapse/sdk
npm install <span class="tk-op">-D</span> tsx        <span class="tk-cm"># run .ts files directly</span>`,
  "ts-nats": `<span class="tk-cm"># The TypeScript SDK + the optional nats driver.</span>
npm install <span class="tk-op">@</span>cosmonapse/sdk nats
npm install <span class="tk-op">-D</span> tsx`,
};

function installStep(combo: Combo): Step {
  return {
    eyebrow: "Install",
    prose: (
      <>
        These workers are plain functions  -  no model provider  -  so the only
        dependency is the SDK itself (plus a transport driver where the bus
        isn&apos;t in-process).
      </>
    ),
    html: INSTALL_HTML[combo],
    maxWidth: 760,
  };
}

// ===========================================================================
// Python  -  two specialised workers + a capability router.
// One worker.py serves both roles; the only per-transport change is SYNAPSE_URL.
// ===========================================================================

const pyWorker = (url: string) => `<span class="tk-kw">import</span> asyncio, sys
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>   <span class="tk-cm"># ← the only line that changes per transport</span>
NAMESPACE   <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>

<span class="tk-cm"># A Neuron is just an async function. Each worker advertises a</span>
<span class="tk-cm"># different capability  -  swap in a real model when you're ready.</span>
<span class="tk-kw">async def</span> <span class="tk-fn">summarize</span>(input, context):
    <span class="tk-kw">return</span> {<span class="tk-str">"result"</span>: <span class="tk-fn">f</span><span class="tk-str">"summary: {input['text'][:40]}…"</span>}

<span class="tk-kw">async def</span> <span class="tk-fn">translate</span>(input, context):
    <span class="tk-kw">return</span> {<span class="tk-str">"result"</span>: <span class="tk-fn">f</span><span class="tk-str">"[fr] {input['text']}"</span>}

<span class="tk-cm"># role -> (capabilities advertised in REGISTER, neuron_fn)</span>
ROLES <span class="tk-op">=</span> {
    <span class="tk-str">"summarizer"</span>: ([<span class="tk-str">"summarize"</span>, <span class="tk-str">"text"</span>], summarize),
    <span class="tk-str">"translator"</span>: ([<span class="tk-str">"translate"</span>, <span class="tk-str">"text"</span>], translate),
}

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    role <span class="tk-op">=</span> sys.argv[<span class="tk-num">1</span>]                  <span class="tk-cm"># "summarizer" | "translator"</span>
    capabilities, fn <span class="tk-op">=</span> ROLES[role]

    axon <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span>role, neuron_fn<span class="tk-op">=</span>fn, capabilities<span class="tk-op">=</span>capabilities)

    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                        dendrite_id<span class="tk-op">=</span>role,
                        heartbeat_s<span class="tk-op">=</span><span class="tk-num">5.0</span>)   <span class="tk-cm"># re-announce every 5s so a late router finds us</span>
    dendrite.<span class="tk-fn">attach_axon</span>(axon)

    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:
            <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"{role} ready  -  advertising {capabilities}"</span>)
            <span class="tk-kw">await</span> asyncio.<span class="tk-fn">Event</span>().<span class="tk-fn">wait</span>()
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const pyRouter = (url: string) => `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, MemoryRegistryStore, connect_synapse, new_trace_id

SYNAPSE_URL <span class="tk-op">=</span> <span class="tk-str">"${url}"</span>
NAMESPACE   <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>

<span class="tk-cm"># Tasks are tagged with the CAPABILITY they need  -  never a worker id.</span>
TASKS <span class="tk-op">=</span> [
    {<span class="tk-str">"capability"</span>: <span class="tk-str">"summarize"</span>, <span class="tk-str">"text"</span>: <span class="tk-str">"Cosmonapse is an A2A protocol that…"</span>},
    {<span class="tk-str">"capability"</span>: <span class="tk-str">"translate"</span>, <span class="tk-str">"text"</span>: <span class="tk-str">"Hello, world"</span>},
    {<span class="tk-str">"capability"</span>: <span class="tk-str">"summarize"</span>, <span class="tk-str">"text"</span>: <span class="tk-str">"Neurons are plain functions that…"</span>},
]

<span class="tk-kw">class</span> <span class="tk-fn">CapabilityRouter</span>:
    <span class="tk-str">"""Routes each task to a worker advertising the required capability,</span>
<span class="tk-str">    discovered live from the RegistryStore  -  no hard-coded worker ids."""</span>

    <span class="tk-kw">def</span> <span class="tk-fn">__init__</span>(self, dendrite):
        self._dendrite <span class="tk-op">=</span> dendrite
        self._pending  <span class="tk-op">=</span> {}

        <span class="tk-op">@</span>dendrite.<span class="tk-fn">on_agent_output</span>
        <span class="tk-kw">async def</span> <span class="tk-fn">_on_output</span>(sig):
            fut <span class="tk-op">=</span> self._pending.<span class="tk-fn">pop</span>(sig.trace_id, <span class="tk-kw">None</span>)
            <span class="tk-kw">if</span> fut <span class="tk-kw">and not</span> fut.<span class="tk-fn">done</span>():
                fut.<span class="tk-fn">set_result</span>(sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"output"</span>, {}))

    <span class="tk-kw">async def</span> <span class="tk-fn">route</span>(self, capability, payload, timeout<span class="tk-op">=</span><span class="tk-num">30.0</span>):
        <span class="tk-cm"># Ask the registry who can do this right now.</span>
        candidates <span class="tk-op">=</span> <span class="tk-kw">await</span> self._dendrite.<span class="tk-fn">find_neurons</span>(capability<span class="tk-op">=</span>capability)
        <span class="tk-kw">if not</span> candidates:
            <span class="tk-kw">raise</span> <span class="tk-fn">RuntimeError</span>(<span class="tk-fn">f</span><span class="tk-str">"no live neuron advertises {capability!r}"</span>)
        target <span class="tk-op">=</span> candidates[<span class="tk-num">0</span>].neuron_id        <span class="tk-cm"># first live match</span>

        trace_id <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()
        fut <span class="tk-op">=</span> asyncio.<span class="tk-fn">get_running_loop</span>().<span class="tk-fn">create_future</span>()
        self._pending[trace_id] <span class="tk-op">=</span> fut
        <span class="tk-kw">await</span> self._dendrite.<span class="tk-fn">dispatch_task</span>(
            neuron<span class="tk-op">=</span>target, input<span class="tk-op">=</span>payload, trace_id<span class="tk-op">=</span>trace_id,
        )
        <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"→ {capability:9} routed to {target}"</span>)
        <span class="tk-kw">return</span> <span class="tk-kw">await</span> asyncio.<span class="tk-fn">wait_for</span>(fut, timeout<span class="tk-op">=</span>timeout)

<span class="tk-kw">async def</span> <span class="tk-fn">wait_for_caps</span>(dendrite, needed, timeout<span class="tk-op">=</span><span class="tk-num">15.0</span>):
    <span class="tk-str">"""Block until every required capability has a live provider."""</span>
    loop <span class="tk-op">=</span> asyncio.<span class="tk-fn">get_running_loop</span>()
    deadline <span class="tk-op">=</span> loop.<span class="tk-fn">time</span>() <span class="tk-op">+</span> timeout
    <span class="tk-kw">while</span> loop.<span class="tk-fn">time</span>() <span class="tk-op">&lt;</span> deadline:
        ready <span class="tk-op">=</span> [c <span class="tk-kw">for</span> c <span class="tk-kw">in</span> needed <span class="tk-kw">if</span> <span class="tk-kw">await</span> dendrite.<span class="tk-fn">find_neurons</span>(capability<span class="tk-op">=</span>c)]
        <span class="tk-kw">if</span> <span class="tk-fn">len</span>(ready) <span class="tk-op">==</span> <span class="tk-fn">len</span>(needed):
            <span class="tk-kw">return</span>
        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(<span class="tk-num">0.25</span>)
    <span class="tk-kw">raise</span> <span class="tk-fn">TimeoutError</span>(<span class="tk-fn">f</span><span class="tk-str">"workers for {needed} never appeared"</span>)

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> Dendrite(
        synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE, dendrite_id<span class="tk-op">=</span><span class="tk-str">"router"</span>,
        registry_store<span class="tk-op">=</span><span class="tk-fn">MemoryRegistryStore</span>(),   <span class="tk-cm"># ← powers find_neurons()</span>
        heartbeat_s<span class="tk-op">=</span><span class="tk-num">0</span>,                       <span class="tk-cm"># the router hosts no Axon</span>
    )
    router <span class="tk-op">=</span> <span class="tk-fn">CapabilityRouter</span>(dendrite)

    <span class="tk-kw">try</span>:
        <span class="tk-kw">async with</span> dendrite:           <span class="tk-cm"># subscribes to REGISTER/HEARTBEAT/DEREGISTER</span>
            needed <span class="tk-op">=</span> {t[<span class="tk-str">"capability"</span>] <span class="tk-kw">for</span> t <span class="tk-kw">in</span> TASKS}
            <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"waiting for workers advertising {needed}…"</span>)
            <span class="tk-kw">await</span> <span class="tk-fn">wait_for_caps</span>(dendrite, needed)
            <span class="tk-kw">for</span> t <span class="tk-kw">in</span> TASKS:
                out <span class="tk-op">=</span> <span class="tk-kw">await</span> router.<span class="tk-fn">route</span>(t[<span class="tk-str">"capability"</span>], {<span class="tk-str">"text"</span>: t[<span class="tk-str">"text"</span>]})
                <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"   ← {out.get('result', '')}"</span>)
    <span class="tk-kw">finally</span>:
        <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

// ===========================================================================
// TypeScript  -  NATS variant (cross-process: worker.ts + router.ts)
// ===========================================================================

const tsWorkerNats = `<span class="tk-kw">import</span> { Axon, Dendrite, NatsSynapse } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> NS <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>;

<span class="tk-cm">// role → [capabilities, neuronFn]. A Neuron is just an async function.</span>
<span class="tk-kw">const</span> ROLES: Record&lt;string, [string[], (i: any) =&gt; any]&gt; <span class="tk-op">=</span> {
  summarizer: [[<span class="tk-str">"summarize"</span>, <span class="tk-str">"text"</span>], (i) <span class="tk-op">=&gt;</span> ({ result: <span class="tk-str">\`summary: \${i.text.slice(0, 40)}…\`</span> })],
  translator: [[<span class="tk-str">"translate"</span>, <span class="tk-str">"text"</span>], (i) <span class="tk-op">=&gt;</span> ({ result: <span class="tk-str">\`[fr] \${i.text}\`</span> })],
};

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> role <span class="tk-op">=</span> process.argv[<span class="tk-num">2</span>] <span class="tk-op">??</span> <span class="tk-str">"summarizer"</span>;   <span class="tk-cm">// pass the role on the CLI</span>
  <span class="tk-kw">const</span> [capabilities, fn] <span class="tk-op">=</span> ROLES[role];

  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">NatsSynapse</span>({ url: <span class="tk-str">"nats://127.0.0.1:4222"</span> });
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>();

  <span class="tk-kw">const</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({
    synapse, namespace: NS, dendriteId: role, heartbeatMs: <span class="tk-num">5_000</span>,
  });
  dendrite.<span class="tk-fn">attachAxon</span>(<span class="tk-kw">new</span> <span class="tk-fn">Axon</span>({ neuronId: role, neuronFn: fn, capabilities }));

  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">start</span>();
  console.<span class="tk-fn">log</span>(<span class="tk-str">\`\${role} ready  -  advertising \${capabilities.join(", ")}\`</span>);
  <span class="tk-kw">await</span> <span class="tk-kw">new</span> <span class="tk-fn">Promise</span>(() <span class="tk-op">=&gt;</span> {});   <span class="tk-cm">// run forever</span>
}

<span class="tk-fn">main</span>();`;

const tsRouterNats = `<span class="tk-kw">import</span> { Dendrite, MemoryRegistryStore, NatsSynapse, newTraceId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> NS <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>;
<span class="tk-kw">const</span> TASKS <span class="tk-op">=</span> [
  { capability: <span class="tk-str">"summarize"</span>, text: <span class="tk-str">"Cosmonapse is an A2A protocol that…"</span> },
  { capability: <span class="tk-str">"translate"</span>, text: <span class="tk-str">"Hello, world"</span> },
  { capability: <span class="tk-str">"summarize"</span>, text: <span class="tk-str">"Neurons are plain functions that…"</span> },
];

<span class="tk-kw">async function</span> <span class="tk-fn">waitForCaps</span>(d: Dendrite, needed: string[], timeoutMs <span class="tk-op">=</span> <span class="tk-num">15_000</span>) {
  <span class="tk-kw">const</span> start <span class="tk-op">=</span> Date.<span class="tk-fn">now</span>();
  <span class="tk-kw">while</span> (Date.<span class="tk-fn">now</span>() <span class="tk-op">-</span> start <span class="tk-op">&lt;</span> timeoutMs) {
    <span class="tk-kw">const</span> lists <span class="tk-op">=</span> <span class="tk-kw">await</span> Promise.<span class="tk-fn">all</span>(needed.<span class="tk-fn">map</span>((c) <span class="tk-op">=&gt;</span> d.<span class="tk-fn">findNeurons</span>({ capability: c })));
    <span class="tk-kw">if</span> (lists.<span class="tk-fn">every</span>((l) <span class="tk-op">=&gt;</span> l.length <span class="tk-op">&gt;</span> <span class="tk-num">0</span>)) <span class="tk-kw">return</span>;
    <span class="tk-kw">await</span> <span class="tk-kw">new</span> <span class="tk-fn">Promise</span>((r) <span class="tk-op">=&gt;</span> <span class="tk-fn">setTimeout</span>(r, <span class="tk-num">250</span>));
  }
  <span class="tk-kw">throw new</span> <span class="tk-fn">Error</span>(<span class="tk-str">"timed out waiting for workers"</span>);
}

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">NatsSynapse</span>({ url: <span class="tk-str">"nats://127.0.0.1:4222"</span> });
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>();

  <span class="tk-kw">const</span> router <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({
    synapse, namespace: NS, dendriteId: <span class="tk-str">"router"</span>,
    registryStore: <span class="tk-kw">new</span> <span class="tk-fn">MemoryRegistryStore</span>(),   <span class="tk-cm">// ← powers findNeurons()</span>
    heartbeatMs: <span class="tk-num">0</span>,
  });

  <span class="tk-kw">const</span> pending <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Map</span>();
  router.<span class="tk-fn">onAgentOutput</span>((sig) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">const</span> resolve <span class="tk-op">=</span> pending.<span class="tk-fn">get</span>(sig.trace_id);
    <span class="tk-kw">if</span> (resolve) { pending.<span class="tk-fn">delete</span>(sig.trace_id); <span class="tk-fn">resolve</span>((sig.payload <span class="tk-kw">as</span> any).output); }
  });
  <span class="tk-kw">await</span> router.<span class="tk-fn">start</span>();

  <span class="tk-kw">const</span> needed <span class="tk-op">=</span> [...<span class="tk-kw">new</span> <span class="tk-fn">Set</span>(TASKS.<span class="tk-fn">map</span>((t) <span class="tk-op">=&gt;</span> t.capability))];
  <span class="tk-kw">await</span> <span class="tk-fn">waitForCaps</span>(router, needed);

  <span class="tk-kw">for</span> (<span class="tk-kw">const</span> t <span class="tk-kw">of</span> TASKS) {
    <span class="tk-kw">const</span> [worker] <span class="tk-op">=</span> <span class="tk-kw">await</span> router.<span class="tk-fn">findNeurons</span>({ capability: t.capability });
    <span class="tk-kw">if</span> (<span class="tk-op">!</span>worker) { console.<span class="tk-fn">log</span>(<span class="tk-str">\`no neuron for \${t.capability}\`</span>); <span class="tk-kw">continue</span>; }
    <span class="tk-kw">const</span> traceId <span class="tk-op">=</span> <span class="tk-fn">newTraceId</span>();
    <span class="tk-kw">const</span> done: any <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Promise</span>((res) <span class="tk-op">=&gt;</span> pending.<span class="tk-fn">set</span>(traceId, res));
    <span class="tk-kw">await</span> router.<span class="tk-fn">dispatchTask</span>({ neuron: worker.neuron_id, input: { text: t.text }, traceId });
    console.<span class="tk-fn">log</span>(<span class="tk-str">\`→ \${t.capability} routed to \${worker.neuron_id}   ← \${(await done).result}\`</span>);
  }
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>();
}

<span class="tk-fn">main</span>();`;

// ===========================================================================
// TypeScript  -  devsynapse variant (MemorySynapse, single in-process file)
// ===========================================================================

const tsDev = `<span class="tk-kw">import</span> { Axon, Dendrite, MemorySynapse, MemoryRegistryStore, newTraceId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> NS <span class="tk-op">=</span> <span class="tk-str">"quickstart"</span>;
<span class="tk-kw">const</span> ROLES <span class="tk-op">=</span> {
  summarizer: { caps: [<span class="tk-str">"summarize"</span>, <span class="tk-str">"text"</span>], fn: (i: any) <span class="tk-op">=&gt;</span> ({ result: <span class="tk-str">\`summary: \${i.text.slice(0, 40)}…\`</span> }) },
  translator: { caps: [<span class="tk-str">"translate"</span>, <span class="tk-str">"text"</span>], fn: (i: any) <span class="tk-op">=&gt;</span> ({ result: <span class="tk-str">\`[fr] \${i.text}\`</span> }) },
};

<span class="tk-kw">async function</span> <span class="tk-fn">main</span>() {
  <span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">MemorySynapse</span>();
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>();

  <span class="tk-cm">// Router first, so its REGISTER subscription is live before workers announce.</span>
  <span class="tk-kw">const</span> router <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({
    synapse, namespace: NS, dendriteId: <span class="tk-str">"router"</span>,
    registryStore: <span class="tk-kw">new</span> <span class="tk-fn">MemoryRegistryStore</span>(), heartbeatMs: <span class="tk-num">0</span>,
  });
  <span class="tk-kw">const</span> pending <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Map</span>();
  router.<span class="tk-fn">onAgentOutput</span>((sig) <span class="tk-op">=&gt;</span> {
    <span class="tk-kw">const</span> r <span class="tk-op">=</span> pending.<span class="tk-fn">get</span>(sig.trace_id);
    <span class="tk-kw">if</span> (r) { pending.<span class="tk-fn">delete</span>(sig.trace_id); <span class="tk-fn">r</span>((sig.payload <span class="tk-kw">as</span> any).output); }
  });
  <span class="tk-kw">await</span> router.<span class="tk-fn">start</span>();

  <span class="tk-cm">// Bring up the two specialised workers, sharing the same in-process bus.</span>
  <span class="tk-kw">for</span> (<span class="tk-kw">const</span> [role, { caps, fn }] <span class="tk-kw">of</span> Object.<span class="tk-fn">entries</span>(ROLES)) {
    <span class="tk-kw">const</span> w <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({ synapse, namespace: NS, dendriteId: role, heartbeatMs: <span class="tk-num">0</span> });
    w.<span class="tk-fn">attachAxon</span>(<span class="tk-kw">new</span> <span class="tk-fn">Axon</span>({ neuronId: role, neuronFn: fn, capabilities: caps }));
    <span class="tk-kw">await</span> w.<span class="tk-fn">start</span>();
  }
  <span class="tk-kw">await</span> <span class="tk-kw">new</span> <span class="tk-fn">Promise</span>((r) <span class="tk-op">=&gt;</span> <span class="tk-fn">setTimeout</span>(r, <span class="tk-num">50</span>));   <span class="tk-cm">// let REGISTERs arrive</span>

  <span class="tk-kw">const</span> TASKS <span class="tk-op">=</span> [
    { capability: <span class="tk-str">"summarize"</span>, text: <span class="tk-str">"Cosmonapse is an A2A protocol that…"</span> },
    { capability: <span class="tk-str">"translate"</span>, text: <span class="tk-str">"Hello, world"</span> },
  ];
  <span class="tk-kw">for</span> (<span class="tk-kw">const</span> t <span class="tk-kw">of</span> TASKS) {
    <span class="tk-kw">const</span> [worker] <span class="tk-op">=</span> <span class="tk-kw">await</span> router.<span class="tk-fn">findNeurons</span>({ capability: t.capability });
    <span class="tk-kw">if</span> (<span class="tk-op">!</span>worker) { console.<span class="tk-fn">log</span>(<span class="tk-str">\`no neuron for \${t.capability}\`</span>); <span class="tk-kw">continue</span>; }
    <span class="tk-kw">const</span> traceId <span class="tk-op">=</span> <span class="tk-fn">newTraceId</span>();
    <span class="tk-kw">const</span> done: any <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Promise</span>((res) <span class="tk-op">=&gt;</span> pending.<span class="tk-fn">set</span>(traceId, res));
    <span class="tk-kw">await</span> router.<span class="tk-fn">dispatchTask</span>({ neuron: worker.neuron_id, input: { text: t.text }, traceId });
    console.<span class="tk-fn">log</span>(<span class="tk-str">\`→ \${t.capability} → \${worker.neuron_id}   ← \${(await done).result}\`</span>);
  }
  <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>();
}

<span class="tk-fn">main</span>();`;

const outputSnippet = `<span class="tk-op">$</span> python demo.py
waiting for workers advertising {'summarize', 'translate'}…
→ summarize routed to summarizer
   ← summary: Cosmonapse is an A2A protocol that…
→ translate routed to translator
   ← [fr] Hello, world
→ summarize routed to summarizer
   ← summary: Neurons are plain functions that…`;

// ---------------------------------------------------------------------------
// Per-combo step assembly
// ---------------------------------------------------------------------------

function pyData(combo: "py-dev" | "py-nats" | "py-kafka"): ComboData {
  const url = PY_URL[combo];
  const broker = brokerStep(combo);
  const last = runStep(combo, [
    { label: "the summarizer", cmd: "python worker.py summarizer" },
    { label: "the translator", cmd: "python worker.py translator" },
    { label: "the router", cmd: "python demo.py" },
  ]);
  last.afterProse = (
    <>
      Each worker re-broadcasts REGISTER every 5s, so even though the router
      starts last it discovers both within one heartbeat. Watch tasks land on
      the worker that owns the capability:
    </>
  );
  last.html2 = outputSnippet;
  return {
    steps: [
      installStep(combo),
      ...(broker ? [broker] : []),
      {
        eyebrow: "Workers  -  two specialised Neurons",
        prose: (
          <>
            One <code className="inline">worker.py</code> serves both roles; the{" "}
            <code className="inline">ROLES</code> map picks the capabilities and
            the function. Each Axon advertises its capabilities in REGISTER  - 
            that is what the router searches on.
          </>
        ),
        filename: "worker.py",
        html: pyWorker(url),
      },
      {
        eyebrow: "The Router  -  discover by capability",
        prose: (
          <>
            The router is a Dendrite with a{" "}
            <code className="inline">registry_store</code>. Because it has a
            store, it auto-subscribes to REGISTER / HEARTBEAT / DEREGISTER and
            keeps a live view of the namespace. Each task calls{" "}
            <code className="inline">find_neurons(capability=…)</code> instead of
            naming a worker  -  workers can join or leave at runtime.
          </>
        ),
        filename: "demo.py",
        html: pyRouter(url),
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
        eyebrow: "Workers  -  bring-your-own Neuron",
        prose: (
          <>
            A Neuron is simply an{" "}
            <code className="inline">async (input) =&gt; output</code> function.
            One file serves both roles; pass the role as an argv. Capabilities
            are advertised through the Axon.
          </>
        ),
        filename: "worker.ts",
        html: tsWorkerNats,
      },
      {
        eyebrow: "The Router  -  discover by capability",
        prose: (
          <>
            Identical logic to Python: a{" "}
            <code className="inline">registryStore</code> makes{" "}
            <code className="inline">findNeurons(&#123; capability &#125;)</code>{" "}
            return the live workers that can serve each task. No worker ids in
            the routing code.
          </>
        ),
        filename: "router.ts",
        html: tsRouterNats,
      },
      runStep("ts-nats", [
        { label: "the summarizer", cmd: "npx tsx worker.ts summarizer" },
        { label: "the translator", cmd: "npx tsx worker.ts translator" },
        { label: "the router", cmd: "npx tsx router.ts" },
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
            <code className="inline">MemorySynapse</code> is in-process, so the
            router and both workers live in one Node program. The router starts
            first so its REGISTER subscription is live before the workers
            announce; the capability lookup is unchanged.
          </>
        ),
        filename: "capability-routing.ts",
        html: tsDev,
      },
      runStep("ts-dev", [
        { label: "everything", cmd: "npx tsx capability-routing.ts" },
      ]),
    ],
    extend: extendBody("ts-dev"),
  };
}

function extendBody(combo: Combo): React.ReactNode {
  return (
    <>
      <p>
        <strong>Many providers per capability.</strong>{" "}
        <code className="inline">find_neurons(capability=…)</code> returns every
        live match  -  load-balance across them (round-robin, least-recently-seen,
        or by <code className="inline">version</code>) instead of always taking
        the first.
      </p>
      <p>
        <strong>Persist the registry.</strong> Swap{" "}
        <code className="inline">MemoryRegistryStore</code> for{" "}
        <code className="inline">SqliteRegistryStore</code> or{" "}
        <code className="inline">PostgresRegistryStore</code> (Python) so the
        view survives restarts and is shared across multiple router processes.
      </p>
      <p>
        <strong>Watch members come and go.</strong> Kill a worker  -  it stops
        heartbeating and is marked deregistered;{" "}
        <code className="inline">registry_snapshot(include_deregistered=True)</code>{" "}
        shows the full history, while routing skips anything offline.
      </p>
      {combo === "ts-dev" ? (
        <p>
          <strong>Go multi-process.</strong> Swap{" "}
          <code className="inline">MemorySynapse</code> for{" "}
          <code className="inline">NatsSynapse</code> (the NATS tab) and split
          the file into <code className="inline">worker.ts</code> +{" "}
          <code className="inline">router.ts</code>  -  the discovery code is
          identical.
        </p>
      ) : (
        <p>
          <strong>Change transport.</strong> Every other tab is the same
          topology  -  only the install, the synapse you connect to, and the
          launch commands change. The capability-routing logic is byte-for-byte
          identical.
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

const prismWatchSnippet = `<span class="tk-cm"># This demo runs in-process on a MemorySynapse, which Prism can't attach to.</span>
<span class="tk-cm"># To watch it live, start a dev synapse and point the code at it:</span>

<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace=quickstart

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url=cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> quickstart

<span class="tk-cm"># in the code  -  swap one line:</span>
<span class="tk-cm"># synapse = MemorySynapse()</span>
synapse = await connect_synapse("cosmo://127.0.0.1:7070")`;

export default function CapabilityRoutingClient() {
  return (
    <>
      <div className="example-breadcrumb">
        <div className="container">
          <Link href="/examples" className="breadcrumb-back">
            ← Examples
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Capability-based routing</span>
        </div>
      </div>

      <header className="page-header" style={{ marginBottom: 24 }}>
        <div className="container">
          <div className="page-eyebrow">// 03 · Discovery</div>
          <h1 className="page-title">
            Route by What a Worker Can Do,
            <br />
            Not by Its Name.
          </h1>
          <p className="page-sub">
            A router Dendrite holds a <code className="inline">RegistryStore</code>{" "}
            and discovers workers from the REGISTER signals they broadcast. Each
            task names a <em>capability</em>; the router calls{" "}
            <code className="inline">find_neurons(capability=…)</code> to find a
            live worker that advertises it. Workers join and leave at runtime  - 
            no hard-coded address lists. The same code runs over five language ×
            transport stacks  -  pick one below.
          </p>

          <div
            style={{
              marginTop: 28,
              padding: "18px 22px",
              borderRadius: 10,
              border: "1px solid rgba(34, 211, 238, 0.28)",
              background: "rgba(34, 211, 238, 0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono, ui-monospace, monospace)",
                color: "var(--accent-2)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              New · Once-only routing at the transport layer
            </div>
            <p style={{ margin: 0, color: "var(--text-dim)", lineHeight: 1.65 }}>
              The SDK now supports capability dispatch{" "}
              <strong>without an explicit RegistryStore lookup</strong>:{" "}
              <code className="inline">await orch.dispatch(capabilities=[&quot;summarize&quot;], input=...)</code>{" "}
              publishes on a separate subject{" "}
              <code className="inline">cosmonapse.&lt;ns&gt;.TASK.routed</code> with a
              queue group keyed on each Dendrite&rsquo;s aggregate capabilities. The
              broker delivers each TASK <strong>exactly once</strong> within a matching
              cap profile  -  no router-side discovery code needed. Use the
              RegistryStore-based pattern below when you need richer selection (preferred
              version, locality, cost) or use <Link href="/examples/bidding" className="inline-link">bidding</Link>{" "}
              for atomic claim across heterogeneous workers.
            </p>
          </div>
        </div>
      </header>

      <ComboExample data={DATA} defaultCombo="py-dev" />

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
            <PrismPreview namespace="quickstart" src="/prism/capability-routing.mp4" />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/round-robin" className="card">
              <div className="card-icon">→</div>
              <h3>Orchestrator + Round Robin</h3>
              <p>
                The static-list cousin of this example: a Cortex rotates across a
                fixed worker pool.
              </p>
            </Link>
            <Link href="/docs" className="card">
              <div className="card-icon">→</div>
              <h3>RegistryStore reference</h3>
              <p>
                Every method on the store and the Dendrite discovery helpers,
                for Python and TypeScript.
              </p>
            </Link>
            <Link href="/concepts" className="card">
              <div className="card-icon">→</div>
              <h3>Concepts</h3>
              <p>Neuron, Axon, Dendrite, Synapse  -  what each one is and isn&apos;t.</p>
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
