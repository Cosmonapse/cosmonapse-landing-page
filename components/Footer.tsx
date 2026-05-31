import Link from "next/link";
import Image from "next/image";
import mark from "@/app/assets/mark.png";

const GITHUB = "https://github.com/Cosmonapse/cosmonapse-core";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <Image src={mark} alt="" width={24} height={24} className="logo-mark-img" />
              Cosmonapse
            </Link>
            <p>
              Distributed cognition protocol for autonomous AI agents. One envelope. One channel. Replaceable
              neurons. Open source under the MIT license.
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
            </ul>
          </div>
          <div className="footer-col">
            <h5>Developers</h5>
            <ul>
              <li>
                <Link href="/quickstart">Quickstart</Link>
              </li>
              <li>
                <Link href="/docs">Docs</Link>
              </li>
              <li>
                <Link href="/roadmap">Roadmap</Link>
              </li>
              <li>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Project</h5>
            <ul>
              <li>
                <a href={`${GITHUB}/releases`} target="_blank" rel="noopener noreferrer">
                  Changelog
                </a>
              </li>
              <li>
                <a href={`${GITHUB}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
                  License — MIT
                </a>
              </li>
              <li>
                <a href="mailto:dev@cosmonapse.com">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Community</h5>
            <ul>
              <li>
                <a href="https://discord.gg/PGU5PFy3" target="_blank" rel="noopener noreferrer">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://x.com/Cosmonapse" target="_blank" rel="noopener noreferrer">
                  X / Twitter
                </a>
              </li>
              <li>
                <a href="https://www.reddit.com/r/cosmonapse/" target="_blank" rel="noopener noreferrer">
                  Reddit
                </a>
              </li>
              <li>
                <a href={`${GITHUB}/discussions`} target="_blank" rel="noopener noreferrer">
                  Discussions
                </a>
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
