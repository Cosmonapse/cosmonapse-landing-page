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
              <Image src={mark} alt="" width={34} height={34} className="logo-mark-img" />
              <span className="brand-word">Cosmonapse</span>
            </Link>
            <p>
              The open protocol for building distributed multi-agent/model harnesses. One envelope. One channel.
              Replaceable neurons. Open source under the Apache 2.0 license.
            </p>
            <a
              href="https://www.producthunt.com/products/cosmonapse?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-cosmonapse"
              target="_blank"
              rel="noopener noreferrer"
              className="ph-badge"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1190534&theme=dark&t=1784041021323"
                alt="Cosmonapse - An agent-to-agent protocol with no god-object orchestrator | Product Hunt"
                width={250}
                height={54}
              />
            </a>
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
                  License  -  Apache 2.0
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
          <span>© 2026 Cosmonapse  -  Research preview</span>
          <span>v0.1.8-alpha</span>
        </div>
      </div>
    </footer>
  );
}
