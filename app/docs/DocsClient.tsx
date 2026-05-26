"use client";

import { useState } from "react";
import Link from "next/link";
import PythonDocs, { pythonToc } from "./python";
import TypeScriptDocs, { typescriptToc } from "./typescript";
import CliDocs, { cliToc } from "./cli";
import type { TocGroup } from "./shared";

type Lang = "python" | "typescript" | "cli";

const LANGS: { id: Lang; label: string }[] = [
  { id: "python", label: "Python" },
  { id: "typescript", label: "TypeScript" },
  { id: "cli", label: "CLI" },
];

const META: Record<Lang, { title: string; sub: React.ReactNode; toc: TocGroup }> = {
  python: {
    title: "Python SDK reference.",
    sub: (
      <>
        Every class, every method, for the <code className="inline">cosmonapse</code> Python package.
        Verified against the source in <code className="inline">packages/python-sdk</code>. If
        something here disagrees with the code, the code wins — open an issue.
      </>
    ),
    toc: pythonToc,
  },
  typescript: {
    title: "TypeScript SDK reference.",
    sub: (
      <>
        The <code className="inline">@cosmonapse/sdk</code> surface — the idiomatic TypeScript port of
        the same protocol. Verified against the source in{" "}
        <code className="inline">packages/ts-sdk</code>. Wire-compatible with the Python SDK.
      </>
    ),
    toc: typescriptToc,
  },
  cli: {
    title: "cosmo CLI reference.",
    sub: (
      <>
        Every command and flag for the <code className="inline">cosmo</code> developer CLI, verified
        against <code className="inline">packages/cli</code>. v0.2 ships{" "}
        <code className="inline">synapse</code>, <code className="inline">doppler</code>, and{" "}
        <code className="inline">validate</code>.
      </>
    ),
    toc: cliToc,
  },
};

export default function DocsClient() {
  const [lang, setLang] = useState<Lang>("python");
  const meta = META[lang];

  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Documentation</div>
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-sub">{meta.sub}</p>

          <div
            className="lang-toggle"
            role="group"
            aria-label="Choose documentation language"
          >
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="container">
        <div className="docs-layout">
          {/* ─── Sticky TOC ─────────────────────────────────────────── */}
          <aside className="docs-toc" aria-label="Documentation contents">
            <div className="docs-toc-inner">
              <div className="docs-toc-group">
                <div className="docs-toc-title">{meta.toc.title}</div>
                <ul>
                  {meta.toc.items.map((item) => (
                    <li key={item.href}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ─── Main content ───────────────────────────────────────── */}
          <main className="docs-content">
            {lang === "python" && <PythonDocs />}
            {lang === "typescript" && <TypeScriptDocs />}
            {lang === "cli" && <CliDocs />}

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
