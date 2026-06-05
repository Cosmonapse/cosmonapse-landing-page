"use client";

import React, { useState } from "react";
import CodeBlock from "./CodeBlock";

// ---------------------------------------------------------------------------
// The five real language × transport combinations.
//
// The TypeScript SDK ships MemorySynapse + NatsSynapse only  -  the Kafka
// adapter is not ported to TS yet (see packages/ts-sdk/src/index.ts), so
// there is no TS + Kafka tab.
// ---------------------------------------------------------------------------

export type Combo = "py-dev" | "py-nats" | "py-kafka" | "ts-dev" | "ts-nats";

export const COMBOS: { id: Combo; lang: string; transport: string }[] = [
  { id: "py-dev", lang: "Python", transport: "devsynapse" },
  { id: "py-nats", lang: "Python", transport: "NATS" },
  { id: "py-kafka", lang: "Python", transport: "Kafka" },
  { id: "ts-dev", lang: "TypeScript", transport: "devsynapse" },
  { id: "ts-nats", lang: "TypeScript", transport: "NATS" },
];

export type Step = {
  /** Step title WITHOUT a number  -  ComboExample auto-numbers steps. */
  eyebrow: string;
  /** Optional intro prose rendered above the code. */
  prose?: React.ReactNode;
  filename?: string;
  /** Pre-highlighted HTML for the CodeBlock. */
  html: string;
  /** Optional prose rendered *below* the first code block. */
  afterProse?: React.ReactNode;
  /** Optional second code block (e.g. sample output) below afterProse. */
  html2?: string;
  maxWidth?: number;
};

export type ComboData = {
  steps: Step[];
  /** "Extend the pattern" body  -  already combo-specific. */
  extend: React.ReactNode;
};

export default function ComboExample({
  data,
  defaultCombo = "py-dev",
}: {
  data: Record<Combo, ComboData>;
  defaultCombo?: Combo;
}) {
  const [combo, setCombo] = useState<Combo>(defaultCombo);
  const d = data[combo];

  return (
    <>
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Pick your stack</div>
          <p className="prose" style={{ marginBottom: 18, marginTop: 4 }}>
            The same topology, expressed across language and transport. Slide
            between tabs  -  the routing logic never changes; only the imports,
            the synapse you connect to, and how you launch it do.
          </p>
          <div
            className="combo-tabs"
            role="tablist"
            aria-label="Choose language and transport"
          >
            {COMBOS.map((c) => {
              const active = combo === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={active ? "combo-tab active" : "combo-tab"}
                  onClick={() => setCombo(c.id)}
                >
                  <span className="combo-lang">{c.lang}</span>
                  <span className="combo-dot">·</span>
                  <span className="combo-transport">{c.transport}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {d.steps.map((s, i) => (
        <section className="section-sm" key={`${combo}-${i}`}>
          <div className="container">
            <div className="sub-eyebrow">
              {String(i + 1).padStart(2, "0")} · {s.eyebrow}
            </div>
            {s.prose && (
              <p className="prose" style={{ marginBottom: 16 }}>
                {s.prose}
              </p>
            )}
            <CodeBlock
              filename={s.filename}
              html={s.html}
              maxWidth={s.maxWidth ?? 820}
            />
            {s.afterProse && (
              <p className="prose" style={{ marginTop: 16, marginBottom: 16 }}>
                {s.afterProse}
              </p>
            )}
            {s.html2 && <CodeBlock html={s.html2} maxWidth={s.maxWidth ?? 820} />}
          </div>
        </section>
      ))}

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Extend the pattern</div>
          <div className="prose">{d.extend}</div>
        </div>
      </section>

      <style>{`
        .combo-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }
        .combo-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12.5px;
          line-height: 1;
          color: var(--text-dim);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 9px 13px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s,
            transform 0.15s;
        }
        .combo-tab:hover {
          border-color: var(--border-strong);
          color: var(--text);
          transform: translateY(-1px);
        }
        .combo-tab.active {
          color: #fff;
          border-color: rgba(139, 92, 246, 0.55);
          background: linear-gradient(
            180deg,
            rgba(139, 92, 246, 0.16),
            rgba(34, 211, 238, 0.06)
          );
          box-shadow: 0 8px 26px -14px rgba(139, 92, 246, 0.7);
        }
        .combo-lang {
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .combo-dot {
          color: var(--text-faint);
        }
        .combo-tab.active .combo-dot {
          color: var(--accent-2);
        }
        .combo-transport {
          color: inherit;
          opacity: 0.92;
        }
      `}</style>
    </>
  );
}
