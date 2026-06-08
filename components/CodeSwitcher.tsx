"use client";

import { useState, useEffect } from "react";
import CodeBlock from "./CodeBlock";

type Lang = "python" | "typescript";

type LangBlock = {
  html: string;
  filename?: string;
};

type Props = {
  python: LangBlock;
  typescript: LangBlock;
  variant?: "flat" | "elevated";
  maxWidth?: number | string;
};

const LS_KEY = "cosmo-sdk-lang";

export default function CodeSwitcher({
  python,
  typescript,
  variant = "flat",
  maxWidth,
}: Props) {
  const [lang, setLang] = useState<Lang>("python");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY) as Lang | null;
      if (saved === "python" || saved === "typescript") setLang(saved);
    } catch {
      // no-op: localStorage unavailable (SSR guard)
    }
  }, []);

  const pick = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem(LS_KEY, l);
    } catch {}
  };

  const active = lang === "python" ? python : typescript;

  return (
    <div style={maxWidth ? { maxWidth } : undefined}>
      <div className="lang-toggle" style={{ marginTop: 0, marginBottom: 10 }}>
        {(["python", "typescript"] as const).map((l) => (
          <button key={l} aria-pressed={lang === l} onClick={() => pick(l)}>
            {l === "python" ? "Python" : "TypeScript"}
          </button>
        ))}
      </div>
      <CodeBlock filename={active.filename} html={active.html} variant={variant} />
    </div>
  );
}
