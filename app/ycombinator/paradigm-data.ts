// ---------------------------------------------------------------------------
// Data for the "Why event-driven" tab.
//
// Every framework claim below is drawn from that project's own documentation
// or engineering blog, linked in `src`. Where a framework already describes
// itself as event-driven, this page says so - the argument here is about the
// SCOPE of the decoupling, not about who gets to use the word.
// ---------------------------------------------------------------------------

export type Paper = {
  cite: string;
  title: string;
  venue: string;
  url: string;
  why: string;
};

export type PaperGroup = { group: string; blurb: string; papers: Paper[] };

// Citations are given as author-year only where the author list was verified;
// otherwise the arXiv identifier is the citation. Nothing here is paraphrased
// from memory - every entry was checked against the publisher or arXiv record.
export const PAPER_GROUPS: PaperGroup[] = [
  {
    group: "Foundations",
    blurb:
      "None of this is new. Agents reacting to messages instead of being called was proposed for AI in 1973, and the vocabulary was settled long before LLMs existed.",
    papers: [
      {
        cite: "Hewitt, Bishop & Steiger, 1973",
        title: "A Universal Modular ACTOR Formalism for Artificial Intelligence",
        venue: "IJCAI-73, pp. 235-245",
        url: "https://www.ijcai.org/Proceedings/73/Papers/027B.pdf",
        why: "The actor model was proposed for AI, in an AI venue, fifty years before the current wave. Everything is an actor; actors communicate only by message. AutoGen v0.4 was rebuilt on this model in 2024.",
      },
      {
        cite: "Erman, Hayes-Roth, Lesser & Reddy, 1980",
        title:
          "The Hearsay-II Speech-Understanding System: Integrating Knowledge to Resolve Uncertainty",
        venue: "ACM Computing Surveys 12(2), pp. 213-253",
        url: "https://dl.acm.org/doi/10.1145/356810.356816",
        why: "The first blackboard system. Independent knowledge sources watch a shared structure and act when they see something they can contribute to - nobody calls them. The ancestor of every 'agents share memory and react' design.",
      },
      {
        cite: "Smith, 1980",
        title:
          "The Contract Net Protocol: High-Level Communication and Control in a Distributed Problem Solver",
        venue: "IEEE Transactions on Computers C-29(12), pp. 1104-1113",
        url: "https://dl.acm.org/doi/10.1109/TC.1980.1675516",
        why: "Task allocation by negotiation rather than assignment: announce the work, collect bids, award it. Cosmonapse's TASK_OFFER / BID / TASK_AWARDED signals are this protocol, and it only works because announcements are broadcast rather than addressed.",
      },
      {
        cite: "Harel & Pnueli, 1985",
        title: "On the Development of Reactive Systems",
        venue: "Logics and Models of Concurrent Systems, NATO ASI Series vol. 13, Springer",
        url: "https://link.springer.com/chapter/10.1007/978-3-642-82453-1_17",
        why: "Where the word 'reactive' gets its technical meaning. A transformational system computes an output from its inputs; a reactive one is defined by how it responds to events - their variety, order, timing and arrival rate. An agent loop is transformational. A bus is not.",
      },
      {
        cite: "Eugster, Felber, Guerraoui & Kermarrec, 2003",
        title: "The Many Faces of Publish/Subscribe",
        venue: "ACM Computing Surveys 35(2), pp. 114-131",
        url: "https://dl.acm.org/doi/10.1145/857076.857078",
        why: "The load-bearing citation for this page. It surveys every pub/sub variant and isolates what they share: decoupling in space, in time, and in synchronisation. Those three are the whole argument.",
      },
    ],
  },
  {
    group: "The other model",
    blurb:
      "Included because the comparison should be winnable by the other side too. This is the lineage most agent graph frameworks descend from.",
    papers: [
      {
        cite: "Malewicz et al., 2010",
        title: "Pregel: A System for Large-Scale Graph Processing",
        venue: "SIGMOD 2010",
        url: "https://dl.acm.org/doi/10.1145/1583991.1584010",
        why: "Vertices compute in lock-step supersteps with a barrier between them, and writes from one step are invisible until the next. LangGraph's execution engine is an implementation of this. It buys determinism and clean checkpoints - genuinely stronger guarantees than a bus gives you.",
      },
    ],
  },
  {
    group: "Event-driven, applied to LLM agents",
    blurb:
      "The current wave, 2025-2026. The direction of travel is consistent: away from one process driving a loop, toward participants reacting to a shared, replayable record.",
    papers: [
      {
        cite: "arXiv:2502.14321, 2025",
        title:
          "Beyond Self-Talk: A Communication-Centric Survey of LLM-Based Multi-Agent Systems",
        venue: "Yan, Zhou, Zhang et al.",
        url: "https://arxiv.org/abs/2502.14321",
        why: "Surveys LLM multi-agent systems by their communication rather than their application domain - architecture, protocols, strategies and paradigms - on the argument that prior surveys overlooked communication as the central design axis. The best single entry point to this literature.",
      },
      {
        cite: "arXiv:2503.07675, ICAPS 2025",
        title:
          "DynTaskMAS: A Dynamic Task Graph-driven Framework for Asynchronous and Parallel LLM-based Multi-Agent Systems",
        venue: "Proc. 35th Int. Conf. on Automated Planning and Scheduling",
        url: "https://arxiv.org/abs/2503.07675",
        why: "The performance argument, measured. Asynchronous parallel execution reports 21-33% lower execution time, resource utilisation up from 65% to 88%, and near-linear throughput scaling to 16 concurrent agents. Sequential loops leave that on the table.",
      },
      {
        cite: "Han & Zhang, 2025",
        title: "Exploring Advanced LLM Multi-Agent Systems Based on Blackboard Architecture",
        venue: "arXiv:2507.01701",
        url: "https://arxiv.org/abs/2507.01701",
        why: "Hearsay-II's idea applied to LLM agents: agents share everything on a blackboard, and which agent acts next is decided by what is currently on it rather than by a fixed workflow. Reports competitive accuracy against static and dynamic baselines while spending fewer tokens.",
      },
      {
        cite: "arXiv:2504.16736, 2025",
        title: "A Survey of AI Agent Protocols",
        venue: "Comprehensive protocol taxonomy",
        url: "https://arxiv.org/abs/2504.16736",
        why: "Frames the problem this whole page is about: there is no standard way for agents to talk to tools or to each other, which is what stops them composing. Proposes a two-axis taxonomy - context-oriented vs inter-agent, general vs domain-specific.",
      },
      {
        cite: "Ehtesham et al., 2025",
        title:
          "A Survey of Agent Interoperability Protocols: MCP, ACP, A2A, and ANP",
        venue: "arXiv:2505.02279",
        url: "https://arxiv.org/abs/2505.02279",
        why: "The four protocols everyone is converging on, compared. Worth reading next to this page because it shows the industry arriving at capability-based discovery and asynchronous messaging from the protocol direction rather than the framework direction.",
      },
      {
        cite: "Balakrishnan et al., 2026",
        title: "LogAct: Enabling Agentic Reliability via Shared Logs",
        venue: "arXiv:2604.07988",
        url: "https://arxiv.org/abs/2604.07988",
        why: "Each agent is a state machine over a shared log, so actions are visible in the log before they execute - they can be vetoed by decoupled voters and recovered consistently after a failure. Reports stopping all unwanted actions on a benchmark at a 3% utility cost.",
      },
      {
        cite: "Nakajima, 2026",
        title:
          "The Log is the Agent: Event-Sourced Reactive Graphs for Auditable, Forkable Agentic Systems",
        venue: "arXiv:2605.21997",
        url: "https://arxiv.org/abs/2605.21997",
        why: "The closest published statement of the thesis on this page: an append-only event log is the source of truth, behaviours react to changes and emit new events, and - in the author's words - no component instructs another. Every run is resumable, forkable and byte-reproducible from its log.",
      },
    ],
  },
  {
    group: "From the frameworks themselves",
    blurb:
      "Not papers. The most useful evidence, because it is a competitor making the argument against their own previous design.",
    papers: [
      {
        cite: "Microsoft Research, 2024",
        title: "AutoGen v0.4: Reimagining the foundation of agentic AI",
        venue: "Microsoft Research blog",
        url: "https://www.microsoft.com/en-us/research/blog/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/",
        why: "A major framework rewrote its foundation onto an event-driven actor model and published why: decoupling delivery from handling, affordances to observe and control agent behaviour, and agents running in separate processes and languages.",
      },
      {
        cite: "LangChain, current",
        title: "Pregel - the LangGraph execution engine",
        venue: "LangGraph API reference",
        url: "https://reference.langchain.com/python/langgraph/pregel/main/Pregel",
        why: "The reference is explicit that nodes never call each other - they communicate through named channels, and the runtime advances in supersteps. Read it before claiming graph frameworks are 'just a loop'; they are not, they are a different well-chosen model.",
      },
    ],
  },
];

export type Row = {
  name: string;
  model: string;
  drives: string;
  across: "yes" | "partial" | "no";
  acrossNote: string;
  src: string;
  self?: boolean;
};

export const COMPARISON: Row[] = [
  {
    name: "LangGraph",
    model:
      "Pregel / BSP. Nodes are actors, edges are channels of shared state; execution advances in supersteps with a barrier between them, checkpointed per node.",
    drives:
      "The graph runtime. It plans which nodes are eligible each superstep, runs them, applies writes, repeats.",
    across: "partial",
    acrossNote:
      "One runtime executes the graph; distribution is a deployment concern rather than part of the execution model.",
    src: "https://reference.langchain.com/python/langgraph/pregel/main/Pregel",
  },
  {
    name: "AutoGen v0.4",
    model:
      "Actor model with typed, asynchronous message passing. Agents compute in response to messages; delivery is decoupled from handling.",
    drives:
      "Nobody centrally. Agents react to messages - this is genuinely event-driven, by design and by its authors' description.",
    across: "yes",
    acrossNote:
      "Explicitly supports agents in separate processes and different languages.",
    src: "https://www.microsoft.com/en-us/research/blog/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/",
  },
  {
    name: "CrewAI",
    model:
      "Crews run tasks by a process - sequential, or hierarchical with a manager agent that delegates and validates. Flows wrap crews in @start / @listen / @router methods.",
    drives:
      "The process for crews; the Flow engine for flows. Flow decorators are event-driven in style, bound method-to-method inside one class.",
    across: "no",
    acrossNote: "Executes in-process; state is threaded and persisted by the Flow.",
    src: "https://docs.crewai.com/",
  },
  {
    name: "OpenAI Agents SDK",
    model:
      "A runner loop. The model emits tool calls, the runner executes them, appends results, and re-runs; a handoff swaps the current agent and loops again.",
    drives:
      "The Runner, explicitly. One run is one logical turn, however many agents and tool calls it contains.",
    across: "no",
    acrossNote: "A run is a single in-process loop.",
    src: "https://openai.github.io/openai-agents-python/running_agents/",
  },
  {
    name: "Mastra",
    model:
      "Graph-based workflow state machines. Steps composed with .then(), .branch(), .parallel(); suspend and resume backed by storage.",
    drives:
      "The workflow engine, following control flow you declared up front. Durable across restarts via stored execution state.",
    across: "no",
    acrossNote: "One engine executes the workflow; durability is via storage, not a bus.",
    src: "https://mastra.ai/",
  },
  {
    name: "Cosmonapse",
    model:
      "Signals on a Synapse. Dendrites subscribe and react; TASKs route by capability rather than by address, and every interaction is one envelope on the wire.",
    drives:
      "Nobody. A node reacts to a Signal and emits the next one. The bus is an adapter - memory, dev TCP, NATS, Kafka.",
    across: "yes",
    acrossNote:
      "Swap the Synapse backend and the same nodes run in separate processes or on separate machines. No agent code changes.",
    src: "/protocol",
    self: true,
  },
];

export type Contrast = {
  q: string;
  rr: string;
  ed: string;
};

export const CONTRASTS: Contrast[] = [
  {
    q: "Who decides what happens next?",
    rr: "The caller. It holds the control flow and asks for each step in order.",
    ed: "The reacting node. It sees something happen and decides for itself whether it has anything to contribute.",
  },
  {
    q: "Who has to know about whom?",
    rr: "The caller needs a reference to the callee - an address, an import, a handle.",
    ed: "Neither. The publisher names a subject or a capability, not a recipient.",
  },
  {
    q: "What happens when you add a participant?",
    rr: "You edit the caller. The control flow grows to mention the new thing.",
    ed: "You start it and it subscribes. Nothing that already exists is edited.",
  },
  {
    q: "What is the unit you can observe?",
    rr: "A stack frame, if you instrument it. The interaction is a function call.",
    ed: "A message. The interaction already IS a durable, inspectable, replayable record.",
  },
  {
    q: "What happens when a step is slow?",
    rr: "The caller blocks, or you hand-roll concurrency around it.",
    ed: "Nothing waits that does not need to. Other reactions proceed on their own.",
  },
  {
    q: "Where can the work run?",
    rr: "Wherever the caller runs, unless you add a transport - at which point you are building a bus.",
    ed: "Anywhere the bus reaches. That is what the bus is.",
  },
];

export const DECOUPLINGS = [
  {
    name: "Space",
    gloss: "The publisher does not know who receives.",
    cosmo:
      'A TASK is dispatched to capabilities=["rag"], never to a node. Whichever Dendrite advertises that capability gets it; run three replicas and the broker load-balances them within a queue group.',
  },
  {
    name: "Time",
    gloss: "Publisher and subscriber need not be running at the same moment.",
    cosmo:
      "An IMPRINT fired with await_ack=False does not wait for the Engram. On a durable backend the Signals outlive the process that emitted them.",
  },
  {
    name: "Synchronisation",
    gloss: "Nobody is blocked waiting on the other's control flow.",
    cosmo:
      "A Dendrite reacts to a Signal and returns. No node is inside another node's call stack, so no node can hold another one open.",
  },
];
