import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Examples  -  Cosmonapse",
  description:
    "Community-created examples and tutorials showcasing the creative brains other developers have built on Cosmonapse. Submit your own via the Cosmonapse subreddit or dev@cosmonapse.com.",
};

export default function CommunityExamplesPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Community Examples</div>
          <h1 className="page-title">Built by the Community.</h1>
          <p className="page-sub">
            This page will hold community-created examples and tutorials  -  a
            showcase of the creative brains other developers have built on
            Cosmonapse. Real topologies, real Neurons, shared by the people
            wiring them up.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="ce-card">
            <div className="ce-eyebrow">// Coming soon</div>
            <h2 className="ce-title">Nothing here yet  -  but that&rsquo;s where you come in.</h2>
            <p className="ce-desc">
              We&rsquo;re collecting the best community builds to feature here.
              If you&rsquo;ve made something with Cosmonapse  -  an example, a
              tutorial, a clever topology  -  we&rsquo;d love to show it off.
            </p>

            <div className="ce-submit">
              <h3 className="ce-submit-title">Submit your build</h3>
              <p className="ce-submit-desc">There are two ways to send something in:</p>
              <ul className="ce-submit-list">
                <li>
                  Post it to the{" "}
                  <a
                    href="https://www.reddit.com/r/Cosmonapse/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-link"
                  >
                    Cosmonapse subreddit
                  </a>
                </li>
                <li>
                  Or email us at{" "}
                  <a href="mailto:dev@cosmonapse.com" className="inline-link">
                    dev@cosmonapse.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .ce-card {
          background: var(--bg-card, var(--bg-elev));
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px;
          max-width: 720px;
        }
        .ce-eyebrow {
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          color: var(--accent);
          margin-bottom: 12px;
        }
        .ce-title {
          font-size: 24px;
          line-height: 1.25;
          margin: 0 0 12px;
        }
        .ce-desc {
          color: var(--text-dim, var(--text));
          line-height: 1.6;
          margin: 0;
        }
        .ce-submit {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .ce-submit-title {
          font-size: 16px;
          margin: 0 0 8px;
        }
        .ce-submit-desc {
          color: var(--text-dim, var(--text));
          margin: 0 0 12px;
        }
        .ce-submit-list {
          margin: 0;
          padding-left: 20px;
          line-height: 1.9;
          color: var(--text-dim, var(--text));
        }
      `}</style>
    </>
  );
}
