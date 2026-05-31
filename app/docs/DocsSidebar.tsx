"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_REFS } from "./docsNav";

/**
 * Accordion reference rail. Three entries — Python SDK, TypeScript SDK,
 * cosmo CLI — each a dropdown whose children are that page's sections.
 * Every section is its own route (`${base}/${slug}`). The reference that
 * matches the current path is expanded by default.
 *
 * Imports only plain data (DOC_REFS), so no server content modules are
 * pulled into the client bundle.
 */
export default function DocsSidebar() {
  const pathname = usePathname() || "";
  const activeRef = DOC_REFS.find((r) => pathname.startsWith(r.base));
  const [open, setOpen] = useState<string>(activeRef?.base ?? "/docs/python");

  return (
    <nav className="docs-refnav" aria-label="Documentation reference">
      <div className="docs-toc-title">Reference</div>
      <ul className="docs-refnav-list">
        {DOC_REFS.map((ref) => {
          const isOpen = open === ref.base;
          const onRef = pathname.startsWith(ref.base);
          return (
            <li key={ref.base} className="docs-refnav-item">
              <div className={`docs-refnav-head ${onRef ? "active" : ""}`}>
                <Link href={`${ref.base}/${ref.sections[0].slug}`} className="docs-refnav-link">
                  {ref.label}
                </Link>
                <button
                  type="button"
                  className={`docs-refnav-toggle ${isOpen ? "open" : ""}`}
                  aria-expanded={isOpen}
                  aria-label={`Toggle ${ref.label} sections`}
                  onClick={() => setOpen(isOpen ? "" : ref.base)}
                >
                  <svg viewBox="0 0 10 6" width="11" height="7" aria-hidden="true">
                    <path
                      d="M1 1l4 4 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>

              {isOpen && (
                <ul className="docs-refnav-sub">
                  {ref.sections.map((s) => {
                    const href = `${ref.base}/${s.slug}`;
                    const current = pathname === href;
                    return (
                      <li key={s.slug}>
                        <Link
                          href={href}
                          className={current ? "docs-refnav-current" : ""}
                          aria-current={current ? "page" : undefined}
                        >
                          {s.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
