import React from "react";
import Link from "next/link";
import DocsSidebar from "./DocsSidebar";

export type DocsShellProps = {
  title: string;
  sub: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Standalone documentation page frame. The left rail is an accordion of the
 * three SDK references (Python, TypeScript, CLI); each expands to that
 * page's sections, and every section is its own route.
 */
export default function DocsShell({ title, sub, children }: DocsShellProps) {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Documentation</div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{sub}</p>
        </div>
      </header>

      <div className="container">
        <div className="docs-layout">
          {/* ─── Sticky rail: accordion of the three SDK references ─── */}
          <aside className="docs-toc" aria-label="Documentation contents">
            <div className="docs-toc-inner">
              <DocsSidebar />
            </div>
          </aside>

          {/* ─── Main content ─── */}
          <main className="docs-content">
            {children}

            {/* ─── End CTA ─── */}
            <section className="cta-card" style={{ marginTop: 80 }}>
              <h2>Have a feature in mind?</h2>
              <p>
                The protocol, SDKs, and CLI are still pre-1.0. If something here is missing,
                ambiguous, or wrong — open an issue and propose a change. Every breaking change is
                debated in <code className="inline">DECISIONS.md</code> first.
              </p>
              <div className="hero-ctas" style={{ marginBottom: 0 }}>
                <Link href="/quickstart" className="btn btn-primary">
                  Run the quickstart <span className="arrow">→</span>
                </Link>
                <Link href="/protocol" className="btn btn-ghost">
                  Re-read the envelope spec
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
