// ---------------------------------------------------------------------------
// The data behind the replay: two real runs of cosmonapse-examples/16-rag-cli,
// transcribed Signal by Signal. Nothing here is generated at runtime - it is
// a recording, so the page is honest about being a recording.
// ---------------------------------------------------------------------------

export type NodeId = "cli" | "rag" | "engram" | "web";

export type Sig = {
  /** Signal type, exactly as it appears on the wire. */
  type: string;
  from: NodeId;
  to: NodeId;
  /** One-line payload summary, shown in the log. */
  label: string;
  /** What this Signal means - the hover tooltip. */
  detail: string;
  /** Repeat count, for the fan-out steps. */
  times?: number;
  /** Lines the CLI prints when this Signal lands. */
  term?: string[];
};

export type Run = {
  id: string;
  question: string;
  /** Badge on the answer: which path served it. */
  source: "web" | "memory";
  elapsed: string;
  signals: Sig[];
  answer: string[];
  sources: { n: number; title: string; url: string; score: string }[];
};

const RAFT = "https://raft.github.io/";
const WIKI = "https://en.wikipedia.org/wiki/Raft_(algorithm)";
const PAPER = "https://web.stanford.edu/~ouster/cgi-bin/papers/raft-atc14";

export const COLD: Run = {
  id: "cold",
  question: "what is the raft consensus algorithm",
  source: "web",
  elapsed: "9.4s",
  signals: [
    {
      type: "TASK",
      from: "cli",
      to: "rag",
      label: 'capabilities: ["rag"]',
      detail:
        "One capability-routed TASK. The CLI does not name a node - it names a capability, and the Synapse delivers it to whichever Dendrite advertises one. This is the only Signal the CLI emits all run.",
      term: ["? what is the raft consensus algorithm"],
    },
    {
      type: "RECALL",
      from: "rag",
      to: "engram",
      label: '{ text: "what is the raft…", top_k: 5 }',
      detail:
        'The Neuron called recall("web", …). "web" is an EngramBinding name, not an address - the Axon resolves it to engram_id "web-memory" and puts that in directed.id.',
      term: ["  ~ recall 'what is the raft consensus algorithm'"],
    },
    {
      type: "RECALLED",
      from: "engram",
      to: "rag",
      label: "0 hits",
      detail:
        "Empty index, so nothing comes back. The coverage test fails and the Neuron goes to the web. That test is two numbers in config.py - MEMORY_HITS and MIN_COVERAGE.",
      term: ["    -> 0 hit(s)"],
    },
    {
      type: "TOOL_CALL",
      from: "rag",
      to: "web",
      label: 'search { query: "what is the raft…", max_results: 5 }',
      detail:
        'call_tool("web", tool="search", …). Same binding trick: "web" resolves to effector_id "web-effector". The Axon only permits the two tool names the binding lists.',
      term: [
        '  * search {"query": "what is the raft consensus algorithm", "max_results": 5}',
      ],
    },
    {
      type: "TOOL_RESULT",
      from: "web",
      to: "rag",
      label: "5 results",
      detail:
        "web-node serviced the call. The Effector wraps a DuckDuckGo MCP server it spawned lazily on this first call - the Neuron never learns that.",
    },
    {
      type: "TOOL_CALL",
      from: "rag",
      to: "web",
      label: `fetch { url: "${RAFT}" }`,
      detail:
        "One fetch per result URL. Same Effector, second tool - reading a page and searching for one are the same boundary.",
      term: [`  * fetch {"url": "${RAFT}", "max_length": 6000}`],
    },
    {
      type: "TOOL_RESULT",
      from: "web",
      to: "rag",
      label: "5,812 chars",
      detail: "The page, stripped to readable text by the MCP server.",
    },
    {
      type: "TOOL_CALL",
      from: "rag",
      to: "web",
      label: `fetch { url: "${WIKI}" }`,
      detail: "Second result.",
      term: [`  * fetch {"url": "${WIKI}", "max_length": 6000}`],
    },
    {
      type: "TOOL_RESULT",
      from: "web",
      to: "rag",
      label: "6,000 chars",
      detail: "Clamped at max_length.",
    },
    {
      type: "TOOL_CALL",
      from: "rag",
      to: "web",
      label: `fetch { url: "${PAPER}" }`,
      detail: "Third and last - FETCH_PAGES caps it at three.",
      term: [`  * fetch {"url": "${PAPER}", "max_length": 6000}`],
    },
    {
      type: "TOOL_RESULT",
      from: "web",
      to: "rag",
      label: "6,000 chars",
      detail: "A dead link here would be skipped, not fatal - a 404 is not a failed task.",
    },
    {
      type: "IMPRINT",
      from: "rag",
      to: "engram",
      times: 24,
      label: "op: upsert, merge_key: <url>#<n>",
      detail:
        "One IMPRINT per chunk, fired with await_ack=False - nothing downstream needs the receipt, so the Neuron does not wait. merge_key makes re-reading a page idempotent instead of duplicating it.",
      term: ["  + imprint 24"],
    },
    {
      type: "IMPRINTED",
      from: "engram",
      to: "rag",
      times: 24,
      label: "24 receipts",
      detail:
        "The acks arrive anyway. Nobody is listening for them, which is the point of not awaiting.",
    },
    {
      type: "RECALL",
      from: "rag",
      to: "engram",
      label: '{ text: "what is the raft…", top_k: 5 }',
      detail:
        "The exact same query as the first RECALL. Both paths converge here - the answer never knows whether the passages were seconds old or hours old.",
      term: ["  ~ recall 'what is the raft consensus algorithm'"],
    },
    {
      type: "RECALLED",
      from: "engram",
      to: "rag",
      label: "5 hits",
      detail: "BM25 over the chunks that did not exist ninety Signals ago.",
      term: ["    -> 5 hit(s)"],
    },
    {
      type: "AGENT_OUTPUT",
      from: "rag",
      to: "cli",
      label: "answer + 5 sources",
      detail:
        "The model ran once, on finished passages, and returned. It had no tools, no memory, and no idea any of this happened.",
    },
  ],
  answer: [
    "Raft is a consensus algorithm for managing a replicated log, designed",
    "explicitly to be more understandable than Paxos [1][2]. It separates the",
    "problem into leader election, log replication, and safety, and a cluster",
    "stays available as long as a majority of servers are up [3].",
  ],
  sources: [
    { n: 1, title: "The Raft Consensus Algorithm", url: RAFT, score: "6.412" },
    { n: 2, title: "Raft (algorithm) - Wikipedia", url: WIKI, score: "5.881" },
    {
      n: 3,
      title: "In Search of an Understandable Consensus Algorithm",
      url: PAPER,
      score: "4.907",
    },
  ],
};

export const WARM: Run = {
  id: "warm",
  question: "how does raft elect a leader",
  source: "memory",
  elapsed: "1.1s",
  signals: [
    {
      type: "TASK",
      from: "cli",
      to: "rag",
      label: 'capabilities: ["rag"]',
      detail: "Identical dispatch. The CLI has no idea the engram is warm now.",
      term: ["? how does raft elect a leader"],
    },
    {
      type: "RECALL",
      from: "rag",
      to: "engram",
      label: '{ text: "how does raft elect a leader", top_k: 5 }',
      detail: "Same first move as the cold run.",
      term: ["  ~ recall 'how does raft elect a leader'"],
    },
    {
      type: "RECALLED",
      from: "engram",
      to: "rag",
      label: "5 hits",
      detail:
        "Different question, same subject - the chunks from the last run cover it. Coverage passes, so the whole web branch is skipped.",
      term: ["    -> 5 hit(s)"],
    },
    {
      type: "AGENT_OUTPUT",
      from: "rag",
      to: "cli",
      label: "answer + 5 sources",
      detail:
        "Four Signals instead of sixteen. web-node was never touched - watch it stay dark.",
    },
  ],
  answer: [
    "A leader election starts when a follower's election timeout elapses without",
    "hearing from a leader [2]. It increments its term, becomes a candidate, and",
    "requests votes; a candidate that wins a majority becomes leader, and",
    "randomised timeouts make split votes rare [1][3].",
  ],
  sources: [
    { n: 2, title: "Raft (algorithm) - Wikipedia", url: WIKI, score: "7.203" },
    { n: 1, title: "The Raft Consensus Algorithm", url: RAFT, score: "5.664" },
    {
      n: 3,
      title: "In Search of an Understandable Consensus Algorithm",
      url: PAPER,
      score: "3.918",
    },
  ],
};

export const NODES: Record<
  NodeId,
  { name: string; role: string; hosts: string; tip: string }
> = {
  cli: {
    name: "you",
    role: "terminal",
    hosts: "python cli.py",
    tip: "Not a node - just the prompt you type at. It dispatches through rag-node's Dendrite.",
  },
  rag: {
    name: "rag-node",
    role: "orchestrator",
    hosts: "the rag Axon",
    tip: "Hosts the one Neuron, and doubles as the CLI's orchestrator. A Dendrite that both originates and hosts work is supported, so there is no fourth node.",
  },
  engram: {
    name: "engram-host",
    role: "worker",
    hosts: "web-memory",
    tip: "Hosts the Engram - a BM25 index over page chunks. It answers RECALL and IMPRINT and does nothing else.",
  },
  web: {
    name: "web-node",
    role: "worker",
    hosts: "the web Effector",
    tip: "Hosts the Effector - search and fetch, backed by an MCP server. It answers TOOL_CALL and does nothing else.",
  },
};

/** Which node lights up for a signal type, in the log's colour coding. */
export const SIG_TONE: Record<string, string> = {
  TASK: "task",
  AGENT_OUTPUT: "task",
  RECALL: "mem",
  RECALLED: "mem",
  IMPRINT: "mem",
  IMPRINTED: "mem",
  TOOL_CALL: "tool",
  TOOL_RESULT: "tool",
};
