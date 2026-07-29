import type { Metadata } from "next";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS, KW_REACTIVE } from "@/lib/seo";
import ExamplesCatalog from "./ExamplesCatalog";

export const metadata: Metadata = pageMetadata({
  title: "Event-Driven Multi-Agent Examples",
  description:
    "Runnable agent topologies: capability routing, task bidding, orchestrator-free choreography, RAG pipelines, MCP tool agents, retries and rollback.",
  path: "/examples",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    ...KW_HARNESS,
    "multi-agent examples",
    "AI agent code examples",
    "agent topology patterns",
    "RAG example code",
    "MCP agent example",
  ],
});

// NOTE: The examples catalog and CTA are intentionally hidden while the
// Cosmonapse primitives/SDK undergo a rework. The underlying example pages
// and code (ExamplesCatalog, subpage routes, client components) are left
// untouched so this can be reverted by restoring the catalog + CTA sections
// below once examples are redone.
export default function ExamplesPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Examples</div>
          <h1 className="page-title">Examples Are Being Reworked.</h1>
          <p className="page-sub">
            The Cosmonapse primitives and SDK are currently going through a
            rework. The examples on this page are out of date and are being
            redone to match the new APIs. Check back soon.
          </p>
        </div>
      </header>

      {/* Hidden while primitives/SDK rework is in progress:
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
      */}

      <style>{`
        .ex-cat-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: linear-gradient(
            180deg,
            rgba(var(--accent-rgb), 0.12),
            rgba(var(--accent2-rgb), 0.04)
          );
          border: 1px solid rgba(var(--accent-rgb), 0.35);
          border-radius: 12px;
          padding: 24px 28px;
          color: var(--text);
          text-decoration: none;
          transition: border-color 0.15s, transform 0.15s;
        }
        .ex-cat-cta:hover {
          transform: translateY(-2px);
          border-color: rgba(var(--accent-rgb), 0.55);
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
