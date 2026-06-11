import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Examples  -  Cosmonapse",
  description:
    "End-to-end example setups built on Cosmonapse primitives. Copy, run, and adapt each topology for your own agents.",
};

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

export default function ExamplesPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Examples</div>
          <h1 className="page-title">End-to-End Topologies.</h1>
          <p className="page-sub">
            Runnable example setups built on Cosmonapse primitives. Copy any of
            them, swap the Synapse URL, and adapt for your own agents. Sorted
            by difficulty  -  start with{" "}
            <Link href="/examples/building-a-neuron" className="inline-link">
              Building a Neuron
            </Link>{" "}
            and work down. If you want a guided ten-step track instead, head to{" "}
            <Link href="/examples/tutorials" className="inline-link">
              Tutorials
            </Link>
            .
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="ex-cat-grid">
            {examples.map((e) => (
              <Link
                key={e.slug}
                href={`/examples/${e.slug}`}
                className="ex-cat-card"
                style={{ borderColor: e.accentColor }}
              >
                <div className="ex-cat-head">
                  <span
                    className="ex-cat-number"
                    style={{ color: e.accentColor }}
                  >
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
                <div
                  className="ex-cat-tag"
                  style={{ color: e.accentColor }}
                >
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
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <Link
            href="/examples/tutorials"
            className="ex-cat-cta"
          >
            <div>
              <div className="ex-cat-cta-eyebrow">// New</div>
              <h3 className="ex-cat-cta-title">
                Prefer a guided track?
              </h3>
              <p className="ex-cat-cta-desc">
                Ten tutorials from hello-world in twelve lines to the production
                switch to NATS / Kafka, plus the full cosmo CLI reference, in
                one expandable page.
              </p>
            </div>
            <span className="ex-cat-cta-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </section>

      <style>{`
        .ex-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
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

        .ex-cat-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: linear-gradient(
            180deg,
            rgba(139, 92, 246, 0.12),
            rgba(34, 211, 238, 0.04)
          );
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 12px;
          padding: 24px 28px;
          color: var(--text);
          text-decoration: none;
          transition: border-color 0.15s, transform 0.15s;
        }
        .ex-cat-cta:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.55);
        }
        .ex-cat-cta-eyebrow {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 11px;
          color: var(--accent-2);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .ex-cat-cta-title {
          font-size: 19px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }
        .ex-cat-cta-desc {
          font-size: 13px;
          color: var(--text-dim);
          line-height: 1.6;
          margin: 0;
          max-width: 60ch;
        }
        .ex-cat-cta-arrow {
          font-size: 22px;
          color: var(--accent-2);
          flex-shrink: 0;
        }
        @media (max-width: 560px) {
          .ex-cat-cta {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}
