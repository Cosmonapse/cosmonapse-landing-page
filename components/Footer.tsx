import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <span className="logo-mark" aria-hidden />
              Cosmonapse
            </Link>
            <p>
              Distributed cognition protocol for autonomous AI agents. One envelope. One channel. Replaceable
              neurons.
            </p>
          </div>
          <div className="footer-col">
            <h5>Protocol</h5>
            <ul>
              <li>
                <Link href="/protocol">Envelope spec</Link>
              </li>
              <li>
                <Link href="/concepts">Terminology</Link>
              </li>
              <li>
                <Link href="/decisions">Decisions</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Developers</h5>
            <ul>
              <li>
                <Link href="/quickstart">Quickstart</Link>
              </li>
              <li>
                <Link href="/docs">SDK &amp; CLI docs</Link>
              </li>
              <li>
                <Link href="/roadmap">Roadmap</Link>
              </li>
              <li>
                <a href="#">GitHub</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Project</h5>
            <ul>
              <li>
                <a href="#">Status</a>
              </li>
              <li>
                <a href="#">Changelog</a>
              </li>
              <li>
                <a href="mailto:aqibkhan026@gmail.com">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Cosmonapse — Research preview</span>
          <span>v0.1.0-alpha</span>
        </div>
      </div>
    </footer>
  );
}
