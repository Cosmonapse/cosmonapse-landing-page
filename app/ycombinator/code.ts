// ---------------------------------------------------------------------------
// neurons/rag.py, annotated. Each Part with a `tip` becomes a hoverable token.
// Kept in sync by hand with cosmonapse-examples/16-rag-cli/neurons/rag.py.
// ---------------------------------------------------------------------------

export type Part = string | { t: string; cls?: string; tip?: string };
export type Line = Part[];

const K = (t: string, tip?: string): Part => ({ t, cls: "tk-kw", tip });
const F = (t: string, tip?: string): Part => ({ t, cls: "tk-fn", tip });
const S = (t: string, tip?: string): Part => ({ t, cls: "tk-str", tip });
const C = (t: string): Part => ({ t, cls: "tk-cm" });
const O = (t: string, tip?: string): Part => ({ t, cls: "tk-op", tip });

export const NEURON_CODE: Line[] = [
  [C("# THE NEURON is a stock chat model. Three decorators make it a RAG.")],
  [],
  [
    "AXON = Axon(neuron_id=",
    S('"rag"'),
    ", neuron_fn=",
    F(
      "llm()",
      "A hosted chat model and nothing else - no retrieval code, no tool code, no protocol code. It never learns Cosmonapse exists. Swap it in config.py and no other file changes."
    ),
    ", ...)",
  ],
  [],
  [
    O(
      "@AXON.before_task",
      "Runs before the model does. The question comes in, a chat prompt goes out - and every Signal this example sends is emitted from in here."
    ),
  ],
  [
    K("async def "),
    F("situate"),
    "(input):",
  ],
  ["    d = ", F("AXON.dendrite", "The Dendrite hosting this Axon. Memory and tools are both reached through it - they are Signals on the bus, not library calls."), ""],
  [],
  [C("    # 1. What do we already know?")],
  [
    "    known = ",
    K("await "),
    "d.",
    F(
      "recall",
      "Emits RECALL, waits for RECALLED. Answered by whichever Dendrite hosts that Engram - which may be another machine."
    ),
    "(engram_id=",
    S('"web-memory"'),
    ", query={...})",
  ],
  [],
  [C("    # 2. Not enough -> go and learn.")],
  [
    "    ",
    K("if not "),
    F(
      "_covers",
      'The entire "do I already know this?" policy: enough passages, covering enough of the question\'s content words. Two numbers in config.py.'
    ),
    "(question, passages):",
  ],
  [
    "        found = ",
    K("await "),
    "d.",
    F("call_tool", "Emits TOOL_CALL, waits for TOOL_RESULT. Serviced by whichever Dendrite hosts that Effector."),
    "(effector_id=",
    S('"web-effector"'),
    ", tool=",
    S('"search"'),
    ", ...)",
  ],
  [
    "        ",
    K("for "),
    "url ",
    K("in "),
    F("_urls"),
    "(found.result[",
    S('"response"'),
    "]):",
  ],
  [
    "            page = ",
    K("await "),
    "d.call_tool(effector_id=",
    S('"web-effector"'),
    ", tool=",
    S('"fetch"'),
    ", ...)",
  ],
  [
    "            ",
    K("for "),
    "i, chunk ",
    K("in "),
    F("enumerate"),
    "(",
    F(
      "_chunks",
      "Fixed-width overlapping chunks. Deliberately dumb - a smarter splitter is a better splitter, not a different architecture."
    ),
    "(page)):",
  ],
  [
    "                ",
    K("await "),
    "d.",
    F("imprint", "Emits IMPRINT. This one does not wait for the receipt."),
    "(engram_id=",
    S('"web-memory"'),
    ", op=",
    S('"upsert"'),
    ",",
  ],
  [
    "                                merge_key=",
    S(
      'f"{url}#{i}"',
      "Re-reading a page upserts its chunks instead of duplicating them. The index is idempotent under repeat runs."
    ),
    ", ",
    O(
      "await_ack=False",
      "Emit and move on. Nothing downstream needs the receipt, so this IMPRINT never blocks."
    ),
    ")",
  ],
  [],
  [C("        # 3. The same recall as step 1. Both paths converge here.")],
  ["        passages = _passages((", K("await "), "d.recall(...)).hits)"],
  [],
  [
    "    ",
    K("return "),
    "{",
    S('"messages"'),
    ": [",
    F("system", "The model is handed finished passages and a question. It has no tools and no memory of its own."),
    ", ",
    F("user"),
    "]}",
  ],
  [],
  [
    O(
      "@AXON.detects_output",
      "Runs on the model's raw reply. Here the reply IS the answer, so this just re-attaches the sources it was allowed to cite."
    ),
  ],
  [K("def "), F("answer"), "(raw): ..."],
  [],
  [
    O(
      "@AXON.host.on_agent_output",
      "A DEFERRED HOST decorator. It queues at import time and is replayed onto whichever Dendrite hosts this Axon - so brain.py wires no handlers. Here the chain has one link; in 14-agent this same decorator hands work from the planner to the researcher."
    ),
    "(neuron=",
    S('"rag"'),
    ")",
  ],
  [K("async def "), F("conclude"), "(sig):  ", C("# THE CHAIN: emit FINAL")],
];

export const AXON_CODE: Line[] = [
  [C("# THE DECLARATION. What this Neuron is allowed to touch.")],
  [],
  [
    "AXON = ",
    F(
      "Axon",
      "The Axon is the agent-side interface: it declares capabilities, validates output, and resolves bindings. The Neuron above never imports it."
    ),
    "(",
  ],
  [
    "    neuron_id=",
    S('"rag"'),
    ", neuron_fn=",
    F("answer_neuron"),
    ", capabilities=[",
    S(
      '"rag"',
      "What this Neuron advertises. The CLI dispatches to this capability, not to a node - so you can run three replicas and the Synapse load-balances them."
    ),
    "],",
  ],
  [
    "    engrams=[",
    F(
      "EngramBinding",
      'Declarative wiring. The Neuron says "web"; this says what "web" means on the wire. A name the Axon did not declare is refused at call time.'
    ),
    "(name=",
    S('"web"'),
    ", directed_id=",
    S('"web-memory"'),
    ")],",
  ],
  [
    "    effectors=[",
    F("EffectorBinding"),
    "(name=",
    S('"web"'),
    ", directed_id=",
    S('"web-effector"'),
    ",",
  ],
  [
    "                               tools=(",
    S('"search"'),
    ", ",
    S('"fetch"'),
    "))],",
  ],
  [
    "    ",
    O(
      "tool_standard=",
      "THE GATE: effectors= without a tool_standard fails at construction, not silently at runtime. The standard is how an Axon recognises a tool call in a model's raw output - bindings without one would be dead wiring."
    ),
    S('"codex"'),
    ",",
  ],
  [")"],
];

export const BRAIN_CODE: Line[] = [
  [C("# The wiring. Three Dendrites, one Synapse.")],
  [],
  [
    "host = ",
    F(
      "Dendrite",
      "A Dendrite is the synapse-side participant: it owns routing and exposes the aggregate capabilities of whatever is attached to it."
    ),
    "(synapse=synapse, dendrite_id=",
    S('"engram-host"'),
    ", role=",
    S('"worker"'),
    ")",
  ],
  [
    "host.",
    F(
      "attach_engram",
      "That is the entire registration step. No registry, no handler table, no manual subscription - the Dendrite now answers RECALL and IMPRINT for this Engram."
    ),
    "(web_memory.ENGRAM)",
  ],
  [],
  [
    "tools = ",
    F("Dendrite"),
    "(synapse=synapse, dendrite_id=",
    S('"web-node"'),
    ", role=",
    S('"worker"'),
    ")",
  ],
  [
    "tools.",
    F(
      "attach_effector",
      "Same idea for tools. The SDK services this Effector's TOOL_CALL / TOOL_RESULT from here on."
    ),
    "(web.EFFECTOR)",
  ],
  [],
  [
    "node = ",
    F("Dendrite"),
    "(synapse=synapse, dendrite_id=",
    S('"rag-node"'),
    ", role=",
    S(
      '"orchestrator"',
      "Only an orchestrator may dispatch TASKs. Workers host Axons, Effectors and Engrams and never originate work."
    ),
    ")",
  ],
  ["node.", F("attach_axon"), "(rag.AXON)"],
];

export const ENGRAM_CODE: Line[] = [
  [C("# THE ENGRAM. Two decorators - the memory side of the same idea.")],
  [],
  [
    "ENGRAM = ",
    F(
      "Engram.serve",
      "The memory-side twin of Effector.serve(). No ABC to implement and no reply to publish - the Engram is still attached under its own id, so it REGISTERs normally and an observer draws it as one engram node."
    ),
    "(engram_id=",
    S('"web-memory"'),
    ", engram_kind=",
    S('"lexical"'),
    ")",
  ],
  [],
  [
    O(
      "@ENGRAM.serves",
      "The can_serve gate. Return False and the hosting Dendrite skips responding - which is how a BM25 memory declines a vector query routed by kind rather than by id."
    ),
  ],
  [K("def "), F("only_text"), "(query): ", K("return "), S('"text"'), " ", K("in "), "query"],
  [],
  [
    O(
      "@ENGRAM.on_recall",
      "RECALL arrives, this runs, and what it RETURNS becomes the RECALLED hits. It executes INSIDE the Dendrite's handling pass - the same position @AXON.before_task occupies for a Neuron - so resolution and attribution keep working."
    ),
  ],
  [
    K("async def "),
    F("search"),
    "(query, ",
    O("*"),
    ", deadline_ms=",
    K("None"),
    ", min_confidence=",
    K("None"),
    "):",
  ],
  [
    "    ",
    K("return "),
    "[",
    F("Hit", "Return Hits, or plain {id, entry, score} dicts. Returning None falls through to the next handler, so a quota or ACL can sit in front of the real backend."),
    "(id=eid, entry=e, score=bm25) ...]",
  ],
  [],
  [
    O(
      "@ENGRAM.on_imprint",
      "IMPRINT arrives, this runs, and what it returns becomes the IMPRINTED receipt. The index cap lives in here because this handler owns the write."
    ),
  ],
  [
    K("async def "),
    F("write"),
    "(op, entry, ",
    O("*"),
    ", merge_key=",
    K("None"),
    "):",
  ],
  ["    eid = _put(entry, merge_key); _cap()"],
  ["    ", K("return "), "eid"],
  [],
  [
    O(
      "@ENGRAM.host.on_recalled",
      "A pure OBSERVER - it fires AFTER the reply is on the wire, so it cannot filter or rewrite a query. Note which signal carries what: the request had the query, only the reply has the hits."
    ),
  ],
  [
    K("async def "),
    F("mark_used"),
    "(sig):  ",
    C("# stamps last_used; never writes"),
  ],
];

export const EFFECTOR_CODE: Line[] = [
  [C("# THE EFFECTOR. Same shape again, on the action side.")],
  [],
  [
    "EFFECTOR = ",
    F("Effector.serve", "One protocol hook. A TOOL_CALL arrives, your handler runs, its return value is emitted as the TOOL_RESULT - no manual publish, no dispatch table in the SDK."),
    "(effector_id=",
    S('"web-effector"'),
    ", effector_kind=",
    S('"web"'),
    ")",
  ],
  [],
  [O("@EFFECTOR.on_tool_call", "The tool itself. A raise becomes `error` on the TOOL_RESULT, and a tool error never terminates the parent TASK.")],
  [
    K("async def "),
    F("handle"),
    "(tool, args, ",
    O("*"),
    ", ",
    O("trace_id", "Injected only because it is declared - so are call_id and deadline_ms if a handler asks for them."),
    "=",
    K("None"),
    "):",
  ],
  ["    ", C("# search | fetch, proxied onto one MCP server")],
  [],
  [
    O(
      "@EFFECTOR.host.on_final",
      "The action-side observer. Drops this trace's fetch memo when the trace ends - without it the dict grows for the life of the process."
    ),
  ],
  [K("async def "), F("forget"), "(sig): _SEEN.pop(sig.trace_id, ", K("None"), ")"],
];
