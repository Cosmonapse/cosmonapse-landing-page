import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import { Section, ApiCard, type TocGroup } from "./shared";

export const engramToc: TocGroup = {
  title: "Engram",
  items: [
    { href: "#eg-overview", label: "Overview" },
    { href: "#eg-install", label: "Installation" },
    { href: "#eg-imports", label: "Top-level imports" },
    { href: "#eg-binding", label: "EngramBinding" },
    { href: "#eg-helpers", label: "recall() & imprint()" },
    { href: "#eg-abc", label: "Engram (ABC)" },
    { href: "#eg-serve", label: "Engram.serve() & host hooks" },
    { href: "#eg-results", label: "Hit · RecallResult · Receipt" },
    { href: "#eg-backends", label: "Backends" },
    { href: "#eg-mount", label: "Mounting on a Dendrite" },
    { href: "#eg-client", label: "EngramClient" },
    { href: "#eg-signals", label: "Wire signals" },
    { href: "#eg-errors", label: "Errors" },
    { href: "#eg-ids", label: "ID helpers" },
  ],
};

/* ─────────────────────────────  CODE SNIPPETS  ───────────────────────────── */
const serveSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Engram, Hit, ImprintReceipt

<span class="tk-cm"># The memory-side twin of Effector.serve(). Two protocol hooks, no</span>
<span class="tk-cm"># subclass  -  the handler RUNS the operation and its return value is</span>
<span class="tk-cm"># what gets published as RECALLED / IMPRINTED.</span>
ENGRAM <span class="tk-op">=</span> Engram.serve(engram_id<span class="tk-op">=</span><span class="tk-str">"notes"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"context"</span>)

<span class="tk-op">@</span>ENGRAM.on_recall
<span class="tk-kw">async def</span> <span class="tk-fn">search</span>(query, <span class="tk-op">*</span>, deadline_ms<span class="tk-op">=</span><span class="tk-kw">None</span>):
    <span class="tk-cm"># Return Hits, or plain {"id", "entry", "score"} dicts, or None to</span>
    <span class="tk-cm"># fall through to the next handler. A miss is [] , not an error.</span>
    <span class="tk-kw">return</span> [Hit(id<span class="tk-op">=</span>k, entry<span class="tk-op">=</span>v) <span class="tk-kw">for</span> k, v <span class="tk-kw">in</span> match(query)]

<span class="tk-op">@</span>ENGRAM.on_imprint
<span class="tk-kw">async def</span> <span class="tk-fn">write</span>(op, entry, <span class="tk-op">*</span>, merge_key<span class="tk-op">=</span><span class="tk-kw">None</span>, imprint_id<span class="tk-op">=</span><span class="tk-kw">None</span>):
    <span class="tk-cm"># Return an ImprintReceipt, or just the new entry id as a str.</span>
    <span class="tk-kw">return</span> ImprintReceipt(engram_id<span class="tk-op">=</span><span class="tk-str">"notes"</span>, op<span class="tk-op">=</span>op,
                          id<span class="tk-op">=</span>store(op, entry, merge_key))

<span class="tk-op">@</span>ENGRAM.serves          <span class="tk-cm"># optional can_serve(query) -> bool gate</span>
<span class="tk-kw">def</span> <span class="tk-fn">gate</span>(query):
    <span class="tk-kw">return</span> <span class="tk-str">"vector"</span> <span class="tk-kw">not in</span> query

worker.attach_engram(ENGRAM)   <span class="tk-cm"># REGISTERs under its own engram_id</span>`;

const engramHostSnippet = `<span class="tk-cm"># @engram.host.&lt;on_signal&gt; OBSERVES the protocol. By the time it runs,</span>
<span class="tk-cm"># the Dendrite has already serviced the request and replied  -  this is</span>
<span class="tk-cm"># NOT where you service it. Registering one does not disable the</span>
<span class="tk-cm"># built-in path, so writing from here would emit a second IMPRINTED</span>
<span class="tk-cm"># and, for a non-idempotent op, write twice.</span>
ENGRAM <span class="tk-op">=</span> InMemoryEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"session-memory"</span>,
                        engram_kind<span class="tk-op">=</span><span class="tk-str">"context"</span>)

<span class="tk-op">@</span>ENGRAM.host.on_imprint_signal
<span class="tk-kw">async def</span> <span class="tk-fn">audit</span>(sig):
    log.info(<span class="tk-str">"write on trace %s"</span>, sig.trace_id)

host <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
host.attach_engram(ENGRAM)
<span class="tk-kw">await</span> host.start()      <span class="tk-cm"># audit() is now live on the host, subscription ensured</span>

<span class="tk-cm"># Lifecycle is the shared LifecycleHooks trio, owner passed first:</span>
<span class="tk-op">@</span>ENGRAM.on_connect
<span class="tk-kw">async def</span> <span class="tk-fn">warm</span>(engram): <span class="tk-kw">await</span> engram.connect_pool()

<span class="tk-op">@</span>ENGRAM.on_schedule(every_s<span class="tk-op">=</span><span class="tk-num">60</span>)
<span class="tk-kw">async def</span> <span class="tk-fn">compact</span>(engram): <span class="tk-kw">await</span> engram.vacuum()`;


const installSnippet = `<span class="tk-cm"># Engram ships inside the base cosmonapse package  -  InMemoryEngram,</span>
<span class="tk-cm"># SqliteEngram and PostgresEngram all included.</span>
<span class="tk-op">$</span> pip install cosmonapse`;

const importSnippet = `<span class="tk-cm"># Everything public is re-exported from cosmonapse.engram.</span>
<span class="tk-kw">from</span> cosmonapse.engram <span class="tk-kw">import</span> (
    <span class="tk-cm"># Core types</span>
    Engram,            <span class="tk-cm"># ABC every backend implements</span>
    EngramBinding,     <span class="tk-cm"># declarative wiring stored on an Axon</span>
    EngramClient,      <span class="tk-cm"># caller-side correlation table (one per Dendrite)</span>
    Hit,               <span class="tk-cm"># one search result</span>
    RecallResult,      <span class="tk-cm"># what recall() returns</span>
    ImprintReceipt,    <span class="tk-cm"># what imprint() returns</span>

    <span class="tk-cm"># Backends</span>
    InMemoryEngram,    <span class="tk-cm"># dict-backed; default for dev/tests</span>
    SqliteEngram,      <span class="tk-cm"># stdlib sqlite3, single-file DB</span>
    PostgresEngram,    <span class="tk-cm"># asyncpg pool; for real deployments</span>

    <span class="tk-cm"># Errors</span>
    EngramError,
    EngramTimeout,
    EngramCancelled,
    EngramNotBound,
    EngramOverloaded,
)

<span class="tk-cm"># eng_… ULID helper lives on the package root</span>
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> new_engram_id`;

const bindingSnippet = `<span class="tk-nd">@dataclass</span>(frozen=<span class="tk-kw">True</span>)
<span class="tk-kw">class</span> <span class="tk-fn">EngramBinding</span>:
    name:                 <span class="tk-fn">str</span>
    directed_id:          <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>   <span class="tk-cm"># the engram_id (directed.id on the wire)</span>
    directed_type:        <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>   <span class="tk-cm"># the engram_kind (directed.type)</span>
    default_deadline_ms:  <span class="tk-fn">int</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>
    default_recall_mode:  <span class="tk-fn">str</span> = <span class="tk-str">"first"</span>   <span class="tk-cm"># "first" | "merge" | "all"</span>`;

const bindingUseSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon
<span class="tk-kw">from</span> cosmonapse.engram <span class="tk-kw">import</span> EngramBinding

axon = Axon(
    neuron_id=<span class="tk-str">"summariser"</span>,
    neuron_fn=summariser,
    engrams=[
        <span class="tk-cm"># Addressed routing  -  Neuron says recall("notes", ...)</span>
        EngramBinding(name=<span class="tk-str">"notes"</span>, directed_id=<span class="tk-str">"notes-default"</span>),
        <span class="tk-cm"># Slot routing  -  deployment owns the concrete vector store</span>
        EngramBinding(
            name=<span class="tk-str">"memory"</span>,
            directed_type=<span class="tk-str">"semantic"</span>,
            default_deadline_ms=<span class="tk-num">250</span>,
            default_recall_mode=<span class="tk-str">"merge"</span>,
        ),
    ],
)`;

const helperSnippet = `<span class="tk-cm"># Injected into the Neuron when neuron_fn declares the kwargs.</span>
<span class="tk-kw">async def</span> <span class="tk-fn">summariser</span>(input, context, *, recall, imprint):
    <span class="tk-cm"># READ  -  returns a RecallResult (iterable of Hit)</span>
    prior = <span class="tk-kw">await</span> recall(
        <span class="tk-str">"notes"</span>,                       <span class="tk-cm"># binding name (must be wired on the Axon)</span>
        query={<span class="tk-str">"text"</span>: input[<span class="tk-str">"topic"</span>]},
        filters={<span class="tk-str">"tags"</span>: [<span class="tk-str">"kept"</span>]},
        deadline_ms=<span class="tk-num">200</span>,
        recall_mode=<span class="tk-str">"first"</span>,
        min_confidence=<span class="tk-num">0.5</span>,
    )

    note = <span class="tk-str">f"summary of {input['topic']} ({len(prior)} priors)"</span>

    <span class="tk-cm"># WRITE  -  fire-and-forget by default (await_ack=False)</span>
    <span class="tk-kw">await</span> imprint(
        <span class="tk-str">"notes"</span>,
        op=<span class="tk-str">"append"</span>,                    <span class="tk-cm"># add | append | merge | upsert | delete</span>
        entry={<span class="tk-str">"content"</span>: note, <span class="tk-str">"tags"</span>: [<span class="tk-str">"kept"</span>]},
        merge_key=input[<span class="tk-str">"topic"</span>],
    )

    <span class="tk-cm"># WRITE + receipt  -  await the IMPRINTED ack</span>
    receipt = <span class="tk-kw">await</span> imprint(
        <span class="tk-str">"notes"</span>, op=<span class="tk-str">"upsert"</span>, entry={<span class="tk-str">"content"</span>: note},
        merge_key=input[<span class="tk-str">"topic"</span>], await_ack=<span class="tk-kw">True</span>, deadline_ms=<span class="tk-num">500</span>,
    )
    <span class="tk-kw">assert</span> receipt.ok

    <span class="tk-kw">return</span> {<span class="tk-str">"summary"</span>: note, <span class="tk-str">"prior"</span>: [h.entry <span class="tk-kw">for</span> h <span class="tk-kw">in</span> prior]}`;

const recallSigSnippet = `<span class="tk-kw">async def</span> <span class="tk-fn">recall</span>(
    name: <span class="tk-fn">str</span>,                              <span class="tk-cm"># EngramBinding.name on this Axon</span>
    *,
    query:          <span class="tk-fn">dict</span>,                    <span class="tk-cm"># opaque to the protocol; the Engram reads it</span>
    filters:        <span class="tk-fn">dict</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
    context_ref:    <span class="tk-fn">str</span>  | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
    deadline_ms:    <span class="tk-fn">int</span>  | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
    recall_mode:    <span class="tk-fn">str</span>  | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,  <span class="tk-cm"># overrides binding default</span>
    min_confidence: <span class="tk-fn">float</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
    meta:           <span class="tk-fn">dict</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
) -> RecallResult`;

const imprintSigSnippet = `<span class="tk-kw">async def</span> <span class="tk-fn">imprint</span>(
    name: <span class="tk-fn">str</span>,
    *,
    op:          <span class="tk-fn">str</span>,                       <span class="tk-cm"># add | append | merge | upsert | delete</span>
    entry:       <span class="tk-fn">dict</span>,
    merge_key:   <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,   <span class="tk-cm"># required for merge / upsert</span>
    await_ack:   <span class="tk-fn">bool</span> = <span class="tk-kw">False</span>,            <span class="tk-cm"># True → await IMPRINTED, return receipt</span>
    deadline_ms: <span class="tk-fn">int</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
    meta:        <span class="tk-fn">dict</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
) -> ImprintReceipt | <span class="tk-kw">None</span>`;

const abcSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">Engram</span>(ABC):
    <span class="tk-cm"># Set by the backend at construction time.</span>
    engram_id:    <span class="tk-fn">str</span>
    engram_kind:  <span class="tk-fn">str</span>
    capabilities: <span class="tk-fn">list</span>[<span class="tk-fn">str</span>]
    version:      <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>

    <span class="tk-cm"># ── Lifecycle ──────────────────────────────────────────</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">connect</span>(self) -> <span class="tk-kw">None</span>: ...   <span class="tk-cm"># open pool / file handle</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">close</span>(self)   -> <span class="tk-kw">None</span>: ...   <span class="tk-cm"># release resources</span>

    <span class="tk-cm"># ── Read / write ───────────────────────────────────────</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">recall</span>(
        self, query: <span class="tk-fn">dict</span>, *,
        filters: <span class="tk-fn">dict</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
        context_ref: <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
        deadline_ms: <span class="tk-fn">int</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
        min_confidence: <span class="tk-fn">float</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
    ) -> <span class="tk-fn">list</span>[Hit]: ...        <span class="tk-cm"># empty list on a miss  -  never raise</span>

    <span class="tk-kw">async def</span> <span class="tk-fn">imprint</span>(
        self, op: <span class="tk-fn">str</span>, entry: <span class="tk-fn">dict</span>, *,
        merge_key: <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,
        imprint_id: <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>,   <span class="tk-cm"># use for idempotency</span>
    ) -> ImprintReceipt: ...

    <span class="tk-cm"># ── Optional capability negotiation (default: serve all) ─</span>
    <span class="tk-kw">async def</span> <span class="tk-fn">can_serve</span>(self, query: <span class="tk-fn">dict</span>) -> <span class="tk-fn">bool</span>:
        <span class="tk-kw">return</span> <span class="tk-kw">True</span>`;

const customEngramSnippet = `<span class="tk-kw">from</span> cosmonapse.engram <span class="tk-kw">import</span> Engram, Hit, ImprintReceipt

<span class="tk-kw">class</span> <span class="tk-fn">RedisEngram</span>(Engram):
    <span class="tk-kw">def</span> <span class="tk-fn">__init__</span>(self, url: <span class="tk-fn">str</span>):
        self.engram_id   = <span class="tk-str">"redis-default"</span>
        self.engram_kind = <span class="tk-str">"keyvalue"</span>
        self.capabilities = [<span class="tk-str">"substring"</span>, <span class="tk-str">"tags"</span>]
        self._url = url

    <span class="tk-kw">async def</span> <span class="tk-fn">connect</span>(self): self._r = <span class="tk-kw">await</span> redis.from_url(self._url)
    <span class="tk-kw">async def</span> <span class="tk-fn">close</span>(self):   <span class="tk-kw">await</span> self._r.aclose()

    <span class="tk-kw">async def</span> <span class="tk-fn">recall</span>(self, query, **kw) -> <span class="tk-fn">list</span>[Hit]:
        raw = <span class="tk-kw">await</span> self._r.get(query[<span class="tk-str">"key"</span>])
        <span class="tk-kw">return</span> [Hit(id=query[<span class="tk-str">"key"</span>], entry={<span class="tk-str">"value"</span>: raw})] <span class="tk-kw">if</span> raw <span class="tk-kw">else</span> []

    <span class="tk-kw">async def</span> <span class="tk-fn">imprint</span>(self, op, entry, **kw) -> ImprintReceipt:
        <span class="tk-kw">await</span> self._r.set(entry[<span class="tk-str">"key"</span>], entry[<span class="tk-str">"value"</span>])
        <span class="tk-kw">return</span> ImprintReceipt(engram_id=self.engram_id, op=op, id=entry[<span class="tk-str">"key"</span>])`;

const resultsSnippet = `<span class="tk-nd">@dataclass</span>(frozen=<span class="tk-kw">True</span>)
<span class="tk-kw">class</span> <span class="tk-fn">Hit</span>:
    id:    <span class="tk-fn">str</span>
    entry: <span class="tk-fn">dict</span>
    score: <span class="tk-fn">float</span> = <span class="tk-num">1.0</span>      <span class="tk-cm"># cosine in [0,1] for semantic; 1.0 for relational</span>

<span class="tk-nd">@dataclass</span>(frozen=<span class="tk-kw">True</span>)
<span class="tk-kw">class</span> <span class="tk-fn">RecallResult</span>:
    hits:       <span class="tk-fn">list</span>[Hit] = []
    engram_ids: <span class="tk-fn">tuple</span>[<span class="tk-fn">str</span>, ...] = ()
    truncated:  <span class="tk-fn">bool</span> = <span class="tk-kw">False</span>
    took_ms:    <span class="tk-fn">int</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>
    <span class="tk-cm"># Iterable + truthy: 'for h in result', 'len(result)', 'if result:'</span>

<span class="tk-nd">@dataclass</span>(frozen=<span class="tk-kw">True</span>)
<span class="tk-kw">class</span> <span class="tk-fn">ImprintReceipt</span>:
    engram_id: <span class="tk-fn">str</span>
    op:        <span class="tk-fn">str</span>
    id:        <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>
    version:   <span class="tk-fn">int</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>
    took_ms:   <span class="tk-fn">int</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>
    error:     <span class="tk-fn">str</span> | <span class="tk-kw">None</span> = <span class="tk-kw">None</span>

    <span class="tk-nd">@property</span>
    <span class="tk-kw">def</span> <span class="tk-fn">ok</span>(self) -> <span class="tk-fn">bool</span>:
        <span class="tk-kw">return</span> self.error <span class="tk-kw">is</span> <span class="tk-kw">None</span>`;

const backendsSnippet = `<span class="tk-kw">from</span> cosmonapse.engram <span class="tk-kw">import</span> InMemoryEngram, SqliteEngram, PostgresEngram

<span class="tk-cm"># Dict-backed. Zero deps. Resets on process exit. Use in tests.</span>
mem = InMemoryEngram(
    engram_id=<span class="tk-str">"engram-memory"</span>,
    engram_kind=<span class="tk-str">"keyvalue"</span>,
    capabilities=[<span class="tk-str">"substring"</span>, <span class="tk-str">"tags"</span>, <span class="tk-str">"merge_key"</span>],
)

<span class="tk-cm"># Single-file sqlite3 via threadpool. Survives restarts.</span>
sql = SqliteEngram(
    path=<span class="tk-str">"./memory.db"</span>,            <span class="tk-cm"># ":memory:" by default</span>
    engram_id=<span class="tk-str">"engram-sqlite"</span>,
    engram_kind=<span class="tk-str">"relational"</span>,
)

<span class="tk-cm"># asyncpg pool. Production. Driver is lazy-imported.</span>
pg = PostgresEngram(
    dsn=<span class="tk-str">"postgresql://user:pw@localhost/cosmo"</span>,
    engram_id=<span class="tk-str">"engram-postgres"</span>,
    engram_kind=<span class="tk-str">"relational"</span>,
    min_size=<span class="tk-num">1</span>, max_size=<span class="tk-num">5</span>,
)

<span class="tk-kw">await</span> sql.connect()   <span class="tk-cm"># open resources before attaching</span>`;

const mountSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite
<span class="tk-kw">from</span> cosmonapse.engram <span class="tk-kw">import</span> SqliteEngram
<span class="tk-kw">from</span> cosmonapse.synapse.memory <span class="tk-kw">import</span> InMemorySynapse

synapse = InMemorySynapse()

<span class="tk-cm"># A Dendrite that *hosts* the Engram and services RECALL / IMPRINT.</span>
host = Dendrite(synapse=synapse)

notes = SqliteEngram(path=<span class="tk-str">"notes.db"</span>, engram_id=<span class="tk-str">"notes-default"</span>)
<span class="tk-kw">await</span> notes.connect()

host.attach_engram(notes)        <span class="tk-cm"># index by engram_id + engram_kind</span>
<span class="tk-kw">await</span> host.start()

<span class="tk-cm"># Inspect / tear down</span>
host.engrams                     <span class="tk-cm"># {"notes-default": notes}</span>
<span class="tk-kw">await</span> host.detach_engram(<span class="tk-str">"notes-default"</span>)   <span class="tk-cm"># closes backend, unsubscribes</span>`;

const clientSnippet = `<span class="tk-kw">class</span> <span class="tk-fn">EngramClient</span>:
    <span class="tk-cm"># One per Dendrite. The Dendrite constructs it and drives delivery;</span>
    <span class="tk-cm"># the Axon's recall/imprint helpers call into it. You rarely touch</span>
    <span class="tk-cm"># it directly  -  it is the caller-side correlation table.</span>
    <span class="tk-kw">def</span> <span class="tk-fn">__init__</span>(self, dendrite: Dendrite): ...

    <span class="tk-kw">async def</span> <span class="tk-fn">recall</span>(self, *, query, trace_id, parent_id, ...) -> RecallResult
    <span class="tk-kw">async def</span> <span class="tk-fn">imprint</span>(self, *, op, entry, trace_id, parent_id, ...) -> ImprintReceipt | <span class="tk-kw">None</span>

    <span class="tk-kw">async def</span> <span class="tk-fn">_deliver</span>(self, sig: Signal) -> <span class="tk-kw">None</span>   <span class="tk-cm"># match RECALLED/IMPRINTED by parent_id</span>
    <span class="tk-kw">def</span> <span class="tk-fn">cancel_trace</span>(self, trace_id: <span class="tk-fn">str</span>) -> <span class="tk-kw">None</span>   <span class="tk-cm"># on FINAL/ERROR for the trace</span>
    <span class="tk-kw">def</span> <span class="tk-fn">cancel_all</span>(self) -> <span class="tk-kw">None</span>                     <span class="tk-cm"># on Dendrite shutdown</span>`;

const recallWireSnippet = `<span class="tk-cm">// RECALL  -  emitted by a hosting Dendrite on the Neuron's behalf</span>
{
  <span class="tk-str">"type"</span>: <span class="tk-str">"RECALL"</span>,
  <span class="tk-str">"trace_id"</span>: <span class="tk-str">"trc_01JV…"</span>,   <span class="tk-cm">// inherited from the containing TASK</span>
  <span class="tk-str">"parent_id"</span>: <span class="tk-str">"evt_01JV…"</span>,
  <span class="tk-str">"payload"</span>: {
    <span class="tk-str">"engram_id"</span>:   <span class="tk-str">"pgvector-default"</span>,  <span class="tk-cm">// OR engram_kind  -  id wins</span>
    <span class="tk-str">"engram_kind"</span>: <span class="tk-str">"semantic"</span>,
    <span class="tk-str">"query"</span>:       { <span class="tk-str">"text"</span>: <span class="tk-str">"eviction cause"</span> },
    <span class="tk-str">"filters"</span>:     { <span class="tk-str">"tags"</span>: [<span class="tk-str">"k8s"</span>] },
    <span class="tk-str">"deadline_ms"</span>: <span class="tk-num">250</span>,
    <span class="tk-str">"recall_mode"</span>: <span class="tk-str">"first"</span>      <span class="tk-cm">// "first" | "merge" | "all"</span>
  }
}`;

const recalledWireSnippet = `<span class="tk-cm">// RECALLED  -  one per responding Engram; parent_id → the RECALL</span>
{
  <span class="tk-str">"type"</span>: <span class="tk-str">"RECALLED"</span>,
  <span class="tk-str">"payload"</span>: {
    <span class="tk-str">"engram_id"</span>: <span class="tk-str">"pgvector-default"</span>,
    <span class="tk-str">"hits"</span>: [
      { <span class="tk-str">"id"</span>: <span class="tk-str">"eng_01JV…"</span>, <span class="tk-str">"score"</span>: <span class="tk-num">0.91</span>, <span class="tk-str">"entry"</span>: { } },
      { <span class="tk-str">"id"</span>: <span class="tk-str">"eng_01JV…"</span>, <span class="tk-str">"score"</span>: <span class="tk-num">0.74</span>, <span class="tk-str">"entry"</span>: { } }
    ],
    <span class="tk-str">"truncated"</span>: <span class="tk-kw">false</span>,
    <span class="tk-str">"took_ms"</span>:   <span class="tk-num">38</span>
  }
}`;

const imprintWireSnippet = `<span class="tk-cm">// IMPRINT  -  addressed write (broadcast is opt-in via meta.broadcast)</span>
{
  <span class="tk-str">"type"</span>: <span class="tk-str">"IMPRINT"</span>,
  <span class="tk-str">"payload"</span>: {
    <span class="tk-str">"engram_id"</span>:   <span class="tk-str">"ctx-default"</span>,
    <span class="tk-str">"op"</span>:          <span class="tk-str">"append"</span>,   <span class="tk-cm">// add|append|merge|upsert|delete</span>
    <span class="tk-str">"entry"</span>: {
      <span class="tk-str">"id"</span>:      <span class="tk-str">"eng_01JV…"</span>,
      <span class="tk-str">"content"</span>: <span class="tk-str">"Eviction triggered by memory pressure."</span>,
      <span class="tk-str">"tags"</span>:    [<span class="tk-str">"k8s"</span>, <span class="tk-str">"eviction"</span>]
    },
    <span class="tk-str">"merge_key"</span>: <span class="tk-str">"incident:42"</span>   <span class="tk-cm">// required for merge / upsert</span>
  }
}

<span class="tk-cm">// IMPRINTED  -  ack; parent_id → the IMPRINT</span>
{
  <span class="tk-str">"type"</span>: <span class="tk-str">"IMPRINTED"</span>,
  <span class="tk-str">"payload"</span>: {
    <span class="tk-str">"engram_id"</span>: <span class="tk-str">"ctx-default"</span>, <span class="tk-str">"op"</span>: <span class="tk-str">"append"</span>,
    <span class="tk-str">"id"</span>: <span class="tk-str">"eng_01JV…"</span>, <span class="tk-str">"version"</span>: <span class="tk-num">3</span>, <span class="tk-str">"took_ms"</span>: <span class="tk-num">12</span>
  }
}`;

const idSnippet = `<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> new_engram_id

new_engram_id()   <span class="tk-cm"># 'eng_01JVZ8K3M2…'  -  sortable ULID, eng_ prefix</span>`;

/* ─────────────────────────────  COMPONENT  ───────────────────────────── */

export default function EngramDocs() {
  return (
    <>
      <div className="docs-megasection">
        <div className="docs-megasection-label">// cosmonapse.engram</div>
        <h2 className="docs-megasection-title">
          Shared memory for Neurons, addressed as a first-class participant.
        </h2>
        <p className="docs-megasection-sub">
          An <strong>Engram</strong> is a storage wrapper  -  the second persistent surface in
          Cosmonapse after the <code className="inline">RegistryStore</code>, and optional in the same
          way. It is a synapse-side participant with its own envelope category (like a Dendrite), not
          a Neuron: it never produces <code className="inline">AGENT_OUTPUT</code>. Neurons reach it
          only through Signals  -  <code className="inline">RECALL</code> /{" "}
          <code className="inline">IMPRINT</code>  -  that ride inside the containing TASK trace.
        </p>
      </div>

      {/* ─── Overview ─── */}
      <Section id="eg-overview" eyebrow="ENGRAM · 01" title="Overview  -  the mental model">
        <p className="docs-p">
          One Engram wraps <strong>one</strong> backend (sqlite, postgres, a vector store, an object
          store  -  anything that holds bytes and answers queries) and owns its own schema. A namespace
          may run <strong>zero, one, or many</strong> Engrams, each serving a distinct memory purpose:
          one for working context, one for vectors, one for blobs, one for relational records.
        </p>
        <p className="docs-p">
          The intended default is <strong>addressed routing</strong>. A recall says &ldquo;I want the
          vector Engram&rdquo; by <code className="inline">engram_id</code>, or &ldquo;I want a{" "}
          <code className="inline">semantic</code> Engram&rdquo; by{" "}
          <code className="inline">engram_kind</code>, and the matching Engram answers. Fan-out across
          several Engrams of the same kind is opt-in via <code className="inline">recall_mode</code>.
          This is closer to how <code className="inline">TASK</code> routes by{" "}
          <code className="inline">neuron</code> than to how{" "}
          <code className="inline">TASK_OFFER</code> auctions over bids.
        </p>

        <h3 className="docs-h3">Five invariants</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Invariant</th>
              <th>What it means</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Part of the trace</td>
              <td>
                A <code className="inline">RECALL</code> / <code className="inline">IMPRINT</code>{" "}
                emitted mid-task inherits the TASK&rsquo;s <code className="inline">trace_id</code>;
                the <code className="inline">parent_id</code> chain proves causation. Doppler, cost
                rollup, and deadlines apply to Engram I/O too.
              </td>
            </tr>
            <tr>
              <td>Storage is plural</td>
              <td>No single &ldquo;the memory.&rdquo; Multiple Engrams coexist, one per purpose.</td>
            </tr>
            <tr>
              <td>Engrams are black boxes</td>
              <td>The protocol sees opaque keys, queries, and results. The schema is the Engram&rsquo;s business.</td>
            </tr>
            <tr>
              <td>Event-driven only</td>
              <td>Engrams never expose a direct method to Neurons. Everything is a Signal.</td>
            </tr>
            <tr>
              <td>Backends are pluggable</td>
              <td>
                <code className="inline">SqliteEngram</code>,{" "}
                <code className="inline">PostgresEngram</code>, a future{" "}
                <code className="inline">PgVectorEngram</code> or{" "}
                <code className="inline">S3Engram</code> all conform to the same{" "}
                <code className="inline">Engram</code> ABC.
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">engram_kind  -  conventional values</h3>
        <p className="docs-p">
          <code className="inline">engram_kind</code> is a routing label. Conventional values are{" "}
          <code className="inline">relational</code>, <code className="inline">semantic</code>,{" "}
          <code className="inline">keyvalue</code>, <code className="inline">blob</code>,{" "}
          <code className="inline">timeseries</code>, and <code className="inline">context</code>.
          Engrams subscribe by kind; the Cortex routes by capability the same way it routes Tasks.
        </p>
      </Section>

      {/* ─── Installation ─── */}
      <Section id="eg-install" eyebrow="ENGRAM · 02" title="Installation">
        <p className="docs-p">
          Engram ships in the base package. <code className="inline">InMemoryEngram</code> and{" "}
          <code className="inline">SqliteEngram</code> need no extra dependencies;{" "}
          <code className="inline">PostgresEngram</code> lazy-imports{" "}
          <code className="inline">asyncpg</code>, installed via the{" "}
          <code className="inline">postgres</code> extra.
        </p>
        <CodeBlock html={installSnippet} maxWidth={760} />
      </Section>

      {/* ─── Imports ─── */}
      <Section id="eg-imports" eyebrow="ENGRAM · 03" title="Top-level imports">
        <p className="docs-p">
          The entire public surface is re-exported from{" "}
          <code className="inline">cosmonapse.engram</code>. The{" "}
          <code className="inline">new_engram_id</code> ULID helper lives on the package root next to
          the other ID helpers.
        </p>
        <CodeBlock filename="imports.py" html={importSnippet} maxWidth={820} />
      </Section>

      {/* ─── EngramBinding ─── */}
      <Section id="eg-binding" eyebrow="ENGRAM · 04" title="EngramBinding  -  declarative wiring">
        <p className="docs-p">
          An <strong>EngramBinding</strong> is how an Axon declares which Engrams its Neuron may
          address. The Axon stores a list of them at construction, so the Neuron references memory by
          a stable local <code className="inline">name</code> (e.g.{" "}
          <code className="inline">&quot;notes&quot;</code>) rather than a deployment-specific{" "}
          <code className="inline">engram_id</code>. The Axon enforces this whitelist  -  a Neuron cannot
          touch an Engram it was not wired to.
        </p>
        <ApiCard
          kind="dataclass (frozen)"
          name="cosmonapse.engram.EngramBinding"
          summary="One Engram wired into an Axon under a local name. At least one of engram_id or engram_kind must be set."
        >
          <CodeBlock filename="binding.pyi" html={bindingSnippet} maxWidth={720} />
        </ApiCard>

        <h3 className="docs-h3">Fields</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>name</td>
              <td>str</td>
              <td>Local handle the Neuron passes to <code className="inline">recall()</code> / <code className="inline">imprint()</code>. Unique per Axon.</td>
            </tr>
            <tr>
              <td>directed_id</td>
              <td>str | None</td>
              <td>Explicit target (the engram_id; becomes <code className="inline">directed.id</code> on the wire). Preferred. One of <code className="inline">directed_id</code> / <code className="inline">directed_type</code> is required.</td>
            </tr>
            <tr>
              <td>directed_type</td>
              <td>str | None</td>
              <td>Slot routing (the engram_kind; becomes <code className="inline">directed.type</code>)  -  deployment owns the concrete implementation behind a kind.</td>
            </tr>
            <tr>
              <td>default_deadline_ms</td>
              <td>int | None</td>
              <td>Per-binding default SLA applied when a call omits <code className="inline">deadline_ms</code>.</td>
            </tr>
            <tr>
              <td>default_recall_mode</td>
              <td>str</td>
              <td>One of <code className="inline">&quot;first&quot;</code> · <code className="inline">&quot;merge&quot;</code> · <code className="inline">&quot;all&quot;</code>. Defaults to <code className="inline">&quot;first&quot;</code>. Validated at construction.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Example</h3>
        <CodeBlock filename="wire_axon.py" html={bindingUseSnippet} maxWidth={760} />
      </Section>

      {/* ─── Helpers ─── */}
      <Section id="eg-helpers" eyebrow="ENGRAM · 05" title="recall() & imprint()  -  the Neuron-side helpers">
        <p className="docs-p">
          When a <code className="inline">neuron_fn</code> declares{" "}
          <code className="inline">recall</code> and/or <code className="inline">imprint</code>{" "}
          keyword-only parameters, the Axon injects bound async helpers for the current trace. They
          resolve the binding name, build the <code className="inline">RECALL</code> /{" "}
          <code className="inline">IMPRINT</code> envelope, and correlate the response  -  all scoped to
          the containing TASK&rsquo;s <code className="inline">trace_id</code> and{" "}
          <code className="inline">parent_id</code>. If no Engrams are wired, the helpers raise{" "}
          <code className="inline">EngramNotBound</code>.
        </p>

        <ApiCard
          kind="async helper"
          name="recall(name, *, query, …) -> RecallResult"
          summary="Emit RECALL to the bound Engram, await the response per recall_mode, and return a RecallResult. Returns an empty (falsy) result on a miss  -  it does not raise."
        >
          <CodeBlock filename="recall.pyi" html={recallSigSnippet} maxWidth={760} />
        </ApiCard>

        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td>name</td><td>str</td><td>Binding name wired on the Axon. Raises <code className="inline">EngramNotBound</code> if unknown.</td></tr>
            <tr><td>query</td><td>dict</td><td>Opaque to the protocol; the Engram interprets it (text, vector, SQL-ish filter, …).</td></tr>
            <tr><td>filters</td><td>dict | None</td><td>Structured narrowing applied alongside the query (e.g. tags, namespaces).</td></tr>
            <tr><td>context_ref</td><td>str | None</td><td>Opaque pointer threaded to the Engram for context-scoped reads.</td></tr>
            <tr><td>deadline_ms</td><td>int | None</td><td>Best-effort SLA. On <code className="inline">&quot;first&quot;</code>, an elapsed deadline raises <code className="inline">EngramTimeout</code>; on <code className="inline">&quot;merge&quot;</code>/<code className="inline">&quot;all&quot;</code> it resolves with whatever arrived.</td></tr>
            <tr><td>recall_mode</td><td>str | None</td><td>Overrides the binding default. <code className="inline">first</code> = first responder; <code className="inline">merge</code> = accumulate &amp; sort by score; <code className="inline">all</code> = stream every responder.</td></tr>
            <tr><td>min_confidence</td><td>float | None</td><td>Drop hits below this score (backend-enforced where supported).</td></tr>
            <tr><td>meta</td><td>dict | None</td><td>Free-form envelope metadata (e.g. <code className="inline">broadcast</code>).</td></tr>
          </tbody>
        </table>
        </div>

        <ApiCard
          kind="async helper"
          name="imprint(name, *, op, entry, …) -> ImprintReceipt | None"
          summary="Emit IMPRINT to the bound Engram. Fire-and-forget by default (returns None once on the wire); with await_ack=True it awaits IMPRINTED and returns a receipt."
        >
          <CodeBlock filename="imprint.pyi" html={imprintSigSnippet} maxWidth={760} />
        </ApiCard>

        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td>op</td><td>str</td><td>One of <code className="inline">add</code> · <code className="inline">append</code> · <code className="inline">merge</code> · <code className="inline">upsert</code> · <code className="inline">delete</code>. See semantics below.</td></tr>
            <tr><td>entry</td><td>dict</td><td>Opaque body; the Engram validates it against its declared schema.</td></tr>
            <tr><td>merge_key</td><td>str | None</td><td>Required for <code className="inline">merge</code> and <code className="inline">upsert</code>; the key the record is located by.</td></tr>
            <tr><td>await_ack</td><td>bool</td><td><code className="inline">False</code> (default) returns once the envelope is published. <code className="inline">True</code> awaits <code className="inline">IMPRINTED</code> and returns a receipt.</td></tr>
            <tr><td>deadline_ms</td><td>int | None</td><td>With <code className="inline">await_ack=True</code>, raises <code className="inline">EngramTimeout</code> if no ack arrives in time.</td></tr>
            <tr><td>meta</td><td>dict | None</td><td>Free-form metadata. <code className="inline">meta.broadcast = true</code> opts into multi-receiver writes.</td></tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">op semantics</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr><th>op</th><th>Behaviour</th></tr>
          </thead>
          <tbody>
            <tr><td>add</td><td>Insert; fail if the id already exists.</td></tr>
            <tr><td>append</td><td>Append to a sequence/log keyed by <code className="inline">merge_key</code> (auto-creates one if absent).</td></tr>
            <tr><td>merge</td><td>Locate by <code className="inline">merge_key</code>, deep-merge <code className="inline">entry</code> into the existing record.</td></tr>
            <tr><td>upsert</td><td>Replace if <code className="inline">merge_key</code> matches, otherwise insert.</td></tr>
            <tr><td>delete</td><td>Remove by id or <code className="inline">merge_key</code>.</td></tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">End-to-end inside a Neuron</h3>
        <CodeBlock filename="summariser.py" html={helperSnippet} maxWidth={820} />
      </Section>

      {/* ─── Engram ABC ─── */}
      <Section id="eg-abc" eyebrow="ENGRAM · 06" title="Engram  -  the backend ABC">
        <p className="docs-p">
          Every backend implements this exact interface. The conformance suite in{" "}
          <code className="inline">tests/test_engram.py</code> runs against any{" "}
          <code className="inline">Engram</code> and is the single source of truth for correct
          behaviour. Subclasses set <code className="inline">engram_id</code>,{" "}
          <code className="inline">engram_kind</code>, and{" "}
          <code className="inline">capabilities</code> on construction. All read/write methods are
          async; backends wrapping sync libraries (sqlite3) dispatch to a threadpool.
        </p>
        <p className="docs-p">
          This is one of two ways to write an Engram. If your backend does not need to own resources,{" "}
          <code className="inline">Engram.serve()</code> builds the same thing from two decorators  - {" "}
          see <Link href="#eg-serve" className="docs-link">Engram.serve() below</Link>.
        </p>
        <ApiCard
          kind="abstract base class"
          name="cosmonapse.engram.Engram"
          summary="Storage wrapper  -  one backend per instance. recall() must return an empty list on a miss rather than raising."
        >
          <CodeBlock filename="engram.pyi" html={abcSnippet} maxWidth={840} />
        </ApiCard>

        <h3 className="docs-h3">Members</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr><th>Member</th><th>Kind</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td>engram_id</td><td>attr: str</td><td>Stable address other processes route to.</td></tr>
            <tr><td>engram_kind</td><td>attr: str</td><td>Routing label (<code className="inline">relational</code>, <code className="inline">semantic</code>, …).</td></tr>
            <tr><td>capabilities</td><td>attr: list[str]</td><td>Query features advertised in <code className="inline">REGISTER</code> (e.g. <code className="inline">vector_search</code>, <code className="inline">tags</code>).</td></tr>
            <tr><td>version</td><td>attr: str | None</td><td>Optional backend version surfaced to callers.</td></tr>
            <tr><td>connect()</td><td>async, abstract</td><td>Open backend resources (DB pool, file handle).</td></tr>
            <tr><td>close()</td><td>async, abstract</td><td>Release backend resources.</td></tr>
            <tr><td>recall(query, …)</td><td>async, abstract</td><td>Return matching <code className="inline">Hit</code>s. Empty list on a miss  -  never raise.</td></tr>
            <tr><td>imprint(op, entry, …)</td><td>async, abstract</td><td>Write. Use <code className="inline">imprint_id</code> for idempotency (no-op on re-delivery).</td></tr>
            <tr><td>can_serve(query)</td><td>async, optional</td><td>Return <code className="inline">False</code> to decline a query (e.g. BM25 engram asked for vectors). Default serves all.</td></tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Implementing a custom backend</h3>
        <CodeBlock filename="redis_engram.py" html={customEngramSnippet} maxWidth={840} />
      </Section>

      {/* ─── Engram.serve ─── */}
      <Section id="eg-serve" eyebrow="ENGRAM · 06b" title="Engram.serve()  -  the decorator-native form">
        <p className="docs-p">
          There are two ways to write an Engram. Subclass the ABC above  -  what every bundled backend
          does  -  or build one from decorators with <code className="inline">Engram.serve()</code>, the
          memory-side twin of <code className="inline">Effector.serve()</code>. A{" "}
          <code className="inline">RECALL</code> arrives, <code className="inline">@on_recall</code>{" "}
          runs, and its return value is published as the <code className="inline">RECALLED</code> hits;
          an <code className="inline">IMPRINT</code> arrives,{" "}
          <code className="inline">@on_imprint</code> runs, and its return value becomes the{" "}
          <code className="inline">IMPRINTED</code> receipt.
        </p>
        <p className="docs-p">
          Either way the result is a plain Engram: it REGISTERs under its own{" "}
          <code className="inline">engram_id</code>, the hosting Dendrite resolves and services it
          exactly as it does a subclass, and the reply carries the Engram&rsquo;s own attribution. The
          decorators change where the body lives, nothing else.
        </p>

        <ApiCard
          kind="classmethod"
          name="Engram.serve(*, engram_id, engram_kind='context', capabilities=None, version=None)"
          summary="Returns a concrete Engram driven by @on_recall / @on_imprint handlers. Both are sync-or-async, run in registration order, and returning None falls through to the next one."
        >
          <CodeBlock filename="served_engram.py" html={serveSnippet} maxWidth={840} />
        </ApiCard>

        <h3 className="docs-h3">Handler contracts</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr><th>Decorator</th><th>Receives</th><th>Returns</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>@on_recall</td>
              <td><code className="inline">query</code>, plus <code className="inline">filters</code> / <code className="inline">context_ref</code> / <code className="inline">deadline_ms</code> / <code className="inline">min_confidence</code> if declared as keyword parameters (a <code className="inline">**kwargs</code> catch-all receives all four).</td>
              <td>A list of <code className="inline">Hit</code> or of <code className="inline">{`{"id", "entry", "score"}`}</code> dicts  -  becomes the RECALLED hits. <code className="inline">None</code> falls through; if every handler falls through the result is an empty list, which is a miss, not an error.</td>
            </tr>
            <tr>
              <td>@on_imprint</td>
              <td><code className="inline">op</code> and <code className="inline">entry</code>, plus <code className="inline">merge_key</code> / <code className="inline">imprint_id</code> / <code className="inline">trace_id</code> if declared.</td>
              <td>An <code className="inline">ImprintReceipt</code>, or the new entry id as a <code className="inline">str</code>  -  becomes the IMPRINTED receipt. <code className="inline">None</code> falls through.</td>
            </tr>
            <tr>
              <td>@serves</td>
              <td><code className="inline">query</code>.</td>
              <td>The <code className="inline">can_serve</code> gate. Optional  -  the default answers every query once a recall handler exists.</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 className="docs-h3">Servicing vs observing  -  the distinction that bites</h3>
        <p className="docs-p">
          <code className="inline">@on_recall</code> / <code className="inline">@on_imprint</code>{" "}
          <strong>are</strong> the servicing. <code className="inline">@engram.host.on_&lt;signal&gt;</code>{" "}
          only <strong>observes</strong> it: those are deferred{" "}
          <code className="inline">Dendrite</code> decorators, queued at module level and replayed onto
          the <em>hosting</em> Dendrite once it connects this Engram, with the inbound subscription
          ensured. By the time one runs, the Dendrite has already serviced the request and published
          the reply. Registering a host observer does not disable the built-in path  -  so servicing
          from one would emit a second RECALLED / IMPRINTED and, for a non-idempotent op, write twice.
        </p>
        <p className="docs-p">
          The name is validated eagerly, so a typo fails at import time rather than at connect time.{" "}
          <code className="inline">on_discover</code> and <code className="inline">on_trace</code> have
          non-standard registration shapes and are not accepted. This mirrors{" "}
          <code className="inline">Axon.host</code> exactly.
        </p>
        <CodeBlock filename="engram_host.py" html={engramHostSnippet} maxWidth={840} />

        <p className="docs-p">
          <strong>TypeScript note:</strong> <code className="inline">Engram.serve()</code> and the host
          proxy are Python-only today. In the TypeScript SDK, extend the abstract{" "}
          <code className="inline">Engram</code> class instead  -  see the{" "}
          <Link href="/docs/typescript/engram" className="docs-link">TS Engram section</Link>. The
          Effector equivalents <em>are</em> at parity in both SDKs.
        </p>
      </Section>

      {/* ─── Result types ─── */}
      <Section id="eg-results" eyebrow="ENGRAM · 07" title="Hit · RecallResult · ImprintReceipt">
        <p className="docs-p">
          The three caller-facing return types. <code className="inline">RecallResult</code> is
          iterable and truthy, so a Neuron can write{" "}
          <code className="inline">for h in result</code>, <code className="inline">len(result)</code>,
          or <code className="inline">if result:</code> directly.{" "}
          <code className="inline">ImprintReceipt.ok</code> is <code className="inline">True</code> when{" "}
          <code className="inline">error is None</code>.
        </p>
        <CodeBlock filename="results.pyi" html={resultsSnippet} maxWidth={820} />

        <h3 className="docs-h3">recall_mode → what RecallResult contains</h3>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr><th>mode</th><th>Resolution</th><th>hits</th></tr>
          </thead>
          <tbody>
            <tr><td>first</td><td>Resolves on the first <code className="inline">RECALLED</code>. Timeout → <code className="inline">EngramTimeout</code>.</td><td>That responder&rsquo;s hits.</td></tr>
            <tr><td>merge</td><td>Accumulates until the deadline, then resolves.</td><td>All responders, sorted by <code className="inline">score</code> desc.</td></tr>
            <tr><td>all</td><td>Accumulates until the deadline; caller iterates the stream.</td><td>Every responder&rsquo;s hits, with <code className="inline">engram_ids</code> populated.</td></tr>
          </tbody>
        </table>
        </div>
      </Section>

      {/* ─── Backends ─── */}
      <Section id="eg-backends" eyebrow="ENGRAM · 08" title="Bundled backends">
        <p className="docs-p">
          Three backends ship in the box. All take keyword-only arguments and default{" "}
          <code className="inline">version</code> to <code className="inline">&quot;0.0.1&quot;</code>.
          Call <code className="inline">await connect()</code> before{" "}
          <code className="inline">attach_engram</code>.
        </p>

        <ApiCard
          kind="class"
          name="InMemoryEngram(*, engram_id='engram-memory', engram_kind='keyvalue', capabilities=None, version='0.0.1')"
          summary="Dict-backed. No dependencies. Resets on process exit. Default capabilities: ['substring', 'tags', 'merge_key']. Ideal for tests and the dev synapse."
        />
        <ApiCard
          kind="class"
          name="SqliteEngram(*, path=':memory:', engram_id='engram-sqlite', engram_kind='relational', capabilities=None, version='0.0.1')"
          summary="Single-file sqlite3 via a threadpool. Default capabilities: ['substring', 'tags', 'merge_key', 'time_range']. Pass a path to persist across restarts."
        />
        <ApiCard
          kind="class"
          name="PostgresEngram(*, dsn, engram_id='engram-postgres', engram_kind='relational', capabilities=None, version='0.0.1', min_size=1, max_size=5, pool_kwargs=None)"
          summary="asyncpg connection pool; the driver is lazy-imported. Default capabilities add 'jsonb'. dsn is required; min_size / max_size / pool_kwargs tune the pool."
        />

        <h3 className="docs-h3">Constructing them</h3>
        <CodeBlock filename="backends.py" html={backendsSnippet} maxWidth={840} />
      </Section>

      {/* ─── Mounting ─── */}
      <Section id="eg-mount" eyebrow="ENGRAM · 09" title="Mounting on a Dendrite">
        <p className="docs-p">
          An Engram is mounted on a hosting Dendrite with{" "}
          <code className="inline">attach_engram(engram)</code>. From then on, that Dendrite
          subscribes to <code className="inline">RECALL</code> /{" "}
          <code className="inline">IMPRINT</code> addressed to the Engram&rsquo;s{" "}
          <code className="inline">engram_id</code> or matching its{" "}
          <code className="inline">engram_kind</code>, and dispatches them to the instance. The Engram
          still owns its backend lifecycle.
        </p>
        <ApiCard kind="method" name="Dendrite.attach_engram(engram: Engram) -> None" summary="Mount an Engram. Indexes it by engram_id and engram_kind. Raises if an Engram with the same engram_id is already hosted." />
        <ApiCard kind="async method" name="Dendrite.detach_engram(engram_id: str) -> None" summary="Remove a hosted Engram, closing its backend and unsubscribing routing." />
        <ApiCard kind="property" name="Dendrite.engrams -> dict[str, Engram]" summary="A copy of the engram_id → Engram map currently hosted on this Dendrite." />
        <CodeBlock filename="mount.py" html={mountSnippet} maxWidth={840} />
      </Section>

      {/* ─── EngramClient ─── */}
      <Section id="eg-client" eyebrow="ENGRAM · 10" title="EngramClient  -  caller-side correlation">
        <p className="docs-p">
          <code className="inline">EngramClient</code> is the caller-side bridge  -  one instance per
          Dendrite. The Axon&rsquo;s helpers and the Dendrite both call into it; only the Dendrite
          touches the Synapse. It builds envelopes, registers pending futures keyed by envelope{" "}
          <code className="inline">id</code>, resolves them when a matching{" "}
          <code className="inline">RECALLED</code> / <code className="inline">IMPRINTED</code> arrives
          (matched by <code className="inline">parent_id</code>), enforces deadlines, and cancels
          in-flight calls with <code className="inline">EngramCancelled</code> when the trace
          terminates. You rarely construct it yourself.
        </p>
        <ApiCard
          kind="class"
          name="cosmonapse.engram.EngramClient"
          summary="One per Dendrite. Owns the pending-future table for RECALL/IMPRINT and resolves responses by parent_id."
        >
          <CodeBlock filename="engram_client.pyi" html={clientSnippet} maxWidth={840} />
        </ApiCard>
      </Section>

      {/* ─── Wire signals ─── */}
      <Section id="eg-signals" eyebrow="ENGRAM · 11" title="Wire signals  -  RECALL / RECALLED / IMPRINT / IMPRINTED">
        <p className="docs-p">
          Engrams add four signal types to <code className="inline">SYNAPSE_TYPES</code>. Axons cannot
          produce them directly  -  they go through the hosting Dendrite, the same as{" "}
          <code className="inline">MEMORY_APPEND</code>. Routing precedence:{" "}
          <code className="inline">engram_id</code> beats <code className="inline">engram_kind</code>.
          Entry ids use the <code className="inline">eng_</code> ULID prefix. Engrams piggyback on{" "}
          <code className="inline">REGISTER</code> (<code className="inline">role: &quot;engram&quot;</code>),{" "}
          <code className="inline">HEARTBEAT</code>, and <code className="inline">DISCOVER</code>  -  so
          the <code className="inline">RegistryStore</code> already tracks them; no second registry.
        </p>

        <h3 className="docs-h3">RECALL  ·  request</h3>
        <CodeBlock filename="RECALL.json" html={recallWireSnippet} maxWidth={720} />

        <h3 className="docs-h3">RECALLED  ·  response</h3>
        <p className="docs-p">
          <code className="inline">parent_id</code> MUST point at the{" "}
          <code className="inline">RECALL</code>. Multiple Engrams may respond; the Cortex merges or
          picks per <code className="inline">recall_mode</code>.
        </p>
        <CodeBlock filename="RECALLED.json" html={recalledWireSnippet} maxWidth={720} />

        <h3 className="docs-h3">IMPRINT  ·  write &amp; IMPRINTED  ·  ack</h3>
        <CodeBlock filename="IMPRINT.json" html={imprintWireSnippet} maxWidth={720} />

        <p className="docs-p">
          <code className="inline">MEMORY_APPEND</code> is now a convenience macro that compiles to{" "}
          <code className="inline">IMPRINT {"{"} op: &quot;append&quot; {"}"}</code>  -  kept for
          back-compat, but prefer <code className="inline">IMPRINT</code>.{" "}
          <code className="inline">CONTEXT_SYNC</code> is unchanged: a transient broadcast, not a
          storage op.
        </p>
      </Section>

      {/* ─── Errors ─── */}
      <Section id="eg-errors" eyebrow="ENGRAM · 12" title="Errors">
        <p className="docs-p">
          All Engram exceptions subclass <code className="inline">EngramError</code>. Backpressure
          (<code className="inline">EngramOverloaded</code>) surfaces as an{" "}
          <code className="inline">error</code> on the <code className="inline">IMPRINTED</code> receipt
          rather than a separate <code className="inline">ERROR</code> signal  -  so a shed write does
          not terminate the parent TASK.
        </p>
        <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr><th>Exception</th><th>Raised when</th></tr>
          </thead>
          <tbody>
            <tr><td>EngramError</td><td>Base class for everything below.</td></tr>
            <tr><td>EngramTimeout</td><td>A <code className="inline">RECALL</code> / <code className="inline">IMPRINT</code> deadline elapses with no response.</td></tr>
            <tr><td>EngramCancelled</td><td>The containing TASK terminates mid-call (FINAL/ERROR on the trace, or Dendrite shutdown).</td></tr>
            <tr><td>EngramNotBound</td><td>A Neuron asks for a binding name the Axon was not constructed with.</td></tr>
            <tr><td>EngramOverloaded</td><td>A backend sheds load. Reported on the <code className="inline">IMPRINTED</code> receipt&rsquo;s <code className="inline">error</code> field.</td></tr>
          </tbody>
        </table>
        </div>
      </Section>

      {/* ─── ID helpers ─── */}
      <Section id="eg-ids" eyebrow="ENGRAM · 13" title="ID helpers">
        <p className="docs-p">
          Engram entry ids are sortable ULIDs with an <code className="inline">eng_</code> prefix.
          Generate them with <code className="inline">new_engram_id()</code> from the package root.
        </p>
        <CodeBlock filename="ids.py" html={idSnippet} maxWidth={640} />
        <p className="docs-p" style={{ marginTop: 24 }}>
          For the protocol-level design rationale  -  routing precedence, broadcast semantics, and the
          full envelope grammar  -  see the{" "}
          <Link href="/protocol" className="inline-link">
            envelope spec
          </Link>{" "}
          and the Python SDK&rsquo;s{" "}
          <Link href="/docs/python" className="inline-link">
            Dendrite reference
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
