"use client";

import React from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Example catalogue  -  sorted by difficulty
// ---------------------------------------------------------------------------

type Example = {
  slug: string;
  number: string;
  tag: string;
  title: string;
  description: string;
  primitives: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  accentColor: string;
};

const examples: Example[] = [
  {
    slug: "building-a-neuron",
    number: "01",
    tag: "Foundations",
    title: "Building a Neuron",
    description:
      "The smallest possible Cosmonapse program  -  one Neuron, one Axon, one Dendrite, one TASK, one reply. Single process, in-memory Synapse, no broker. The example to read first.",
    primitives: ["Neuron", "Axon", "Dendrite", "Synapse", "Pathway"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "orchestrator-api",
    number: "02",
    tag: "Web integration",
    title: "Building an Orchestrator API",
    description:
      "Wire a Dendrite into Flask, FastAPI, Express, or raw WSGI. Your HTTP framework stays at the edge and dispatches TASKs from its route handlers  -  the Neuron never sees HTTP, the framework never sees the Synapse.",
    primitives: ["Dendrite", "Synapse", "Pathway"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "round-robin",
    number: "03",
    tag: "Orchestration",
    title: "Orchestrator + Round Robin",
    description:
      "A Cortex (orchestrator Dendrite) load-balances prompts across two workers in a plain rotation. Slide across five stacks  -  Python and TypeScript over devsynapse, NATS, and Kafka.",
    primitives: ["Neuron", "Axon", "Dendrite", "Synapse"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "pathway",
    number: "04",
    tag: "Consume",
    title: "Pathway  -  three consumption shapes",
    description:
      "One primitive, three faces: await pw.wait() for sequential request/reply, @pw.on(SignalType.X) for reactive trace-scoped callbacks, and async for sig in pw: for streaming. Plus scope=\"terminal\" for decentralised orchestration and observe_pathway() for non-originating watchers.",
    primitives: ["Pathway", "Dendrite", "Synapse"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "engram-integration",
    number: "05",
    tag: "Shared memory",
    title: "Integrating an Engram",
    description:
      "Bind shared memory to a Neuron with EngramBinding. The Neuron calls recall() and imprint() to read and write the bound Engram without ever touching the protocol. Backed by InMemoryEngram; swap for SqliteEngram / PostgresEngram without editing Neuron code.",
    primitives: ["Engram", "EngramBinding", "Axon", "Dendrite"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "no-orchestrator",
    number: "06",
    tag: "Decentralised",
    title: "No Orchestrator",
    description:
      "Drop the Cortex. Every worker hears every task and runs the same pure owner_of(trace_id), so exactly one claims each  -  no coordination, no queue. Same five stacks via the slider.",
    primitives: ["Axon", "Dendrite", "Synapse"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "real-world-neurons",
    number: "07",
    tag: "Neuron sources",
    title: "Real-world Neurons (MCP + web edge)",
    description:
      "A Neuron is anything that interacts with the real world  -  here, a wrapped stdio MCP server. An HTTP API is not a Neuron: your web framework (Flask / Express) stays at the edge and dispatches TASKs from its route handlers via an orchestrator Dendrite. Same five stacks via the slider.",
    primitives: ["Neuron", "Axon", "Dendrite", "Synapse"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "capability-routing",
    number: "08",
    tag: "Discovery",
    title: "Capability-based Routing",
    description:
      "A router Dendrite holds a RegistryStore and discovers workers from their REGISTER signals. Each task names a capability; the router finds a live worker that advertises it  -  no hard-coded ids. Same five stacks via the slider.",
    primitives: ["Axon", "Dendrite", "RegistryStore", "Synapse"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "bidding",
    number: "09",
    tag: "Atomic claim",
    title: "Bidding  -  TASK_OFFER / BID / TASK_AWARDED",
    description:
      "Competitive bidding for capability-routed dispatch. Workers register on_task_offer + call bid(); the producer picks a winner by first_bid, lowest_cost, or highest_confidence and emits TASK_AWARDED. Atomic claim for heterogeneous deployments where queue-group routing falls short.",
    primitives: ["Dendrite", "Pathway", "Synapse"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "rag",
    number: "10",
    tag: "Retrieval",
    title: "Full RAG System",
    description:
      "Retrieval-augmented generation built entirely on Cosmonapse primitives  -  four Neurons across two workers, three Engrams across two hosts, run as a staged retrieve → rerank → generate pipeline on one trace. Hybrid semantic + lexical retrieval fused by reciprocal rank, plus an answer cache shared through one Engram binding.",
    primitives: ["Neuron", "Axon", "Engram", "Pathway"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "rag-mcp",
    number: "11",
    tag: "Coding agent",
    title: "RAG + MCP Coding Agent",
    description:
      "RAG-grounded code generation that lands on disk and runs. A coder Neuron recalls the team style guide from a VectorEngram, an MCP filesystem Neuron writes the file, and a runner Neuron executes it  -  retrieve → write → run, one trace. The model follows rules it was never trained on, supplied entirely by retrieval.",
    primitives: ["Neuron", "Engram", "MCP", "Pathway"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "retry",
    number: "12",
    tag: "Resilience",
    title: "Retry, STOP & Rollback",
    description:
      "Resilience patterns over the RAG primitives, fully offline. run_with_retry re-dispatches a stuck stage on a fresh trace after STOPping the abandoned one; stop_trace cooperatively cancels a whole workflow by trace_id; and stop_trace(rollback=True) replays each Engram's saga journal to undo a half-finished write.",
    primitives: ["Dendrite", "RetryStrategy", "Engram", "Pathway"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "agent",
    number: "13",
    tag: "Agent",
    title: "Agent  -  Choreographed, No Loop",
    description:
      "A capability-routed agent with no supervisor loop. run_agent dispatches ONE TASK and awaits the trace's FINAL; each node's @on_agent_output handler creates the next TASK. Stock LLM / MCP Neurons with behaviour in @before_task / @detects_output hooks, Dendrite-owned recall / imprint memory, and agents that own their tools. A repeat goal answers straight from the Engram.",
    primitives: ["Axon", "Dendrite", "Engram", "MCP", "Pathway"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
];

const difficultyBg: Record<Example["difficulty"], string> = {
  Beginner: "rgba(34, 211, 238, 0.12)",
  Intermediate: "rgba(139, 92, 246, 0.12)",
  Advanced: "rgba(244, 114, 182, 0.12)",
};
const difficultyText: Record<Example["difficulty"], string> = {
  Beginner: "#67e8f9",
  Intermediate: "#c4b5fd",
  Advanced: "#f9a8d4",
};
const difficultyBorder: Record<Example["difficulty"], string> = {
  Beginner: "rgba(34, 211, 238, 0.3)",
  Intermediate: "rgba(139, 92, 246, 0.3)",
  Advanced: "rgba(244, 114, 182, 0.3)",
};

const PER_PAGE = 9;
const FADE_MS = 180;

export default function ExamplesCatalog() {
  const pageCount = Math.ceil(examples.length / PER_PAGE);
  const [page, setPage] = React.useState(0);
  const [leaving, setLeaving] = React.useState(false);
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const goTo = (next: number) => {
    if (next === page || next < 0 || next >= pageCount || leaving) return;
    setLeaving(true);
    timer.current = setTimeout(() => {
      setPage(next);
      setLeaving(false);
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, FADE_MS);
  };

  const visible = examples.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div ref={gridRef} style={{ scrollMarginTop: 96 }}>
      <div
        key={page}
        className={`ex-cat-grid ${leaving ? "is-leaving" : "is-entering"}`}
        aria-live="polite"
      >
        {visible.map((e) => (
          <Link
            key={e.slug}
            href={`/examples/${e.slug}`}
            className="ex-cat-card"
            style={{ borderColor: e.accentColor }}
          >
            <div className="ex-cat-head">
              <span className="ex-cat-number" style={{ color: e.accentColor }}>
                {e.number}
              </span>
              <span
                className="ex-cat-difficulty"
                style={{
                  background: difficultyBg[e.difficulty],
                  color: difficultyText[e.difficulty],
                  borderColor: difficultyBorder[e.difficulty],
                }}
              >
                {e.difficulty}
              </span>
            </div>
            <div className="ex-cat-tag" style={{ color: e.accentColor }}>
              {e.tag}
            </div>
            <h3 className="ex-cat-title">{e.title}</h3>
            <p className="ex-cat-desc">{e.description}</p>
            <div className="ex-cat-primitives">
              {e.primitives.map((p) => (
                <span key={p} className="ex-cat-prim">
                  {p}
                </span>
              ))}
            </div>
            <div className="ex-cat-arrow">
              Open <span aria-hidden>→</span>
            </div>
          </Link>
        ))}
      </div>

      {pageCount > 1 && (
        <nav className="ex-cat-pager" aria-label="Examples pages">
          <button
            type="button"
            className="ex-cat-page-btn"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            ←
          </button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`ex-cat-page-btn ${i === page ? "is-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page ? "page" : undefined}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            className="ex-cat-page-btn"
            onClick={() => goTo(page + 1)}
            disabled={page === pageCount - 1}
            aria-label="Next page"
          >
            →
          </button>
          <span className="ex-cat-page-count">
            {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, examples.length)} of{" "}
            {examples.length}
          </span>
        </nav>
      )}

      <style>{`
        .ex-cat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        }
        .ex-cat-grid.is-leaving {
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
        }
        .ex-cat-grid.is-entering {
          animation: exCatIn 260ms ease both;
        }
        @keyframes exCatIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ex-cat-grid,
          .ex-cat-grid.is-entering {
            animation: none;
            transition: none;
          }
        }
        @media (max-width: 1024px) {
          .ex-cat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .ex-cat-grid {
            grid-template-columns: 1fr;
          }
        }
        .ex-cat-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--bg-card, var(--bg-elev));
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 22px 22px 20px;
          color: var(--text);
          text-decoration: none;
          transition: transform 0.15s, border-color 0.15s, background 0.15s;
        }
        .ex-cat-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.02);
        }
        .ex-cat-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .ex-cat-number {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .ex-cat-difficulty {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ex-cat-tag {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }
        .ex-cat-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .ex-cat-desc {
          font-size: 13px;
          color: var(--text-dim);
          line-height: 1.6;
          margin: 0;
          flex-grow: 1;
        }
        .ex-cat-primitives {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .ex-cat-prim {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 11px;
          padding: 3px 9px;
          border-radius: 6px;
          background: var(--bg, #07080c);
          border: 1px solid var(--border);
          color: var(--text-dim);
        }
        .ex-cat-arrow {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12px;
          color: var(--text-faint);
          margin-top: 6px;
        }
        .ex-cat-card:hover .ex-cat-arrow {
          color: var(--accent-2);
        }

        .ex-cat-pager {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 28px;
        }
        .ex-cat-page-btn {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 13px;
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-card, var(--bg-elev));
          color: var(--text-dim);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .ex-cat-page-btn:hover:not(:disabled):not(.is-active) {
          color: var(--text);
          border-color: var(--accent-2);
        }
        .ex-cat-page-btn.is-active {
          color: var(--accent-2);
          border-color: var(--accent-2);
          background: rgba(139, 92, 246, 0.12);
          cursor: default;
        }
        .ex-cat-page-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .ex-cat-page-count {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12px;
          color: var(--text-faint);
          margin-left: 8px;
        }
        @media (max-width: 640px) {
          .ex-cat-page-count {
            width: 100%;
            text-align: center;
            margin: 6px 0 0;
          }
        }
      `}</style>
    </div>
  );
}
