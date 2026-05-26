import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Examples — Cosmonapse",
  description:
    "End-to-end example setups built on Cosmonapse primitives. Copy, run, and adapt each topology for your own agents.",
};

// ---------------------------------------------------------------------------
// Example catalogue
// ---------------------------------------------------------------------------

const examples = [
  {
    slug: "round-robin",
    number: "01",
    tag: "Orchestration",
    title: "Orchestrator + Round Robin",
    description:
      "A Cortex (orchestrator Dendrite) load-balances prompts across two workers in a plain rotation. Slide across five stacks — Python and TypeScript over devsynapse, NATS, and Kafka.",
    primitives: ["Neuron", "Axon", "Dendrite", "Synapse"],
    difficulty: "Beginner",
    accentColor: "var(--accent)",
  },
  {
    slug: "no-orchestrator",
    number: "02",
    tag: "Decentralised",
    title: "No Orchestrator",
    description:
      "Drop the Cortex. Every worker hears every task and runs the same pure owner_of(trace_id), so exactly one claims each — no coordination, no queue. Same five stacks via the slider.",
    primitives: ["Axon", "Dendrite", "Synapse"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
  {
    slug: "capability-routing",
    number: "03",
    tag: "Discovery",
    title: "Capability-based Routing",
    description:
      "A router Dendrite holds a RegistryStore and discovers workers from their REGISTER signals. Each task names a capability; the router finds a live worker that advertises it — no hard-coded ids. Same five stacks via the slider.",
    primitives: ["Axon", "Dendrite", "RegistryStore", "Synapse"],
    difficulty: "Advanced",
    accentColor: "var(--accent-2)",
  },
  {
    slug: "real-world-neurons",
    number: "04",
    tag: "Neuron sources",
    title: "Real-world Neurons (API + MCP)",
    description:
      "A Neuron is anything that interacts with the real world. One Cortex dispatches to an HTTP API (Flask / Express) and a wrapped stdio MCP server through the identical Axon interface. Same five stacks via the slider.",
    primitives: ["Neuron", "Axon", "Dendrite", "Synapse"],
    difficulty: "Intermediate",
    accentColor: "var(--accent-3)",
  },
];

// ---------------------------------------------------------------------------
// Difficulty badge colours
// ---------------------------------------------------------------------------

const difficultyColor: Record<string, string> = {
  Beginner: "rgba(34, 211, 238, 0.15)",
  Intermediate: "rgba(139, 92, 246, 0.15)",
  Advanced: "rgba(244, 114, 182, 0.15)",
};
const difficultyText: Record<string, string> = {
  Beginner: "#67e8f9",
  Intermediate: "#c4b5fd",
  Advanced: "#f9a8d4",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExamplesPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Examples</div>
          <h1 className="page-title">Worked examples.</h1>
          <p className="page-sub">
            End-to-end setups built on the same primitives the{" "}
            <Link href="/quickstart" className="inline-link">
              quickstart
            </Link>{" "}
            introduces. Each example is a small, runnable topology — copy it,
            run it, change one piece at a time.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="examples-grid">
            {examples.map((ex) => (
              <Link
                key={ex.slug}
                href={`/examples/${ex.slug}`}
                className="example-card"
              >
                <div className="example-card-top">
                  <span className="example-num">{ex.number}</span>
                  <span
                    className="example-tag"
                    style={{ color: ex.accentColor }}
                  >
                    {ex.tag}
                  </span>
                </div>

                <h2 className="example-title">{ex.title}</h2>
                <p className="example-desc">{ex.description}</p>

                <div className="example-meta">
                  <div className="example-primitives">
                    {ex.primitives.map((p) => (
                      <span key={p} className="prim-chip">
                        {p}
                      </span>
                    ))}
                  </div>
                  <span
                    className="diff-badge"
                    style={{
                      background: difficultyColor[ex.difficulty],
                      color: difficultyText[ex.difficulty],
                    }}
                  >
                    {ex.difficulty}
                  </span>
                </div>

                <div className="example-cta">
                  View example <span className="arrow">→</span>
                </div>
              </Link>
            ))}

            {/* Placeholder card — drop-zone for the next example */}
            <div className="example-card example-card-empty">
              <div className="empty-icon">+</div>
              <p className="empty-label">More examples coming soon.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom nav */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/quickstart" className="card">
              <div className="card-icon">→</div>
              <h3>Quickstart</h3>
              <p>The single-worker walkthrough that precedes these examples.</p>
            </Link>
            <Link href="/concepts" className="card">
              <div className="card-icon">→</div>
              <h3>Concepts</h3>
              <p>
                Neuron, Axon, Dendrite, Synapse — what each one is and isn&apos;t.
              </p>
            </Link>
            <Link href="/docs" className="card">
              <div className="card-icon">→</div>
              <h3>API reference</h3>
              <p>Complete SDK and CLI reference for every primitive.</p>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        /* ── Example catalogue grid ── */
        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        /* Real example card */
        .example-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }
        .example-card:hover {
          border-color: rgba(139, 92, 246, 0.45);
          transform: translateY(-3px);
          box-shadow: 0 20px 50px -20px rgba(139, 92, 246, 0.35);
        }

        .example-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .example-num {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 11px;
          color: var(--text-faint);
          letter-spacing: 0.1em;
        }
        .example-tag {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .example-title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: var(--text);
          margin: 0;
        }
        .example-desc {
          font-size: 14px;
          color: var(--text-dim);
          line-height: 1.65;
          flex: 1;
          margin: 0;
        }

        .example-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .example-primitives {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .prim-chip {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 11px;
          color: var(--accent-2);
          background: rgba(34, 211, 238, 0.07);
          border: 1px solid rgba(34, 211, 238, 0.18);
          border-radius: 6px;
          padding: 2px 8px;
        }
        .diff-badge {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          border-radius: 6px;
          padding: 3px 10px;
        }

        .example-cta {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          transition: gap 0.15s;
        }
        .example-card:hover .example-cta { gap: 10px; }
        .example-card:hover .arrow { transform: translateX(2px); }

        /* Empty / coming-soon card */
        .example-card-empty {
          align-items: center;
          justify-content: center;
          border-style: dashed;
          cursor: default;
          opacity: 0.45;
        }
        .example-card-empty:hover {
          transform: none;
          box-shadow: none;
          border-color: var(--border);
        }
        .empty-icon {
          font-size: 28px;
          color: var(--text-faint);
          line-height: 1;
          margin-bottom: 10px;
        }
        .empty-label {
          font-size: 13px;
          color: var(--text-faint);
          text-align: center;
          margin: 0;
        }
      `}</style>
    </>
  );
}
