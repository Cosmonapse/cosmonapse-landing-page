import type { Metadata } from "next";
import Link from "next/link";
import ExamplesCatalog from "./ExamplesCatalog";

export const metadata: Metadata = {
  title: "Examples  -  Cosmonapse",
  description:
    "End-to-end example setups built on Cosmonapse primitives. Copy, run, and adapt each topology for your own agents.",
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
          <ExamplesCatalog />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <Link href="/examples/tutorials" className="ex-cat-cta">
            <div>
              <div className="ex-cat-cta-eyebrow">// New</div>
              <h3 className="ex-cat-cta-title">Prefer a guided track?</h3>
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
