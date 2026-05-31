"use client";

import React, { useState } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Tutorial track data
// ---------------------------------------------------------------------------

type Tier = "start" | "core" | "advanced" | "production";

type Tutorial = {
  number: number;
  title: string;
  surface: string;
  tier: Tier;
  note: React.ReactNode;
  blocks: { html: string }[];
  deeperLink?: { href: string; label: string };
};

const TIER_LABEL: Record<Tier, string> = {
  start: "start here",
  core: "core",
  advanced: "advanced",
  production: "production",
};

const tutorials: Tutorial[] = [
  // -------------------------------------------------------------------------
  // START HERE — 1, 2, 3
  // -------------------------------------------------------------------------
  {
    number: 1,
    title: "Hello world in 12 lines",
    surface: "MemorySynapse · Neuron · Axon · Dendrite · dispatch_and_wait",
    tier: "start",
    note: (
      <>
        A Neuron is just an async function. Wrap it in an Axon, host it on a
        Dendrite, connect an orchestrator Dendrite, and call{" "}
        <code className="inline">dispatch_and_wait</code>. No broker needed —
        MemorySynapse runs in-process.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, MemorySynapse

<span class="tk-kw">async def</span> <span class="tk-fn">greet</span>(input, context):
    <span class="tk-kw">return</span> {<span class="tk-str">"msg"</span>: <span class="tk-fn">f</span><span class="tk-str">"Hello, {input['name']}!"</span>}

synapse = MemorySynapse()
<span class="tk-kw">await</span> synapse.connect()

worker = Dendrite(synapse=synapse, namespace=<span class="tk-str">"demo"</span>, role=<span class="tk-str">"worker"</span>)
worker.attach_axon(Axon(neuron_id=<span class="tk-str">"greeter"</span>, neuron_fn=greet))

orch = Dendrite(synapse=synapse, namespace=<span class="tk-str">"demo"</span>)

<span class="tk-kw">async with</span> worker, orch:
    reply = <span class="tk-kw">await</span> orch.dispatch_and_wait(
        neuron=<span class="tk-str">"greeter"</span>, input={<span class="tk-str">"name"</span>: <span class="tk-str">"world"</span>}, timeout_s=<span class="tk-num">5.0</span>
    )
    print(reply.payload[<span class="tk-str">"output"</span>])  <span class="tk-cm"># {"msg": "Hello, world!"}</span>`,
      },
    ],
    deeperLink: { href: "/examples/building-a-neuron", label: "Building a Neuron — full walkthrough" },
  },
  {
    number: 2,
    title: "Multi-process dev with the CLI",
    surface: "cosmo synapse start · cosmo doppler · DevSynapse · connect_synapse",
    tier: "start",
    note: (
      <>
        In real dev you run each process separately. Start the broker with the
        CLI, then replace MemorySynapse with a URL — nothing else in your code
        changes.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-cm"># Terminal 1 — start the broker</span>
cosmo synapse start memory <span class="tk-op">--namespace</span>=demo

<span class="tk-cm"># Terminal 2 — watch every signal</span>
cosmo doppler <span class="tk-op">--url</span>=cosmo://127.0.0.1:7070 <span class="tk-op">--namespace</span>=demo`,
      },
      {
        html: `<span class="tk-cm"># worker.py — one URL change, everything else identical</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> connect_synapse, Axon, Dendrite

synapse = <span class="tk-kw">await</span> connect_synapse(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
worker = Dendrite(synapse=synapse, namespace=<span class="tk-str">"demo"</span>, role=<span class="tk-str">"worker"</span>)
worker.attach_axon(Axon(neuron_id=<span class="tk-str">"greeter"</span>, neuron_fn=greet))

<span class="tk-kw">async with</span> worker:
    <span class="tk-kw">await</span> asyncio.sleep(<span class="tk-fn">float</span>(<span class="tk-str">"inf"</span>))  <span class="tk-cm"># stay alive</span>`,
      },
    ],
    deeperLink: { href: "/quickstart", label: "Quickstart — install and first 5 minutes" },
  },
  {
    number: 3,
    title: "Capabilities + fire-and-forget dispatch",
    surface: "capabilities · dispatch_task · on_agent_output · emit_final",
    tier: "start",
    note: (
      <>
        Tag Axons with capability strings so orchestrators can route by what a
        neuron can do, not its exact id. Use the event-driven{" "}
        <code className="inline">@orch.on_agent_output</code> handler for
        fire-and-forget tasks.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-cm"># Declare what this neuron can do</span>
axon = Axon(
    neuron_id=<span class="tk-str">"summariser"</span>,
    neuron_fn=summarise,
    capabilities=[<span class="tk-str">"summarise"</span>, <span class="tk-str">"nlp"</span>],
)

<span class="tk-cm"># Route by capability, not by id</span>
<span class="tk-kw">await</span> orch.dispatch_task(
    capabilities=[<span class="tk-str">"summarise"</span>],
    input={<span class="tk-str">"text"</span>: <span class="tk-str">"..."</span>},
)

<span class="tk-cm"># Handle the reply globally</span>
<span class="tk-op">@</span>orch.on_agent_output
<span class="tk-kw">async def</span> <span class="tk-fn">done</span>(sig):
    print(<span class="tk-str">"Got:"</span>, sig.payload[<span class="tk-str">"output"</span>])
    <span class="tk-kw">await</span> orch.emit_final(
        trace_id=sig.trace_id, parent_id=sig.id, result=sig.payload[<span class="tk-str">"output"</span>]
    )`,
      },
    ],
    deeperLink: { href: "/examples/capability-routing", label: "Capability-based routing — full walkthrough" },
  },

  // -------------------------------------------------------------------------
  // CORE — 4, 5, 6
  // -------------------------------------------------------------------------
  {
    number: 4,
    title: "Lifecycle hooks",
    surface: "on_connect · on_refresh · on_schedule · LifecycleHooks",
    tier: "core",
    note: (
      <>
        Axons and Dendrites fire three hook kinds. Use them for startup
        announcements, heartbeat-driven reconciliation, and recurring background
        work — without a central orchestrator.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-cm"># Axon lifecycle — fires after REGISTER is emitted</span>
<span class="tk-op">@</span>axon.on_connect
<span class="tk-kw">async def</span> <span class="tk-fn">announce</span>(axon):
    print(<span class="tk-fn">f</span><span class="tk-str">"Neuron {axon.neuron_id} is live"</span>)

<span class="tk-cm"># Periodic maintenance (background task for the axon's lifetime)</span>
<span class="tk-op">@</span>axon.on_schedule(every_s=<span class="tk-num">30</span>)
<span class="tk-kw">async def</span> <span class="tk-fn">flush_cache</span>(axon):
    cache.clear()

<span class="tk-cm"># Dendrite lifecycle — fires on every heartbeat tick</span>
<span class="tk-op">@</span>dendrite.on_refresh
<span class="tk-kw">async def</span> <span class="tk-fn">reconcile</span>(d, event):
    <span class="tk-kw">if</span> event.reason == <span class="tk-str">"heartbeat"</span>:
        <span class="tk-kw">await</span> d.refresh(reason=<span class="tk-str">"manual"</span>)

<span class="tk-cm"># Dendrite periodic — gossip state every 10 s (peer-to-peer)</span>
<span class="tk-op">@</span>dendrite.on_schedule(every_s=<span class="tk-num">10</span>)
<span class="tk-kw">async def</span> <span class="tk-fn">gossip</span>(d):
    <span class="tk-kw">await</span> d.dispatch_task(neuron=<span class="tk-str">"peer"</span>, input={<span class="tk-str">"state"</span>: local_state()})`,
      },
    ],
  },
  {
    number: 5,
    title: "Pathway API — three consumption shapes",
    surface: "dispatch · dispatch_and_subscribe · Pathway.wait · Pathway.on · async for sig in pathway",
    tier: "core",
    note: (
      <>
        A Pathway is a per-trace event handle. Open one with{" "}
        <code className="inline">dispatch()</code> and consume it in whichever
        shape fits the workflow — blocking wait, callback, or async iteration.
        All three compose on the same Pathway.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-cm"># Shape 1 — blocking wait (request/reply)</span>
pw = <span class="tk-kw">await</span> orch.dispatch(neuron=<span class="tk-str">"thinker"</span>, input={<span class="tk-str">"q"</span>: <span class="tk-str">"why?"</span>})
sig = <span class="tk-kw">await</span> pw.wait(timeout_s=<span class="tk-num">10</span>)
print(sig.payload[<span class="tk-str">"output"</span>])

<span class="tk-cm"># Shape 2 — callbacks (reactive / streaming)</span>
pw = orch.dispatch_and_subscribe(neuron=<span class="tk-str">"streamer"</span>, input={...})

<span class="tk-op">@</span>pw.on(SignalType.AGENT_OUTPUT)
<span class="tk-kw">async def</span> <span class="tk-fn">on_chunk</span>(sig):
    sys.stdout.write(sig.payload[<span class="tk-str">"output"</span>][<span class="tk-str">"delta"</span>])

<span class="tk-cm"># Shape 3 — async iteration (stream everything on the trace)</span>
pw = <span class="tk-kw">await</span> orch.dispatch(neuron=<span class="tk-str">"planner"</span>, input={...})
<span class="tk-kw">async for</span> sig <span class="tk-kw">in</span> pw:
    print(sig.type.value, sig.payload)  <span class="tk-cm"># PLAN, TOOL_CALL, AGENT_OUTPUT …</span>

<span class="tk-cm"># Wait for a specific type (e.g. skip to FINAL)</span>
final = <span class="tk-kw">await</span> pw.wait_for(SignalType.FINAL, timeout_s=<span class="tk-num">30</span>)`,
      },
    ],
    deeperLink: { href: "/examples/pathway", label: "Pathway — three shapes, full walkthrough" },
  },
  {
    number: 6,
    title: "Neuron factory — wrap anything real-world",
    surface: "Neuron(source=...) · ollama · huggingface · flask · mcp",
    tier: "core",
    note: (
      <>
        <code className="inline">Neuron(source=...)</code> returns a callable
        that satisfies <code className="inline">NeuronFn</code>. It slots
        directly into <code className="inline">Axon.neuron_fn</code> — the rest
        of the protocol never knows what's behind it.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron

<span class="tk-cm"># Local Ollama daemon</span>
Axon(neuron_id=<span class="tk-str">"chat"</span>,
     neuron_fn=Neuron(source=<span class="tk-str">"ollama"</span>, model=<span class="tk-str">"llama3"</span>))

<span class="tk-cm"># HuggingFace TGI / vLLM / LM Studio</span>
Axon(neuron_id=<span class="tk-str">"summarise"</span>,
     neuron_fn=Neuron(source=<span class="tk-str">"huggingface"</span>, endpoint=<span class="tk-str">"http://localhost:8080"</span>))

<span class="tk-cm"># Existing Flask app — becomes a Neuron with zero rewrites</span>
Axon(neuron_id=<span class="tk-str">"legacy-api"</span>,
     neuron_fn=Neuron(source=<span class="tk-str">"flask"</span>, app=flask_app, default_path=<span class="tk-str">"/run"</span>))

<span class="tk-cm"># Stdio MCP server — tools become a Neuron surface</span>
Axon(neuron_id=<span class="tk-str">"files"</span>,
     neuron_fn=Neuron(source=<span class="tk-str">"mcp"</span>, server=<span class="tk-str">"filesystem"</span>, args=[<span class="tk-str">"."</span>]))`,
      },
    ],
    deeperLink: { href: "/examples/real-world-neurons", label: "Real-world Neurons — API + MCP walkthrough" },
  },

  // -------------------------------------------------------------------------
  // ADVANCED — 7, 8, 9
  // -------------------------------------------------------------------------
  {
    number: 7,
    title: "Parallel fan-out + phased workflows",
    surface: "asyncio.gather · dispatch_task · phase synchronisation · MemoryRegistryStore",
    tier: "advanced",
    note: (
      <>
        Dispatch multiple tasks simultaneously with{" "}
        <code className="inline">asyncio.gather</code>. Use{" "}
        <code className="inline">asyncio.Event</code> to gate each phase on the
        previous one completing.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-cm"># Phase 1 — design + arch in parallel</span>
p1_done = asyncio.Event()
results: dict = {}

<span class="tk-op">@</span>orch.on_agent_output
<span class="tk-kw">async def</span> <span class="tk-fn">collect</span>(sig):
    results[sig.payload[<span class="tk-str">"neuron"</span>]] = sig.payload[<span class="tk-str">"output"</span>]
    <span class="tk-kw">if</span> {<span class="tk-str">"design"</span>, <span class="tk-str">"arch"</span>} <= results.keys():
        p1_done.set()

<span class="tk-kw">await</span> asyncio.gather(
    orch.dispatch_task(neuron=<span class="tk-str">"design"</span>, input={<span class="tk-str">"brief"</span>: brief}),
    orch.dispatch_task(neuron=<span class="tk-str">"arch"</span>,   input={<span class="tk-str">"brief"</span>: brief}),
)
<span class="tk-kw">await</span> p1_done.wait()

<span class="tk-cm"># Phase 2 — frontend + backend use phase-1 results as context</span>
<span class="tk-kw">await</span> asyncio.gather(
    orch.dispatch_task(neuron=<span class="tk-str">"frontend"</span>, input={...},
                       context_ref=<span class="tk-str">"design_spec"</span>),
    orch.dispatch_task(neuron=<span class="tk-str">"backend"</span>,  input={...},
                       context_ref=<span class="tk-str">"arch_spec"</span>),
)`,
      },
    ],
  },
  {
    number: 8,
    title: "Engram — shared memory for Neurons",
    surface: "EngramBinding · InMemoryEngram · recall · imprint · attach_engram",
    tier: "advanced",
    note: (
      <>
        Declare an <code className="inline">EngramBinding</code> on the Axon.
        The SDK injects <code className="inline">recall</code> and{" "}
        <code className="inline">imprint</code> helpers into the Neuron at
        call time — the Neuron stays pure, it never imports the protocol.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-cm"># Neuron gains recall + imprint keyword args</span>
<span class="tk-kw">async def</span> <span class="tk-fn">researcher</span>(input, context, *, recall, imprint):
    prior = <span class="tk-kw">await</span> recall(<span class="tk-str">"ctx"</span>, query={<span class="tk-str">"text"</span>: input[<span class="tk-str">"question"</span>]})
    <span class="tk-kw">if</span> prior.hits:
        <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: prior.hits[<span class="tk-num">0</span>].content[<span class="tk-str">"answer"</span>], <span class="tk-str">"source"</span>: <span class="tk-str">"cache"</span>}

    answer = expensive_compute(input[<span class="tk-str">"question"</span>])
    <span class="tk-kw">await</span> imprint(<span class="tk-str">"ctx"</span>, op=<span class="tk-str">"upsert"</span>,
                   entry={<span class="tk-str">"question"</span>: input[<span class="tk-str">"question"</span>], <span class="tk-str">"answer"</span>: answer},
                   merge_key=<span class="tk-fn">f</span><span class="tk-str">"q:{input['question']}"</span>, await_ack=<span class="tk-kw">True</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: answer, <span class="tk-str">"source"</span>: <span class="tk-str">"computed"</span>}

<span class="tk-cm"># Wire the engram host and declare the binding on the axon</span>
host = Dendrite(synapse=synapse, namespace=<span class="tk-str">"demo"</span>, role=<span class="tk-str">"worker"</span>)
host.attach_engram(InMemoryEngram(engram_id=<span class="tk-str">"ctx"</span>, engram_kind=<span class="tk-str">"context"</span>))

worker.attach_axon(Axon(
    neuron_id=<span class="tk-str">"researcher"</span>, neuron_fn=researcher,
    engrams=[EngramBinding(name=<span class="tk-str">"ctx"</span>, engram_id=<span class="tk-str">"ctx"</span>)],
))`,
      },
    ],
    deeperLink: { href: "/examples/engram-integration", label: "Integrating an Engram — full walkthrough" },
  },
  {
    number: 9,
    title: "Clarifications — agents asking back",
    surface: "__clarification__ · Pathway.wait_for · SignalType.CLARIFICATION",
    tier: "advanced",
    note: (
      <>
        Return{" "}
        <code className="inline">{`{"__clarification__": True, "question": "..."}`}</code>{" "}
        from a Neuron to emit a CLARIFICATION signal. The orchestrator catches
        it and replies with a follow-up TASK.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-cm"># Neuron asks for more info</span>
<span class="tk-kw">async def</span> <span class="tk-fn">planner</span>(input, context):
    <span class="tk-kw">if</span> <span class="tk-str">"deadline"</span> <span class="tk-kw">not in</span> input:
        <span class="tk-kw">return</span> {<span class="tk-str">"__clarification__"</span>: <span class="tk-kw">True</span>,
                <span class="tk-str">"question"</span>: <span class="tk-str">"What is the project deadline?"</span>}
    <span class="tk-kw">return</span> {<span class="tk-str">"plan"</span>: build_plan(input)}

<span class="tk-cm"># Orchestrator handles the clarification</span>
pw = <span class="tk-kw">await</span> orch.dispatch(neuron=<span class="tk-str">"planner"</span>, input={<span class="tk-str">"goal"</span>: <span class="tk-str">"ship v2"</span>})
sig = <span class="tk-kw">await</span> pw.wait()

<span class="tk-kw">if</span> sig.type == SignalType.CLARIFICATION:
    answer = <span class="tk-kw">await</span> ask_user(sig.payload[<span class="tk-str">"question"</span>])
    pw2 = <span class="tk-kw">await</span> orch.dispatch(
        neuron=<span class="tk-str">"planner"</span>,
        input={<span class="tk-str">"goal"</span>: <span class="tk-str">"ship v2"</span>, <span class="tk-str">"deadline"</span>: answer},
    )
    final = <span class="tk-kw">await</span> pw2.wait()`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // PRODUCTION — 10
  // -------------------------------------------------------------------------
  {
    number: 10,
    title: "Production — persistent registry + NATS/Kafka",
    surface: "SqliteRegistryStore · PostgresRegistryStore · NatsSynapse · KafkaSynapse",
    tier: "production",
    note: (
      <>
        Swap one URL and one import. Every Neuron, Axon, and workflow stays
        identical — only the synapse and store change.
      </>
    ),
    blocks: [
      {
        html: `<span class="tk-cm"># dev</span>
synapse = MemorySynapse()
store   = MemoryRegistryStore()

<span class="tk-cm"># single-host production</span>
synapse = <span class="tk-kw">await</span> connect_synapse(<span class="tk-str">"nats://localhost:4222"</span>)
store   = SqliteRegistryStore(<span class="tk-str">"registry.db"</span>)

<span class="tk-cm"># multi-host production</span>
synapse = <span class="tk-kw">await</span> connect_synapse(<span class="tk-str">"nats://nats-cluster:4222"</span>)
store   = PostgresRegistryStore(<span class="tk-str">"postgresql://user:pw@host/db"</span>)

<span class="tk-cm"># durable audit trail</span>
synapse = <span class="tk-kw">await</span> connect_synapse(<span class="tk-str">"kafka://broker:9092"</span>)

<span class="tk-cm"># Dendrite construction is identical in all cases</span>
orch = Dendrite(synapse=synapse, registry_store=store, namespace=<span class="tk-str">"prod"</span>)`,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// CLI reference data
// ---------------------------------------------------------------------------

type CliCard = {
  title: string;
  commands: { html: string }[];
  description: React.ReactNode;
};

const cliCards: CliCard[] = [
  {
    title: "cosmo init",
    commands: [{ html: "cosmo init" }],
    description:
      "Scaffold a minimal Axon + Dendrite project. Creates worker.py, server.py, and a cosmo.toml in the current directory.",
  },
  {
    title: "cosmo synapse start",
    commands: [
      { html: "cosmo synapse start memory" },
      { html: `cosmo synapse start memory <span class="tk-op">--namespace</span>=dev` },
      { html: `cosmo synapse start memory <span class="tk-op">--port</span>=7070` },
      { html: `cosmo synapse start memory <span class="tk-op">--quiet</span>` },
    ],
    description:
      "Start a local dev synapse (TCP + NDJSON). Streams every signal to stdout by default — pass --quiet to suppress. Ctrl-C to stop.",
  },
  {
    title: "cosmo synapse view",
    commands: [
      { html: `cosmo synapse view <span class="tk-op">--url</span>=cosmo://127.0.0.1:7070` },
      { html: `cosmo synapse view <span class="tk-op">--url</span>=cosmo://... <span class="tk-op">--namespace</span>=dev` },
    ],
    description:
      "List all active namespaces on a running synapse. Pass --namespace to stream signals for that specific namespace.",
  },
  {
    title: "cosmo synapse stop",
    commands: [
      { html: `cosmo synapse stop <span class="tk-op">--url</span>=cosmo://127.0.0.1:7070 <span class="tk-op">--namespace</span>=dev` },
    ],
    description:
      "Gracefully stop a namespace on a running synapse. Sends DEREGISTER to all attached Dendrites before shutting down.",
  },
  {
    title: "cosmo doppler",
    commands: [
      { html: `cosmo doppler <span class="tk-op">--url</span>=cosmo://127.0.0.1:7070 <span class="tk-op">--namespace</span>=dev` },
    ],
    description:
      "Passive read-only signal watcher. Attaches a Doppler to the synapse and streams every signal type to stdout. Zero side-effects on the bus.",
  },
  {
    title: "cosmo validate",
    commands: [
      { html: `cosmo validate <span class="tk-op">--url</span>=cosmo://127.0.0.1:7070 <span class="tk-op">--namespace</span>=dev` },
    ],
    description:
      "Validates that every signal flowing through the synapse conforms to the envelope spec. Reports malformed fields, missing trace_ids, and version mismatches.",
  },
  {
    title: "cosmo completion",
    commands: [
      { html: "cosmo completion bash" },
      { html: "cosmo completion zsh" },
      { html: "cosmo completion fish" },
    ],
    description: (
      <>
        Print a shell-completion script. Pipe to your shell&rsquo;s rc file:{" "}
        <code className="inline">cosmo completion zsh &gt;&gt; ~/.zshrc</code>
      </>
    ),
  },
  {
    title: "typical dev loop",
    commands: [
      { html: "cosmo init" },
      { html: `cosmo synapse start memory <span class="tk-op">--namespace</span>=dev` },
      { html: `cosmo doppler <span class="tk-op">--namespace</span>=dev  <span class="tk-cm"># separate terminal</span>` },
      { html: `python worker.py  <span class="tk-cm"># separate terminal</span>` },
      { html: `cosmo validate <span class="tk-op">--namespace</span>=dev` },
    ],
    description:
      "Four terminals: broker, watcher, worker, validator. The doppler and validator are read-only — you can attach and detach them at any time.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TutorialsClient() {
  const [tab, setTab] = useState<"sdk" | "cli">("sdk");
  const [open, setOpen] = useState<Set<number>>(new Set([1]));

  const toggle = (n: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Examples</div>
          <h1 className="page-title">Tutorials, ordered.</h1>
          <p className="page-sub">
            Ten tutorials, sorted by what you need next. Start with the Neuron
            in twelve lines; finish on the production switch from
            MemorySynapse to NATS or Kafka. Then the CLI reference, in one
            page.
          </p>

          <div
            className="ex-tabs"
            role="tablist"
            aria-label="Examples view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "sdk"}
              className={`ex-tab${tab === "sdk" ? " active" : ""}`}
              onClick={() => setTab("sdk")}
            >
              SDK tutorials
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "cli"}
              className={`ex-tab${tab === "cli" ? " active" : ""}`}
              onClick={() => setTab("cli")}
            >
              CLI reference
            </button>
          </div>
        </div>
      </header>

      {tab === "sdk" && (
        <section className="section-sm">
          <div className="container">
            <div className="ex-track">
              {tutorials.map((t) => {
                const isOpen = open.has(t.number);
                return (
                  <div
                    key={t.number}
                    className={`ex-tut${isOpen ? " open" : ""}`}
                  >
                    <button
                      type="button"
                      className="ex-tut-head"
                      aria-expanded={isOpen}
                      onClick={() => toggle(t.number)}
                    >
                      <span className={`ex-num ex-num-${t.tier}`}>
                        {t.number}
                      </span>
                      <span className="ex-tut-meta">
                        <span className="ex-tut-title">{t.title}</span>
                        <span className="ex-tut-sub">{t.surface}</span>
                      </span>
                      <span className={`ex-badge ex-badge-${t.tier}`}>
                        {TIER_LABEL[t.tier]}
                      </span>
                      <span className="ex-chevron" aria-hidden>
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div className="ex-tut-body">
                        <p className="ex-note">{t.note}</p>
                        {t.blocks.map((b, i) => (
                          <pre
                            key={i}
                            className="ex-code"
                            dangerouslySetInnerHTML={{ __html: b.html }}
                          />
                        ))}
                        {t.deeperLink && (
                          <Link href={t.deeperLink.href} className="ex-deeper">
                            → {t.deeperLink.label}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {tab === "cli" && (
        <section className="section-sm">
          <div className="container">
            <div className="ex-cli-grid">
              {cliCards.map((c) => (
                <div key={c.title} className="ex-cli-card">
                  <div className="ex-cli-title">{c.title}</div>
                  <div className="ex-cli-cmds">
                    {c.commands.map((cmd, i) => (
                      <code
                        key={i}
                        className="ex-cli-cmd"
                        dangerouslySetInnerHTML={{ __html: cmd.html }}
                      />
                    ))}
                  </div>
                  <p className="ex-cli-desc">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .ex-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid var(--border);
          margin-top: 28px;
        }
        .ex-tab {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 13px;
          font-weight: 500;
          padding: 8px 16px 12px;
          cursor: pointer;
          color: var(--text-dim);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: color 0.15s, border-color 0.15s;
        }
        .ex-tab:hover {
          color: var(--text);
        }
        .ex-tab.active {
          color: var(--text);
          border-bottom-color: var(--accent);
        }

        .ex-track {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ex-tut {
          background: var(--bg-card, var(--bg-elev));
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .ex-tut.open {
          border-color: var(--border-strong);
        }
        .ex-tut-head {
          width: 100%;
          padding: 16px 18px;
          display: grid;
          grid-template-columns: 36px 1fr auto auto;
          align-items: center;
          gap: 14px;
          background: transparent;
          border: none;
          color: var(--text);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: background 0.15s;
        }
        .ex-tut-head:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .ex-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .ex-num-start {
          background: rgba(34, 211, 238, 0.14);
          color: #67e8f9;
        }
        .ex-num-core {
          background: rgba(139, 92, 246, 0.14);
          color: #c4b5fd;
        }
        .ex-num-advanced {
          background: rgba(251, 191, 36, 0.14);
          color: #fcd34d;
        }
        .ex-num-production {
          background: rgba(244, 114, 182, 0.14);
          color: #f9a8d4;
        }
        .ex-tut-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .ex-tut-title {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.005em;
        }
        .ex-tut-sub {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12px;
          color: var(--text-faint);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ex-badge {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .ex-badge-start {
          background: rgba(34, 211, 238, 0.12);
          color: #67e8f9;
          border: 1px solid rgba(34, 211, 238, 0.3);
        }
        .ex-badge-core {
          background: rgba(139, 92, 246, 0.12);
          color: #c4b5fd;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .ex-badge-advanced {
          background: rgba(251, 191, 36, 0.12);
          color: #fcd34d;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        .ex-badge-production {
          background: rgba(244, 114, 182, 0.12);
          color: #f9a8d4;
          border: 1px solid rgba(244, 114, 182, 0.3);
        }
        .ex-chevron {
          color: var(--text-faint);
          font-size: 12px;
          transition: transform 0.2s;
        }
        .ex-tut.open .ex-chevron {
          transform: rotate(180deg);
        }

        .ex-tut-body {
          border-top: 1px solid var(--border);
          padding: 18px 22px 22px;
        }
        .ex-note {
          font-size: 13.5px;
          color: var(--text-dim);
          line-height: 1.65;
          margin: 0 0 16px;
        }
        .ex-code {
          background: var(--bg, #07080c);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 16px;
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12.5px;
          line-height: 1.75;
          color: var(--text);
          overflow-x: auto;
          margin: 0 0 14px;
        }
        .ex-code:last-of-type {
          margin-bottom: 0;
        }
        .ex-deeper {
          display: inline-block;
          margin-top: 14px;
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12.5px;
          color: var(--accent-2);
          text-decoration: none;
        }
        .ex-deeper:hover {
          color: var(--accent);
        }

        .ex-cli-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 12px;
        }
        .ex-cli-card {
          background: var(--bg-card, var(--bg-elev));
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .ex-cli-title {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 12px;
          letter-spacing: -0.005em;
        }
        .ex-cli-cmds {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }
        .ex-cli-cmd {
          display: block;
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12px;
          background: var(--bg, #07080c);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 10px;
          color: var(--text);
          line-height: 1.5;
        }
        .ex-cli-desc {
          font-size: 12.5px;
          color: var(--text-dim);
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 720px) {
          .ex-tut-head {
            grid-template-columns: 32px 1fr auto;
          }
          .ex-tut-sub {
            font-size: 11px;
          }
          .ex-badge {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
