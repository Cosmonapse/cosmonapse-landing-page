"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import mark from "@/app/assets/mark.png";

const GITHUB = "https://github.com/Cosmonapse/cosmonapse-core";

const links = [
  { href: "/protocol", label: "Protocol" },
  { href: "/concepts", label: "Concepts" },
  { href: "/quickstart", label: "Quickstart" },
];

const docsLinks = [
  { href: "/docs/python", label: "Python SDK" },
  { href: "/docs/typescript", label: "TypeScript SDK" },
  { href: "/docs/cli", label: "cosmo CLI" },
];

const trailingLinks = [
  { href: "/examples", label: "Examples" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Nav() {
  const pathname = usePathname();
  const docsActive = pathname?.startsWith("/docs");
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          <Image src={mark} alt="" width={24} height={24} className="logo-mark-img" priority />
          Cosmonapse
        </Link>
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={pathname?.startsWith(l.href) ? "active" : ""}>
                {l.label}
              </Link>
            </li>
          ))}

          {/* Docs dropdown */}
          <li className="nav-dropdown">
            <Link
              href="/docs/python"
              className={`nav-dropdown-trigger ${docsActive ? "active" : ""}`}
              aria-haspopup="true"
            >
              Docs
              <svg
                className="nav-caret"
                viewBox="0 0 10 6"
                width="10"
                height="6"
                aria-hidden="true"
              >
                <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Link>
            <div className="nav-dropdown-menu" role="menu">
              {docsLinks.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  role="menuitem"
                  className={pathname?.startsWith(d.href) ? "active" : ""}
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </li>

          {trailingLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={pathname?.startsWith(l.href) ? "active" : ""}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="nav-star">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
          <Link href="/quickstart" className="nav-cta">
            Get started
            <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
