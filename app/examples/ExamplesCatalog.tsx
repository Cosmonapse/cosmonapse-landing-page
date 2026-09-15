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
    number: "02",
    tag: "Foundations",
    title: "Building a Neuron",
    description:
      "The smallest Cosmonapse program: one HF-backed Neuron, one Axon, one terminal Receptor, one TASK, one reply. In-process bus, no broker. Read this first.",
    primitives: ["Neuron", "Axon", "Receptor", "Dendrite"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "round-robin",
    number: "03",
    tag: "Orchestration",
    title: "Round Robin",
    description:
      "A pool of identical workers, a node each, and a terminal that sends every prompt to the next one in line. The rotation is three lines in the interface.",
    primitives: ["Neuron", "Axon", "Receptor", "Dendrite"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "pathway",
    number: "04",
    tag: "Consume",
    title: "Pathway - three shapes",
    description:
      "dispatch returns a Pathway you can await, subscribe to, or iterate. The Receptor's shapes, then the same thing by hand. Plus scope=\"terminal\" and observe_pathway.",
    primitives: ["Pathway", "Dendrite", "Receptor"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "orchestrator-api",
    number: "05",
    tag: "Web integration",
    title: "Orchestrator API",
    description:
      "An HTTP edge for a Neuron: an ApiReceptor with send, wait and stream on one endpoint, or dispatch from the Flask or WSGI app you already run.",
    primitives: ["Receptor", "Dendrite", "Pathway"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "engram-integration",
    number: "06",
    tag: "Shared memory",
    title: "Integrating an Engram",
    description:
      "Bind memory with EngramBinding and call recall() / imprint() from inside the Neuron. The Engram lives on its own node; swap the backend without touching the Neuron.",
    primitives: ["Engram", "EngramBinding", "Axon"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "no-orchestrator",
    number: "07",
    tag: "Decentralised",
    title: "No Orchestrator",
    description:
      "No cortex, no queue. Every peer runs the same pure owner_of(trace_id) and exactly one claims each TASK - no coordination at all.",
    primitives: ["Axon", "Dendrite", "Receptor"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "real-world-neurons",
    number: "08",
    tag: "Neurons and tools",
    title: "Real-world Neurons",
    description:
      "A plain function as a Neuron, the filesystem MCP server as an Effector, and an HTTP Receptor that sends TASKs to one and TOOL_CALLs to the other.",
    primitives: ["Neuron", "Effector", "Receptor", "MCP"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "capability-routing",
    number: "09",
    tag: "Discovery",
    title: "Capability Routing",
    description:
      "Name the capability, never the worker. Routed dispatch hands each TASK to one Dendrite that advertises it; a registry lists who can, right now.",
    primitives: ["Axon", "Dendrite", "RegistryStore"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "bidding",
    number: "10",
    tag: "Atomic claim",
    title: "Bidding - offer, bid, award",
    description:
      "Two priced bidders compete for a TASK_OFFER; the producer picks by first_bid, lowest_cost or highest_confidence and awards the winner.",
    primitives: ["Dendrite", "Pathway", "Axon"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "rag",
    number: "11",
    tag: "Retrieval",
    title: "Full RAG System",
    description:
      "Four Neurons and three Engrams, a node each: hybrid semantic and lexical recall fused by reciprocal rank, an answer cache, a staged pipeline on one trace, a CLI and an API.",
    primitives: ["Neuron", "Engram", "Receptor", "Pathway"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "rag-mcp",
    number: "12",
    tag: "Coding agent",
    title: "RAG + MCP Coding Agent",
    description:
      "A coder Neuron recalls the team style guide, an MCP filesystem Effector writes the file, a runner Effector executes it - retrieve, write, run, one trace.",
    primitives: ["Neuron", "Engram", "Effector", "MCP"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "retry",
    number: "13",
    tag: "Resilience",
    title: "Retry, STOP & Rollback",
    description:
      "Fully offline. run_with_retry re-dispatches a stuck stage after STOPping it; stop_trace(rollback=True) replays the Engram journal to undo a half-finished write.",
    primitives: ["Dendrite", "RetryStrategy", "Engram"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "agent",
    number: "14",
    tag: "Agent",
    title: "Agent - choreographed, no loop",
    description:
      "A Receptor dispatches one TASK and waits for FINAL; each node's on_agent_output handler creates the next. Stock LLM Neurons, MCP Effectors, Engram memory, terminal and chat.",
    primitives: ["Axon", "Effector", "Engram", "Receptor"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "claude-harness",
    number: "15",
    tag: "Coding harness",
    title: "Claude-code-style Harness",
    description:
      "A REPL coding agent that reads, writes, runs shell and delegates to a subagent. Native hermes tool calls through EffectorBindings; the loop is Signals.",
    primitives: ["Axon", "EffectorBinding", "Engram", "MCP"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "rag-cli",
    number: "16",
    tag: "Self-filling memory",
    title: "RAG CLI",
    description:
      "One Neuron, one Engram, one Effector. Recall first; if memory is thin, search and fetch the web, imprint it, answer. Related questions stay offline.",
    primitives: ["Neuron", "Engram", "Effector"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "receptors",
    number: "17",
    tag: "Interfaces",
    title: "Receptors - CLI, API, chat",
    description:
      "One Neuron, three interfaces. A command, a request and a chat turn become the same TASK. Voice is client-side; nothing new crosses the wire.",
    primitives: ["Receptor", "Pathway", "Dendrite"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "simple-chat",
    number: "18",
    tag: "Chat",
    title: "Simple Chat",
    description:
      "The smallest chat app the SDK can express: Axon.huggingface(), one ChatReceptor, two nodes, python brain.py.",
    primitives: ["Axon", "Receptor"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
];

const difficultyBg: Record<Example["difficulty"], string> = {
  Beginner: "rgba(var(--accent2-rgb), 0.12)",
  Intermediate: "rgba(var(--accent-rgb), 0.12)",
  Advanced: "rgba(var(--tag-advanced-rgb), 0.12)",
};
const difficultyText: Record<Example["difficulty"], string> = {
  Beginner: "var(--accent2-soft)",
  Intermediate: "var(--accent-text)",
  Advanced: "var(--tag-advanced)",
};
const difficultyBorder: Record<Example["difficulty"], string> = {
  Beginner: "rgba(var(--accent2-rgb), 0.3)",
  Intermediate: "rgba(var(--accent-rgb), 0.3)",
  Advanced: "rgba(var(--tag-advanced-rgb), 0.3)",
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
            {page * PER_PAGE + 1}-{Math.min((page + 1) * PER_PAGE, examples.length)} of{" "}
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
          background: rgba(var(--fg-rgb), 0.02);
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
          background: var(--bg);
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
          background: rgba(var(--accent-rgb), 0.12);
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
