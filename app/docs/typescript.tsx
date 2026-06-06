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
    { href: "#ts-synapse", label: "Synapse" },
    { href: "#ts-registry", label: "RegistryStore" },
    { href: "#ts-signal", label: "Signal & SignalType" },
    { href: "#ts-ids", label: "ID helpers" },
    { href: "#ts-errors", label: "Protocol errors" },
    { href: "#ts-parity", label: "Parity with Python" },
  ],
};

/* ─────────────────────────────  CODE SNIPPETS  ───────────────────────────── */

const installSnippet = `<span class="tk-cm"># Node 18+. Published as an ESM package.</span>
<span class="tk-op">$</span> npm i <span class="tk-op">@</span>cosmonapse/sdk

<span class="tk-cm"># NATS transport is an optional peer dependency:</span>
<span class="tk-op">$</span> npm i nats

<span class="tk-cm"># From source:</span>
<span class="tk-op">$</span> cd cosmonapse-core/packages/ts-sdk <span class="tk-op">&amp;&amp;</span> npm i <span class="tk-op">&amp;&amp;</span> npm run build`;

const importsSnippet = `<span class="tk-kw">import</span> {
  <span class="tk-cm">// Core primitives</span>
  Axon,
  Dendrite,
  Cortex,                 <span class="tk-cm">// back-compat alias of Dendrite</span>

  <span class="tk-cm">// Transports  -  construct directly (no URL factory in the TS port)</span>
  MemorySynapse,
  NatsSynapse,

  <span class="tk-cm">// Registry (in-memory backend only)</span>
  MemoryRegistryStore,
  neuronRecord,

  <span class="tk-cm">// Neuron  -  contract + source factories</span>
  clarify,
  isClarification,
  mcpNeuron,              <span class="tk-cm">// wrap any stdio MCP server</span>
  neuron,                 <span class="tk-cm">// unified neuron(source, opts) factory</span>
  standardMcpServers,     <span class="tk-cm">// presets for published MCP servers</span>

  <span class="tk-cm">// Envelope + builders</span>
  SignalType,
  createSignal,
  encode,
  decode,
  newTraceId,
  newEventId,
  taskSignal,
  agentOutputSignal,

  <span class="tk-cm">// The only SDK-thrown error (+ its alias)</span>
  DendriteProtocolError,
} <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">import type</span> { Signal, NeuronFn, RegistryStore } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;`;

const axonClassSnippet = `<span class="tk-kw">interface</span> <span class="tk-fn">AxonOptions</span> {
  neuronId:        string;
  neuronFn:        NeuronFn;
  capabilities?:   string[];
  version?:        string;
  contextFetcher?: ContextFetcher;
}

<span class="tk-kw">class</span> <span class="tk-fn">Axon</span> {
  <span class="tk-kw">readonly</span> neuronId: string;
  <span class="tk-kw">readonly</span> capabilities: string[];
  <span class="tk-kw">readonly</span> version: string <span class="tk-op">|</span> undefined;

  <span class="tk-fn">constructor</span>(opts: AxonOptions);

  <span class="tk-cm">// Called by the Dendrite for each inbound TASK. Resolves</span>
  <span class="tk-cm">// contextRef, runs neuronFn, returns AGENT_OUTPUT / CLARIFICATION / PERMISSION / ERROR.</span>
  <span class="tk-fn">handleTask</span>(task: Signal): Promise<span class="tk-op">&lt;</span>Signal<span class="tk-op">&gt;</span>;
}

<span class="tk-cm">// A Neuron is a plain function  -  sync or async:</span>
<span class="tk-kw">type</span> <span class="tk-fn">NeuronFn</span> <span class="tk-op">=</span> (input: Json, context: unknown[]) <span class="tk-op">=></span> Promise<span class="tk-op">&lt;</span>Json<span class="tk-op">&gt;</span> <span class="tk-op">|</span> Json;`;

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

const dendriteClassSnippet = `<span class="tk-kw">interface</span> <span class="tk-fn">DendriteOptions</span> {
  synapse:                Synapse;        <span class="tk-cm">// REQUIRED</span>
  registryStore?:         RegistryStore;
  namespace?:             string;         <span class="tk-cm">// default "default"</span>
  dendriteId?:            string;         <span class="tk-cm">// default "dendrite"</span>
  heartbeatMs?:           number;         <span class="tk-cm">// default 30_000; 0 disables</span>
  reregisterOnHeartbeat?: boolean;        <span class="tk-cm">// default true</span>
}

<span class="tk-kw">class</span> <span class="tk-fn">Dendrite</span> {
  <span class="tk-fn">constructor</span>(opts: DendriteOptions);

  <span class="tk-cm">// ── Axon lifecycle ──────────────────────────────────────</span>
  <span class="tk-fn">attachAxon</span>(axon: Axon): void;
  <span class="tk-fn">start</span>(): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">stop</span>(reason?: string): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;

  <span class="tk-cm">// ── Inbound handlers  -  method calls, NOT decorators ─────</span>
  <span class="tk-fn">onAgentOutput</span>(fn: SignalHandler): SignalHandler;
  <span class="tk-fn">onClarification</span>(fn: SignalHandler): SignalHandler;
  <span class="tk-fn">onPermission</span>(fn: SignalHandler): SignalHandler;
  <span class="tk-fn">onErrorSignal</span>(fn: SignalHandler): SignalHandler;
  <span class="tk-fn">onRegister</span>(fn: SignalHandler): SignalHandler;
  <span class="tk-fn">onDeregister</span>(fn: SignalHandler): SignalHandler;
  <span class="tk-fn">onHeartbeat</span>(fn: SignalHandler): SignalHandler;
  <span class="tk-fn">subscribe</span>(type: SignalType, handler: MessageHandler, opts?): Promise<span class="tk-op">&lt;</span>Subscription<span class="tk-op">&gt;</span>;

  <span class="tk-cm">// ── Orchestration ───────────────────────────────────────</span>
  <span class="tk-fn">dispatchTask</span>(args: {
    neuron: string; input: Json; traceId?: string; parentId?: string <span class="tk-op">|</span> null;
    contextRef?: string; capabilities?: string[]; meta?: Json;
  }): Promise<span class="tk-op">&lt;</span>Signal<span class="tk-op">&gt;</span>;
  <span class="tk-fn">emitFinal</span>(args: { traceId; parentId; result; meta? }): Promise<span class="tk-op">&lt;</span>Signal<span class="tk-op">&gt;</span>;
  <span class="tk-fn">emitError</span>(args: { traceId; parentId?; code; message; recoverable?; meta? }): Promise<span class="tk-op">&lt;</span>Signal<span class="tk-op">&gt;</span>;
  <span class="tk-fn">emit</span>(signal: Signal): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;   <span class="tk-cm">// throws DendriteProtocolError off-list</span>

  <span class="tk-cm">// ── Registry reads (require registryStore) ──────────────</span>
  <span class="tk-fn">findNeurons</span>(opts?: { capability?: string }): Promise<span class="tk-op">&lt;</span>NeuronRecord[]<span class="tk-op">&gt;</span>;
  <span class="tk-fn">registrySnapshot</span>(opts?: ListOptions): Promise<span class="tk-op">&lt;</span>NeuronRecord[]<span class="tk-op">&gt;</span>;
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

const synapseInterfaceSnippet = `<span class="tk-kw">interface</span> <span class="tk-fn">Synapse</span> {
  <span class="tk-fn">connect</span>(): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">close</span>(): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">publish</span>(subject: string, signal: Signal): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">subscribe</span>(subject: string, handler: MessageHandler, opts?: SubscribeOptions): Promise<span class="tk-op">&lt;</span>Subscription<span class="tk-op">&gt;</span>;
  <span class="tk-fn">request</span>(subject: string, signal: Signal, opts?: RequestOptions): Promise<span class="tk-op">&lt;</span>Signal<span class="tk-op">&gt;</span>;
}

<span class="tk-cm">// Construct adapters directly  -  there is no synapse_from_url in the TS port:</span>
<span class="tk-kw">const</span> mem  <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">MemorySynapse</span>();
<span class="tk-kw">const</span> nats <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">NatsSynapse</span>({ url: <span class="tk-str">"nats://127.0.0.1:4222"</span> });  <span class="tk-cm">// needs npm i nats</span>`;

const registryStoreSnippet = `<span class="tk-kw">interface</span> <span class="tk-fn">RegistryStore</span> {
  <span class="tk-fn">connect</span>(): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">close</span>(): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">upsert</span>(record: NeuronRecord): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">markDeregistered</span>(neuronId: string): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">touchHeartbeat</span>(neuronId: string, ts: string, status?: NeuronStatus): Promise<span class="tk-op">&lt;</span>void<span class="tk-op">&gt;</span>;
  <span class="tk-fn">get</span>(neuronId: string): Promise<span class="tk-op">&lt;</span>NeuronRecord <span class="tk-op">|</span> null<span class="tk-op">&gt;</span>;
  <span class="tk-fn">list</span>(opts?: ListOptions): Promise<span class="tk-op">&lt;</span>NeuronRecord[]<span class="tk-op">&gt;</span>;
}

<span class="tk-kw">type</span> <span class="tk-fn">NeuronStatus</span> <span class="tk-op">=</span> <span class="tk-str">"registered"</span> <span class="tk-op">|</span> <span class="tk-str">"draining"</span> <span class="tk-op">|</span> <span class="tk-str">"deregistered"</span>;

<span class="tk-cm">// Only the in-memory backend is ported (sqlite / postgres are Python-only):</span>
<span class="tk-kw">const</span> store <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">MemoryRegistryStore</span>();`;

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

const signalSnippet = `<span class="tk-kw">interface</span> <span class="tk-fn">Signal</span> {
  v:         string;            <span class="tk-cm">// "1"</span>
  id:        string;            <span class="tk-cm">// evt_&lt;ULID&gt;</span>
  trace_id:  string;            <span class="tk-cm">// trc_&lt;ULID&gt;</span>
  parent_id: string <span class="tk-op">|</span> null;
  type:      SignalType;
  neuron:    string <span class="tk-op">|</span> null;
  ts:        string;            <span class="tk-cm">// RFC 3339 UTC</span>
  payload:   Json;
  meta:      Json;
}

<span class="tk-fn">createSignal</span>(input: NewSignalInput): Signal;   <span class="tk-cm">// fills defaults + validates</span>
<span class="tk-fn">validateSignal</span>(signal: Signal): void;          <span class="tk-cm">// throws on bad evt_/trc_ prefix</span>
<span class="tk-fn">encode</span>(signal: Signal): Uint8Array;             <span class="tk-cm">// UTF-8 JSON bytes</span>
<span class="tk-fn">decode</span>(data: Uint8Array <span class="tk-op">|</span> string): Signal;
<span class="tk-fn">reply</span>(source: Signal, opts: { type; payload?; neuron?; meta? }): Signal;`;

const signalTypeSnippet = `<span class="tk-cm">// SignalType is a const object (+ a union type), not a TS enum:</span>
<span class="tk-kw">const</span> SignalType <span class="tk-op">=</span> {
  TASK: <span class="tk-str">"TASK"</span>,
  AGENT_OUTPUT: <span class="tk-str">"AGENT_OUTPUT"</span>,
  FINAL: <span class="tk-str">"FINAL"</span>,
  ERROR: <span class="tk-str">"ERROR"</span>,
  <span class="tk-cm">// … TASK_OFFER, BID, TASK_AWARDED, TASK_DECLINED,</span>
  <span class="tk-cm">//    THOUGHT_DELTA, PLAN, TOOL_CALL, TOOL_RESULT,</span>
  <span class="tk-cm">//    MEMORY_APPEND, ESCALATION, CONSENSUS, CONTEXT_SYNC,</span>
  <span class="tk-cm">//    CRITIQUE, CLARIFICATION, PERMISSION,</span>
  <span class="tk-cm">//    PERMISSION_DECISION, CLARIFICATION_ANSWER,</span>
  REGISTER: <span class="tk-str">"REGISTER"</span>,
  DEREGISTER: <span class="tk-str">"DEREGISTER"</span>,
  HEARTBEAT: <span class="tk-str">"HEARTBEAT"</span>,
} <span class="tk-kw">as const</span>;
<span class="tk-kw">type</span> <span class="tk-fn">SignalType</span> <span class="tk-op">=</span> (<span class="tk-kw">typeof</span> SignalType)[keyof <span class="tk-kw">typeof</span> SignalType];

<span class="tk-cm">// Sets controlling who may emit what:</span>
AXON_TYPES: ReadonlySet<span class="tk-op">&lt;</span>SignalType<span class="tk-op">&gt;</span>;
SYNAPSE_TYPES: ReadonlySet<span class="tk-op">&lt;</span>SignalType<span class="tk-op">&gt;</span>;`;

const idsSnippet = `<span class="tk-kw">import</span> { newTraceId, newEventId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">const</span> trace <span class="tk-op">=</span> <span class="tk-fn">newTraceId</span>();   <span class="tk-cm">// "trc_01JV…"  prefixed ULID</span>
<span class="tk-kw">const</span> id    <span class="tk-op">=</span> <span class="tk-fn">newEventId</span>();   <span class="tk-cm">// "evt_01JV…"  prefixed ULID</span>`;

const errorsSnippet = `<span class="tk-kw">import</span> { DendriteProtocolError } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-kw">try</span> {
  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">emit</span>(someAgentOutputSignal);   <span class="tk-cm">// AGENT_OUTPUT is Axon-owned</span>
} <span class="tk-kw">catch</span> (e) {
  <span class="tk-kw">if</span> (e <span class="tk-kw">instanceof</span> DendriteProtocolError) {
    <span class="tk-cm">// Dendrites may only emit SYNAPSE_TYPES.</span>
  }
}
<span class="tk-cm">// CortexProtocolError is an exported alias of DendriteProtocolError.</span>`;

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
          classes you instantiate with <code className="inline">new</code>. This is a v0.1 port; see{" "}
          <Link href="#ts-parity">Parity with Python</Link> for what isn&rsquo;t carried over yet.
        </p>
      </div>

      <Section id="ts-install" eyebrow="TS · 01" title="Installation">
        <p className="docs-p">
          The package targets Node 18+ and ships as ESM with bundled type declarations. NATS is an
          optional peer dependency, lazily imported only when you construct a{" "}
          <code className="inline">NatsSynapse</code>.
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

        <h3 className="docs-h3">Inbound handlers</h3>
        <p className="docs-p">
          Call an <code className="inline">on*</code> method with a handler; it returns the same
          handler. For any other type, <code className="inline">subscribe()</code> takes the type and
          a handler and resolves to a <code className="inline">Subscription</code>.
        </p>
        <table className="spec-table">
          <thead>
            <tr>
              <th>Registration</th>
              <th>Fires on</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>dendrite.onAgentOutput(fn)</td><td>Every AGENT_OUTPUT on the namespace.</td></tr>
            <tr><td>dendrite.onClarification(fn)</td><td>Every CLARIFICATION.</td></tr>
            <tr><td>dendrite.onPermission(fn)</td><td>Every PERMISSION request. Reply with respondToPermission / grantPermission / denyPermission.</td></tr>
            <tr><td>dendrite.onErrorSignal(fn)</td><td>Every ERROR.</td></tr>
            <tr><td>dendrite.onRegister(fn)</td><td>Every REGISTER.</td></tr>
            <tr><td>dendrite.onDeregister(fn)</td><td>Every DEREGISTER.</td></tr>
            <tr><td>dendrite.onHeartbeat(fn)</td><td>Every HEARTBEAT.</td></tr>
            <tr><td>await dendrite.subscribe(type, fn)</td><td>Any other type. Returns a Subscription.</td></tr>
          </tbody>
        </table>

        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="worker.ts" html={dendriteUseSnippet} maxWidth={880} />
      </Section>

      {/* ─── Synapse ─── */}
      <Section id="ts-synapse" eyebrow="TS · 06" title="Synapse  -  transport adapters">
        <p className="docs-p">
          A <strong>Synapse</strong> is the message bus. The TS port ships{" "}
          <code className="inline">MemorySynapse</code> (single process) and{" "}
          <code className="inline">NatsSynapse</code> (cluster). There is no URL factory  -  construct
          the adapter you want directly and pass it to the Dendrite.
        </p>
        <ApiCard kind="interface" name="Synapse" summary="The contract every adapter implements. The caller builds, connects, and closes it; the Dendrite only uses it.">
          <CodeBlock filename="synapse.ts" html={synapseInterfaceSnippet} maxWidth={840} />
        </ApiCard>
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
              <td>NatsSynapse</td>
              <td>Cross-process / cluster. Lazily imports <code className="inline">nats</code>; construct with <code className="inline">{`new NatsSynapse({ url })`}</code>.</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ─── Registry ─── */}
      <Section id="ts-registry" eyebrow="TS · 07" title="RegistryStore">
        <p className="docs-p">
          The <strong>RegistryStore</strong> is the optional live view of every Neuron on a namespace.
          The TS port ships only the in-memory backend; the SQLite and Postgres backends remain
          Python-only for now.
        </p>
        <ApiCard kind="interface" name="RegistryStore" summary="Records are NeuronRecord objects keyed by neuron_id. MemoryRegistryStore is the only bundled implementation.">
          <CodeBlock filename="storage.ts" html={registryStoreSnippet} maxWidth={840} />
        </ApiCard>
        <h3 className="docs-h3">NeuronRecord</h3>
        <CodeBlock filename="record.ts" html={neuronRecordSnippet} maxWidth={780} />
      </Section>

      {/* ─── Signal ─── */}
      <Section id="ts-signal" eyebrow="TS · 08" title="Signal & SignalType">
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
      </Section>

      {/* ─── IDs ─── */}
      <Section id="ts-ids" eyebrow="TS · 09" title="ID helpers">
        <p className="docs-p">
          Both return prefixed ULIDs (via the <code className="inline">ulid</code> dependency) that
          sort lexicographically by creation time.
        </p>
        <CodeBlock html={idsSnippet} maxWidth={760} />
      </Section>

      {/* ─── Errors ─── */}
      <Section id="ts-errors" eyebrow="TS · 10" title="Protocol errors">
        <p className="docs-p">
          As in Python, the only bespoke error is{" "}
          <code className="inline">DendriteProtocolError</code> (exported with the alias{" "}
          <code className="inline">CortexProtocolError</code>), thrown when you{" "}
          <code className="inline">emit()</code> a type outside{" "}
          <code className="inline">SYNAPSE_TYPES</code>. Envelope validation failures throw a plain{" "}
          <code className="inline">Error</code>.
        </p>
        <CodeBlock filename="errors.ts" html={errorsSnippet} maxWidth={840} />
      </Section>

      {/* ─── Parity ─── */}
      <Section id="ts-parity" eyebrow="TS · 11" title="Parity with the Python SDK">
        <p className="docs-p">
          The envelope, signal builders, <code className="inline">MemorySynapse</code>,{" "}
          <code className="inline">NatsSynapse</code>, the in-memory registry, Neuron, Axon, and
          Dendrite are all ported and functional. A few Python features are intentionally not in this
          v0.1 port yet:
        </p>
        <table className="spec-table">
          <thead>
            <tr>
              <th>Python feature</th>
              <th>Status in TS</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>KafkaSynapse</td><td>Not ported  -  use MemorySynapse or NatsSynapse.</td></tr>
            <tr><td>SqliteRegistryStore / PostgresRegistryStore</td><td>Not ported  -  only MemoryRegistryStore.</td></tr>
            <tr><td>Provider-backed Neuron factories (Ollama / HF)</td><td>Not ported  -  pass your own NeuronFn.</td></tr>
            <tr><td>Lifecycle hooks (on_connect / on_refresh / on_schedule)</td><td>Not ported  -  no LifecycleHooks mixin.</td></tr>
            <tr><td>connect_synapse / synapse_from_url URL factory</td><td>Not ported  -  construct adapters directly.</td></tr>
            <tr><td>async context manager (async with dendrite)</td><td>Use start() / stop() explicitly.</td></tr>
          </tbody>
        </table>
      </Section>
    </>
  );
  return pickSection(all, section);
};