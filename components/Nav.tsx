"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/protocol", label: "Protocol" },
  { href: "/concepts", label: "Concepts" },
  { href: "/quickstart", label: "Quickstart" },
  { href: "/docs", label: "Docs" },
  { href: "/examples", label: "Examples" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden />
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
        </ul>
        <Link href="/quickstart" className="nav-cta">
          Get started
          <span className="arrow">→</span>
        </Link>
      </div>
    </nav>
  );
}
