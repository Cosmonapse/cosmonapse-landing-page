import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import { Section, ApiCard, type TocGroup } from "./shared";

export const pythonToc: TocGroup = {
  title: "Python SDK",
  items: [
    { href: "#install", label: "Installation" },
    { href: "#imports", label: "Top-level imports" },
    { href: "#neuron", label: "Neuron — sources" },
    { href: "#axon", label: "Axon" },
    { href: "#dendrite", label: "Dendrite" },
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

<span class="tk-cm"># Optional extra (declared in pyproject):</span>
<span class="tk-op">$</span> pip install <span class="tk-str">"cosmonapse[nats]"</span>   <span class="tk-cm"># NatsSynapse (pulls in nats-py)</span>

<span class="tk-cm"># The Kafka and Postgres backends ship in the package, but their</span>
<span class="tk-cm"># drivers are not declared extras yet — install them yourself:</span>
<span class="tk-op">$</span> pip install aiokafka      <span class="tk-cm"># KafkaSynapse</span>
<span class="tk-op">$</span> pip install asyncpg       <span class="tk-cm"># PostgresRegistryStore</span>

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

    <span class="tk-cm"># Envelope + helpers</span>
    Signal,
    SignalType,
    AXON_TYPES,
    SYNAPSE_TYPES,
    new_trace_id,
    new_event_id,

    <span class="tk-cm"># The only SDK-raised exception</span>
    DendriteProtocolError,
    CortexProtocolError,          <span class="tk-cm"># alias of the above</span>
)`;

const neuronSourceSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Neuron

<span class="tk-cm"># A Neuron is anything that interacts with the real world. The same factory</span>
<span class="tk-cm"># wraps an LLM, an HTTP app, or an MCP server — the Axon never knows which.</span>

<span class="tk-cm"># 1 · LLM / agent — Ollama, HuggingFace TGI / vLLM / OpenAI-compatible</span>
chat <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"chat"</span>,
            neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"ollama"</span>, model<span class="tk-op">=</span><span class="tk-str">"llama3"</span>))

<span class="tk-cm"># 2 · API — an existing Flask app (or any WSGI callable), served in-process</span>
<span class="tk-kw">from</span> flask <span class="tk-kw">import</span> Flask, request, jsonify
app <span class="tk-op">=</span> Flask(__name__)

<span class="tk-op">@</span>app.post(<span class="tk-str">"/summarise"</span>)
<span class="tk-kw">def</span> <span class="tk-fn">summarise</span>():
    body <span class="tk-op">=</span> request.get_json()
    <span class="tk-kw">return</span> jsonify(summary<span class="tk-op">=</span>body[<span class="tk-str">"text"</span>][:<span class="tk-str">120</span>])

api <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"summary-api"</span>,
           neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"flask"</span>, app<span class="tk-op">=</span>app,
                            default_path<span class="tk-op">=</span><span class="tk-str">"/summarise"</span>))

<span class="tk-cm"># 3 · MCP server — wrap any stdio MCP server's tools as a Neuron</span>
files <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"files"</span>,
             neuron_fn<span class="tk-op">=</span>Neuron(source<span class="tk-op">=</span><span class="tk-str">"mcp"</span>, server<span class="tk-op">=</span><span class="tk-str">"filesystem"</span>,
                              args<span class="tk-op">=</span>[<span class="tk-str">"/data"</span>], tool<span class="tk-op">=</span><span class="tk-str">"read_file"</span>))`;

const axonClassSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">Axon</span>(LifecycleHooks):
    <span class="tk-kw">def</span> __init__(
        self,
        *,
        neuron_id:       str,
        neuron_fn:       Callable[[dict, list], Awaitable[dict]],
        capabilities:    list[str] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        version:         str <span class="tk-op">|</span> <span class="tk-kw">None</span>      <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        context_fetcher: Callable[[str], Awaitable[list]] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
    ) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...

    <span class="tk-kw">async def</span> <span class="tk-fn">handle_task</span>(self, task: Signal) <span class="tk-op">-></span> Signal: ...
    <span class="tk-cm"># Called by the Dendrite. Resolves context_ref, invokes neuron_fn,</span>
    <span class="tk-cm"># wraps the result in AGENT_OUTPUT / CLARIFICATION / ERROR.</span>

    <span class="tk-cm"># Inherited from LifecycleHooks:</span>
    <span class="tk-op">@</span>axon.on_connect          <span class="tk-cm"># after the hosting Dendrite emits REGISTER</span>
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
    <span class="tk-kw">await</span> <span class="tk-fn">preload_model_weights</span>()`;

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
    ) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...

    <span class="tk-cm"># No Dendrite.connect() — build the synapse yourself, then pass it in:</span>
    <span class="tk-cm">#   synapse = await connect_synapse("cosmo://127.0.0.1:7070")</span>
    <span class="tk-cm">#   dendrite = Dendrite(synapse=synapse, ...)</span>

    <span class="tk-cm"># ── Axon lifecycle ──────────────────────────────────────────</span>
    <span class="tk-kw">def</span>    <span class="tk-fn">attach_axon</span>(self, axon: Axon) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">def</span>    <span class="tk-fn">detach_axon</span>(self, neuron_id: str) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">start</span>(self) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">stop</span>(self, reason: str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-kw">async def</span> __aenter__(self) <span class="tk-op">-></span> <span class="tk-str">"Dendrite"</span>: ...
    <span class="tk-kw">async def</span> __aexit__(self, <span class="tk-op">*</span>exc) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...

    <span class="tk-cm"># ── Orchestration primitives ────────────────────────────────</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">dispatch_task</span>(
        self, *,
        neuron:      str,
        input:       dict,
        trace_id:    str  <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        parent_id:   str  <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        context_ref: str  <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        capabilities: list[str] <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
        meta:        dict <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>,
    ) <span class="tk-op">-></span> Signal: ...

    <span class="tk-kw">async def</span> <span class="tk-fn">emit_final</span>(self, *, trace_id, parent_id, result, meta<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit_error</span>(self, *, trace_id, parent_id, code, message, recoverable<span class="tk-op">=</span><span class="tk-kw">False</span>, meta<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> Signal: ...
    <span class="tk-kw">async def</span> <span class="tk-fn">emit</span>(self, signal: Signal) <span class="tk-op">-></span> <span class="tk-kw">None</span>: ...
    <span class="tk-cm"># emit() raises DendriteProtocolError for any type not in SYNAPSE_TYPES.</span>

    <span class="tk-cm"># ── Inbound handler decorators ──────────────────────────────</span>
    <span class="tk-op">@</span>dendrite.on_agent_output
    <span class="tk-op">@</span>dendrite.on_clarification
    <span class="tk-op">@</span>dendrite.on_error            <span class="tk-cm"># alias of on_error_signal</span>
    <span class="tk-op">@</span>dendrite.on_register         <span class="tk-cm"># alias of on_register_signal</span>
    <span class="tk-op">@</span>dendrite.on_deregister       <span class="tk-cm"># alias of on_deregister_signal</span>
    <span class="tk-op">@</span>dendrite.on_heartbeat        <span class="tk-cm"># alias of on_heartbeat_signal</span>

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
    <span class="tk-cm"># The Dendrite never closes the synapse — you do:</span>
    <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

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

<span class="tk-cm"># memory:// has no URL — it is process-local, so build it directly:</span>
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
    neuron:    str <span class="tk-op">|</span> <span class="tk-kw">None</span> <span class="tk-op">=</span> <span class="tk-kw">None</span>
    ts:        datetime                <span class="tk-cm"># UTC, auto-set on construction</span>
    payload:   dict <span class="tk-op">=</span> {}
    meta:      dict <span class="tk-op">=</span> {}

    <span class="tk-cm"># Field validators reject ids that don't start with evt_ / trc_.</span>
    <span class="tk-kw">def</span> <span class="tk-fn">encode</span>(self) <span class="tk-op">-></span> bytes: ...            <span class="tk-cm"># compact JSON bytes for the wire</span>
    <span class="tk-op">@</span>classmethod
    <span class="tk-kw">def</span> <span class="tk-fn">decode</span>(cls, data: bytes <span class="tk-op">|</span> str) <span class="tk-op">-></span> <span class="tk-str">"Signal"</span>: ...
    <span class="tk-kw">def</span> <span class="tk-fn">reply</span>(self, *, type, payload<span class="tk-op">=</span><span class="tk-kw">None</span>, neuron<span class="tk-op">=</span><span class="tk-kw">None</span>, meta<span class="tk-op">=</span><span class="tk-kw">None</span>) <span class="tk-op">-></span> <span class="tk-str">"Signal"</span>: ...`;

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

    <span class="tk-cm"># Agent management</span>
    REGISTER        <span class="tk-op">=</span> <span class="tk-str">"REGISTER"</span>
    DEREGISTER      <span class="tk-op">=</span> <span class="tk-str">"DEREGISTER"</span>
    HEARTBEAT       <span class="tk-op">=</span> <span class="tk-str">"HEARTBEAT"</span>

<span class="tk-cm"># Frozensets defining who may emit what:</span>
<span class="tk-fn">AXON_TYPES</span>     <span class="tk-cm"># AGENT_OUTPUT, CLARIFICATION, ERROR, REGISTER, DEREGISTER, HEARTBEAT</span>
<span class="tk-fn">SYNAPSE_TYPES</span>  <span class="tk-cm"># every type a Dendrite is allowed to emit (incl. ERROR)</span>`;

const helpersSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> new_trace_id, new_event_id

trace <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()        <span class="tk-cm"># "trc_01JV..."  — prefixed ULID</span>
eid   <span class="tk-op">=</span> <span class="tk-fn">new_event_id</span>()        <span class="tk-cm"># "evt_01JV..."  — prefixed ULID</span>

<span class="tk-cm"># ULIDs sort lexicographically by creation time.</span>
<span class="tk-cm"># Call new_trace_id() at the top of any externally-triggered request</span>
<span class="tk-cm"># so you can correlate Doppler output with HTTP request IDs.</span>`;

const errorsSnippet = `<span class="tk-cm"># The SDK raises exactly one custom exception type today.</span>
<span class="tk-kw">class</span> <span class="tk-fn">DendriteProtocolError</span>(ValueError): ...   <span class="tk-cm"># illegal emit() type</span>
CortexProtocolError <span class="tk-op">=</span> DendriteProtocolError   <span class="tk-cm"># back-compat alias</span>

<span class="tk-cm"># Everything else surfaces as a stdlib / dependency exception:</span>
<span class="tk-cm">#   ValueError       — bad envelope id prefix, unknown synapse URL scheme</span>
<span class="tk-cm">#   TypeError        — Dendrite built without a synapse</span>
<span class="tk-cm">#   pydantic.ValidationError — malformed Signal fields</span>
<span class="tk-cm">#   transport errors — raised straight from nats-py / aiokafka / asyncpg</span>

<span class="tk-cm"># Usage</span>
<span class="tk-kw">try</span>:
    <span class="tk-kw">await</span> dendrite.<span class="tk-fn">emit</span>(some_agent_output_signal)
<span class="tk-kw">except</span> DendriteProtocolError <span class="tk-kw">as</span> e:
    log.error(<span class="tk-str">"Dendrite may only emit synapse-side types: %s"</span>, e)`;

/* ─────────────────────────────  COMPONENT  ───────────────────────────── */

export default function PythonDocs() {
  return (
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

      {/* ─── Neuron — sources ─── */}
      <Section id="neuron" eyebrow="SDK · 03" title="Neuron — sources">
        <p className="docs-p">
          A <strong>Neuron</strong> is <em>anything that interacts with the real world</em>, exposed
          behind one signature: <code className="inline">async (input, context) → dict</code>. It is
          not limited to an LLM agent — it can be an agent, an existing <strong>API</strong> (a Flask
          app or any WSGI callable), or an <strong>MCP server</strong>. The{" "}
          <code className="inline">Neuron(source=…)</code> factory wraps each kind into the same{" "}
          <code className="inline">neuron_fn</code>, so the Axon and the rest of the protocol can&rsquo;t
          tell them apart. Each source is a soft dependency — installed only when you use it.
        </p>

        <ApiCard kind="factory" name="cosmonapse.Neuron(source, **kwargs)" summary="Returns a NeuronFn callable for the chosen source. Pass it straight to Axon(neuron_fn=…).">
          <CodeBlock filename="neuron_sources.py" html={neuronSourceSnippet} maxWidth={860} />
        </ApiCard>

        <h3 className="docs-h3">Available sources</h3>
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
              <td>&quot;flask&quot; / &quot;wsgi&quot; / &quot;api&quot;</td>
              <td>API</td>
              <td>app*, default_method, default_path, base_headers</td>
              <td>Serves a Flask/WSGI app in-process. Input is HTTP-shaped (method/path/json/query/headers); returns <code className="inline">{`{status, ok, json, response, headers, meta}`}</code>. Needs <code className="inline">werkzeug</code> (ships with Flask).</td>
            </tr>
            <tr>
              <td>&quot;mcp&quot;</td>
              <td>MCP server</td>
              <td>command+args <em>or</em> server+args, env, cwd, tool</td>
              <td>Spawns any stdio MCP server and exposes its tools. Input is <code className="inline">{`{tool, arguments}`}</code> (or <code className="inline">{`{"__list_tools__": True}`}</code>); returns <code className="inline">{`{response, result, is_error, content, meta}`}</code>. Wrapper only — does not implement a server. Needs <code className="inline">mcp</code>.</td>
            </tr>
          </tbody>
        </table>

        <p className="docs-p">
          The <code className="inline">&quot;mcp&quot;</code> source ships{" "}
          <code className="inline">STANDARD_MCP_SERVERS</code> — launch presets for well-known published
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
      <Section id="axon" eyebrow="SDK · 04" title="Axon — agent-side tool">
        <p className="docs-p">
          The <strong>Axon</strong> owns the Neuron&rsquo;s identity (
          <code className="inline">neuron_id</code>, <code className="inline">capabilities</code>,{" "}
          <code className="inline">version</code>) and the tool body (
          <code className="inline">neuron_fn</code>). It never touches the Synapse — it must be
          attached to a Dendrite to participate.
        </p>

        <ApiCard kind="class" name="cosmonapse.Axon" summary="Wraps a Neuron function with the metadata and validation needed to put it on the bus.">
          <CodeBlock filename="axon.pyi" html={axonClassSnippet} maxWidth={820} />
        </ApiCard>

        <h3 className="docs-h3">Constructor parameters</h3>
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

        <h3 className="docs-h3">Methods</h3>
        <ApiCard kind="async method" name="Axon.handle_task(task: Signal) -> Signal" summary="Called by the Dendrite for each inbound TASK. Resolves context_ref, invokes neuron_fn, and returns the corresponding outbound Signal (AGENT_OUTPUT, CLARIFICATION, or ERROR). Application code never calls this directly." />

        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="answerer.py" html={axonUseSnippet} maxWidth={820} />
      </Section>

      {/* ─── Dendrite ─── */}
      <Section id="dendrite" eyebrow="SDK · 05" title="Dendrite — synapse-side connector">
        <p className="docs-p">
          The <strong>Dendrite</strong> is the only thing that touches the Synapse. It hosts attached
          Axons, owns REGISTER / HEARTBEAT / DEREGISTER, routes inbound TASKs to the matching Axon,
          and publishes the Axon&rsquo;s returned Signal. Every Dendrite can also orchestrate — there
          is no separate Cortex class in v0.2.
        </p>

        <ApiCard kind="class" name="cosmonapse.Dendrite" summary="Hosts Axons and exposes every orchestration primitive. Synapse and (optionally) RegistryStore are passed in; the Dendrite never builds or closes them.">
          <CodeBlock filename="dendrite.pyi" html={dendriteClassSnippet} maxWidth={880} />
        </ApiCard>

        <h3 className="docs-h3">Constructor parameters</h3>
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

        <h3 className="docs-h3">Axon lifecycle</h3>
        <ApiCard kind="method" name="Dendrite.attach_axon(axon: Axon) -> None" summary="Register an Axon on this Dendrite. If the Dendrite is already started, the next start cycle emits REGISTER. Raises if neuron_id is already attached." />
        <ApiCard kind="method" name="Dendrite.detach_axon(neuron_id: str) -> None" summary="Stop hosting the named Axon and emit DEREGISTER." />
        <ApiCard kind="async method" name="Dendrite.start() -> None" summary="Wire subscriptions, emit REGISTER for every attached Axon, and start the heartbeat task plus any on_schedule coroutines." />
        <ApiCard kind="async method" name="Dendrite.stop(reason=None) -> None" summary="Cancel background tasks, emit DEREGISTER for each Axon, and tear down subscriptions. The passed-in Synapse and RegistryStore are NOT closed — the caller owns them." />
        <ApiCard kind="async context manager" name="async with Dendrite as d: ..." summary="Equivalent to start() on enter and stop() on exit, with exceptions propagated normally." />

        <h3 className="docs-h3">Orchestration primitives</h3>
        <ApiCard
          kind="async method"
          name="Dendrite.dispatch_task(*, neuron, input, trace_id=None, parent_id=None, context_ref=None, capabilities=None, meta=None) -> Signal"
          summary="Publish a TASK envelope addressed to a Neuron. Auto-generates trace_id and id if omitted. This is a fire-and-publish call — it does not consult the registry, so dispatching to an unknown neuron simply produces a TASK no Axon picks up. Returns the emitted Signal so the caller can correlate."
        />
        <ApiCard kind="async method" name="Dendrite.emit_final(*, trace_id, parent_id, result, meta=None) -> Signal" summary="Publish a terminal FINAL envelope for a trace. Exactly one FINAL or ERROR is expected per trace; subsequent terminal envelopes for the same trace are dropped by well-behaved consumers." />
        <ApiCard kind="async method" name="Dendrite.emit_error(*, trace_id, parent_id, code, message, recoverable=False, meta=None) -> Signal" summary="Publish a terminal ERROR envelope with a short machine code and a human-readable message. recoverable=True signals to the consumer that the task may be retried or re-routed." />
        <ApiCard kind="async method" name="Dendrite.emit(signal: Signal) -> None" summary="Low-level escape hatch. Raises DendriteProtocolError for any Signal whose type is not in SYNAPSE_TYPES (the allow-list defined in code, not just convention)." />

        <h3 className="docs-h3">Inbound handlers</h3>
        <p className="docs-p">
          The six <code className="inline">on_*</code> methods are decorators you apply to a coroutine.
          For any other type, <code className="inline">subscribe()</code> is a coroutine — not a
          decorator — that takes the type and a handler and returns a{" "}
          <code className="inline">Subscription</code>.
        </p>
        <table className="spec-table">
          <thead>
            <tr>
              <th>Registration</th>
              <th>Fires on</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>@dendrite.on_agent_output</td><td>Every AGENT_OUTPUT on the namespace.</td></tr>
            <tr><td>@dendrite.on_clarification</td><td>Every CLARIFICATION on the namespace.</td></tr>
            <tr><td>@dendrite.on_error</td><td>Every ERROR on the namespace.</td></tr>
            <tr><td>@dendrite.on_register</td><td>Every REGISTER (including re-registers attached to HEARTBEATs).</td></tr>
            <tr><td>@dendrite.on_deregister</td><td>Every DEREGISTER.</td></tr>
            <tr><td>@dendrite.on_heartbeat</td><td>Every HEARTBEAT.</td></tr>
            <tr><td>await dendrite.subscribe(SignalType.X, handler)</td><td>Any other type. Returns a Subscription you can later unsubscribe.</td></tr>
          </tbody>
        </table>

        <h3 className="docs-h3">RegistryStore reads</h3>
        <ApiCard kind="async method" name="Dendrite.find_neurons(*, capability=None) -> list[NeuronRecord]" summary="Return live (non-deregistered) Neurons on the namespace, optionally filtered to those advertising the given capability. Requires a registry_store." />
        <ApiCard kind="async method" name="Dendrite.registry_snapshot(*, capability=None, include_deregistered=False) -> list[NeuronRecord]" summary="Point-in-time snapshot of the registry. Useful in on_connect / on_schedule handlers. Requires a registry_store." />

        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="worker.py" html={dendriteUseSnippet} maxWidth={880} />
      </Section>

      {/* ─── Cortex alias ─── */}
      <Section id="cortex" eyebrow="SDK · 06" title="Cortex — back-compat alias">
        <p className="docs-p">
          <code className="inline">cosmonapse.Cortex</code> is an alias of{" "}
          <code className="inline">cosmonapse.Dendrite</code>, and{" "}
          <code className="inline">CortexProtocolError</code> aliases{" "}
          <code className="inline">DendriteProtocolError</code>. They are preserved for code written
          against the v0.1 split where the orchestrator was a separate class. New code should use{" "}
          <code className="inline">Dendrite</code> directly — every orchestration primitive lives
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
              <td>on_refresh(fn)</td>
              <td>On each refresh event — a heartbeat tick, a REGISTER / DEREGISTER / HEARTBEAT observed via the registry mirror, or a manual <code className="inline">await component.refresh(reason=...)</code>. The handler receives a <code className="inline">RefreshEvent(reason, neuron_id, extra)</code>.</td>
            </tr>
            <tr>
              <td>on_schedule(every_s=N)(fn)</td>
              <td>Developer-supplied periodic task. Runs as a background coroutine every <code className="inline">every_s</code> seconds for the lifetime of the component.</td>
            </tr>
          </tbody>
        </table>
        <ApiCard kind="async method" name="component.refresh(*, reason='manual', neuron_id=None, extra=None) -> None" summary="Manually fire on_refresh handlers with the supplied RefreshEvent. Use when your own code knows state has changed but the SDK can't detect it." />
        <CodeBlock filename="hooks.py" html={lifecycleSnippet} maxWidth={820} />
      </Section>

      {/* ─── Synapse ─── */}
      <Section id="synapse" eyebrow="SDK · 08" title="Synapse — transport adapters">
        <p className="docs-p">
          A <strong>Synapse</strong> is the message bus. The application picks a backend, passes the
          adapter to the Dendrite, and never touches the wire format again. All adapters subclass the
          same abstract <code className="inline">Synapse</code> base.
        </p>

        <ApiCard kind="abstract base" name="cosmonapse.Synapse" summary="The contract every transport adapter must satisfy. Adapters are responsible for ordering, dedup window, ack semantics, and durability — the SDK assumes at-least-once delivery and in-order per key.">
          <CodeBlock filename="synapse.pyi" html={synapseInterfaceSnippet} maxWidth={820} />
        </ApiCard>

        <h3 className="docs-h3">Bundled adapters</h3>
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

        <h3 className="docs-h3">URL factory</h3>
        <ApiCard kind="function" name="synapse_from_url(url: str) -> Synapse" summary="Map a cosmo:// / nats:// / kafka:// URL to a non-connected adapter instance. Raises ValueError for any other scheme. MemorySynapse has no URL — build it directly." />
        <ApiCard kind="async function" name="connect_synapse(url: str) -> Synapse" summary="Same as synapse_from_url but immediately calls connect()." />
        <CodeBlock filename="urls.py" html={synapseUrlSnippet} maxWidth={780} />

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
            <tr><td>(no URL)</td><td>MemorySynapse — construct directly, it is process-local</td></tr>
          </tbody>
        </table>

        <h3 className="docs-h3">Subjects</h3>
        <p className="docs-p">
          Subjects follow <code className="inline">cosmonapse.&lt;namespace&gt;.&lt;TYPE&gt;</code>.
          Queue groups load-balance within a group; subscribers with no{" "}
          <code className="inline">queue_group</code> form the Doppler population (every matching
          message goes to each one). Application code must never construct subjects directly — let the
          Dendrite resolve them.
        </p>
      </Section>

      {/* ─── Registry ─── */}
      <Section id="registry" eyebrow="SDK · 09" title="RegistryStore">
        <p className="docs-p">
          The <strong>RegistryStore</strong> is the one optional persistent surface the SDK owns. It
          is a live view of every Neuron seen on a namespace: capabilities, status, last heartbeat.
          Anything beyond that — cost histograms, audit history, latency dashboards — is the
          developer&rsquo;s to build on top.
        </p>

        <ApiCard kind="abstract base" name="cosmonapse.RegistryStore" summary="The interface every backend must satisfy. Records are NeuronRecord instances keyed by neuron_id.">
          <CodeBlock filename="registry.pyi" html={registryStoreSnippet} maxWidth={840} />
        </ApiCard>

        <h3 className="docs-h3">NeuronRecord</h3>
        <CodeBlock filename="record.pyi" html={neuronRecordSnippet} maxWidth={760} />

        <h3 className="docs-h3">Bundled backends</h3>
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
      </Section>

      {/* ─── Signal ─── */}
      <Section id="signal" eyebrow="SDK · 10" title="Signal & SignalType">
        <p className="docs-p">
          A <strong>Signal</strong> is the in-memory representation of an envelope — a Pydantic v2
          model. Every method that publishes or receives a message uses it. See{" "}
          <Link href="/protocol">the envelope spec</Link> for the full wire-level field reference.
        </p>
        <ApiCard kind="model" name="cosmonapse.Signal" summary="Pydantic BaseModel mirroring the envelope schema. encode() / decode() round-trip with the wire format; field validators reject ids that don't carry the evt_ / trc_ prefixes.">
          <CodeBlock filename="signal.pyi" html={signalSnippet} maxWidth={840} />
        </ApiCard>
        <ApiCard kind="enum" name="cosmonapse.SignalType" summary="String enum of every legal type. SYNAPSE_TYPES is a frozenset of the values a Dendrite is allowed to publish — anything else passed to dendrite.emit() raises DendriteProtocolError.">
          <CodeBlock filename="signal_type.pyi" html={signalTypeSnippet} maxWidth={840} />
        </ApiCard>
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

      {/* ─── Errors ─── */}
      <Section id="errors" eyebrow="SDK · 12" title="Protocol errors">
        <p className="docs-p">
          The SDK is deliberately thin on bespoke exceptions. The only custom type is{" "}
          <code className="inline">DendriteProtocolError</code> (a{" "}
          <code className="inline">ValueError</code> subclass), raised when you try to{" "}
          <code className="inline">emit()</code> a Signal whose type isn&rsquo;t in{" "}
          <code className="inline">SYNAPSE_TYPES</code>. Everything else surfaces as a standard library
          or dependency exception.
        </p>
        <CodeBlock filename="errors.py" html={errorsSnippet} maxWidth={840} />
        <table className="spec-table">
          <thead>
            <tr>
              <th>Exception</th>
              <th>Raised when</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>DendriteProtocolError</td><td><code className="inline">dendrite.emit()</code> (or a primitive that calls it) is given a type outside SYNAPSE_TYPES. Subclasses <code className="inline">ValueError</code>.</td></tr>
            <tr><td>CortexProtocolError</td><td>Alias of the above, for v0.1-era code.</td></tr>
            <tr><td>pydantic.ValidationError</td><td>A Signal is constructed or decoded with malformed fields.</td></tr>
            <tr><td>ValueError</td><td>An envelope id lacks its evt_ / trc_ prefix, or <code className="inline">synapse_from_url</code> gets an unknown scheme.</td></tr>
            <tr><td>TypeError</td><td>A Dendrite is built without a <code className="inline">synapse</code>.</td></tr>
          </tbody>
        </table>
      </Section>
    </>
  );
}
