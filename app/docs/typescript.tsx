import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import { Section, ApiCard, type TocGroup } from "./shared";

/** Render a single <Section> by id, or the whole reference when no id is given. */
function pickSection(all: React.ReactElement, section?: string) {
  if (!section) return all;
  const children = (all.props as { children?: React.ReactNode }).children;
  const match = React.Children.toArray(children).find(
    (k) => React.isValidElement(k) && (k.props as { id?: string }).id === section,
  );
  return <>{match ?? all}</>;
}

export const typescriptToc: TocGroup = {
  title: "TypeScript SDK",
  items: [
    { href: "#ts-install", label: "Installation" },
    { href: "#ts-imports", label: "Top-level imports" },
    { href: "#ts-axon", label: "Axon" },
    { href: "#ts-neuron", label: "Neuron  -  sources & clarify" },
    { href: "#ts-dendrite", label: "Dendrite" },
    { href: "#ts-pathway", label: "Pathway" },
    { href: "#ts-synapse", label: "Synapse" },
    { href: "#ts-registry", label: "RegistryStore" },
    { href: "#ts-engram", label: "Engram (shared memory)" },
    { href: "#ts-signal", label: "Signal & SignalType" },
    { href: "#ts-ids", label: "ID & trace helpers" },
    { href: "#ts-errors", label: "Protocol errors" },
    { href: "#ts-parity", label: "Parity with Python" },
  ],
};

/* ─────────────────────────────  CODE SNIPPETS  ───────────────────────────── */

const installSnippet = `<span class="tk-cm"># Node 18+. Published as an ESM package.</span>
$ npm i @cosmonapse/sdk

<span class="tk-cm"># Optional dependencies, lazily imported by the adapter that needs them:</span>
$ npm i nats                        <span class="tk-cm"># NatsSynapse</span>
$ npm i kafkajs                     <span class="tk-cm"># KafkaSynapse</span>
$ npm i better-sqlite3              <span class="tk-cm"># SqliteRegistryStore + SqliteEngram</span>
$ npm i pg                          <span class="tk-cm"># PostgresRegistryStore + PostgresEngram</span>
$ npm i @modelcontextprotocol/sdk   <span class="tk-cm"># mcpNeuron</span>

<span class="tk-cm"># From source:</span>
$ cd cosmonapse-core/packages/ts-sdk &amp;&amp; npm i &amp;&amp; npm run build`;

const importsSnippet = `<span class="tk-kw">import</span> {
  <span class="tk-cm">// Core primitives</span>
  Axon,
  Dendrite,
  Cortex,                 <span class="tk-cm">// back-compat alias of Dendrite</span>

  <span class="tk-cm">// Synapse adapters + URL helpers</span>
  MemorySynapse,
  DevSynapse,
  NatsSynapse,
  KafkaSynapse,
  synapseFromUrl,
  connectSynapse,

  <span class="tk-cm">// Registry stores</span>
  MemoryRegistryStore,
  SqliteRegistryStore,
  PostgresRegistryStore,
  neuronRecord,

  <span class="tk-cm">// Pathway  -  per-trace event handle</span>
  Pathway,
  PathwayClosedError,
  PATHWAY_TYPES,

  <span class="tk-cm">// Lifecycle hooks (onConnect / onRefresh / onSchedule)</span>
  LifecycleHooks,

  <span class="tk-cm">// Neuron  -  contract + source factories</span>
  clarify,
  isClarification,
  permissionRequest,
  neuron,                 <span class="tk-cm">// unified neuron(source, opts) factory</span>
  mcpNeuron,
  ollamaNeuron,
  huggingFaceNeuron,
  openaiNeuron,
  anthropicNeuron,
  standardMcpServers,

  <span class="tk-cm">// Engram  -  shared memory (RECALL / IMPRINT)</span>
  Engram,
  EngramBinding,
  EngramClient,
  InMemoryEngram,
  SqliteEngram,
  PostgresEngram,

  <span class="tk-cm">// Envelope + builders</span>
  SignalType,
  createSignal,
  validateSignal,
  directedTo,
  encode,
  decode,
  reply,
  newTraceId,
  newEventId,
  newEngramId,
  taskSignal,
  agentOutputSignal,
  <span class="tk-cm">// ... one typed builder per SignalType, taskOfferSignal through</span>
  <span class="tk-cm">// imprintedSignal (29 in total, from signals.ts)</span>

  <span class="tk-cm">// Errors</span>
  DendriteProtocolError,  <span class="tk-cm">// alias: CortexProtocolError</span>
  EngramError,            <span class="tk-cm">// + EngramTimeout / EngramCancelled / EngramNotBound / EngramOverloaded</span>
} <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">import</span> <span class="tk-kw">type</span> {
  Signal, Directed, Json, NeuronFn, NeuronHelpers,
  RegistryStore, Synapse, HandlerFilter,
  Hit, RecallResult, ImprintReceipt,
} <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;`;

const axonClassSnippet = `<span class="tk-kw">interface</span> AxonOptions {
  neuronId:        <span class="tk-kw">string</span>;
  neuronFn:        NeuronFn;
  capabilities?:   <span class="tk-kw">string</span>[];
  version?:        <span class="tk-kw">string</span>;
  neuronKind?:     <span class="tk-kw">string</span>;          <span class="tk-cm">// REGISTER directed.type; default "neuron"</span>
  contextFetcher?: ContextFetcher;
  outputParser?:   OutputParser;    <span class="tk-cm">// recognise CLARIFICATION / PERMISSION / ERROR</span>
  engrams?:        EngramBinding[]; <span class="tk-cm">// memory the Neuron may address by name</span>
}

<span class="tk-kw">class</span> Axon {
  <span class="tk-kw">readonly</span> neuronId: <span class="tk-kw">string</span>;
  <span class="tk-kw">readonly</span> capabilities: <span class="tk-kw">string</span>[];
  <span class="tk-kw">readonly</span> version: <span class="tk-kw">string</span> | <span class="tk-kw">undefined</span>;

  constructor(opts: AxonOptions);

  <span class="tk-cm">// Source-paired factories  -  create the Neuron and the Axon in one call:</span>
  <span class="tk-kw">static</span> openai(neuronId, opts, extra?): Axon;
  <span class="tk-kw">static</span> anthropic(neuronId, opts, extra?): Axon;
  <span class="tk-kw">static</span> ollama(neuronId, opts, extra?): Axon;
  <span class="tk-kw">static</span> huggingface(neuronId, opts, extra?): Axon;
  <span class="tk-kw">static</span> mcp(neuronId, opts, extra?): Axon;

  <span class="tk-cm">// Called by the Dendrite for each inbound TASK. Resolves</span>
  <span class="tk-cm">// contextRef, runs neuronFn, returns AGENT_OUTPUT / CLARIFICATION / PERMISSION / ERROR.</span>
  handleTask(task: Signal): Promise&lt;Signal>;

  <span class="tk-cm">// Pre-task hook  -  transform / validate / reject the TASK input.</span>
  beforeTask(fn: (input: Json) => unknown | Promise&lt;unknown>);

  <span class="tk-cm">// Detectors over the Neuron's RAW output  -  named detects* to stay</span>
  <span class="tk-cm">// distinct from the Dendrite's on* (which consume inbound Signals).</span>
  <span class="tk-cm">// Return the intent's fields to match, null to fall through.</span>
  <span class="tk-cm">// Precedence: error -> clarification -> permission -> output.</span>
  detectsOutput(fn: Recogniser): Recogniser;
  detectsClarification(fn: Recogniser): Recogniser;
  detectsPermission(fn: Recogniser): Recogniser;
  detectsError(fn: Recogniser): Recogniser;

  <span class="tk-cm">// Inherited from LifecycleHooks:</span>
  onConnect(fn);                  <span class="tk-cm">// after the hosting Dendrite emits REGISTER</span>
  onRefresh(fn);                  <span class="tk-cm">// each heartbeat tick</span>
  onSchedule(everyMs, fn);        <span class="tk-cm">// periodic background task</span>
}

<span class="tk-cm">// A Neuron is a plain function  -  sync or async. The optional third argument</span>
<span class="tk-cm">// carries the Engram helpers (recall / imprint) when engrams are bound:</span>
<span class="tk-kw">type</span> NeuronFn = (input: Json, context: unknown[], helpers?: NeuronHelpers)
  => Promise&lt;Json> | Json;`;

const axonUseSnippet = `<span class="tk-kw">import</span> { Axon, clarify } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> axon <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Axon</span>({
  neuronId: <span class="tk-str">"answerer"</span>,
  neuronFn: <span class="tk-kw">async</span> (input, context) <span class="tk-op">=></span> {
    <span class="tk-kw">if</span> (<span class="tk-op">!</span>input.q) <span class="tk-kw">return</span> <span class="tk-fn">clarify</span>(<span class="tk-str">"What should I answer?"</span>);
    <span class="tk-kw">return</span> { answer: <span class="tk-fn">String</span>(input.q).<span class="tk-fn">toUpperCase</span>() };
  },
  capabilities: [<span class="tk-str">"text"</span>, <span class="tk-str">"qa"</span>],
  version: <span class="tk-str">"1.2.0"</span>,
});`;

const neuronSnippet = `<span class="tk-kw">import</span> { clarify, isClarification } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> neuronFn: NeuronFn <span class="tk-op">=</span> <span class="tk-kw">async</span> (input, context) <span class="tk-op">=></span> {
  <span class="tk-kw">if</span> (<span class="tk-op">!</span>input.topic) <span class="tk-kw">return</span> <span class="tk-fn">clarify</span>(<span class="tk-str">"Which topic?"</span>, { hint: <span class="tk-str">"e.g. billing"</span> });
  <span class="tk-kw">return</span> { summary: <span class="tk-fn">summarise</span>(input.topic, context) };
};

<span class="tk-cm">// The Axon turns a clarify() return into a CLARIFICATION signal for you.</span>
<span class="tk-fn">isClarification</span>(<span class="tk-kw">await</span> <span class="tk-fn">neuronFn</span>({}, []));   <span class="tk-cm">// true</span>`;

const neuronSourceSnippet = `<span class="tk-kw">import</span> { Axon, mcpNeuron, neuron } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// An HTTP API is NOT a Neuron. Keep Express/Fastify on the OUTSIDE as an</span>
<span class="tk-cm">// HTTP boundary and dispatch TASKs from its routes via an orchestrator</span>
<span class="tk-cm">// Dendrite  -  see the real-world-neurons example.</span>

<span class="tk-cm">// MCP server  -  wrap any stdio MCP server's tools as a Neuron</span>
<span class="tk-kw">const</span> files <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Axon</span>({
  neuronId: <span class="tk-str">"files"</span>,
  neuronFn: <span class="tk-fn">mcpNeuron</span>({ server: <span class="tk-str">"filesystem"</span>, args: [<span class="tk-str">"/data"</span>], tool: <span class="tk-str">"read_file"</span> }),
});

<span class="tk-cm">// Or use the unified factory  -  mirrors Python's Neuron(source=…)</span>
<span class="tk-kw">const</span> sameFiles <span class="tk-op">=</span> <span class="tk-fn">neuron</span>(<span class="tk-str">"mcp"</span>, { server: <span class="tk-str">"filesystem"</span>, args: [<span class="tk-str">"/data"</span>] });`;

const dendriteClassSnippet = `<span class="tk-kw">interface</span> DendriteOptions {
  synapse:                Synapse;        <span class="tk-cm">// REQUIRED</span>
  registryStore?:         RegistryStore;
  namespace?:             <span class="tk-kw">string</span>;         <span class="tk-cm">// default "default"</span>
  dendriteId?:            <span class="tk-kw">string</span>;         <span class="tk-cm">// default "dendrite"</span>
  heartbeatMs?:           <span class="tk-kw">number</span>;         <span class="tk-cm">// default 30_000; 0 disables</span>
  reregisterOnHeartbeat?: <span class="tk-kw">boolean</span>;        <span class="tk-cm">// default true</span>
  role?:                  DendriteRole;   <span class="tk-cm">// "orchestrator" (default) | "worker"</span>
  autoBid?:               <span class="tk-kw">boolean</span>;        <span class="tk-cm">// default true  -  default bidder for hosted Axons</span>
  staleAfterMs?:          <span class="tk-kw">number</span>;         <span class="tk-cm">// liveness sweep; default 3 heartbeat intervals</span>
}

<span class="tk-kw">class</span> Dendrite {
  constructor(opts: DendriteOptions);

  <span class="tk-cm">// ── Axon lifecycle ──────────────────────────────────────</span>
  attachAxon(axon: Axon): <span class="tk-kw">void</span>;
  addAxon(axon: Axon): Promise&lt;<span class="tk-kw">void</span>>;              <span class="tk-cm">// attach while running</span>
  detachAxon(neuronId: <span class="tk-kw">string</span>, opts?: { reason? }): Promise&lt;<span class="tk-kw">void</span>>;
  start(): Promise&lt;<span class="tk-kw">void</span>>;
  stop(reason?: <span class="tk-kw">string</span>): Promise&lt;<span class="tk-kw">void</span>>;

  <span class="tk-cm">// ── Dispatch (orchestrator-role only) ────────────────────</span>
  <span class="tk-cm">// Addressed (neuron) or capability-routed (capabilities); at least one required.</span>
  dispatchTask(args: DispatchArgs &amp; { finalize?: <span class="tk-kw">boolean</span> }): Promise&lt;Signal>;

  <span class="tk-cm">// Pathway-based dispatch. scope: "all" | "terminal".</span>
  <span class="tk-cm">// finalize defaults true when scope is "terminal", so a stock worker's</span>
  <span class="tk-cm">// AGENT_OUTPUT is promoted to FINAL (terminal-handler finalize).</span>
  dispatch(args): Promise&lt;Pathway>;
  dispatchAndWait(args &amp; { timeoutMs?: <span class="tk-kw">number</span> }): Promise&lt;Signal>;
  dispatchAndSubscribe(args): Promise&lt;Pathway>;
  dispatchOffer(args: {
    input; capabilities?; deadlineMs?;            <span class="tk-cm">// BID-collection window</span>
    select?: <span class="tk-str">"first_bid"</span> | <span class="tk-str">"lowest_cost"</span> | <span class="tk-str">"highest_confidence"</span>;
  }): Promise&lt;Pathway>;
  observePathway(traceId: <span class="tk-kw">string</span>): Promise&lt;Pathway>;   <span class="tk-cm">// watch a peer's trace</span>

  <span class="tk-cm">// ── Resilience & cancellation (orchestrator-role only) ──</span>
  runWithRetry(args &amp; { retry: RetryStrategy; timeoutMs? }): Promise&lt;Signal>;
  emitStop(args: { traceId; rollback?; reason? }): Promise&lt;Signal>;
  stopTrace(traceId: <span class="tk-kw">string</span>, opts?: {
    rollback?; reason?; collectAcks?; timeoutMs?;
  }): Promise&lt;Signal[]>;

  <span class="tk-cm">// Worker side: register your own bidder (suppresses the auto-bidder).</span>
  onTaskOffer(fn: SignalHandler, filter?: HandlerFilter): SignalHandler;
  bid(offer: Signal, args: { neuron; cost; etaMs?; confidence? }): Promise&lt;Signal>;

  <span class="tk-cm">// ── Interactive cognition (CLARIFICATION / PERMISSION) ───</span>
  awaitDecision(request: Signal, opts?: { timeoutMs? }): Promise&lt;Signal>;
  answerClarification(request: Signal, opts: { answer; meta? }): Promise&lt;Signal>;

  <span class="tk-cm">// ── Engram  -  shared memory (RECALL / IMPRINT) ──────────</span>
  attachEngram(engram: Engram): Promise&lt;<span class="tk-kw">void</span>>;
  recall(args: { engramId?; engramKind?; query; ... }): Promise&lt;RecallResult>;
  imprint(args: { engramId?; engramKind?; op; entry; ... }): Promise&lt;ImprintReceipt | <span class="tk-kw">null</span>>;

  <span class="tk-cm">// ── Inbound handlers  -  method calls, NOT decorators ─────</span>
  <span class="tk-cm">// One per SignalType, all accepting an optional filter:</span>
  <span class="tk-cm">//   { neuron?, capability?, traceId? }</span>

  <span class="tk-cm">// Lifecycle</span>
  onTaskSignal(fn, filter?): SignalHandler;
  onAgentOutput(fn, filter?): SignalHandler;
  onFinal(fn, filter?): SignalHandler;
  onErrorSignal(fn, filter?): SignalHandler;

  <span class="tk-cm">// Routing / bidding</span>
  onTaskOffer(fn, filter?): SignalHandler;   <span class="tk-cm">// suppresses the auto-bidder</span>
  onBid(fn, filter?): SignalHandler;
  onTaskAwarded(fn, filter?): SignalHandler;
  onTaskDeclined(fn, filter?): SignalHandler;

  <span class="tk-cm">// Cognition</span>
  onPlan / onThoughtDelta / onToolCall / onToolResult(fn, filter?);
  onMemoryAppend / onCritique / onEscalation / onConsensus / onContextSync(fn, filter?);

  <span class="tk-cm">// Interactive cognition (see awaitDecision)</span>
  onClarification(fn, filter?): SignalHandler;
  onPermission(fn, filter?): SignalHandler;
  onClarificationAnswer(fn, filter?): SignalHandler;
  onPermissionDecision(fn, filter?): SignalHandler;

  <span class="tk-cm">// Engram</span>
  onRecallSignal / onImprintSignal(fn, filter?);    <span class="tk-cm">// requests on the bus</span>
  onRecalled / onImprinted(fn, filter?);            <span class="tk-cm">// responses (observability)</span>

  <span class="tk-cm">// Agent management + discovery</span>
  onRegister / onDeregister / onHeartbeat(fn, filter?);
  onDiscover(fn): SignalHandler;

  <span class="tk-cm">// Generic escape hatches</span>
  onSignal(<span class="tk-kw">type</span>: SignalType, fn, filter?): SignalHandler;
  onTrace(traceId: <span class="tk-kw">string</span>, ...types: SignalType[]): (fn) => SignalHandler;
  subscribe(<span class="tk-kw">type</span>: SignalType, handler: MessageHandler, opts?): Promise&lt;Subscription>;

  <span class="tk-cm">// Lifecycle hooks (inherited)</span>
  onConnect(fn): ConnectHook;    <span class="tk-cm">// after this Dendrite registers</span>
  onRefresh(fn): RefreshHook;    <span class="tk-cm">// heartbeat / register / deregister</span>
  onSchedule(everyMs, fn): ScheduleHook;

  <span class="tk-cm">// ── Cognition emitters ────────────────────────────────────</span>
  emitFinal(args: { traceId; parentId; result; meta? }): Promise&lt;Signal>;
  emitError(args: { traceId; parentId?; code; message; recoverable?; meta? }): Promise&lt;Signal>;
  <span class="tk-cm">// + emitPlan / emitThoughtDelta / emitToolCall / emitToolResult /</span>
  <span class="tk-cm">//   emitMemoryAppend / emitCritique / emitEscalation / emitConsensus / emitContextSync</span>
  emit(signal: Signal): Promise&lt;<span class="tk-kw">void</span>>;   <span class="tk-cm">// throws DendriteProtocolError off-list</span>

  <span class="tk-cm">// ── Registry reads (require registryStore) ──────────────</span>
  findNeurons(opts?: { capability?: <span class="tk-kw">string</span> }): Promise&lt;NeuronRecord[]>;
  registrySnapshot(opts?: ListOptions): Promise&lt;NeuronRecord[]>;
}`;

const dendriteUseSnippet = `<span class="tk-kw">import</span> { Axon, Dendrite, MemorySynapse } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> synapse <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">MemorySynapse</span>();
<span class="tk-kw">await</span> synapse.<span class="tk-fn">connect</span>();

<span class="tk-kw">const</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({
  synapse,
  namespace: <span class="tk-str">"demo"</span>,
  heartbeatMs: <span class="tk-num">5_000</span>,
});

dendrite.<span class="tk-fn">attachAxon</span>(
  <span class="tk-kw">new</span> <span class="tk-fn">Axon</span>({ neuronId: <span class="tk-str">"answerer"</span>, neuronFn: <span class="tk-kw">async</span> (i) <span class="tk-op">=></span> ({ answer: i.q }) }),
);

dendrite.<span class="tk-fn">onAgentOutput</span>(<span class="tk-kw">async</span> (sig) <span class="tk-op">=></span> {
  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">emitFinal</span>({
    traceId: sig.trace_id,
    parentId: sig.id,
    result: sig.payload.output,
  });
});

<span class="tk-kw">await</span> dendrite.<span class="tk-fn">start</span>();
<span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatchTask</span>({ neuron: <span class="tk-str">"answerer"</span>, input: { q: <span class="tk-str">"hi"</span> } });

<span class="tk-cm">// … on shutdown  -  the Dendrite never closes the synapse, you do:</span>
<span class="tk-kw">await</span> dendrite.<span class="tk-fn">stop</span>();
<span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>();`;

const synapseInterfaceSnippet = `<span class="tk-kw">interface</span> Synapse {
  connect(): Promise&lt;<span class="tk-kw">void</span>>;
  close(): Promise&lt;<span class="tk-kw">void</span>>;
  publish(subject: <span class="tk-kw">string</span>, signal: Signal): Promise&lt;<span class="tk-kw">void</span>>;
  subscribe(subject: <span class="tk-kw">string</span>, handler: MessageHandler, opts?: SubscribeOptions): Promise&lt;Subscription>;
  request(subject: <span class="tk-kw">string</span>, signal: Signal, opts?: RequestOptions): Promise&lt;Signal>;
}

<span class="tk-cm">// Build from a URL (mirrors Python's synapse_from_url / connect_synapse):</span>
<span class="tk-kw">import</span> { synapseFromUrl, connectSynapse } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;
<span class="tk-kw">const</span> dev   = synapseFromUrl("cosmo:<span class="tk-cm">//127.0.0.1:7070");   // DevSynapse (built, not connected)</span>
<span class="tk-kw">const</span> nats  = synapseFromUrl("nats:<span class="tk-cm">//nats:4222");          // NatsSynapse</span>
<span class="tk-kw">const</span> kafka = synapseFromUrl("kafka:<span class="tk-cm">//broker:9092");       // KafkaSynapse</span>
<span class="tk-kw">const</span> syn   = <span class="tk-kw">await</span> connectSynapse("cosmo:<span class="tk-cm">//127.0.0.1:7070");  // build + connect</span>

<span class="tk-cm">// memory:// has no URL  -  it is process-local, so build it directly:</span>
<span class="tk-kw">const</span> mem = <span class="tk-kw">new</span> MemorySynapse();`;

const registryStoreSnippet = `<span class="tk-kw">interface</span> RegistryStore {
  connect(): Promise&lt;<span class="tk-kw">void</span>>;
  close(): Promise&lt;<span class="tk-kw">void</span>>;
  upsert(record: NeuronRecord): Promise&lt;<span class="tk-kw">void</span>>;
  markDeregistered(neuronId: <span class="tk-kw">string</span>): Promise&lt;<span class="tk-kw">void</span>>;
  touchHeartbeat(neuronId: <span class="tk-kw">string</span>, ts: <span class="tk-kw">string</span>, status?: NeuronStatus): Promise&lt;<span class="tk-kw">void</span>>;
  get(neuronId: <span class="tk-kw">string</span>): Promise&lt;NeuronRecord | <span class="tk-kw">null</span>>;
  list(opts?: ListOptions): Promise&lt;NeuronRecord[]>;
}

<span class="tk-kw">type</span> NeuronStatus = <span class="tk-str">"registered"</span> | <span class="tk-str">"draining"</span> | <span class="tk-str">"deregistered"</span>;

<span class="tk-cm">// All three backends are ported:</span>
<span class="tk-kw">const</span> mem  = <span class="tk-kw">new</span> MemoryRegistryStore();
<span class="tk-kw">const</span> lite = <span class="tk-kw">new</span> SqliteRegistryStore(<span class="tk-str">"/var/lib/cosmonapse/registry.db"</span>);  <span class="tk-cm">// needs better-sqlite3</span>
<span class="tk-kw">const</span> pg   = <span class="tk-kw">new</span> PostgresRegistryStore({ dsn: "postgresql:<span class="tk-cm">//user:pw@host/cosmonapse" });  // needs pg</span>`;

const neuronRecordSnippet = `<span class="tk-kw">interface</span> <span class="tk-fn">NeuronRecord</span> {
  neuron_id:      string;          <span class="tk-cm">// wire field names stay snake_case</span>
  capabilities:   string[];
  version:        string <span class="tk-op">|</span> null;
  status:         NeuronStatus;
  last_heartbeat: string <span class="tk-op">|</span> null;  <span class="tk-cm">// ISO 8601</span>
  registered_at:  string;          <span class="tk-cm">// ISO 8601</span>
}

<span class="tk-cm">// Factory that fills defaults (status "registered", registered_at = now):</span>
<span class="tk-kw">const</span> rec <span class="tk-op">=</span> <span class="tk-fn">neuronRecord</span>({ neuron_id: <span class="tk-str">"answerer"</span>, capabilities: [<span class="tk-str">"qa"</span>] });`;

const signalSnippet = `<span class="tk-kw">interface</span> Signal {
  v:         <span class="tk-kw">string</span>;            <span class="tk-cm">// "1"</span>
  id:        <span class="tk-kw">string</span>;            <span class="tk-cm">// evt_&lt;ULID></span>
  trace_id:  <span class="tk-kw">string</span>;            <span class="tk-cm">// trc_&lt;ULID></span>
  parent_id: <span class="tk-kw">string</span> | <span class="tk-kw">null</span>;
  <span class="tk-kw">type</span>:      SignalType;
  directed:  Directed | <span class="tk-kw">null</span>;   <span class="tk-cm">// unified addressing</span>
  ts:        <span class="tk-kw">string</span>;            <span class="tk-cm">// RFC 3339 UTC</span>
  payload:   Json;
  meta:      Json;
}

<span class="tk-kw">interface</span> Directed {            <span class="tk-cm">// precedence on receive: id > type > capabilities</span>
  id:           <span class="tk-kw">string</span> | <span class="tk-kw">null</span>;  <span class="tk-cm">// direct address (neuron_id or engram_id)</span>
  <span class="tk-kw">type</span>:         <span class="tk-kw">string</span> | <span class="tk-kw">null</span>;  <span class="tk-cm">// type routing (neuron type or engram_kind)</span>
  capabilities: <span class="tk-kw">string</span>[];       <span class="tk-cm">// capability routing</span>
}
<span class="tk-cm">// Producer identity rides directed too: an AGENT_OUTPUT's directed.id</span>
<span class="tk-cm">// is the neuron that produced it (there is no Signal.neuron field).</span>

createSignal(input: NewSignalInput): Signal;   <span class="tk-cm">// fills defaults + validates</span>
validateSignal(signal: Signal): <span class="tk-kw">void</span>;          <span class="tk-cm">// throws on violation</span>
encode(signal: Signal): Uint8Array;             <span class="tk-cm">// UTF-8 JSON bytes</span>
decode(data: Uint8Array | <span class="tk-kw">string</span>): Signal;
reply(source: Signal, opts: { <span class="tk-kw">type</span>; payload?; directed?; meta? }): Signal;
directedTo(id?, <span class="tk-kw">type</span>?, capabilities?): Directed;`;

const signalTypeSnippet = `<span class="tk-cm">// SignalType is a const object (+ a union type), not a TS enum:</span>
<span class="tk-kw">const</span> SignalType = {
  TASK: <span class="tk-str">"TASK"</span>,
  AGENT_OUTPUT: <span class="tk-str">"AGENT_OUTPUT"</span>,
  FINAL: <span class="tk-str">"FINAL"</span>,
  ERROR: <span class="tk-str">"ERROR"</span>,
  <span class="tk-cm">// … TASK_OFFER, BID, TASK_AWARDED, TASK_DECLINED,</span>
  <span class="tk-cm">//    THOUGHT_DELTA, PLAN, TOOL_CALL, TOOL_RESULT,</span>
  <span class="tk-cm">//    MEMORY_APPEND, ESCALATION, CONSENSUS, CONTEXT_SYNC,</span>
  <span class="tk-cm">//    CRITIQUE, CLARIFICATION, PERMISSION,</span>
  <span class="tk-cm">//    PERMISSION_DECISION, CLARIFICATION_ANSWER,</span>
  <span class="tk-cm">//    RECALL, RECALLED, IMPRINT, IMPRINTED, DISCOVER,</span>
  REGISTER: <span class="tk-str">"REGISTER"</span>,
  DEREGISTER: <span class="tk-str">"DEREGISTER"</span>,
  HEARTBEAT: <span class="tk-str">"HEARTBEAT"</span>,
  <span class="tk-cm">// Workflow control  -  cooperative cancellation of a whole trace</span>
  STOP: <span class="tk-str">"STOP"</span>,
  STOPPED: <span class="tk-str">"STOPPED"</span>,
} <span class="tk-kw">as</span> <span class="tk-kw">const</span>;
<span class="tk-kw">type</span> SignalType = (<span class="tk-kw">typeof</span> SignalType)[<span class="tk-kw">keyof</span> <span class="tk-kw">typeof</span> SignalType];

<span class="tk-cm">// Sets controlling who may emit what:</span>
AXON_TYPES: ReadonlySet&lt;SignalType>;
SYNAPSE_TYPES: ReadonlySet&lt;SignalType>;`;

const retrySnippet = `<span class="tk-kw">import</span> { Dendrite, type RetryStrategy } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// Declarative retry policy for the request/reply shape.</span>
<span class="tk-kw">interface</span> RetryStrategy {
  maxAttempts?:     <span class="tk-kw">number</span>;   <span class="tk-cm">// total tries incl. the first (>= 1). Default 3</span>
  timeoutMs?:       <span class="tk-kw">number</span>;   <span class="tk-cm">// per-attempt terminal timeout. Default 30_000</span>
  backoffMs?:       (attempt: <span class="tk-kw">number</span>) => <span class="tk-kw">number</span>;  <span class="tk-cm">// default 0</span>
  retryOn?:         (outcome: Signal | Error) => <span class="tk-kw">boolean</span>;  <span class="tk-cm">// default defaultRetryOn</span>
  newTrace?:        <span class="tk-kw">boolean</span>;  <span class="tk-cm">// fresh trace + STOP the abandoned one. Default true</span>
  rollbackOnRetry?: <span class="tk-kw">boolean</span>;  <span class="tk-cm">// also roll back its Engram writes. Default false</span>
  onRetry?:         (attempt: <span class="tk-kw">number</span>, outcome: Signal | Error) => <span class="tk-kw">void</span>;
  reason?:          <span class="tk-kw">string</span>;   <span class="tk-cm">// carried on the preemptive STOP. Default "retry"</span>
}

<span class="tk-cm">// defaultRetryOn retries on a TimeoutError, a Pathway that closed before a</span>
<span class="tk-cm">// terminal, or an ERROR flagged recoverable. FINAL / AGENT_OUTPUT /</span>
<span class="tk-cm">// CLARIFICATION / PERMISSION are never retried.</span>
<span class="tk-kw">const</span> sig = <span class="tk-kw">await</span> orch.runWithRetry({
  neuron: <span class="tk-str">"flaky-worker"</span>, input: { q: <span class="tk-str">"hi"</span> },
  retry: {
    maxAttempts: <span class="tk-num">5</span>, timeoutMs: <span class="tk-num">10_000</span>,
    backoffMs: (a) => <span class="tk-num">1000</span> * <span class="tk-num">2</span> ** a,  <span class="tk-cm">// 1s, 2s, 4s, ...</span>
    rollbackOnRetry: <span class="tk-kw">true</span>,            <span class="tk-cm">// undo each abandoned attempt's Engram writes</span>
  },
});

<span class="tk-cm">// Or cancel a whole workflow yourself (and roll back its Engram writes):</span>
<span class="tk-kw">await</span> orch.stopTrace(traceId, { rollback: <span class="tk-kw">true</span>, reason: <span class="tk-str">"superseded"</span> });`;

const idsSnippet = `<span class="tk-kw">import</span> { newTraceId, newEventId, newEngramId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> trace = newTraceId();    <span class="tk-cm">// "trc_01JV…"  prefixed ULID</span>
<span class="tk-kw">const</span> id    = newEventId();    <span class="tk-cm">// "evt_01JV…"  prefixed ULID</span>
<span class="tk-kw">const</span> eng   = newEngramId();   <span class="tk-cm">// "eng_01JV…"  prefixed ULID (Engram entries)</span>

<span class="tk-kw">import</span> { ambientTrace, runWithTraceContext } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// Ambient trace context (trace-context.ts): the (traceId, parentId) of</span>
<span class="tk-cm">// the TASK currently being handled, carried via AsyncLocalStorage. Code</span>
<span class="tk-cm">// running inside a task without explicit trace plumbing  -  e.g. an</span>
<span class="tk-cm">// imprint fired from a detectsOutput hook  -  inherits the task's trace.</span>
<span class="tk-kw">const</span> ctx = ambientTrace();        <span class="tk-cm">// [traceId, parentId] | null</span>
runWithTraceContext(traceId, parentId, () =&gt; handler(sig));`;

const errorsSnippet = `<span class="tk-kw">import</span> { DendriteProtocolError, EngramTimeout, PathwayClosedError } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">try</span> {
  <span class="tk-kw">await</span> dendrite.emit(someAgentOutputSignal);   <span class="tk-cm">// AGENT_OUTPUT is Axon-owned</span>
} <span class="tk-kw">catch</span> (e) {
  <span class="tk-kw">if</span> (e <span class="tk-kw">instanceof</span> DendriteProtocolError) {
    <span class="tk-cm">// Dendrites may only emit SYNAPSE_TYPES.</span>
  }
}
<span class="tk-cm">// CortexProtocolError is an exported alias of DendriteProtocolError.</span>
<span class="tk-cm">// Engram I/O throws EngramError subclasses (EngramTimeout / EngramNotBound / …);</span>
<span class="tk-cm">// a Pathway closed before its Signal arrives throws PathwayClosedError.</span>`;

const engramClassSnippet = `<span class="tk-cm">// One Engram wraps one backend and owns its own schema.</span>
<span class="tk-kw">abstract</span> <span class="tk-kw">class</span> Engram {
  <span class="tk-kw">abstract</span> engramId: <span class="tk-kw">string</span>;
  <span class="tk-kw">abstract</span> engramKind: <span class="tk-kw">string</span>;
  <span class="tk-kw">abstract</span> capabilities: <span class="tk-kw">string</span>[];
  version: <span class="tk-kw">string</span> | <span class="tk-kw">null</span>;

  <span class="tk-kw">abstract</span> connect(): Promise&lt;<span class="tk-kw">void</span>>;
  <span class="tk-kw">abstract</span> close(): Promise&lt;<span class="tk-kw">void</span>>;

  <span class="tk-cm">// Return matching entries. Empty array on a miss; never throw on a miss.</span>
  <span class="tk-kw">abstract</span> recall(query: Json, opts?: RecallOptions): Promise&lt;Hit[]>;
  <span class="tk-cm">// op: "add" | "append" | "merge" | "upsert" | "delete"</span>
  <span class="tk-kw">abstract</span> imprint(op: ImprintOp, entry: Json, opts?: ImprintOptions): Promise&lt;ImprintReceipt>;
  <span class="tk-cm">// Return false to decline a query. Default: serve all.</span>
  canServe(query: Json): Promise&lt;<span class="tk-kw">boolean</span>>;
}

<span class="tk-cm">// Bundled backends (constructor inits mirror Python):</span>
<span class="tk-kw">new</span> InMemoryEngram({ engramId: <span class="tk-str">"engram-memory"</span>, engramKind: <span class="tk-str">"keyvalue"</span> });
<span class="tk-kw">new</span> SqliteEngram({ path: <span class="tk-str">"notes.db"</span>, engramId: <span class="tk-str">"notes-default"</span> });    <span class="tk-cm">// needs better-sqlite3</span>
<span class="tk-kw">new</span> PostgresEngram({ dsn: "postgresql:<span class="tk-cm">//user:pw@host/db" });           // needs pg</span>`;

const engramBindingSnippet = `<span class="tk-kw">import</span> { Axon, EngramBinding } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw"><span class="tk-cm">// The helpers ride a context object as the NeuronFn's optional THIRD</span>
<span class="tk-cm">// argument (JS cannot introspect parameter names like Python kwargs):</span>
<span class="tk-kw">const</span> summariser: NeuronFn = <span class="tk-kw">async</span> (input, context, helpers) => {
  <span class="tk-kw">const</span> prior = <span class="tk-kw">await</span> helpers.recall(<span class="tk-str">"notes"</span>, {
    query: { text: input.topic },
    filters: { tags: [<span class="tk-str">"kept"</span>] },
    deadlineMs: <span class="tk-num">200</span>,
    recallMode: <span class="tk-str">"first"</span>,
    minConfidence: <span class="tk-num">0.5</span>,
  });

  <span class="tk-kw">const</span> note = <span class="tk-str">"summary of "</span> + input.topic;

  <span class="tk-kw">await</span> helpers.imprint(<span class="tk-str">"notes"</span>, {
    op: <span class="tk-str">"append"</span>,
    entry: { key: input.topic, value: note },
    awaitAck: <span class="tk-kw">false</span>,                    <span class="tk-cm">// fire-and-forget by default</span>
  });
  <span class="tk-kw">return</span> { summary: note };
};

const</span> axon = <span class="tk-kw">new</span> Axon({
  neuronId: <span class="tk-str">"summariser"</span>,
  neuronFn: summariser,
  engrams: [
    <span class="tk-cm">// Addressed routing  -  the Neuron says recall("notes", ...)</span>
    <span class="tk-kw">new</span> EngramBinding({ name: <span class="tk-str">"notes"</span>, directedId: <span class="tk-str">"notes-default"</span> }),
    <span class="tk-cm">// Slot routing  -  deployment owns the concrete impl behind a kind</span>
    <span class="tk-kw">new</span> EngramBinding({
      name: <span class="tk-str">"memory"</span>,
      directedType: <span class="tk-str">"semantic"</span>,
      defaultDeadlineMs: <span class="tk-num">250</span>,
      defaultRecallMode: <span class="tk-str">"merge"</span>,      <span class="tk-cm">// "first" | "merge" | "all"</span>
    }),
  ],
});`;

const engramDendriteSnippet = `<span class="tk-kw">import</span> { Dendrite, InMemoryEngram, connectSynapse } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> synapse = <span class="tk-kw">await</span> connectSynapse("cosmo:<span class="tk-cm">//127.0.0.1:7070");</span>
<span class="tk-kw">const</span> host = <span class="tk-kw">new</span> Dendrite({ synapse, namespace: <span class="tk-str">"prod"</span> });

<span class="tk-cm">// Mount an Engram  -  it announces itself with REGISTER and serves</span>
<span class="tk-cm">// RECALL / IMPRINT addressed to its engramId or engramKind.</span>
<span class="tk-kw">await</span> host.attachEngram(<span class="tk-kw">new</span> InMemoryEngram({ engramId: <span class="tk-str">"ctx"</span> }));
<span class="tk-kw">await</span> host.start();

<span class="tk-cm">// Any Dendrite can read / write directly (EngramClient under the hood):</span>
<span class="tk-kw">const</span> hits = <span class="tk-kw">await</span> host.recall({
  engramId: <span class="tk-str">"ctx"</span>,                     <span class="tk-cm">// OR engramKind  -  id wins</span>
  query: { key: <span class="tk-str">"user-42"</span> },
});
<span class="tk-kw">await</span> host.imprint({
  engramId: <span class="tk-str">"ctx"</span>,
  op: <span class="tk-str">"upsert"</span>,
  entry: { key: <span class="tk-str">"user-42"</span>, value: { plan: <span class="tk-str">"pro"</span> } },
  awaitAck: <span class="tk-kw">true</span>,                      <span class="tk-cm">// resolve with the ImprintReceipt</span>
});

<span class="tk-cm">// Observability  -  watch Engram traffic on the bus:</span>
host.onRecalled((sig) => console.log(<span class="tk-str">"hits:"</span>, sig.payload.hits));
host.onImprinted((sig) => console.log(<span class="tk-str">"receipt:"</span>, sig.payload.receipt));`;

const axonFactorySnippet = `<span class="tk-kw">import</span> { Axon } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// One call: Neuron factory + Axon wiring + recogniser. The third argument</span>
<span class="tk-cm">// (AxonExtra) carries the Axon-side options: capabilities, version,</span>
<span class="tk-cm">// neuronKind, contextFetcher, outputParser, engrams.</span>
<span class="tk-kw">const</span> chat = Axon.huggingface(<span class="tk-str">"llama"</span>,
  { endpoint: "https:<span class="tk-cm">//router.huggingface.co",</span>
    model: <span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    apiKey: <span class="tk-kw">process</span>.env.HF_TOKEN, useChatApi: <span class="tk-kw">true</span> },
  { capabilities: [<span class="tk-str">"chat"</span>] });

<span class="tk-kw">const</span> cloud = Axon.openai(<span class="tk-str">"gpt"</span>, { model: <span class="tk-str">"gpt-4o"</span> });        <span class="tk-cm">// apiKey falls back to OPENAI_API_KEY</span>
<span class="tk-kw">const</span> local = Axon.ollama(<span class="tk-str">"chat"</span>, { model: <span class="tk-str">"llama3"</span> });
<span class="tk-kw">const</span> claude = Axon.anthropic(<span class="tk-str">"claude"</span>, { model: <span class="tk-str">"claude-sonnet-4-6"</span> });
<span class="tk-kw">const</span> files = Axon.mcp(<span class="tk-str">"files"</span>, { server: <span class="tk-str">"filesystem"</span>, args: [<span class="tk-str">"/data"</span>] });

<span class="tk-cm">// Each factory wires the source family's recogniser (parseLlmIntents /</span>
<span class="tk-cm">// parseMcpIntents), so the model can signal CLARIFICATION / PERMISSION /</span>
<span class="tk-cm">// ERROR via a {"cosmo": ...} intent block  -  pass an explicit</span>
<span class="tk-cm">// outputParser (or none) in AxonExtra to override.</span>`;

const pathwayClassSnippet = `<span class="tk-cm">// A per-trace event handle. Open via dendrite.dispatch(...) or</span>
<span class="tk-cm">// dendrite.observePathway(traceId). Three consumption shapes on the</span>
<span class="tk-cm">// same primitive  -  pick whichever fits the workflow.</span>
<span class="tk-kw">class</span> Pathway {
  <span class="tk-kw">get</span> traceId(): <span class="tk-kw">string</span>;
  <span class="tk-kw">get</span> parentId(): <span class="tk-kw">string</span> | <span class="tk-kw">null</span>;
  <span class="tk-kw">get</span> role(): <span class="tk-str">"originator"</span> | <span class="tk-str">"observer"</span>;
  <span class="tk-kw">get</span> scope(): <span class="tk-str">"all"</span> | <span class="tk-str">"terminal"</span>;
  <span class="tk-kw">get</span> closed(): <span class="tk-kw">boolean</span>;

  <span class="tk-cm">// Shape 1  -  sequential / request-reply</span>
  wait(timeoutMs?: <span class="tk-kw">number</span>): Promise&lt;Signal>;
  waitFor(<span class="tk-kw">type</span>: SignalType, timeoutMs?: <span class="tk-kw">number</span>): Promise&lt;Signal>;

  <span class="tk-cm">// Shape 2  -  reactive callbacks (trace-scoped)</span>
  on(<span class="tk-kw">type</span>: SignalType, fn: PathwaySignalHandler): PathwaySignalHandler;

  <span class="tk-cm">// Shape 3  -  async iteration</span>
  [Symbol.asyncIterator](): AsyncIterator&lt;Signal>;

  <span class="tk-cm">// Lifecycle  -  auto-closes on FINAL / ERROR; close() is idempotent.</span>
  <span class="tk-cm">// A wait() pending at close rejects with PathwayClosedError.</span>
  close(): Promise&lt;<span class="tk-kw">void</span>>;
}

<span class="tk-cm">// Exported sets:</span>
PATHWAY_TYPES;    <span class="tk-cm">// every type a Pathway observes</span>
TERMINAL_TYPES;   <span class="tk-cm">// FINAL / ERROR  -  auto-close triggers</span>`;

const pathwayUseSnippet = `<span class="tk-kw">import</span> { SignalType, connectSynapse, Dendrite } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> synapse = <span class="tk-kw">await</span> connectSynapse("cosmo:<span class="tk-cm">//127.0.0.1:7070");</span>
<span class="tk-kw">const</span> orch = <span class="tk-kw">new</span> Dendrite({ synapse, namespace: <span class="tk-str">"prod"</span> });
<span class="tk-kw">await</span> orch.start();

<span class="tk-cm">// Shape 1  -  sequential</span>
<span class="tk-kw">const</span> sig = <span class="tk-kw">await</span> orch.dispatchAndWait({
  capabilities: [<span class="tk-str">"summarize"</span>], input: { text: <span class="tk-str">"..."</span> }, timeoutMs: <span class="tk-num">5_000</span>,
});

<span class="tk-cm">// Shape 2  -  reactive</span>
<span class="tk-kw">const</span> pw = <span class="tk-kw">await</span> orch.dispatchAndSubscribe({
  capabilities: [<span class="tk-str">"plan"</span>], input: { goal: <span class="tk-str">"..."</span> },
});
pw.on(SignalType.PLAN, <span class="tk-kw">async</span> (s) => console.log(s.payload.steps));

<span class="tk-cm">// Shape 3  -  streaming</span>
<span class="tk-kw">const</span> stream = <span class="tk-kw">await</span> orch.dispatch({ neuron: <span class="tk-str">"agent"</span>, input: {} });
<span class="tk-kw">for</span> <span class="tk-kw">await</span> (<span class="tk-kw">const</span> s <span class="tk-kw">of</span> stream) {
  <span class="tk-kw">if</span> (s.<span class="tk-kw">type</span> === SignalType.AGENT_OUTPUT) <span class="tk-kw">break</span>;
}
<span class="tk-kw">await</span> stream.close();

<span class="tk-cm">// Observer role  -  watch a trace another peer started (no TASK emitted)</span>
<span class="tk-kw">const</span> watcher = <span class="tk-kw">await</span> orch.observePathway(<span class="tk-str">"trc_01J..."</span>);
console.log(watcher.role);   <span class="tk-cm">// "observer"</span>`;

/* ─────────────────────────────  COMPONENT  ───────────────────────────── */

export default function TypeScriptDocs({ section }: { section?: string }) {
  const all = (
    <>
      <div className="docs-megasection">
        <div className="docs-megasection-label">TypeScript SDK</div>
        <h2 className="docs-megasection-title">
          The same protocol, idiomatic TypeScript.
        </h2>
        <p className="docs-megasection-sub">
          <code className="inline">@cosmonapse/sdk</code> is the 1:1 TypeScript port of the Python
          envelope protocol and runtime. The shapes are identical on the wire  -  only the surface is
          idiomatic: <code className="inline">camelCase</code> names, options-object constructors, and
          classes you instantiate with <code className="inline">new</code>. As of 0.1.6 the TS SDK is at feature parity
          with Python  -  Pathway dispatch, capability routing and bidding, Engram, lifecycle hooks,
          and the full filtered handler surface are all ported; see{" "}
          <Link href="#ts-parity">Parity with Python</Link> for the details.
        </p>
      </div>

      <Section id="ts-install" eyebrow="TS · 01" title="Installation">
        <p className="docs-p">
          The package targets Node 18+ and ships as ESM with bundled type declarations. Transport and
          backend drivers (<code className="inline">nats</code>,{" "}
          <code className="inline">kafkajs</code>, <code className="inline">better-sqlite3</code>,{" "}
          <code className="inline">pg</code>,{" "}
          <code className="inline">@modelcontextprotocol/sdk</code>) are optional dependencies,
          lazily imported only by the adapter that needs them.
        </p>
        <CodeBlock html={installSnippet} maxWidth={760} />
      </Section>

      <Section id="ts-imports" eyebrow="TS · 02" title="Top-level imports">
        <p className="docs-p">
          Everything is re-exported from the package root. Values and types come from the same
          entry point  -  use <code className="inline">import type</code> for the type-only symbols.
        </p>
        <CodeBlock filename="imports.ts" html={importsSnippet} maxWidth={820} />
      </Section>

      {/* ─── Axon ─── */}
      <Section id="ts-axon" eyebrow="TS · 03" title="Axon  -  agent-side tool">
        <p className="docs-p">
          The <strong>Axon</strong> wraps a <code className="inline">neuronFn</code> with the metadata
          and validation needed to put it on the bus. It never touches the Synapse; attach it to a
          Dendrite to participate.
        </p>
        <ApiCard kind="class" name="Axon" summary="Turns raw Neuron output into protocol-valid signals: a normal return becomes AGENT_OUTPUT, a clarify() return becomes CLARIFICATION, a permissionRequest() return becomes PERMISSION, and a thrown error becomes ERROR.">
          <CodeBlock filename="axon.ts" html={axonClassSnippet} maxWidth={820} />
        </ApiCard>

        <h3 className="docs-h3">Constructor options</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Option</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>neuronId</td>
              <td>string</td>
              <td>The address other processes use to reach this Neuron. Unique within a namespace.</td>
            </tr>
            <tr>
              <td>neuronFn</td>
              <td>NeuronFn</td>
              <td>The Neuron itself: <code className="inline">(input, context) =&gt; Json | Promise&lt;Json&gt;</code>. May return <code className="inline">clarify(...)</code>.</td>
            </tr>
            <tr>
              <td>capabilities?</td>
              <td>string[]</td>
              <td>Tags advertised in REGISTER for routing. Defaults to <code className="inline">[]</code>.</td>
            </tr>
            <tr>
              <td>version?</td>
              <td>string</td>
              <td>Optional version string surfaced in REGISTER. Defaults to <code className="inline">undefined</code>.</td>
            </tr>
            <tr>
              <td>contextFetcher?</td>
              <td>ContextFetcher</td>
              <td>Resolver for <code className="inline">payload.context_ref</code>. Defaults to a no-op returning <code className="inline">[]</code>.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Source-paired factories</h3>
        <p className="docs-p">
          The second way to build an Axon. The static factories  -{" "}
          <code className="inline">Axon.ollama()</code>,{" "}
          <code className="inline">Axon.huggingface()</code>,{" "}
          <code className="inline">Axon.openai()</code>,{" "}
          <code className="inline">Axon.anthropic()</code>,{" "}
          <code className="inline">Axon.mcp()</code>  -  create the provider-backed Neuron and the
          Axon in one call, mirroring Python&rsquo;s classmethods. The signature is{" "}
          <code className="inline">Axon.source(neuronId, sourceOpts, axonExtra?)</code>: source
          options go in the second argument, Axon options (capabilities, version, engrams, ...) in
          the third.
        </p>
        <CodeBlock filename="factories.ts" html={axonFactorySnippet} maxWidth={880} />

        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="answerer.ts" html={axonUseSnippet} maxWidth={820} />
      </Section>

      {/* ─── Neuron / clarify ─── */}
      <Section id="ts-neuron" eyebrow="TS · 04" title="Neuron  -  sources, contract & clarify()">
        <p className="docs-p">
          A Neuron is a plain function  -  <code className="inline">NeuronFn</code>  -  wrapping{" "}
          <em>anything that interacts with the real world</em>. Write your own, or use a source
          factory: <code className="inline">mcpNeuron(opts)</code> wraps any stdio MCP server, and the
          unified <code className="inline">neuron(source, opts)</code> mirrors Python&rsquo;s{" "}
          <code className="inline">Neuron(source=…)</code>. An HTTP API is <em>not</em> a Neuron  - 
          keep Express/Fastify at the edge and dispatch TASKs from its routes via an orchestrator
          Dendrite. To ask for more information instead of producing a result, return{" "}
          <code className="inline">clarify()</code>; the Axon converts it into a CLARIFICATION signal.
          To ask permission before acting, return <code className="inline">permissionRequest()</code>{" "}
           -  same return-and-resume shape  -  and the Axon emits a PERMISSION signal.
        </p>

        <h3 className="docs-h3">Source factories</h3>
        <ApiCard kind="function" name="mcpNeuron(opts): CloseableNeuronFn" summary="MCP source. Spawns any stdio MCP server (command+args or a server preset) via @modelcontextprotocol/sdk and exposes its tools. Input is {tool, arguments} or {__list_tools__:true}. Wrapper only  -  does not implement a server. The SDK is an optional peer dependency, imported lazily." />
        <ApiCard kind="function" name="neuron(source, opts): CloseableNeuronFn" summary='Unified dispatcher. source = "mcp" | "ollama" | "huggingface" | "hf". Mirrors Python&rsquo;s Neuron(source=…).' />
        <ApiCard kind="const" name="standardMcpServers" summary="Launch presets for well-known published MCP servers (filesystem, fetch, git, memory, everything, sequentialthinking, time). Pass server=&quot;filesystem&quot; and your args are appended to the preset." />
        <CodeBlock filename="neuron_sources.ts" html={neuronSourceSnippet} maxWidth={860} />

        <h3 className="docs-h3">Contract, clarify() & permissionRequest()</h3>
        <p className="docs-p">
          Every source  -  and any hand-written Neuron  -  satisfies the same{" "}
          <code className="inline">NeuronFn</code> signature, so the Axon treats them identically.
        </p>
        <ApiCard kind="function" name="clarify(question: string, context?: Json): ClarificationOutput" summary="Build a clarification marker for a Neuron to return." />
        <ApiCard kind="function" name="isClarification(output: unknown): output is ClarificationOutput" summary="Type guard that detects a clarify() marker." />
        <ApiCard kind="function" name="permissionRequest(action: string, opts?: { scope?, reason?, context? }): PermissionRequestOutput" summary="Build a permission-request marker for a Neuron to return. Typically returned only after an Engram recall misses." />
        <ApiCard kind="function" name="isPermissionRequest(output: unknown): output is PermissionRequestOutput" summary="Type guard that detects a permissionRequest() marker." />
        <ApiCard kind="function" name="errorResult(message: string, opts?: { code?, recoverable? }): ErrorOutput" summary="Build an error marker for a Neuron to return instead of throwing - the Axon emits ERROR with the given code (default NEURON_ERROR) and recoverable flag." />
        <ApiCard kind="function" name="isErrorOutput(output: unknown): output is ErrorOutput" summary="Type guard that detects an errorResult() marker." />
        <CodeBlock filename="neuron.ts" html={neuronSnippet} maxWidth={820} />
      </Section>

      {/* ─── Dendrite ─── */}
      <Section id="ts-dendrite" eyebrow="TS · 05" title="Dendrite  -  synapse-side connector">
        <p className="docs-p">
          The <strong>Dendrite</strong> is the only component that touches the Synapse. It hosts
          attached Axons, owns REGISTER / HEARTBEAT / DEREGISTER, routes inbound TASKs, and exposes
          every orchestration primitive. Unlike Python, handler registration is plain method calls  - 
          there are no decorators in the TS port.
        </p>
        <ApiCard kind="class" name="Dendrite" summary="Hosts Axons and orchestrates. Synapse and (optionally) RegistryStore are passed in via the options object; the Dendrite never builds or closes them.">
          <CodeBlock filename="dendrite.ts" html={dendriteClassSnippet} maxWidth={880} />
        </ApiCard>

        <h3 className="docs-h3">Constructor options</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Option</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>synapse</td>
              <td>Synapse</td>
              <td>Required. An already-connected adapter. The Dendrite never calls <code className="inline">connect()</code> on it.</td>
            </tr>
            <tr>
              <td>registryStore?</td>
              <td>RegistryStore</td>
              <td>When set, the Dendrite mirrors its own Axons and auto-subscribes to REGISTER / DEREGISTER / HEARTBEAT to track the namespace view.</td>
            </tr>
            <tr>
              <td>namespace?</td>
              <td>string</td>
              <td>Subject namespace. Default <code className="inline">&quot;default&quot;</code>.</td>
            </tr>
            <tr>
              <td>dendriteId?</td>
              <td>string</td>
              <td>Identifier embedded as <code className="inline">neuron</code> in outbound FINAL / ERROR signals. Default <code className="inline">&quot;dendrite&quot;</code>.</td>
            </tr>
            <tr>
              <td>heartbeatMs?</td>
              <td>number</td>
              <td>Heartbeat interval in milliseconds. Default <code className="inline">30_000</code>. Pass <code className="inline">0</code> to disable.</td>
            </tr>
            <tr>
              <td>reregisterOnHeartbeat?</td>
              <td>boolean</td>
              <td>Re-emit REGISTER on each heartbeat tick so late joiners catch up. Default <code className="inline">true</code>.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Inbound handlers</h3>
        <p className="docs-p">
          Call an <code className="inline">on*</code> method with a handler; it returns the same
          handler. Every registration takes an optional filter{" "}
          <code className="inline">{`{ neuron?, capability?, traceId? }`}</code>. For any other type,
          use <code className="inline">onSignal(type, fn, filter?)</code>, or{" "}
          <code className="inline">subscribe()</code> for a raw <code className="inline">Subscription</code>.
        </p>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Registration</th>
              <th>Fires on</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>dendrite.onTaskSignal(fn)</td><td>Every TASK on the namespace.</td></tr>
            <tr><td>dendrite.onAgentOutput(fn)</td><td>Every AGENT_OUTPUT.</td></tr>
            <tr><td>dendrite.onFinal(fn)</td><td>Every FINAL  -  workflow conclusion.</td></tr>
            <tr><td>dendrite.onErrorSignal(fn)</td><td>Every ERROR.</td></tr>
            <tr><td>dendrite.onTaskOffer(fn)</td><td>Every TASK_OFFER; registering one suppresses the default auto-bidder.</td></tr>
            <tr><td>dendrite.onBid(fn) / onTaskAwarded(fn) / onTaskDeclined(fn)</td><td>The bidding flow  -  market observability.</td></tr>
            <tr><td>dendrite.onPlan(fn) / onThoughtDelta(fn) / onToolCall(fn) / onToolResult(fn)</td><td>The cognition stream.</td></tr>
            <tr><td>dendrite.onMemoryAppend(fn) / onCritique(fn) / onEscalation(fn) / onConsensus(fn) / onContextSync(fn)</td><td>The remaining cognition / coordination types.</td></tr>
            <tr><td>dendrite.onClarification(fn)</td><td>Every CLARIFICATION. Reply with answerClarification (discrete) or respondToClarification (re-dispatch).</td></tr>
            <tr><td>dendrite.onPermission(fn)</td><td>Every PERMISSION request. Reply with grantPermission / denyPermission / respondToPermission.</td></tr>
            <tr><td>dendrite.onClarificationAnswer(fn) / onPermissionDecision(fn)</td><td>The discrete answers  -  the handler counterparts of awaitDecision().</td></tr>
            <tr><td>dendrite.onRecallSignal(fn) / onImprintSignal(fn)</td><td>Engram requests crossing the bus.</td></tr>
            <tr><td>dendrite.onRecalled(fn) / onImprinted(fn)</td><td>Engram responses (observability; EngramClient owns correlation).</td></tr>
            <tr><td>dendrite.onRegister(fn) / onDeregister(fn) / onHeartbeat(fn)</td><td>REGISTER (incl. heartbeat re-registers) / DEREGISTER / HEARTBEAT.</td></tr>
            <tr><td>dendrite.onDiscover(fn)</td><td>Every DISCOVER  -  answer with your hosted Axons (cosmo registry list uses this).</td></tr>
            <tr><td>dendrite.onSignal(type, fn, filter?)</td><td>Any SignalType  -  the generic form with the same filters.</td></tr>
            <tr><td>dendrite.onTrace(traceId, ...types)(fn)</td><td>Every (or the selected) type on one trace.</td></tr>
            <tr><td>dendrite.onConnect(fn) / onRefresh(fn) / onSchedule(everyMs, fn)</td><td>Lifecycle hooks  -  not Signals: registration, registry refresh, timer.</td></tr>
            <tr><td>await dendrite.subscribe(type, fn)</td><td>Raw subscription. Returns a Subscription.</td></tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Resilience &amp; cancellation</h3>
        <p className="docs-p">
          Retry fits the request/reply shape only  -  the Dendrite owns the full dispatch → wait →
          close arc and can transparently re-dispatch. The streaming shapes hand the live Pathway to
          the caller, so retry there would orphan their subscriptions. A new-trace retry broadcasts{" "}
          <code className="inline">STOP</code> on the abandoned trace first, so a stalled worker
          can&rsquo;t outlive the retry. Full parity with the Python surface.
        </p>
        <ApiCard kind="async method" name="dendrite.runWithRetry(args & { retry: RetryStrategy, timeoutMs? }): Promise<Signal>" summary="Dispatch and wait, retrying per the RetryStrategy until a non-retryable outcome or attempts are exhausted. Resolves with the terminal Signal (FINAL / AGENT_OUTPUT / CLARIFICATION / PERMISSION, or a final ERROR); rejects with the last error when every attempt timed out." />
        <ApiCard kind="async method" name="dendrite.dispatchAndWait(args & { retry?: RetryStrategy }): Promise<Signal>" summary="The request/reply sugar also accepts retry. When supplied it delegates to the same loop as runWithRetry; when omitted it is a single dispatch + wait." />
        <ApiCard kind="async method" name="dendrite.emitStop({ traceId, rollback?, reason? }): Promise<Signal>" summary="Broadcast a STOP for a whole trace (orchestrator-gated). Best-effort and idempotent: a peer that never saw it simply isn't stopped. rollback replays each hosted Engram's per-trace saga journal in reverse. Resolves with the emitted STOP Signal." />
        <ApiCard kind="async method" name="dendrite.stopTrace(traceId, { rollback?, reason?, collectAcks?, timeoutMs? }): Promise<Signal[]>" summary="Thin wrapper over emitStop. With collectAcks: true it opens a short-lived STOPPED subscription and resolves with the acks seen within timeoutMs (best effort)." />
        <CodeBlock filename="retry.ts" html={retrySnippet} maxWidth={880} />

        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="worker.ts" html={dendriteUseSnippet} maxWidth={880} />
      </Section>

      {/* ─── Pathway ─── */}
      <Section id="ts-pathway" eyebrow="TS · 06" title="Pathway  -  per-trace event handle">
        <p className="docs-p">
          A <strong>Pathway</strong> is the client-side observation surface for one logical
          workflow, identified by its <code className="inline">trace_id</code>. It supports{" "}
          <strong>three consumption shapes on the same primitive</strong>  -  sequential{" "}
          <code className="inline">wait()</code>, reactive{" "}
          <code className="inline">on()</code> callbacks, and{" "}
          <code className="inline">for await</code> iteration. Opened by{" "}
          <code className="inline">dispatch()</code> family calls in the{" "}
          <em>originator</em> role, or by{" "}
          <code className="inline">observePathway(traceId)</code> in the <em>observer</em> role.
          With <code className="inline">{`scope: "terminal"`}</code> only FINAL / ERROR /
          CLARIFICATION / PERMISSION are delivered, and the dispatch is tagged with{" "}
          <code className="inline">finalize</code> so a stock worker&rsquo;s AGENT_OUTPUT is
          promoted to FINAL.
        </p>
        <ApiCard kind="class" name="Pathway" summary="Auto-closes on FINAL / ERROR. close() is idempotent; a pending wait() rejects with PathwayClosedError when the Pathway closes first.">
          <CodeBlock filename="pathway.ts" html={pathwayClassSnippet} maxWidth={840} />
        </ApiCard>
        <h3 className="docs-h3">Example  -  the three shapes</h3>
        <CodeBlock filename="shapes.ts" html={pathwayUseSnippet} maxWidth={880} />
      </Section>

      {/* ─── Synapse ─── */}
      <Section id="ts-synapse" eyebrow="TS · 07" title="Synapse  -  transport adapters">
        <p className="docs-p">
          A <strong>Synapse</strong> is the message bus. The TS port ships{" "}
          <code className="inline">MemorySynapse</code> (single process),{" "}
          <code className="inline">DevSynapse</code> (the cosmo:// dev broker),{" "}
          <code className="inline">NatsSynapse</code>, and{" "}
          <code className="inline">KafkaSynapse</code>. Map a URL with{" "}
          <code className="inline">synapseFromUrl()</code> / <code className="inline">connectSynapse()</code>{" "}
          (mirroring Python), or construct an adapter directly and pass it to the Dendrite.
        </p>
        <ApiCard kind="interface" name="Synapse" summary="The contract every adapter implements. The caller builds, connects, and closes it; the Dendrite only uses it.">
          <CodeBlock filename="synapse.ts" html={synapseInterfaceSnippet} maxWidth={840} />
        </ApiCard>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Use when</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>MemorySynapse</td>
              <td>Tests and single-process apps. No external deps.</td>
            </tr>
            <tr>
              <td>DevSynapse</td>
              <td>Single-host dev against <code className="inline">cosmo synapse start memory</code>. URL scheme <code className="inline">cosmo://</code>.</td>
            </tr>
            <tr>
              <td>NatsSynapse</td>
              <td>Cross-process / cluster. Lazily imports <code className="inline">nats</code>; construct with <code className="inline">{`new NatsSynapse({ url })`}</code> or <code className="inline">nats://</code> URL.</td>
            </tr>
            <tr>
              <td>KafkaSynapse</td>
              <td>Kafka deployments. Lazily imports <code className="inline">kafkajs</code>; URL scheme <code className="inline">kafka://</code>.</td>
            </tr>
          </tbody>
        </table>
        </div>
      </Section>

      {/* ─── Registry ─── */}
      <Section id="ts-registry" eyebrow="TS · 08" title="RegistryStore">
        <p className="docs-p">
          The <strong>RegistryStore</strong> is the optional live view of every Neuron on a namespace.
          All three backends are ported: in-memory, SQLite (via{" "}
          <code className="inline">better-sqlite3</code>), and Postgres (via{" "}
          <code className="inline">pg</code>).
        </p>
        <ApiCard kind="interface" name="RegistryStore" summary="Records are NeuronRecord objects keyed by neuron_id. Backends: MemoryRegistryStore, SqliteRegistryStore, PostgresRegistryStore.">
          <CodeBlock filename="storage.ts" html={registryStoreSnippet} maxWidth={840} />
        </ApiCard>
        <h3 className="docs-h3">NeuronRecord</h3>
        <CodeBlock filename="record.ts" html={neuronRecordSnippet} maxWidth={780} />
      </Section>

      {/* ─── Engram ─── */}
      <Section id="ts-engram" eyebrow="TS · 09" title="Engram  -  shared memory">
        <p className="docs-p">
          The full Engram subsystem is ported: the abstract{" "}
          <code className="inline">Engram</code> contract, the{" "}
          <code className="inline">InMemoryEngram</code> /{" "}
          <code className="inline">SqliteEngram</code> /{" "}
          <code className="inline">PostgresEngram</code> backends,{" "}
          <code className="inline">EngramBinding</code>, and{" "}
          <code className="inline">EngramClient</code>. The concepts (addressing, the five
          invariants, the <code className="inline">RECALL</code> /{" "}
          <code className="inline">IMPRINT</code> wire signals) are covered in the{" "}
          <Link href="/docs/engram" className="docs-link">Engram reference</Link>  -  this section
          shows the TypeScript surface.
        </p>

        <h3 className="docs-h3">The Engram contract & backends</h3>
        <CodeBlock filename="engram.ts" html={engramClassSnippet} maxWidth={880} />

        <h3 className="docs-h3">Wiring memory into an Axon</h3>
        <p className="docs-p">
          An <code className="inline">EngramBinding</code> whitelists which Engrams a Neuron may
          address, by a stable local name. Unlike Python  -  where the SDK injects{" "}
          <code className="inline">recall=</code> / <code className="inline">imprint=</code> keyword
          arguments  -  the TS helpers arrive as the <code className="inline">NeuronFn</code>&rsquo;s
          optional third argument.
        </p>
        <CodeBlock filename="binding.ts" html={engramBindingSnippet} maxWidth={880} />

        <h3 className="docs-h3">Hosting & Dendrite-side access</h3>
        <p className="docs-p">
          <code className="inline">attachEngram()</code> mounts a backend on a Dendrite;{" "}
          <code className="inline">dendrite.recall()</code> /{" "}
          <code className="inline">dendrite.imprint()</code> give any peer direct access over the
          same RECALL / IMPRINT signals. Failures throw{" "}
          <code className="inline">EngramError</code> subclasses ({" "}
          <code className="inline">EngramTimeout</code>,{" "}
          <code className="inline">EngramNotBound</code>,{" "}
          <code className="inline">EngramOverloaded</code>,{" "}
          <code className="inline">EngramCancelled</code>).
        </p>
        <CodeBlock filename="host.ts" html={engramDendriteSnippet} maxWidth={880} />
      </Section>

      {/* ─── Signal ─── */}
      <Section id="ts-signal" eyebrow="TS · 10" title="Signal & SignalType">
        <p className="docs-p">
          A <strong>Signal</strong> is a plain object matching the envelope schema. Its field names
          stay snake_case (<code className="inline">trace_id</code>,{" "}
          <code className="inline">parent_id</code>) so the JSON is byte-identical to the Python side.
          See <Link href="/protocol">the envelope spec</Link> for the wire-level reference.
        </p>
        <ApiCard kind="interface + codec" name="Signal" summary="createSignal() fills defaults and validates; encode()/decode() round-trip the wire format; reply() builds a child signal sharing the trace_id.">
          <CodeBlock filename="signal.ts" html={signalSnippet} maxWidth={840} />
        </ApiCard>
        <ApiCard kind="const + type" name="SignalType" summary="A frozen const object plus a union type. AXON_TYPES and SYNAPSE_TYPES are ReadonlySets controlling who may emit which type.">
          <CodeBlock filename="signal-type.ts" html={signalTypeSnippet} maxWidth={840} />
        </ApiCard>
        <ApiCard kind="builders" name="stopSignal(...) / stoppedSignal(...)" summary="Envelope builders for the workflow-control pair. stopSignal({ traceId, rollback?, reason? }) builds a STOP; stoppedSignal({ traceId, parentId, rolledBack?, cancelled?, compensated?, node? }) builds the ack. You rarely call these directly  -  dendrite.emitStop / stopTrace build and publish them for you." />
      </Section>

      {/* ─── IDs ─── */}
      <Section id="ts-ids" eyebrow="TS · 11" title="ID & trace helpers">
        <p className="docs-p">
          The ID helpers return prefixed ULIDs (via the{" "}
          <code className="inline">ulid</code> dependency) that sort lexicographically by creation
          time. The trace helpers expose the ambient task context the SDK uses for automatic trace
          attribution  -  the TS analogue of Python&rsquo;s ContextVar-based{" "}
          <code className="inline">ambient_trace()</code>.
        </p>
        <CodeBlock html={idsSnippet} maxWidth={760} />
      </Section>

      {/* ─── Errors ─── */}
      <Section id="ts-errors" eyebrow="TS · 12" title="Protocol errors">
        <p className="docs-p">
          As in Python, protocol misuse throws{" "}
          <code className="inline">DendriteProtocolError</code> (exported with the alias{" "}
          <code className="inline">CortexProtocolError</code>)  -  e.g. when you{" "}
          <code className="inline">emit()</code> a type outside{" "}
          <code className="inline">SYNAPSE_TYPES</code>. The Engram surface throws{" "}
          <code className="inline">EngramError</code> subclasses, Pathways throw{" "}
          <code className="inline">PathwayClosedError</code> when closed early, and envelope
          validation failures throw a plain <code className="inline">Error</code>.
        </p>
        <CodeBlock filename="errors.ts" html={errorsSnippet} maxWidth={840} />
      </Section>

      {/* ─── Parity ─── */}
      <Section id="ts-parity" eyebrow="TS · 13" title="Parity with the Python SDK">
        <p className="docs-p">
          As of 0.1.6 the port covers the full Python surface: the envelope and signal builders,
          all four Synapse adapters with the URL factory, all three registry backends, Neuron
          source factories, Axon (with recognisers and Engram bindings), Dendrite (Pathway
          dispatch, offers and bidding, interactive cognition, Engram hosting), and the lifecycle
          hooks. The 92-test suite mirrors the Python one. Remaining differences are idiomatic,
          not functional:
        </p>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Python</th>
              <th>TypeScript</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Decorators (@dendrite.on_agent_output)</td><td>Method calls (dendrite.onAgentOutput(fn, filter?)).</td></tr>
            <tr><td>Keyword args (deadline_ms=, trace_id=)</td><td>Options objects with camelCase keys (deadlineMs, traceId). Wire fields stay snake_case.</td></tr>
            <tr><td>async with dendrite</td><td>Use start() / stop() explicitly.</td></tr>
            <tr><td>Neuron memory helpers injected as keyword args (recall=, imprint=)</td><td>Helpers ride a context object as the NeuronFn&rsquo;s optional third argument.</td></tr>
            <tr><td>asyncio.TimeoutError on Pathway.wait timeout</td><td>A plain Error with a timeout message.</td></tr>
          </tbody>
        </table>
        </div>
      </Section>
    </>
  );
  return pickSection(all, section);
};