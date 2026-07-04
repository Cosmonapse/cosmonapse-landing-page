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

export const pythonToc: TocGroup = {
  title: "Python SDK",
  items: [
    { href: "#install", label: "Installation" },
    { href: "#imports", label: "Top-level imports" },
    { href: "#neuron", label: "Neuron  -  sources" },
    { href: "#axon", label: "Axon" },
    { href: "#dendrite", label: "Dendrite" },
    { href: "#pathway", label: "Pathway" },
    { href: "#engram", label: "Engram (shared memory)" },
    { href: "#cortex", label: "Cortex (alias)" },
    { href: "#lifecycle", label: "Lifecycle hooks" },
    { href: "#synapse", label: "Synapse" },
    { href: "#registry", label: "RegistryStore" },
    { href: "#signal", label: "Signal & SignalType" },
    { href: "#helpers", label: "ID helpers" },
    { href: "#errors", label: "Protocol errors" },
  ],
};

/* ─────────────────────────────  CODE SNIPPETS  ───────────────────────────── */

const installSnippet = `<span class="tk-cm"># Python 3.11 or newer required.</span>
<span class="tk-op">$</span> pip install cosmonapse

<span class="tk-cm"># Provider-backed Neurons (Ollama / HuggingFace) need httpx:</span>
<span class="tk-op">$</span> pip install httpx

<span class="tk-cm"># From source (editable). The cosmo CLI ships inside this one package.</span>
<span class="tk-op">$</span> pip install <span class="tk-op">-e</span> cosmonapse-core/packages/python-sdk`;

const topImportSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> (
    <span class="tk-cm"># Core primitives</span>
    Neuron,                       <span class="tk-cm"># provider-backed NeuronFn factory</span>
    Axon,
    Dendrite,
    Cortex,                       <span class="tk-cm"># back-compat alias of Dendrite</span>

    <span class="tk-cm"># Synapse adapters + URL helpers</span>
    MemorySynapse,
    DevSynapse,
    NatsSynapse,
    KafkaSynapse,
    synapse_from_url,
    connect_synapse,

    <span class="tk-cm"># Registry stores</span>
    RegistryStore,
    MemoryRegistryStore,
    SqliteRegistryStore,
    PostgresRegistryStore,
    NeuronRecord,

    <span class="tk-cm"># Pathway  -  per-trace event handle</span>
    Pathway,
    PathwayClosedError,
    PATHWAY_TYPES,

    <span class="tk-cm"># Engram  -  shared memory (RECALL / IMPRINT)</span>
    Engram,
    EngramBinding,
    EngramClient,
    InMemoryEngram,
    SqliteEngram,
    PostgresEngram,
    Hit,
    RecallResult,
    ImprintReceipt,
    new_engram_id,

    <span class="tk-cm"># Envelope + helpers</span>
    Signal,
    SignalType,
    Directed,
    directed_to,
    AXON_TYPES,
    SYNAPSE_TYPES,
    new_trace_id,
    new_event_id,
    task_signal,
    agent_output_signal,
    <span class="tk-cm"># ... one typed builder per SignalType, task_offer_signal through</span>
    <span class="tk-cm"># imprinted_signal</span>

    <span class="tk-cm"># SDK-raised exceptions</span>
    DendriteProtocolError,
    CortexProtocolError,          <span class="tk-cm"># alias of the above</span>
    EngramError,
    EngramTimeout,
    EngramCancelled,
    EngramNotBound,
    EngramOverloaded,
)`;

const neuronSourceSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron

<span class="tk-cm"># A Neuron is anything that interacts with the real world. The same factory</span>
<span class="tk-cm"># wraps an LLM or an MCP server  -  the Axon never knows which.</span>

<span class="tk-cm"># 1 · LLM / agent  -  Ollama, HuggingFace, OpenAI, Anthropic, or any</span>
<span class="tk-cm">#     OpenAI-compatible host (groq / openrouter / together / mistral).</span>
chat <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"chat"</span>,
            neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"ollama"</span>, model<span class="tk-op">=</span><span class="tk-str">"llama3"</span>))
cloud <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"cloud"</span>,  <span class="tk-cm"># api_key falls back to OPENAI_API_KEY</span>
             neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"openai"</span>, model<span class="tk-op">=</span><span class="tk-str">"gpt-4o"</span>))

<span class="tk-cm"># 2 · An HTTP API is NOT a Neuron. Keep your web framework (Flask/FastAPI)</span>
<span class="tk-cm">#     at the edge and dispatch TASKs from its routes via an orchestrator</span>
<span class="tk-cm">#     Dendrite  -  see the quickstart and the real-world-neurons example.</span>

<span class="tk-cm"># 3 · MCP server  -  wrap any stdio MCP server's tools as a Neuron</span>
files <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"files"</span>,
             neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"mcp"</span>, server<span class="tk-op">=</span><span class="tk-str">"filesystem"</span>,
                              args<span class="tk-op">=</span>[<span class="tk-str">"/data"</span>], tool<span class="tk-op">=</span><span class="tk-str">"read_file"</span>))

<span class="tk-cm"># Shortcut: the source-paired factories  -  Axon.ollama() / .huggingface()</span>
<span class="tk-cm"># / .openai() / .anthropic() / .mcp()  -  do both steps in one call AND</span>
<span class="tk-cm"># wire the matching recogniser. See the Axon section below.</span>`;

const axonClassSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">Axon</span>(LifecycleHooks):
    <span class="tk-kw">def</span> __init__(
        self,
        *,
        neuron_id:       str,
        neuron_fn:       Callable[[dict, list], Awaitable[dict]],
        capabilities:    list[str] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        version:         str <span class="tk-op">|</span> <span class="tk-kw">None</span>      <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        neuron_kind:     str <span class="tk-op">=</span> <span class="tk-str">"neuron"</span>,
        context_fetcher: Callable[[str], Awaitable[list]] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        engrams:         list[EngramBinding] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        output_parser:   OutputParser <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
    ) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...

    <span class="tk-cm"># ── Source-paired factories ─────────────────────────────────</span>
    <span class="tk-cm"># Create the Neuron AND the Axon in one call, wired with the</span>
    <span class="tk-cm"># matching recogniser. Every factory returns a plain Axon.</span>
    <span class="tk-op">@</span>classmethod
    <span class="tk-kw">def</span> <span class="tk-fn">from_source</span>(cls, source, *, neuron_id,
                    capabilities<span class="tk-op">=</span><span class="tk-kw">None</span>, version<span class="tk-op">=</span><span class="tk-kw">None</span>, neuron_kind<span class="tk-op">=</span><span class="tk-str">"neuron"</span>,
                    context_fetcher<span class="tk-op">=</span><span class="tk-kw">None</span>, engrams<span class="tk-op">=</span><span class="tk-kw">None</span>,
                    recognize<span class="tk-op">=</span><span class="tk-kw">True</span>, teach_intents<span class="tk-op">=</span><span class="tk-kw">None</span>,
                    <span class="tk-op">**</span>source_kwargs) <span class="tk-op">-></span> <span class="tk-str">"Axon"</span>: ...
    <span class="tk-cm"># source: ollama | huggingface/hf | openai | anthropic | groq |</span>
    <span class="tk-cm">#         openrouter | together | mistral | mcp</span>

    <span class="tk-cm"># Shorthands over from_source():</span>
    <span class="tk-op">@</span>classmethod
    <span class="tk-kw">def</span> <span class="tk-fn">ollama</span>(cls, neuron_id, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> <span class="tk-str">"Axon"</span>: ...       <span class="tk-cm"># model= required</span>
    <span class="tk-op">@</span>classmethod
    <span class="tk-kw">def</span> <span class="tk-fn">huggingface</span>(cls, neuron_id, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> <span class="tk-str">"Axon"</span>: ...  <span class="tk-cm"># endpoint= required; alias Axon.hf</span>
    <span class="tk-op">@</span>classmethod
    <span class="tk-kw">def</span> <span class="tk-fn">openai</span>(cls, neuron_id, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> <span class="tk-str">"Axon"</span>: ...       <span class="tk-cm"># model= required; api_key or OPENAI_API_KEY</span>
    <span class="tk-op">@</span>classmethod
    <span class="tk-kw">def</span> <span class="tk-fn">anthropic</span>(cls, neuron_id, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> <span class="tk-str">"Axon"</span>: ...    <span class="tk-cm"># model= required; api_key or ANTHROPIC_API_KEY</span>
    <span class="tk-op">@</span>classmethod
    <span class="tk-kw">def</span> <span class="tk-fn">mcp</span>(cls, neuron_id, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> <span class="tk-str">"Axon"</span>: ...          <span class="tk-cm"># command= or server= (+ args, tool)</span>

    <span class="tk-kw">async def</span> <span class="tk-fn">handle_task</span>(self, task: Signal) <span class="tk-op">-></span> Signal: ...
    <span class="tk-cm"># Called by the Dendrite. Resolves context_ref, invokes neuron_fn,</span>
    <span class="tk-cm"># wraps the result in AGENT_OUTPUT / CLARIFICATION / PERMISSION / ERROR.</span>

    <span class="tk-cm"># Pre-task hook  -  transform / validate / reject the TASK input.</span>
    <span class="tk-cm"># Return a dict to replace the input, None to pass through, or raise</span>
    <span class="tk-cm"># to reject (surfaces as ERROR code NEURON_EXCEPTION).</span>
    <span class="tk-op">@</span>axon.before_task

    <span class="tk-cm"># Detectors over the Neuron's RAW output  -  named detects_* to stay</span>
    <span class="tk-cm"># distinct from the Dendrite's on_* (which consume inbound Signals).</span>
    <span class="tk-cm"># Return the intent's fields (dict) to match, None to fall through.</span>
    <span class="tk-cm"># Precedence: error -> clarification -> permission -> output.</span>
    <span class="tk-op">@</span>axon.detects_output           <span class="tk-cm"># -> AGENT_OUTPUT payload</span>
    <span class="tk-op">@</span>axon.detects_clarification    <span class="tk-cm"># -> {"question": ..., "context": ...}</span>
    <span class="tk-op">@</span>axon.detects_permission       <span class="tk-cm"># -> {"action": ..., "scope": ..., "reason": ...}</span>
    <span class="tk-op">@</span>axon.detects_error            <span class="tk-cm"># -> {"code": ..., "message": ..., "recoverable": ...}</span>

    <span class="tk-cm"># Deferred HOST decorators - queued at module level, applied to the</span>
    <span class="tk-cm"># HOSTING Dendrite when it announces this Axon (subscription ensured).</span>
    <span class="tk-cm"># THE standard way to declare chain handlers and tool servers:</span>
    <span class="tk-op">@</span>axon.host.on_agent_output(neuron<span class="tk-op">=</span>...)   <span class="tk-cm"># chain handler</span>
    <span class="tk-op">@</span>axon.host.on_tool_call(neuron<span class="tk-op">=</span>...)      <span class="tk-cm"># tool server</span>
    <span class="tk-op">@</span>axon.host.on_&lt;any_signal&gt;(...)          <span class="tk-cm"># full Dendrite on_* family</span>

    <span class="tk-cm"># Inherited from LifecycleHooks:</span>
    <span class="tk-op">@</span>axon.on_connect          <span class="tk-cm"># after the hosting Dendrite emits REGISTER</span>
                              <span class="tk-cm"># (and after @host.on_* have been applied)</span>
    <span class="tk-op">@</span>axon.on_refresh          <span class="tk-cm"># each heartbeat tick (reason="heartbeat")</span>
    <span class="tk-op">@</span>axon.on_schedule(every_s<span class="tk-op">=</span><span class="tk-num">N</span>)  <span class="tk-cm"># periodic background coroutine</span>`;

const axonUseSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon

<span class="tk-kw">async def</span> <span class="tk-fn">answerer</span>(input: dict, context: list) <span class="tk-op">-></span> dict:
    <span class="tk-kw">return</span> {<span class="tk-str">"answer"</span>: input[<span class="tk-str">"q"</span>].upper()}

axon <span class="tk-op">=</span> Axon(
    neuron_id    <span class="tk-op">=</span> <span class="tk-str">"answerer"</span>,
    neuron_fn    <span class="tk-op">=</span> answerer,
    capabilities <span class="tk-op">=</span> [<span class="tk-str">"text"</span>, <span class="tk-str">"qa"</span>],
    version      <span class="tk-op">=</span> <span class="tk-str">"1.2.0"</span>,
)

<span class="tk-op">@</span>axon.<span class="tk-fn">on_connect</span>
<span class="tk-kw">async def</span> <span class="tk-fn">warmup</span>(a):
    <span class="tk-kw">await</span> <span class="tk-fn">preload_model_weights</span>()

<span class="tk-cm"># Host-side behaviour, declared right here - applied to whichever</span>
<span class="tk-cm"># Dendrite ends up hosting this Axon, subscription ensured:</span>
<span class="tk-op">@</span>axon.host.<span class="tk-fn">on_agent_output</span>(neuron<span class="tk-op">=</span><span class="tk-str">"answerer"</span>)
<span class="tk-kw">async def</span> <span class="tk-fn">chain</span>(sig):
    ...   <span class="tk-cm"># e.g. dispatch the next TASK on sig.trace_id</span>`;

const dendriteClassSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">Dendrite</span>(LifecycleHooks):
    <span class="tk-kw">def</span> __init__(
        self,
        *,
        synapse:         Synapse,                  <span class="tk-cm"># REQUIRED</span>
        registry_store:  RegistryStore <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        namespace:       str  <span class="tk-op">=</span> <span class="tk-str">"default"</span>,
        dendrite_id:     str  <span class="tk-op">=</span> <span class="tk-str">"dendrite"</span>,
        heartbeat_s:             float <span class="tk-op">=</span> <span class="tk-num">30.0</span>,
        reregister_on_heartbeat: bool  <span class="tk-op">=</span> <span class="tk-kw">True</span>,
        role:            str   <span class="tk-op">=</span> <span class="tk-str">"orchestrator"</span>,  <span class="tk-cm"># or "worker"</span>
        auto_bid:        bool  <span class="tk-op">=</span> <span class="tk-kw">True</span>,   <span class="tk-cm"># default bidder for hosted Axons</span>
        stale_after_s:   float <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,  <span class="tk-cm"># liveness sweep; default 3 heartbeats</span>
    ) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...

    <span class="tk-cm"># Aggregate of every attached Axon's capabilities (sorted, deduped).</span>
    <span class="tk-op">@</span>property
    <span class="tk-kw">def</span> <span class="tk-fn">capabilities</span>(self) <span class="tk-op">-></span> list[str]: ...

    <span class="tk-op">@</span>property
    <span class="tk-kw">def</span> <span class="tk-fn">role</span>(self) <span class="tk-op">-></span> str: ...           <span class="tk-cm"># "orchestrator" | "worker"</span>

    <span class="tk-cm"># No Dendrite.connect()  -  build the synapse yourself, then pass it in:</span>
    <span class="tk-cm">#   synapse = await connect_synapse("cosmo://127.0.0.1:7070")</span>
    <span class="tk-cm">#   dendrite = Dendrite(synapse=synapse, ...)</span>

    <span class="tk-cm"># ── Axon lifecycle ──────────────────────────────────────────</span>
    <span class="tk-kw">def</span>    <span class="tk-fn">attach_axon</span>(self, axon: Axon) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">detach_axon</span>(self, neuron_id: str, *, reason<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">add_axon</span>(self, axon: Axon) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...   <span class="tk-cm"># attach while running</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">start</span>(self) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">stop</span>(self, reason: str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> __aenter__(self) <span class="tk-op">-></span> <span class="tk-str">"Dendrite"</span>: ...
    <span class="tk-kw">async def</span> __aexit__(self, <span class="tk-op">*</span>exc) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...

    <span class="tk-cm"># ── Dispatch (orchestrator-role only) ───────────────────────</span>
    <span class="tk-cm"># Addressed (neuron=) or capability-routed (capabilities=); at least one required.</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">dispatch_task</span>(
        self, *,
        neuron:       str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        input:        dict,
        trace_id:     str  <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        parent_id:    str  <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        context_ref:  str  <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        capabilities: list[str] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        finalize:     bool <span class="tk-op">=</span> <span class="tk-kw">False</span>,  <span class="tk-cm"># worker promotes AGENT_OUTPUT to FINAL</span>
        meta:         dict <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
    ) <span class="tk-op">-></span> Signal: ...        <span class="tk-cm"># fire-and-forget; returns the emitted TASK</span>

    <span class="tk-cm"># Returns a Pathway scoped to the trace. scope="all" or "terminal".</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">dispatch</span>(
        self, *,
        neuron:       str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        input:        dict,
        capabilities: list[str] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        scope:        str  <span class="tk-op">=</span> <span class="tk-str">"all"</span>,
        finalize:     bool <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,  <span class="tk-cm"># default: True when scope="terminal"</span>
        <span class="tk-cm"># ... trace_id, parent_id, context_ref, meta as above ...</span>
    ) <span class="tk-op">-></span> Pathway: ...

    <span class="tk-cm"># Sugar: dispatch, block until terminal Signal, close, return Signal.</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">dispatch_and_wait</span>(
        self, *, neuron<span class="tk-op">=</span><span class="tk-kw">None</span>, input, capabilities<span class="tk-op">=</span><span class="tk-kw">None</span>,
        timeout_s: float <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-num">30.0</span>, scope<span class="tk-op">=</span><span class="tk-str">"all"</span>, finalize<span class="tk-op">=</span><span class="tk-kw">None</span>, <span class="tk-op">**</span>kw,
    ) <span class="tk-op">-></span> Signal: ...
    <span class="tk-cm"># scope="terminal" waits for FINAL/ERROR only; finalize defaults True</span>
    <span class="tk-cm"># there, so a stock worker's AGENT_OUTPUT is promoted to FINAL.</span>

    <span class="tk-cm"># Sugar: dispatch, return the live Pathway (caller wires @pw.on(...)).</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">dispatch_and_subscribe</span>(
        self, *, neuron<span class="tk-op">=</span><span class="tk-kw">None</span>, input, capabilities<span class="tk-op">=</span><span class="tk-kw">None</span>, scope<span class="tk-op">=</span><span class="tk-str">"all"</span>, <span class="tk-op">**</span>kw,
    ) <span class="tk-op">-></span> Pathway: ...

    <span class="tk-cm"># Competitive bidding via TASK_OFFER / BID / TASK_AWARDED.</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">dispatch_offer</span>(
        self, *,
        input:        dict,
        capabilities: list[str] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        deadline_ms:  int  <span class="tk-op">=</span> <span class="tk-num">250</span>,
        select:       str  <span class="tk-op">=</span> <span class="tk-str">"first_bid"</span>,  <span class="tk-cm"># lowest_cost | highest_confidence</span>
        scope:        str  <span class="tk-op">=</span> <span class="tk-str">"all"</span>,
        <span class="tk-op">**</span>kw,
    ) <span class="tk-op">-></span> Pathway: ...

    <span class="tk-cm"># Watch a trace another peer started (no TASK emitted).</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">observe_pathway</span>(self, trace_id: str) <span class="tk-op">-></span> Pathway: ...

    <span class="tk-cm"># ── Interactive cognition (CLARIFICATION / PERMISSION loop) ─</span>
    <span class="tk-cm"># Await the discrete CLARIFICATION_ANSWER / PERMISSION_DECISION</span>
    <span class="tk-cm"># whose parent_id == request.id (op-pathway under the hood).</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">await_decision</span>(self, request: Signal, *, timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">answer_clarification</span>(self, request: Signal, *, answer, meta<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> Signal: ...

    <span class="tk-cm"># ── Engram  -  shared memory (RECALL / IMPRINT) ─────────────</span>
    <span class="tk-kw">def</span>       <span class="tk-fn">attach_engram</span>(self, engram: Engram) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">detach_engram</span>(self, engram_id: str) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">recall</span>(self, *, engram_id<span class="tk-op">=</span><span class="tk-kw">None</span>, engram_kind<span class="tk-op">=</span><span class="tk-kw">None</span>, query, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> RecallResult: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">imprint</span>(self, *, engram_id<span class="tk-op">=</span><span class="tk-kw">None</span>, engram_kind<span class="tk-op">=</span><span class="tk-kw">None</span>, op, entry, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> ImprintReceipt <span class="tk-op">|</span> <span class="tk-kw">None</span>: ...

    <span class="tk-cm"># Worker side: react to TASK_OFFER + emit a BID (bypasses role guard).</span>
    <span class="tk-kw">def</span>       <span class="tk-fn">on_task_offer</span>(self, fn<span class="tk-op">=</span><span class="tk-kw">None</span>, *, capability<span class="tk-op">=</span><span class="tk-kw">None</span>, trace_id<span class="tk-op">=</span><span class="tk-kw">None</span>): ...
    <span class="tk-kw">async def</span> <span class="tk-fn">bid</span>(
        self, offer: Signal, *,
        neuron: str, cost: float,
        eta_ms: int <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        confidence: float <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
    ) <span class="tk-op">-></span> Signal: ...

    <span class="tk-cm"># ── Cognition emitters (orchestrator-role; funnel through emit()) ──</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_final</span>(self, *, trace_id, parent_id, result, meta<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_error</span>(self, *, trace_id, parent_id, code, message, recoverable<span class="tk-op">=</span><span class="tk-kw">False</span>, meta<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_plan</span>(self, *, trace_id, parent_id, steps, rationale<span class="tk-op">=</span><span class="tk-kw">None</span>, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_thought_delta</span>(self, *, trace_id, parent_id, delta, seq<span class="tk-op">=</span><span class="tk-kw">None</span>, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_tool_call</span>(self, *, trace_id, parent_id, tool, args, call_id<span class="tk-op">=</span><span class="tk-kw">None</span>, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_tool_result</span>(self, *, trace_id, parent_id, tool, result<span class="tk-op">=</span><span class="tk-kw">None</span>, error<span class="tk-op">=</span><span class="tk-kw">None</span>, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_memory_append</span>(self, *, trace_id, parent_id, key, value, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_critique</span>(self, *, trace_id, parent_id, target_event_id, issues, verdict, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_escalation</span>(self, *, trace_id, parent_id, reason, target<span class="tk-op">=</span><span class="tk-kw">None</span>, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_consensus</span>(self, *, trace_id, parent_id, members, verdict, votes<span class="tk-op">=</span><span class="tk-kw">None</span>, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_context_sync</span>(self, *, trace_id, parent_id, snapshot, version<span class="tk-op">=</span><span class="tk-kw">None</span>, <span class="tk-op">**</span>kw) <span class="tk-op">-></span> Signal: ...

    <span class="tk-kw">async def</span> <span class="tk-fn">emit</span>(self, signal: Signal) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-cm"># emit() enforces role guard (workers raise DendriteProtocolError) and</span>
    <span class="tk-cm"># type guard (only SYNAPSE_TYPES accepted). bid() uses _publish to bypass.</span>

    <span class="tk-cm"># ── Inbound handler decorators ──────────────────────────────</span>
    <span class="tk-cm"># One per SignalType, all accepting the same optional filters:</span>
    <span class="tk-cm">#   (neuron=, capability=, trace_id=)</span>

    <span class="tk-cm"># Lifecycle</span>
    <span class="tk-op">@</span>dendrite.on_task_signal
    <span class="tk-op">@</span>dendrite.on_agent_output
    <span class="tk-op">@</span>dendrite.on_final
    <span class="tk-op">@</span>dendrite.on_error_signal

    <span class="tk-cm"># Routing / bidding</span>
    <span class="tk-op">@</span>dendrite.on_task_offer                     <span class="tk-cm"># registering one suppresses the auto-bidder</span>
    <span class="tk-op">@</span>dendrite.on_bid
    <span class="tk-op">@</span>dendrite.on_task_awarded
    <span class="tk-op">@</span>dendrite.on_task_declined

    <span class="tk-cm"># Cognition</span>
    <span class="tk-op">@</span>dendrite.on_plan
    <span class="tk-op">@</span>dendrite.on_thought_delta
    <span class="tk-op">@</span>dendrite.on_tool_call
    <span class="tk-op">@</span>dendrite.on_tool_result
    <span class="tk-op">@</span>dendrite.on_memory_append
    <span class="tk-op">@</span>dendrite.on_critique
    <span class="tk-op">@</span>dendrite.on_escalation
    <span class="tk-op">@</span>dendrite.on_consensus
    <span class="tk-op">@</span>dendrite.on_context_sync

    <span class="tk-cm"># Interactive cognition (see await_decision)</span>
    <span class="tk-op">@</span>dendrite.on_clarification
    <span class="tk-op">@</span>dendrite.on_permission
    <span class="tk-op">@</span>dendrite.on_clarification_answer
    <span class="tk-op">@</span>dendrite.on_permission_decision

    <span class="tk-cm"># Engram</span>
    <span class="tk-op">@</span>dendrite.on_recall_signal                  <span class="tk-cm"># requests crossing the bus</span>
    <span class="tk-op">@</span>dendrite.on_imprint_signal
    <span class="tk-op">@</span>dendrite.on_recalled                       <span class="tk-cm"># responses (observability)</span>
    <span class="tk-op">@</span>dendrite.on_imprinted

    <span class="tk-cm"># Agent management + discovery</span>
    <span class="tk-op">@</span>dendrite.on_register_signal
    <span class="tk-op">@</span>dendrite.on_deregister_signal
    <span class="tk-op">@</span>dendrite.on_heartbeat_signal
    <span class="tk-op">@</span>dendrite.on_discover
    <span class="tk-cm"># (on_error / on_register / on_deregister / on_heartbeat are</span>
    <span class="tk-cm">#  DEPRECATED short aliases  -  prefer the *_signal names)</span>

    <span class="tk-cm"># Generic escape hatches</span>
    <span class="tk-op">@</span>dendrite.on_signal(SignalType.X, neuron<span class="tk-op">=</span>..., capability<span class="tk-op">=</span>..., trace_id<span class="tk-op">=</span>...)
    <span class="tk-op">@</span>dendrite.on_trace(trace_id, *types)   <span class="tk-cm"># every (or selected) type on one trace</span>

    <span class="tk-cm"># Inherited from LifecycleHooks</span>
    <span class="tk-op">@</span>dendrite.on_connect                        <span class="tk-cm"># after this Dendrite registers</span>
    <span class="tk-op">@</span>dendrite.on_refresh                        <span class="tk-cm"># heartbeat / register / deregister</span>
    <span class="tk-op">@</span>dendrite.on_schedule(every_s<span class="tk-op">=</span>N)    <span class="tk-cm"># periodic background coroutine</span>

    <span class="tk-cm"># subscribe() is a coroutine, NOT a decorator:</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">subscribe</span>(self, signal_type: SignalType, handler, *, queue_group<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> Subscription: ...

    <span class="tk-cm"># ── RegistryStore reads (require a registry_store) ──────────</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">find_neurons</span>(self, *, capability: str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>) <span class="tk-op">-></span> list[NeuronRecord]: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">registry_snapshot</span>(self, *, capability<span class="tk-op">=</span><span class="tk-kw">None</span>, include_deregistered<span class="tk-op">=</span><span class="tk-kw">False</span>) <span class="tk-op">-></span> list[NeuronRecord]: ...`;

const dendriteUseSnippet = `<span class="tk-kw">import</span> asyncio
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, SqliteRegistryStore, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)

    dendrite <span class="tk-op">=</span> Dendrite(
        synapse        <span class="tk-op">=</span> synapse,
        registry_store <span class="tk-op">=</span> <span class="tk-fn">SqliteRegistryStore</span>(<span class="tk-str">"/tmp/worker.db"</span>),
        namespace      <span class="tk-op">=</span> <span class="tk-str">"prod"</span>,
        heartbeat_s    <span class="tk-op">=</span> <span class="tk-num">5.0</span>,
    )
    dendrite.<span class="tk-fn">attach_axon</span>(axon)

    <span class="tk-op">@</span>dendrite.<span class="tk-fn">on_agent_output</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">handle</span>(sig):
        <span class="tk-kw">await</span> dendrite.<span class="tk-fn">emit_final</span>(
            trace_id<span class="tk-op">=</span>sig.trace_id,
            parent_id<span class="tk-op">=</span>sig.id,
            result<span class="tk-op">=</span>sig.payload[<span class="tk-str">"output"</span>],
        )

    <span class="tk-kw">async with</span> dendrite:
        <span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatch_task</span>(neuron<span class="tk-op">=</span><span class="tk-str">"answerer"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"q"</span>: <span class="tk-str">"hi"</span>})
        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">sleep</span>(<span class="tk-fn">float</span>(<span class="tk-str">"inf"</span>))
    <span class="tk-cm"># The Dendrite never closes the synapse  -  you do:</span>
    <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

const pathwayClassSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">Pathway</span>:
    <span class="tk-cm"># A per-trace event handle. Open via dendrite.dispatch(...) or</span>
    <span class="tk-cm"># dendrite.observe_pathway(trace_id). Three consumption shapes on</span>
    <span class="tk-cm"># the same primitive - pick whichever fits the workflow.</span>

    <span class="tk-op">@</span>property
    <span class="tk-kw">def</span> <span class="tk-fn">trace_id</span>(self) <span class="tk-op">-></span> str: ...
    <span class="tk-op">@</span>property
    <span class="tk-kw">def</span> <span class="tk-fn">role</span>(self) <span class="tk-op">-></span> str: ...        <span class="tk-cm"># "originator" | "observer"</span>
    <span class="tk-op">@</span>property
    <span class="tk-kw">def</span> <span class="tk-fn">scope</span>(self) <span class="tk-op">-></span> str: ...       <span class="tk-cm"># "all" | "terminal"</span>
    <span class="tk-op">@</span>property
    <span class="tk-kw">def</span> <span class="tk-fn">closed</span>(self) <span class="tk-op">-></span> bool: ...

    <span class="tk-cm"># Shape 1 - sequential / request-reply</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">wait</span>(self, timeout_s: float <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">wait_for</span>(self, signal_type: SignalType, timeout_s<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> Signal: ...

    <span class="tk-cm"># Shape 2 - reactive callbacks (trace-scoped)</span>
    <span class="tk-kw">def</span> <span class="tk-fn">on</span>(self, signal_type: SignalType): ...    <span class="tk-cm"># decorator</span>

    <span class="tk-cm"># Shape 3 - async iteration</span>
    <span class="tk-kw">def</span> __aiter__(self) <span class="tk-op">-></span> <span class="tk-str">"Pathway"</span>: ...
    <span class="tk-kw">async def</span> __anext__(self) <span class="tk-op">-></span> Signal: ...

    <span class="tk-cm"># Lifecycle - auto-closes on FINAL / ERROR; close() is idempotent.</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">close</span>(self) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> __aenter__(self) <span class="tk-op">-></span> <span class="tk-str">"Pathway"</span>: ...
    <span class="tk-kw">async def</span> __aexit__(self, <span class="tk-op">*</span>exc) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...`;

const pathwayUseSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, SignalType, connect_synapse

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    synapse <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
    orch <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"prod"</span>)

    <span class="tk-kw">async with</span> orch:
        <span class="tk-cm"># Shape 1 - sequential</span>
        sig <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_wait</span>(
            capabilities<span class="tk-op">=</span>[<span class="tk-str">"summarize"</span>], input<span class="tk-op">=</span>{<span class="tk-str">"text"</span>: <span class="tk-str">"..."</span>}, timeout_s<span class="tk-op">=</span><span class="tk-num">5.0</span>,
        )

        <span class="tk-cm"># Shape 2 - reactive</span>
        pw <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch_and_subscribe</span>(
            capabilities<span class="tk-op">=</span>[<span class="tk-str">"plan"</span>], input<span class="tk-op">=</span>{<span class="tk-str">"goal"</span>: <span class="tk-str">"..."</span>},
        )
        <span class="tk-op">@</span>pw.<span class="tk-fn">on</span>(SignalType.PLAN)
        <span class="tk-kw">async def</span> <span class="tk-fn">on_plan</span>(s): <span class="tk-fn">print</span>(s.payload[<span class="tk-str">"steps"</span>])

        <span class="tk-cm"># Shape 3 - streaming</span>
        <span class="tk-kw">async with</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">dispatch</span>(neuron<span class="tk-op">=</span><span class="tk-str">"agent"</span>, input<span class="tk-op">=</span>{}) <span class="tk-kw">as</span> pw:
            <span class="tk-kw">async for</span> s <span class="tk-kw">in</span> pw:
                <span class="tk-kw">if</span> s.type <span class="tk-kw">is</span> SignalType.AGENT_OUTPUT: <span class="tk-kw">break</span>`;

const lifecycleSnippet = `<span class="tk-cm"># 1. Announce on connect</span>
<span class="tk-op">@</span>dendrite.<span class="tk-fn">on_connect</span>
<span class="tk-kw">async def</span> <span class="tk-fn">hello</span>(d):
    snap <span class="tk-op">=</span> <span class="tk-kw">await</span> d.<span class="tk-fn">registry_snapshot</span>()
    <span class="tk-fn">log</span>.info(<span class="tk-str">f"Up on {d.namespace}: {len(snap)} known neurons"</span>)

<span class="tk-cm"># 2. React to refresh events (heartbeat / register / deregister / manual)</span>
<span class="tk-op">@</span>dendrite.<span class="tk-fn">on_refresh</span>
<span class="tk-kw">async def</span> <span class="tk-fn">reconcile</span>(d, event):
    <span class="tk-kw">if</span> event.reason <span class="tk-op">==</span> <span class="tk-str">"register"</span>:
        <span class="tk-fn">log</span>.info(<span class="tk-str">"New peer: %s"</span>, event.neuron_id)

<span class="tk-cm"># 3. Periodic background task</span>
<span class="tk-op">@</span>dendrite.<span class="tk-fn">on_schedule</span>(every_s<span class="tk-op">=</span><span class="tk-num">30</span>)
<span class="tk-kw">async def</span> <span class="tk-fn">rollup</span>(d):
    snap <span class="tk-op">=</span> <span class="tk-kw">await</span> d.<span class="tk-fn">registry_snapshot</span>(include_deregistered<span class="tk-op">=</span><span class="tk-kw">True</span>)
    <span class="tk-fn">publish_derived_view</span>(snap)

<span class="tk-cm"># 4. Manual trigger</span>
<span class="tk-kw">await</span> dendrite.<span class="tk-fn">refresh</span>(reason<span class="tk-op">=</span><span class="tk-str">"manual"</span>, extra<span class="tk-op">=</span>{<span class="tk-str">"why"</span>: <span class="tk-str">"side-channel update"</span>})`;

const synapseInterfaceSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">Synapse</span>(ABC):
    <span class="tk-kw">async def</span> <span class="tk-fn">connect</span>(self) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">close</span>(self)   <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...

    <span class="tk-kw">async def</span> <span class="tk-fn">publish</span>(self, subject: str, signal: Signal) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...

    <span class="tk-kw">async def</span> <span class="tk-fn">subscribe</span>(
        self,
        subject:    str,
        handler:    Callable[[Signal], Awaitable[<span class="tk-kw">None</span>]],
        *,
        queue_group: str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
    ) <span class="tk-op">-></span> Subscription: ...

    <span class="tk-kw">async def</span> <span class="tk-fn">request</span>(
        self,
        subject: str,
        signal:  Signal,
        *,
        timeout_s: float <span class="tk-op">=</span> <span class="tk-num">5.0</span>,
    ) <span class="tk-op">-></span> Signal: ...`;

const synapseUrlSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> synapse_from_url, connect_synapse, MemorySynapse

<span class="tk-cm"># Build (does not connect):</span>
syn <span class="tk-op">=</span> <span class="tk-fn">synapse_from_url</span>(<span class="tk-str">"cosmo://localhost:7070"</span>)    <span class="tk-cm"># DevSynapse</span>
syn <span class="tk-op">=</span> <span class="tk-fn">synapse_from_url</span>(<span class="tk-str">"nats://nats:4222"</span>)            <span class="tk-cm"># NatsSynapse</span>
syn <span class="tk-op">=</span> <span class="tk-fn">synapse_from_url</span>(<span class="tk-str">"kafka://broker:9092"</span>)         <span class="tk-cm"># KafkaSynapse</span>

<span class="tk-cm"># memory:// has no URL  -  it is process-local, so build it directly:</span>
syn <span class="tk-op">=</span> <span class="tk-fn">MemorySynapse</span>()

<span class="tk-cm"># Build + connect in one call:</span>
syn <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(<span class="tk-str">"cosmo://127.0.0.1:7070"</span>)`;

const registryStoreSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">RegistryStore</span>(ABC):
    <span class="tk-kw">async def</span> <span class="tk-fn">connect</span>(self) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">close</span>(self)   <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">upsert</span>(self, record: NeuronRecord) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">mark_deregistered</span>(self, neuron_id: str) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">touch_heartbeat</span>(self, neuron_id: str, ts: datetime, status: str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">get</span>(self, neuron_id: str) <span class="tk-op">-></span> NeuronRecord <span class="tk-op">|</span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">list</span>(self, *, capability: str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>, include_deregistered: bool <span class="tk-op">=</span> <span class="tk-kw">False</span>) <span class="tk-op">-></span> list[NeuronRecord]: ...

<span class="tk-cm"># Backends</span>
<span class="tk-fn">MemoryRegistryStore</span>()
<span class="tk-fn">SqliteRegistryStore</span>(<span class="tk-str">"/var/lib/cosmonapse/registry.db"</span>)
<span class="tk-fn">PostgresRegistryStore</span>(dsn<span class="tk-op">=</span><span class="tk-str">"postgresql://user:pw@host/cosmonapse"</span>)`;

const neuronRecordSnippet = `<span class="tk-op">@</span>dataclass
<span class="tk-kw">class</span> <span class="tk-fn">NeuronRecord</span>:
    neuron_id:      str
    capabilities:   list[str] <span class="tk-op">=</span> []
    version:        str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>
    status:         str <span class="tk-op">=</span> <span class="tk-str">"registered"</span>   <span class="tk-cm"># registered | draining | deregistered</span>
    last_heartbeat: datetime <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>
    registered_at:  datetime

    <span class="tk-kw">def</span> <span class="tk-fn">to_dict</span>(self) <span class="tk-op">-></span> dict: ...`;

const signalSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">Signal</span>(BaseModel):              <span class="tk-cm"># pydantic v2 model</span>
    v:         str <span class="tk-op">=</span> <span class="tk-str">"1"</span>
    id:        str                     <span class="tk-cm"># evt_&lt;ULID&gt;, auto-generated</span>
    trace_id:  str                     <span class="tk-cm"># trc_&lt;ULID&gt;, auto-generated</span>
    parent_id: str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>
    type:      SignalType
    directed:  Directed <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>  <span class="tk-cm"># unified addressing</span>
    ts:        datetime                <span class="tk-cm"># UTC, auto-set on construction</span>
    payload:   dict <span class="tk-op">=</span> {}
    meta:      dict <span class="tk-op">=</span> {}

    <span class="tk-cm"># Field validators reject ids that don't start with evt_ / trc_.</span>
    <span class="tk-kw">def</span> <span class="tk-fn">encode</span>(self) <span class="tk-op">-></span> bytes: ...            <span class="tk-cm"># compact JSON bytes for the wire</span>
    <span class="tk-op">@</span>classmethod
    <span class="tk-kw">def</span> <span class="tk-fn">decode</span>(cls, data: bytes <span class="tk-op">|</span> str) <span class="tk-op">-></span> <span class="tk-str">"Signal"</span>: ...
    <span class="tk-kw">def</span> <span class="tk-fn">reply</span>(self, type, payload<span class="tk-op">=</span><span class="tk-kw">None</span>, directed<span class="tk-op">=</span><span class="tk-kw">None</span>, meta<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> <span class="tk-str">"Signal"</span>: ...
    <span class="tk-cm"># Child Signal sharing this trace, parented to this id. directed</span>
    <span class="tk-cm"># propagates from the source unless overridden.</span>

<span class="tk-kw">class</span> <span class="tk-fn">Directed</span>(BaseModel):   <span class="tk-cm"># precedence on receive: id > type > capabilities</span>
    id:           str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>   <span class="tk-cm"># direct address (neuron_id or engram_id)</span>
    type:         str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>   <span class="tk-cm"># type routing (neuron type or engram_kind)</span>
    capabilities: list[str] <span class="tk-op">=</span> []     <span class="tk-cm"># capability routing</span>

<span class="tk-cm"># Producer identity rides directed too: an AGENT_OUTPUT's directed.id</span>
<span class="tk-cm"># is the neuron_id that produced it (there is no Signal.neuron field).</span>`;

const signalTypeSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">SignalType</span>(str, Enum):
    <span class="tk-cm"># Lifecycle</span>
    TASK            <span class="tk-op">=</span> <span class="tk-str">"TASK"</span>
    AGENT_OUTPUT    <span class="tk-op">=</span> <span class="tk-str">"AGENT_OUTPUT"</span>
    FINAL           <span class="tk-op">=</span> <span class="tk-str">"FINAL"</span>
    ERROR           <span class="tk-op">=</span> <span class="tk-str">"ERROR"</span>

    <span class="tk-cm"># Routing</span>
    TASK_OFFER      <span class="tk-op">=</span> <span class="tk-str">"TASK_OFFER"</span>
    BID             <span class="tk-op">=</span> <span class="tk-str">"BID"</span>
    TASK_AWARDED    <span class="tk-op">=</span> <span class="tk-str">"TASK_AWARDED"</span>
    TASK_DECLINED   <span class="tk-op">=</span> <span class="tk-str">"TASK_DECLINED"</span>

    <span class="tk-cm"># Cognition</span>
    THOUGHT_DELTA   <span class="tk-op">=</span> <span class="tk-str">"THOUGHT_DELTA"</span>
    PLAN            <span class="tk-op">=</span> <span class="tk-str">"PLAN"</span>
    TOOL_CALL       <span class="tk-op">=</span> <span class="tk-str">"TOOL_CALL"</span>
    TOOL_RESULT     <span class="tk-op">=</span> <span class="tk-str">"TOOL_RESULT"</span>

    <span class="tk-cm"># Memory</span>
    MEMORY_APPEND   <span class="tk-op">=</span> <span class="tk-str">"MEMORY_APPEND"</span>
    ESCALATION      <span class="tk-op">=</span> <span class="tk-str">"ESCALATION"</span>

    <span class="tk-cm"># Coordination</span>
    CONSENSUS       <span class="tk-op">=</span> <span class="tk-str">"CONSENSUS"</span>
    CONTEXT_SYNC    <span class="tk-op">=</span> <span class="tk-str">"CONTEXT_SYNC"</span>
    CRITIQUE        <span class="tk-op">=</span> <span class="tk-str">"CRITIQUE"</span>
    CLARIFICATION   <span class="tk-op">=</span> <span class="tk-str">"CLARIFICATION"</span>
    PERMISSION      <span class="tk-op">=</span> <span class="tk-str">"PERMISSION"</span>
    PERMISSION_DECISION  <span class="tk-op">=</span> <span class="tk-str">"PERMISSION_DECISION"</span>
    CLARIFICATION_ANSWER <span class="tk-op">=</span> <span class="tk-str">"CLARIFICATION_ANSWER"</span>

    <span class="tk-cm"># Engram  -  shared memory</span>
    RECALL          <span class="tk-op">=</span> <span class="tk-str">"RECALL"</span>
    RECALLED        <span class="tk-op">=</span> <span class="tk-str">"RECALLED"</span>
    IMPRINT         <span class="tk-op">=</span> <span class="tk-str">"IMPRINT"</span>
    IMPRINTED       <span class="tk-op">=</span> <span class="tk-str">"IMPRINTED"</span>

    <span class="tk-cm"># Agent management</span>
    REGISTER        <span class="tk-op">=</span> <span class="tk-str">"REGISTER"</span>
    DEREGISTER      <span class="tk-op">=</span> <span class="tk-str">"DEREGISTER"</span>
    HEARTBEAT       <span class="tk-op">=</span> <span class="tk-str">"HEARTBEAT"</span>

    <span class="tk-cm"># Discovery</span>
    DISCOVER        <span class="tk-op">=</span> <span class="tk-str">"DISCOVER"</span>

    <span class="tk-cm"># Workflow control  -  cooperative cancellation of a whole trace</span>
    STOP            <span class="tk-op">=</span> <span class="tk-str">"STOP"</span>
    STOPPED         <span class="tk-op">=</span> <span class="tk-str">"STOPPED"</span>

<span class="tk-cm"># Frozensets defining who may emit what:</span>
<span class="tk-fn">AXON_TYPES</span>     <span class="tk-cm"># AGENT_OUTPUT, CLARIFICATION, PERMISSION, ERROR, REGISTER, DEREGISTER, HEARTBEAT</span>
<span class="tk-fn">SYNAPSE_TYPES</span>  <span class="tk-cm"># every type a Dendrite is allowed to emit (incl. ERROR)</span>`;

const retrySnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> RetryStrategy, default_retry_on

<span class="tk-cm"># Declarative retry policy for the request/reply shape.</span>
<span class="tk-op">@</span>dataclass(frozen<span class="tk-op">=</span><span class="tk-kw">True</span>)
<span class="tk-kw">class</span> <span class="tk-fn">RetryStrategy</span>:
    max_attempts:      int   <span class="tk-op">=</span> <span class="tk-num">3</span>     <span class="tk-cm"># total tries, incl. the first (&gt;= 1)</span>
    timeout_s:         float <span class="tk-op">=</span> <span class="tk-num">30.0</span>  <span class="tk-cm"># per-attempt terminal timeout</span>
    backoff:           Callable[[int], float] <span class="tk-op">=</span> ...   <span class="tk-cm"># attempt -&gt; secs; default 0</span>
    retry_on:          Callable[[object], bool] <span class="tk-op">=</span> default_retry_on
    new_trace:         bool  <span class="tk-op">=</span> <span class="tk-kw">True</span>   <span class="tk-cm"># fresh trace + STOP the abandoned one</span>
    rollback_on_retry: bool  <span class="tk-op">=</span> <span class="tk-kw">False</span>  <span class="tk-cm"># also roll back its Engram writes</span>
    on_retry:          Callable[[int, object], None] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>
    reason:            str   <span class="tk-op">=</span> <span class="tk-str">"retry"</span>

<span class="tk-cm"># default_retry_on retries on a timeout, on a Pathway that closed before a</span>
<span class="tk-cm"># terminal, or on an ERROR flagged recoverable. A FINAL / AGENT_OUTPUT /</span>
<span class="tk-cm"># CLARIFICATION / PERMISSION is never retried.</span>

sig <span class="tk-op">=</span> <span class="tk-kw">await</span> orch.<span class="tk-fn">run_with_retry</span>(
    neuron<span class="tk-op">=</span><span class="tk-str">"flaky-worker"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"q"</span>: <span class="tk-str">"hi"</span>},
    retry<span class="tk-op">=</span><span class="tk-fn">RetryStrategy</span>(
        max_attempts<span class="tk-op">=</span><span class="tk-num">5</span>, timeout_s<span class="tk-op">=</span><span class="tk-num">10.0</span>,
        backoff<span class="tk-op">=</span><span class="tk-kw">lambda</span> a: <span class="tk-num">2</span> <span class="tk-op">**</span> a,   <span class="tk-cm"># 1s, 2s, 4s, ...</span>
        rollback_on_retry<span class="tk-op">=</span><span class="tk-kw">True</span>,        <span class="tk-cm"># undo each abandoned attempt's Engram writes</span>
    ),
)

<span class="tk-cm"># Or cancel a whole workflow yourself (and roll back its Engram writes):</span>
<span class="tk-kw">await</span> orch.<span class="tk-fn">stop_trace</span>(trace_id, rollback<span class="tk-op">=</span><span class="tk-kw">True</span>, reason<span class="tk-op">=</span><span class="tk-str">"superseded"</span>)`;

const helpersSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> new_trace_id, new_event_id

trace <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()        <span class="tk-cm"># "trc_01JV..."   -  prefixed ULID</span>
eid   <span class="tk-op">=</span> <span class="tk-fn">new_event_id</span>()        <span class="tk-cm"># "evt_01JV..."   -  prefixed ULID</span>

<span class="tk-cm"># ULIDs sort lexicographically by creation time.</span>
<span class="tk-cm"># Call new_trace_id() at the top of any externally-triggered request</span>
<span class="tk-cm"># so you can correlate Doppler output with HTTP request IDs.</span>`;

const errorsSnippet = `<span class="tk-cm"># Protocol misuse:</span>
<span class="tk-kw">class</span> <span class="tk-fn">DendriteProtocolError</span>(ValueError): ...   <span class="tk-cm"># illegal emit() / await_decision type</span>
CortexProtocolError <span class="tk-op">=</span> DendriteProtocolError   <span class="tk-cm"># back-compat alias</span>

<span class="tk-cm"># Engram errors (see the Engram reference):</span>
<span class="tk-cm">#   EngramError, EngramTimeout, EngramCancelled, EngramNotBound, EngramOverloaded</span>

<span class="tk-cm"># Pathway:</span>
<span class="tk-cm">#   PathwayClosedError  -  Pathway closed before a matching Signal arrived</span>

<span class="tk-cm"># Everything else surfaces as a stdlib / dependency exception:</span>
<span class="tk-cm">#   ValueError        -  bad envelope id prefix, unknown synapse URL scheme</span>
<span class="tk-cm">#   TypeError         -  Dendrite built without a synapse</span>
<span class="tk-cm">#   pydantic.ValidationError  -  malformed Signal fields</span>
<span class="tk-cm">#   transport errors  -  raised straight from nats-py / aiokafka / asyncpg</span>

<span class="tk-cm"># Usage</span>
<span class="tk-kw">try</span>:
    <span class="tk-kw">await</span> dendrite.<span class="tk-fn">emit</span>(some_agent_output_signal)
<span class="tk-kw">except</span> DendriteProtocolError <span class="tk-kw">as</span> e:
    log.error(<span class="tk-str">"Dendrite may only emit synapse-side types: %s"</span>, e)`;

const axonFactorySnippet = `<span class="tk-kw">import</span> os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon

<span class="tk-cm"># One call: Neuron factory + Axon wiring + recogniser. Equivalent to</span>
<span class="tk-cm"># Axon(neuron_id=..., neuron_fn=Neuron(source=...), output_parser=...).</span>
chat = Axon.<span class="tk-fn">huggingface</span>(
    neuron_id<span class="tk-op">=</span><span class="tk-str">"llama"</span>,
    endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
    model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
    api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
    use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>,
    capabilities<span class="tk-op">=</span>[<span class="tk-str">"chat"</span>],
)

cloud = Axon.<span class="tk-fn">openai</span>(neuron_id<span class="tk-op">=</span><span class="tk-str">"gpt"</span>, model<span class="tk-op">=</span><span class="tk-str">"gpt-4o"</span>)         <span class="tk-cm"># api_key falls back to OPENAI_API_KEY</span>
local = Axon.<span class="tk-fn">ollama</span>(neuron_id<span class="tk-op">=</span><span class="tk-str">"chat"</span>, model<span class="tk-op">=</span><span class="tk-str">"llama3"</span>)
files = Axon.<span class="tk-fn">mcp</span>(neuron_id<span class="tk-op">=</span><span class="tk-str">"files"</span>, server<span class="tk-op">=</span><span class="tk-str">"filesystem"</span>, args<span class="tk-op">=</span>[<span class="tk-str">"/data"</span>])

<span class="tk-cm"># recognize=True (default) wires the source-family recogniser: the LLM</span>
<span class="tk-cm"># recogniser parses a {"cosmo": ...} intent block out of the model's text</span>
<span class="tk-cm"># (so it can emit CLARIFICATION / PERMISSION / ERROR, not just output);</span>
<span class="tk-cm"># the MCP recogniser maps is_error -> ERROR. teach_intents (default: on</span>
<span class="tk-cm"># for system=-capable LLM sources) appends COSMO_INTENT_SYSTEM_PROMPT so</span>
<span class="tk-cm"># the model knows the convention. Opt out of both:</span>
raw = Axon.<span class="tk-fn">openai</span>(neuron_id<span class="tk-op">=</span><span class="tk-str">"raw"</span>, model<span class="tk-op">=</span><span class="tk-str">"gpt-4o"</span>, recognize<span class="tk-op">=</span><span class="tk-kw">False</span>)`;

/* ─────────────────────────────  COMPONENT  ───────────────────────────── */

export default function PythonDocs({ section }: { section?: string }) {
  const all = (
    <>
      <div className="docs-megasection">
        <div className="docs-megasection-label">Python SDK</div>
        <h2 className="docs-megasection-title">
          Build agent fabrics from five small primitives.
        </h2>
        <p className="docs-megasection-sub">
          The SDK is the ergonomic skin over the Cosmonapse protocol. Every class below maps 1:1 onto
          a concept in the envelope spec. Anything the SDK does, you can do by speaking the protocol
          directly.
        </p>
      </div>

      <Section id="install" eyebrow="SDK · 01" title="Installation">
        <p className="docs-p">
          Cosmonapse requires Python 3.11 or newer. The base package ships with the in-memory and dev
          synapses, the SQLite registry store, and the <code className="inline">cosmo</code> CLI. NATS is
          an opt-in extra; the Kafka and Postgres backends are bundled but their drivers are installed
          separately.
        </p>
        <CodeBlock html={installSnippet} maxWidth={760} />
      </Section>

      <Section id="imports" eyebrow="SDK · 02" title="Top-level imports">
        <p className="docs-p">
          Every public symbol is re-exported from the <code className="inline">cosmonapse</code>{" "}
          package root. Deep imports (<code className="inline">cosmonapse.synapse.dev</code>,{" "}
          <code className="inline">cosmonapse.storage.sqlite</code>, etc.) are stable but not the
          blessed surface.
        </p>
        <CodeBlock filename="imports.py" html={topImportSnippet} maxWidth={820} />
      </Section>

      {/* ─── Neuron  -  sources ─── */}
      <Section id="neuron" eyebrow="SDK · 03" title="Neuron  -  sources">
        <p className="docs-p">
          A <strong>Neuron</strong> is <em>anything that interacts with the real world</em>, exposed
          behind one signature: <code className="inline">async (input, context) → dict</code>. It is
          not limited to an LLM agent  -  it can be an agent, an <strong>MCP server</strong>, or a plain
          async function. The{" "}
          <code className="inline">Neuron(source=…)</code> factory wraps each kind into the same{" "}
          <code className="inline">neuron_fn</code>, so the Axon and the rest of the protocol can&rsquo;t
          tell them apart. Each source is a soft dependency  -  installed only when you use it. An HTTP
          API is <em>not</em> a Neuron: keep your web framework at the edge and dispatch TASKs from its
          routes via an orchestrator Dendrite.
        </p>

        <ApiCard kind="factory" name="cosmonapse.Neuron(source, **kwargs)" summary="Returns a NeuronFn callable for the chosen source. Pass it straight to Axon(neuron_fn=…).">
          <CodeBlock filename="neuron_sources.py" html={neuronSourceSnippet} maxWidth={860} />
        </ApiCard>

        <h3 className="docs-h3">Available sources</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>source=</th>
              <th>Kind</th>
              <th>Key kwargs</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>&quot;ollama&quot;</td>
              <td>LLM</td>
              <td>model*, endpoint, system, temperature, max_tokens</td>
              <td>Wraps a local Ollama daemon (/api/generate + /api/chat). Needs <code className="inline">httpx</code>.</td>
            </tr>
            <tr>
              <td>&quot;huggingface&quot; / &quot;hf&quot;</td>
              <td>LLM</td>
              <td>endpoint*, model, use_chat_api, api_key, max_new_tokens</td>
              <td>TGI / vLLM / llama.cpp / LM Studio (OpenAI-compatible). Needs <code className="inline">httpx</code>.</td>
            </tr>
            <tr>
              <td>&quot;openai&quot;</td>
              <td>LLM</td>
              <td>model*, api_key, endpoint, system, temperature, max_tokens</td>
              <td>OpenAI Chat Completions. <code className="inline">api_key</code> falls back to <code className="inline">OPENAI_API_KEY</code>; point <code className="inline">endpoint</code> at Azure or a proxy. Needs <code className="inline">httpx</code>.</td>
            </tr>
            <tr>
              <td>&quot;anthropic&quot;</td>
              <td>LLM</td>
              <td>model*, api_key, system, max_tokens, temperature</td>
              <td>Anthropic Messages API. <code className="inline">api_key</code> falls back to <code className="inline">ANTHROPIC_API_KEY</code>; OpenAI-style system messages are hoisted to the top-level <code className="inline">system</code> field. Needs <code className="inline">httpx</code>.</td>
            </tr>
            <tr>
              <td>&quot;groq&quot; / &quot;openrouter&quot; / &quot;together&quot; / &quot;mistral&quot;</td>
              <td>LLM</td>
              <td>model, api_key, endpoint, temperature, max_new_tokens</td>
              <td>OpenAI-compatible hosted endpoints  -  pre-configured <code className="inline">&quot;huggingface&quot;</code> Neurons with the provider base URL and <code className="inline">use_chat_api=True</code>. <code className="inline">api_key</code> falls back to <code className="inline">GROQ_API_KEY</code> / <code className="inline">OPENROUTER_API_KEY</code> / <code className="inline">TOGETHER_API_KEY</code> / <code className="inline">MISTRAL_API_KEY</code>. Needs <code className="inline">httpx</code>.</td>
            </tr>
            <tr>
              <td>&quot;mcp&quot;</td>
              <td>MCP server</td>
              <td>command+args <em>or</em> server+args, env, cwd, tool</td>
              <td>Spawns any stdio MCP server and exposes its tools. Input is <code className="inline">{`{tool, arguments}`}</code> (or <code className="inline">{`{"__list_tools__": True}`}</code>); returns <code className="inline">{`{response, result, is_error, content, meta}`}</code>. Wrapper only  -  does not implement a server. Needs <code className="inline">mcp</code>.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <p className="docs-p">
          The <code className="inline">&quot;mcp&quot;</code> source ships{" "}
          <code className="inline">STANDARD_MCP_SERVERS</code>  -  launch presets for well-known published
          servers (<code className="inline">filesystem</code>, <code className="inline">fetch</code>,{" "}
          <code className="inline">git</code>, <code className="inline">memory</code>,{" "}
          <code className="inline">everything</code>, <code className="inline">sequentialthinking</code>,{" "}
          <code className="inline">time</code>). Pass <code className="inline">server=&quot;filesystem&quot;</code>{" "}
          and anything in <code className="inline">args</code> is appended to the preset&rsquo;s launch
          command. One subprocess is spawned and reused across tasks; the Axon tears it down on
          deregister.
        </p>
      </Section>

      {/* ─── Axon ─── */}
      <Section id="axon" eyebrow="SDK · 04" title="Axon  -  agent-side tool">
        <p className="docs-p">
          The <strong>Axon</strong> owns the Neuron&rsquo;s identity (
          <code className="inline">neuron_id</code>, <code className="inline">capabilities</code>,{" "}
          <code className="inline">version</code>) and the tool body (
          <code className="inline">neuron_fn</code>). It never touches the Synapse  -  it must be
          attached to a Dendrite to participate.
        </p>

        <ApiCard kind="class" name="cosmonapse.Axon" summary="Wraps a Neuron function with the metadata and validation needed to put it on the bus.">
          <CodeBlock filename="axon.pyi" html={axonClassSnippet} maxWidth={820} />
        </ApiCard>

        <h3 className="docs-h3">Constructor parameters</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>neuron_id</td>
              <td>str</td>
              <td>The address other processes use to reach this Neuron. Must be unique within a namespace.</td>
            </tr>
            <tr>
              <td>neuron_fn</td>
              <td>async (input, context) → dict</td>
              <td>The Neuron itself. Receives the TASK payload and resolved context; must return a JSON-serialisable dict.</td>
            </tr>
            <tr>
              <td>capabilities</td>
              <td>list[str] | None</td>
              <td>Tags advertised in REGISTER for capability-based routing. Defaults to an empty list.</td>
            </tr>
            <tr>
              <td>version</td>
              <td>str | None</td>
              <td>Optional version string surfaced in REGISTER so callers can target a specific revision. Defaults to None.</td>
            </tr>
            <tr>
              <td>context_fetcher</td>
              <td>async (context_ref) → list</td>
              <td>Resolver for <code className="inline">payload.context_ref</code>. Defaults to a no-op returning <code className="inline">[]</code>.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Methods</h3>
        <ApiCard kind="async method" name="Axon.handle_task(task: Signal) -> Signal" summary="Called by the Dendrite for each inbound TASK. Resolves context_ref, invokes neuron_fn, and returns the corresponding outbound Signal (AGENT_OUTPUT, CLARIFICATION, PERMISSION, or ERROR). Application code never calls this directly." />

        <h3 className="docs-h3">Source-paired factories</h3>
        <p className="docs-p">
          The second way to build an Axon. <code className="inline">Axon.from_source(source, ...)</code>{" "}
          and its shorthands  -  <code className="inline">Axon.ollama()</code>,{" "}
          <code className="inline">Axon.huggingface()</code> (alias{" "}
          <code className="inline">Axon.hf</code>), <code className="inline">Axon.openai()</code>,{" "}
          <code className="inline">Axon.anthropic()</code>,{" "}
          <code className="inline">Axon.mcp()</code>  -  create the provider-backed Neuron{" "}
          <em>and</em> the Axon in one call. Extra kwargs flow to the{" "}
          <code className="inline">Neuron(source=...)</code> factory; the Axon kwargs
          (<code className="inline">capabilities</code>, <code className="inline">version</code>,{" "}
          <code className="inline">engrams</code>, ...) keep their meaning. By default the Axon is
          also wired with the source family&rsquo;s recogniser{" "}
          (<code className="inline">recognize=True</code>) and the model is taught the{" "}
          <code className="inline">{"{\"cosmo\": ...}"}</code> intent convention{" "}
          (<code className="inline">teach_intents</code>) where the source accepts a{" "}
          <code className="inline">system=</code> prompt.
        </p>
        <CodeBlock filename="factories.py" html={axonFactorySnippet} maxWidth={880} />

        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="answerer.py" html={axonUseSnippet} maxWidth={820} />
      </Section>

      {/* ─── Dendrite ─── */}
      <Section id="dendrite" eyebrow="SDK · 05" title="Dendrite  -  synapse-side connector">
        <p className="docs-p">
          The <strong>Dendrite</strong> is the only thing that touches the Synapse. It hosts attached
          Axons, owns REGISTER / HEARTBEAT / DEREGISTER, routes inbound TASKs to the matching Axon,
          and publishes the Axon&rsquo;s returned Signal. Every Dendrite can also orchestrate  -  there
          is no separate Cortex class in v0.2.
        </p>

        <ApiCard kind="class" name="cosmonapse.Dendrite" summary="Hosts Axons and exposes every orchestration primitive. Synapse and (optionally) RegistryStore are passed in; the Dendrite never builds or closes them.">
          <CodeBlock filename="dendrite.pyi" html={dendriteClassSnippet} maxWidth={880} />
        </ApiCard>

        <h3 className="docs-h3">Constructor parameters</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>synapse</td>
              <td>Synapse</td>
              <td>Required. An already-connected synapse adapter. The Dendrite never calls <code className="inline">connect()</code> on it.</td>
            </tr>
            <tr>
              <td>registry_store</td>
              <td>RegistryStore | None</td>
              <td>Optional. When supplied, the Dendrite mirrors attached Axons into the store and auto-subscribes to REGISTER / DEREGISTER / HEARTBEAT for the namespace.</td>
            </tr>
            <tr>
              <td>namespace</td>
              <td>str</td>
              <td>Subject namespace. All published and subscribed subjects are scoped under <code className="inline">cosmonapse.&lt;namespace&gt;.&lt;TYPE&gt;</code>. Default &quot;default&quot;.</td>
            </tr>
            <tr>
              <td>dendrite_id</td>
              <td>str</td>
              <td>Identifier embedded as <code className="inline">neuron</code> in this Dendrite&rsquo;s outbound FINAL / ERROR signals. Default &quot;dendrite&quot;.</td>
            </tr>
            <tr>
              <td>heartbeat_s</td>
              <td>float</td>
              <td>Interval between HEARTBEAT emissions in seconds. Default 30.0. Pass 0 to disable the loop.</td>
            </tr>
            <tr>
              <td>reregister_on_heartbeat</td>
              <td>bool</td>
              <td>Re-emit REGISTER alongside each HEARTBEAT so late-joining consumers discover Axons without a dedicated sync. Default True.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Axon lifecycle</h3>
        <ApiCard kind="method" name="Dendrite.attach_axon(axon: Axon) -> None" summary="Register an Axon on this Dendrite. If the Dendrite is already started, the next start cycle emits REGISTER. Raises if neuron_id is already attached." />
        <ApiCard kind="method" name="Dendrite.detach_axon(neuron_id: str) -> None" summary="Stop hosting the named Axon and emit DEREGISTER." />
        <ApiCard kind="async method" name="Dendrite.start() -> None" summary="Wire subscriptions, emit REGISTER for every attached Axon, and start the heartbeat task plus any on_schedule coroutines." />
        <ApiCard kind="async method" name="Dendrite.stop(reason=None) -> None" summary="Cancel background tasks, emit DEREGISTER for each Axon, and tear down subscriptions. The passed-in Synapse and RegistryStore are NOT closed  -  the caller owns them." />
        <ApiCard kind="async context manager" name="async with Dendrite as d: ..." summary="Equivalent to start() on enter and stop() on exit, with exceptions propagated normally." />

        <h3 className="docs-h3">Orchestration primitives</h3>
        <ApiCard
          kind="async method"
          name="Dendrite.dispatch_task(*, neuron, input, trace_id=None, parent_id=None, context_ref=None, capabilities=None, meta=None) -> Signal"
          summary="Publish a TASK envelope addressed to a Neuron. Auto-generates trace_id and id if omitted. This is a fire-and-publish call  -  it does not consult the registry, so dispatching to an unknown neuron simply produces a TASK no Axon picks up. Returns the emitted Signal so the caller can correlate."
        />
        <ApiCard kind="async method" name="Dendrite.emit_final(*, trace_id, parent_id, result, meta=None) -> Signal" summary="Publish a terminal FINAL envelope for a trace. Exactly one FINAL or ERROR is expected per trace; subsequent terminal envelopes for the same trace are dropped by well-behaved consumers." />
        <ApiCard kind="async method" name="Dendrite.emit_error(*, trace_id, parent_id, code, message, recoverable=False, meta=None) -> Signal" summary="Publish a terminal ERROR envelope with a short machine code and a human-readable message. recoverable=True signals to the consumer that the task may be retried or re-routed." />
        <ApiCard kind="async method" name="Dendrite.emit(signal: Signal) -> None" summary="Low-level escape hatch. Raises DendriteProtocolError for any Signal whose type is not in SYNAPSE_TYPES (the allow-list defined in code, not just convention)." />

        <h3 className="docs-h3">Resilience &amp; cancellation</h3>
        <p className="docs-p">
          Retry is a declarative policy for the request/reply shape only  -  the Dendrite owns the
          full dispatch → wait → close arc and can transparently re-dispatch. The streaming shapes
          (<code className="inline">dispatch</code> / <code className="inline">dispatch_and_subscribe</code>)
          hand the live Pathway back to the caller, so retry there would orphan their subscriptions.
          A new-trace retry broadcasts <code className="inline">STOP</code> on the abandoned trace
          first, so a stalled worker (and its half-finished Engram writes) can&rsquo;t outlive the retry.
        </p>
        <ApiCard kind="async method" name="Dendrite.run_with_retry(*, retry: RetryStrategy, neuron=None, input, capabilities=None, timeout_s=30.0, scope='all', finalize=None, **kw) -> Signal" summary="Dispatch and wait, retrying per the RetryStrategy until a non-retryable outcome or attempts are exhausted. Returns the resolved Signal (FINAL / AGENT_OUTPUT / CLARIFICATION / PERMISSION, or a final ERROR); re-raises the last exception when every attempt timed out." />
        <ApiCard kind="async method" name="Dendrite.dispatch_and_wait(..., retry: RetryStrategy | None = None) -> Signal" summary="The request/reply sugar also accepts retry=. When supplied it delegates to the same loop as run_with_retry; when omitted it is a single dispatch + wait." />
        <ApiCard kind="async method" name="Dendrite.emit_stop(*, trace_id, rollback=False, reason=None) -> Signal" summary="Broadcast a STOP for a whole trace (orchestrator-gated). Best-effort and idempotent: STOP is fire-and-forget, so a peer that never saw it simply isn't stopped. rollback=True replays each hosted Engram's per-trace saga journal in reverse. Returns the emitted STOP Signal." />
        <ApiCard kind="async method" name="Dendrite.stop_trace(trace_id, *, rollback=False, reason=None, collect_acks=False, timeout_s=1.0) -> list[Signal]" summary="Thin wrapper over emit_stop. With collect_acks=True it opens a short-lived STOPPED subscription and returns the acks (one per quiesced Dendrite) seen within timeout_s, best effort." />
        <CodeBlock filename="retry.py" html={retrySnippet} maxWidth={880} />

        <h3 className="docs-h3">Inbound handlers</h3>
        <p className="docs-p">
          Every SignalType has a named <code className="inline">on_*</code> decorator you apply to a
          coroutine, and all of them accept the same optional filters:{" "}
          <code className="inline">neuron=</code>, <code className="inline">capability=</code>,{" "}
          <code className="inline">trace_id=</code>.{" "}
          <code className="inline">on_signal(SignalType.X, ...)</code> is the generic escape hatch
          behind the named sugar, <code className="inline">on_trace(trace_id, *types)</code> registers
          one handler across a whole trace, and <code className="inline">subscribe()</code> is a
          coroutine  -  not a decorator  -  returning a raw{" "}
          <code className="inline">Subscription</code>.
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
            <tr><td>@dendrite.on_task_signal</td><td>Every TASK on the namespace.</td></tr>
            <tr><td>@dendrite.on_agent_output</td><td>Every AGENT_OUTPUT.</td></tr>
            <tr><td>@dendrite.on_final</td><td>Every FINAL  -  workflow conclusion.</td></tr>
            <tr><td>@dendrite.on_error_signal</td><td>Every ERROR. (@dendrite.on_error is a deprecated alias.)</td></tr>
            <tr><td>@dendrite.on_task_offer</td><td>Every TASK_OFFER. Registering one suppresses the default auto-bidder.</td></tr>
            <tr><td>@dendrite.on_bid / on_task_awarded / on_task_declined</td><td>The bidding flow  -  market observability.</td></tr>
            <tr><td>@dendrite.on_plan / on_thought_delta / on_tool_call / on_tool_result</td><td>The cognition stream.</td></tr>
            <tr><td>@dendrite.on_memory_append / on_critique / on_escalation / on_consensus / on_context_sync</td><td>The remaining cognition / coordination types.</td></tr>
            <tr><td>@dendrite.on_clarification</td><td>Every CLARIFICATION. Reply with answer_clarification (discrete) or respond_to_clarification (re-dispatch).</td></tr>
            <tr><td>@dendrite.on_permission</td><td>Every PERMISSION request. Reply with grant_permission / deny_permission / respond_to_permission.</td></tr>
            <tr><td>@dendrite.on_clarification_answer / on_permission_decision</td><td>The discrete answers  -  the decorator counterparts of await_decision().</td></tr>
            <tr><td>@dendrite.on_recall_signal / on_imprint_signal</td><td>Engram requests crossing the bus.</td></tr>
            <tr><td>@dendrite.on_recalled / on_imprinted</td><td>Engram responses (observability; EngramClient owns correlation).</td></tr>
            <tr><td>@dendrite.on_register_signal</td><td>Every REGISTER, including re-registers attached to HEARTBEATs. (on_register is a deprecated alias.)</td></tr>
            <tr><td>@dendrite.on_deregister_signal / on_heartbeat_signal</td><td>DEREGISTER / HEARTBEAT. (Short aliases deprecated.)</td></tr>
            <tr><td>@dendrite.on_discover</td><td>Every DISCOVER  -  answer with your hosted Axons (cosmo registry list uses this).</td></tr>
            <tr><td>@dendrite.on_signal(SignalType.X, neuron=…, capability=…, trace_id=…)</td><td>Any SignalType  -  the generic form with the same filters.</td></tr>
            <tr><td>@dendrite.on_trace(trace_id, *types)</td><td>Every (or the selected) type on one trace.</td></tr>
            <tr><td>@dendrite.on_connect / on_refresh / on_schedule(every_s=N)</td><td>LifecycleHooks  -  not Signals: fired on registration, registry refresh, and a timer.</td></tr>
            <tr><td>await dendrite.subscribe(SignalType.X, handler)</td><td>Raw subscription. Returns a Subscription you can later unsubscribe.</td></tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">RegistryStore reads</h3>
        <ApiCard kind="async method" name="Dendrite.find_neurons(*, capability=None) -> list[NeuronRecord]" summary="Return live (non-deregistered) Neurons on the namespace, optionally filtered to those advertising the given capability. Requires a registry_store." />
        <ApiCard kind="async method" name="Dendrite.registry_snapshot(*, capability=None, include_deregistered=False) -> list[NeuronRecord]" summary="Point-in-time snapshot of the registry. Useful in on_connect / on_schedule handlers. Requires a registry_store." />

        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="worker.py" html={dendriteUseSnippet} maxWidth={880} />
      </Section>

      {/* ─── Pathway ─── */}
      <Section id="pathway" eyebrow="SDK · 06" title="Pathway  -  per-trace event handle">
        <p className="docs-p">
          A <strong>Pathway</strong> is the client-side observation surface for one logical workflow,
          identified by its <code className="inline">trace_id</code>. It supports{" "}
          <strong>three consumption shapes on the same primitive</strong>, so the developer picks the
          shape that fits the workflow rather than the SDK forcing a style.
        </p>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr><th>Shape</th><th>When to use</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code className="inline">await pw.wait()</code></td>
              <td>Sequential request/reply. Blocks until the first AGENT_OUTPUT / CLARIFICATION / ERROR / FINAL.</td>
            </tr>
            <tr>
              <td><code className="inline">@pw.on(SignalType.X)</code></td>
              <td>Reactive trace-scoped callbacks. Useful for streams like THOUGHT_DELTA or PLAN/TOOL_CALL.</td>
            </tr>
            <tr>
              <td><code className="inline">async for sig in pw:</code></td>
              <td>Streaming iteration over every Signal on the trace until close.</td>
            </tr>
          </tbody>
        </table>
        </div>
        <p className="docs-p" style={{ marginTop: 24 }}>
          <strong>Scope filter.</strong>{" "}
          <code className="inline">Pathway(scope=&quot;all&quot;)</code> (default, centralised pattern)
          delivers every PATHWAY_TYPES Signal on the trace.{" "}
          <code className="inline">scope=&quot;terminal&quot;</code> (decentralised pattern) delivers
          only FINAL / ERROR / CLARIFICATION  -  intermediate orchestration is handled peer-to-peer by
          other Dendrites and the Cortex only wakes for events that need attention. FINAL and ERROR
          always reach auto-close regardless of scope.
        </p>
        <p className="docs-p">
          <strong>Originator vs observer.</strong>{" "}
          <code className="inline">dendrite.dispatch(...)</code> returns a Pathway in{" "}
          <em>originator</em> role.{" "}
          <code className="inline">dendrite.observe_pathway(trace_id)</code> opens one in{" "}
          <em>observer</em> role  -  watch a trace another peer started, without emitting a TASK.
        </p>
        <CodeBlock filename="pathway.pyi" html={pathwayClassSnippet} maxWidth={880} />
        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="three_shapes.py" html={pathwayUseSnippet} maxWidth={880} />
      </Section>

      {/* ─── Engram pointer ─── */}
      <Section id="engram" eyebrow="SDK · 06b" title="Engram  -  shared memory">
        <p className="docs-p">
          The Engram subsystem (the <code className="inline">cosmonapse.engram</code> package:{" "}
          <code className="inline">Engram</code>, <code className="inline">EngramBinding</code>,{" "}
          <code className="inline">EngramClient</code>, and the{" "}
          <code className="inline">InMemoryEngram</code> /{" "}
          <code className="inline">SqliteEngram</code> /{" "}
          <code className="inline">PostgresEngram</code> backends) is large enough to warrant its own
          reference. It covers how a Neuron addresses memory through{" "}
          <code className="inline">recall(...)</code> and <code className="inline">imprint(...)</code>,
          how Engrams are mounted on a Dendrite with{" "}
          <code className="inline">attach_engram(...)</code>, the{" "}
          <code className="inline">RECALL</code> / <code className="inline">IMPRINT</code> signals on
          the wire, and the full backend API.
        </p>
        <p className="docs-p">
          Read it on the dedicated page:{" "}
          <Link href="/docs/engram" className="inline-link">
            Engram reference →
          </Link>
        </p>
      </Section>

      {/* ─── Cortex alias ─── */}
      <Section id="cortex" eyebrow="SDK · 07" title="Cortex  -  back-compat alias">
        <p className="docs-p">
          <code className="inline">cosmonapse.Cortex</code> is an alias of{" "}
          <code className="inline">cosmonapse.Dendrite</code>, and{" "}
          <code className="inline">CortexProtocolError</code> aliases{" "}
          <code className="inline">DendriteProtocolError</code>. They are preserved for code written
          against the v0.1 split where the orchestrator was a separate class. New code should use{" "}
          <code className="inline">Dendrite</code> directly  -  every orchestration primitive lives
          there.
        </p>
        <p className="docs-p">
          When you read &ldquo;Cortex&rdquo; elsewhere in the docs, treat it as &ldquo;a Dendrite
          acting as an orchestrator&rdquo;.
        </p>
      </Section>

      {/* ─── Lifecycle Hooks ─── */}
      <Section id="lifecycle" eyebrow="SDK · 07" title="Lifecycle hooks">
        <p className="docs-p">
          Both <code className="inline">Axon</code> and <code className="inline">Dendrite</code> mix in{" "}
          <code className="inline">LifecycleHooks</code>. The same three decorators are available on
          each.
        </p>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Hook</th>
              <th>Fires when</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>on_connect(fn)</td>
              <td>Once, after this component finishes its own connect handshake. For an Axon, after the hosting Dendrite emits REGISTER; for a Dendrite, after synapse subscriptions are wired.</td>
            </tr>
            <tr>
              <td>axon.host.on_&lt;signal&gt;(**filters)</td>
              <td>Axon only  -  deferred Dendrite decorator. Queued at module level, replayed onto the <em>hosting</em> Dendrite right after REGISTER (before on_connect hooks) with the inbound subscription ensured. Any <code className="inline">Dendrite.on_*</code> signal decorator with the standard <code className="inline">(fn, *, neuron=, capability=, trace_id=)</code> shape; names validated at import time.</td>
            </tr>
            <tr>
              <td>on_refresh(fn)</td>
              <td>On each refresh event  -  a heartbeat tick, a REGISTER / DEREGISTER / HEARTBEAT observed via the registry mirror, or a manual <code className="inline">await component.refresh(reason=...)</code>. The handler receives a <code className="inline">RefreshEvent(reason, neuron_id, extra)</code>.</td>
            </tr>
            <tr>
              <td>on_schedule(every_s=N)(fn)</td>
              <td>Developer-supplied periodic task. Runs as a background coroutine every <code className="inline">every_s</code> seconds for the lifetime of the component.</td>
            </tr>
          </tbody>
        </table>
        </div>
        <ApiCard kind="async method" name="component.refresh(*, reason='manual', neuron_id=None, extra=None) -> None" summary="Manually fire on_refresh handlers with the supplied RefreshEvent. Use when your own code knows state has changed but the SDK can't detect it." />
        <CodeBlock filename="hooks.py" html={lifecycleSnippet} maxWidth={820} />
      </Section>

      {/* ─── Synapse ─── */}
      <Section id="synapse" eyebrow="SDK · 08" title="Synapse  -  transport adapters">
        <p className="docs-p">
          A <strong>Synapse</strong> is the message bus. The application picks a backend, passes the
          adapter to the Dendrite, and never touches the wire format again. All adapters subclass the
          same abstract <code className="inline">Synapse</code> base.
        </p>

        <ApiCard kind="abstract base" name="cosmonapse.Synapse" summary="The contract every transport adapter must satisfy. Adapters are responsible for ordering, dedup window, ack semantics, and durability  -  the SDK assumes at-least-once delivery and in-order per key.">
          <CodeBlock filename="synapse.pyi" html={synapseInterfaceSnippet} maxWidth={820} />
        </ApiCard>

        <h3 className="docs-h3">Bundled adapters</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Process boundary</th>
              <th>Use when</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>MemorySynapse</td>
              <td>single process</td>
              <td>Tests, tightly-coupled callers, embedded supervisor processes.</td>
            </tr>
            <tr>
              <td>DevSynapse</td>
              <td>local host, many processes</td>
              <td>Client side of <code className="inline">cosmo synapse start</code>. TCP + NDJSON; single-host dev only; zero external deps.</td>
            </tr>
            <tr>
              <td>NatsSynapse</td>
              <td>cluster</td>
              <td>Production default. Native wildcards and queue groups; low latency. Needs the <code className="inline">[nats]</code> extra.</td>
            </tr>
            <tr>
              <td>KafkaSynapse</td>
              <td>cluster</td>
              <td>Durable audit log. Trickier request/reply; recommended when retention matters more than latency.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">URL factory</h3>
        <ApiCard kind="function" name="synapse_from_url(url: str) -> Synapse" summary="Map a cosmo:// / nats:// / kafka:// URL to a non-connected adapter instance. Raises ValueError for any other scheme. MemorySynapse has no URL  -  build it directly." />
        <ApiCard kind="async function" name="connect_synapse(url: str) -> Synapse" summary="Same as synapse_from_url but immediately calls connect()." />
        <CodeBlock filename="urls.py" html={synapseUrlSnippet} maxWidth={780} />

        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>URL scheme</th>
              <th>Resolves to</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>cosmo://host:port</td><td>DevSynapse client (talks to cosmo synapse start)</td></tr>
            <tr><td>nats://host:port</td><td>NatsSynapse</td></tr>
            <tr><td>kafka://host:port</td><td>KafkaSynapse</td></tr>
            <tr><td>(no URL)</td><td>MemorySynapse  -  construct directly, it is process-local</td></tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Subjects</h3>
        <p className="docs-p">
          Subjects follow <code className="inline">cosmonapse.&lt;namespace&gt;.&lt;TYPE&gt;</code>.
          Queue groups load-balance within a group; subscribers with no{" "}
          <code className="inline">queue_group</code> form the Doppler population (every matching
          message goes to each one). Application code must never construct subjects directly  -  let the
          Dendrite resolve them.
        </p>
      </Section>

      {/* ─── Registry ─── */}
      <Section id="registry" eyebrow="SDK · 09" title="RegistryStore">
        <p className="docs-p">
          The <strong>RegistryStore</strong> is the one optional persistent surface the SDK owns. It
          is a live view of every Neuron seen on a namespace: capabilities, status, last heartbeat.
          Anything beyond that  -  cost histograms, audit history, latency dashboards  -  is the
          developer&rsquo;s to build on top.
        </p>

        <ApiCard kind="abstract base" name="cosmonapse.RegistryStore" summary="The interface every backend must satisfy. Records are NeuronRecord instances keyed by neuron_id.">
          <CodeBlock filename="registry.pyi" html={registryStoreSnippet} maxWidth={840} />
        </ApiCard>

        <h3 className="docs-h3">NeuronRecord</h3>
        <CodeBlock filename="record.pyi" html={neuronRecordSnippet} maxWidth={760} />

        <h3 className="docs-h3">Bundled backends</h3>
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
              <td>MemoryRegistryStore()</td>
              <td>Tests, ephemeral orchestrators, anything where losing state on restart is acceptable.</td>
            </tr>
            <tr>
              <td>SqliteRegistryStore(path)</td>
              <td>Single-process production with zero extra dependencies.</td>
            </tr>
            <tr>
              <td>PostgresRegistryStore(dsn=…)</td>
              <td>Multi-process production. asyncpg-backed, lazily imported. Use when more than one Dendrite needs to write to the same store.</td>
            </tr>
          </tbody>
        </table>
        </div>
      </Section>

      {/* ─── Signal ─── */}
      <Section id="signal" eyebrow="SDK · 10" title="Signal & SignalType">
        <p className="docs-p">
          A <strong>Signal</strong> is the in-memory representation of an envelope  -  a Pydantic v2
          model. Every method that publishes or receives a message uses it. See{" "}
          <Link href="/protocol">the envelope spec</Link> for the full wire-level field reference.
        </p>
        <ApiCard kind="model" name="cosmonapse.Signal" summary="Pydantic BaseModel mirroring the envelope schema. encode() / decode() round-trip with the wire format; field validators reject ids that don't carry the evt_ / trc_ prefixes.">
          <CodeBlock filename="signal.pyi" html={signalSnippet} maxWidth={840} />
        </ApiCard>
        <ApiCard kind="enum" name="cosmonapse.SignalType" summary="String enum of every legal type. SYNAPSE_TYPES is a frozenset of the values a Dendrite is allowed to publish  -  anything else passed to dendrite.emit() raises DendriteProtocolError.">
          <CodeBlock filename="signal_type.pyi" html={signalTypeSnippet} maxWidth={840} />
        </ApiCard>
        <ApiCard kind="builders" name="stop_signal(...) / stopped_signal(...)" summary="Envelope builders for the workflow-control pair. stop_signal(*, trace_id, rollback=False, reason=None) builds a STOP; stopped_signal(*, trace_id, parent_id, rolled_back=False, cancelled=0, compensated=0, node=None) builds the ack. You rarely call these directly  -  Dendrite.emit_stop / stop_trace build and publish them for you." />
      </Section>

      {/* ─── Helpers ─── */}
      <Section id="helpers" eyebrow="SDK · 11" title="ID helpers">
        <p className="docs-p">
          Both helpers return prefixed ULIDs as defined in the spec. They sort lexicographically by
          creation time.
        </p>
        <ApiCard kind="function" name="new_trace_id() -> str" summary={`Generate a new trace_id of the form "trc_01JV…". Use at the start of any externally-triggered request so HTTP/CLI/test inputs can be correlated end-to-end.`} />
        <ApiCard kind="function" name="new_event_id() -> str" summary={`Generate a new event id of the form "evt_01JV…". The SDK calls this internally on every emitted Signal; you only need it for hand-built envelopes.`} />
        <CodeBlock html={helpersSnippet} maxWidth={760} />
      </Section>

      {/* ─── Errors (protocol exceptions) ─── */}
      <Section id="errors" eyebrow="SDK · 12" title="Protocol errors">
        <p className="docs-p">
          The SDK is deliberately thin on bespoke exceptions.{" "}
          <code className="inline">DendriteProtocolError</code> (a{" "}
          <code className="inline">ValueError</code> subclass) is raised for protocol misuse  -  e.g.
          when you <code className="inline">emit()</code> a Signal whose type isn&rsquo;t in{" "}
          <code className="inline">SYNAPSE_TYPES</code>. The Engram surface adds{" "}
          <code className="inline">EngramError</code> and its subclasses, and Pathways raise{" "}
          <code className="inline">PathwayClosedError</code> when closed early. Everything else
          surfaces as a standard library or dependency exception.
        </p>
        <CodeBlock filename="errors.py" html={errorsSnippet} maxWidth={840} />
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Exception</th>
              <th>Raised when</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code className="inline">DendriteProtocolError</code></td>
              <td><code className="inline">dendrite.emit()</code> is called with a Signal type not in <code className="inline">SYNAPSE_TYPES</code> (e.g. a worker trying to emit a TASK).</td>
            </tr>
            <tr>
              <td><code className="inline">ValueError</code></td>
              <td>Bad envelope id prefix (not <code className="inline">evt_</code> / <code className="inline">trc_</code>), or unknown Synapse URL scheme.</td>
            </tr>
            <tr>
              <td><code className="inline">TypeError</code></td>
              <td>Dendrite constructed without a <code className="inline">synapse=</code> argument.</td>
            </tr>
            <tr>
              <td><code className="inline">pydantic.ValidationError</code></td>
              <td>Malformed Signal fields on decode (wire format does not match the envelope schema).</td>
            </tr>
            <tr>
              <td>Transport exception</td>
              <td>Raised directly from <code className="inline">nats-py</code>, <code className="inline">aiokafka</code>, or <code className="inline">asyncpg</code>  -  not wrapped.</td>
            </tr>
          </tbody>
        </table>
        </div>
      </Section>
    </>
  );

  return pickSection(all, section);
}