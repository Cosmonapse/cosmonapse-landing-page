import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, KW_PRODUCT, KW_PLATFORM } from "@/lib/seo";
import { EARLY_ACCESS_FORM_URL } from "@/lib/early-access";

export const metadata: Metadata = pageMetadata({
  title: "Early Access Program",
  description:
    "Build on Cosmonapse before 1.0. Early access members get architecture sessions with the team, and the first 50 accepted members get credits and a standing discount on Cosmonapse Cloud when it goes live. No cost, no exclusivity.",
  path: "/early-access",
  image: "/og/early-access.png",
  keywords: [
    ...KW_PRODUCT,
    ...KW_PLATFORM,
    "Cosmonapse early access",
    "AI agent framework early access",
    "design partner AI agents",
    "agent architecture consulting",
    "build AI agent system with the team",
  ],
});

/** What a member gets out of it. */
const PERKS = [
  {
    name: "Credits and discounts - first 50 only",
    body:
      "Core, Genesis and Prism are Apache 2.0 and free to run locally - that does not change. Cosmonapse Cloud is the part that will eventually be paid, and the first 50 members accepted into the programme get launch credits plus a standing discount on it. Member 51 onward is welcome and gets everything else; the concessions are capped at 50 so they mean something.",
  },
  {
    name: "Architecture sessions with the team",
    body:
      "Live working sessions on your system, not a sales call. We whiteboard the thing you are actually building: where the boundaries go, which parts should be Neurons, what belongs in memory, where a human has to sit in the loop. Subject to availability.",
  },
  {
    name: "A direct line to the roadmap",
    body:
      "0.2.0 is being shaped right now. Rough edges you hit go on the list with your name against them, and you hear back about what happened. Early access is the shortest path from a real workload to a protocol change.",
  },
];

/** The four steps, from form to credits. */
const STEPS = [
  {
    n: "01",
    title: "Apply through the form",
    body:
      "Two minutes. What you are building, the stack you are on, and how far along you are. There is no bar to clear on company size or funding - a solo project with a real problem behind it is exactly the profile.",
  },
  {
    n: "02",
    title: "We read it and reply",
    body:
      "Every application gets a response, including the ones we cannot take. If it is a fit, we come back with times for a first session.",
  },
  {
    n: "03",
    title: "We architect it together",
    body:
      "Remote, roughly an hour, screen and a diagram. We go through the system end to end and leave you with a design you could build on Monday. Framework-agnostic: if Cosmonapse is the wrong tool for what you are doing, we will say so and help you pick the right shape anyway.",
  },
  {
    n: "04",
    title: "Credits land when the platform does",
    body:
      "Your slot, join date and member number are on record from the day you are accepted. If your number is 50 or below, the credits and the standing discount are applied when Cosmonapse Cloud launches - no re-application, no window to miss.",
  },
];

const FIT = [
  {
    name: "A good fit if",
    items: [
      "You have a real system in mind - a product, an internal tool, a research setup - not a tutorial to follow",
      "Multiple models, tools or services have to coordinate, and a single prompt-and-response is clearly not enough",
      "You are comfortable on alpha software and can work around a rough edge instead of being stopped by it",
      "You are willing to say what broke, in enough detail that it can be fixed",
    ],
  },
  {
    name: "Probably not yet if",
    items: [
      "You need a production SLA today - Core is 0.1.12-alpha and the protocol is not frozen until 0.2.0",
      "You are looking for a managed hosted service right now - Cloud is a 0.3.0 target, not a thing you can buy",
      "You want an agent that is one model behind a chat box - you do not need a protocol for that",
      "You cannot share anything at all about what you are building, which makes an architecture session hard to run",
    ],
  },
];

const FAQ = [
  {
    q: "Does it cost anything?",
    a: "No. The programme is free, the sessions are free, and everything you would build on today is open source under Apache 2.0. The credits exist because early members will have spent time on a product that was not finished yet.",
  },
  {
    q: "How firm are the credits?",
    a: "It is a commitment we are putting in writing on a public page, not a signed contract - and we will not attach a date to it, because Cloud and 1.0.0 do not have one. What is fixed is who qualifies: the first 50 members accepted, in the order they were accepted, and that list stops at 50.",
  },
  {
    q: "Do I have to build on Cosmonapse?",
    a: "No. The sessions are about your architecture. Plenty of systems are better served by something else, and we would rather be useful than convert you. If Cosmonapse does end up being the right fit, that is a better outcome for both of us than talking you into it.",
  },
  {
    q: "Who owns what I build?",
    a: "You do. No NDA, no exclusivity, no claim on your code. You are free to talk publicly about the sessions, the product and where it fell short.",
  },
  {
    q: "What happens after the 50 are taken?",
    a: "The programme stays open and the sessions keep running - they are limited by how many hours exist in a week, not by a headcount. What closes at 50 is the credits and the launch discount. Applying early is the only way to be inside that number, which is also why the form asks what you are building rather than just for an email.",
  },
  {
    q: "What happens to my form response?",
    a: "It goes to a Google Form and is read by the team. We do not need your source code or credentials to run a session, and we do not ask for them.",
  },
];

export default function EarlyAccessPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Early Access Program</div>
          <div className="badge">
            <span className="dot" />
            First 50 members only
          </div>
          <h1 className="page-title">Build on Cosmonapse before 1.0.</h1>
          <p className="page-sub">
            Cosmonapse is a research preview being taken to a stable 1.0.0. Early access is for
            people pointing it at a real problem while that happens. You get working sessions with
            the team on your architecture, and the first 50 members accepted also get credits plus
            a standing discount on Cosmonapse Cloud when it goes live. Free to join, sessions
            subject to availability.
          </p>
          <div className="hero-ctas" style={{ marginTop: 28 }}>
            <a
              href={EARLY_ACCESS_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Apply for early access <span className="arrow">→</span>
            </a>
            <Link href="/roadmap" className="btn btn-ghost">
              See the roadmap first
            </Link>
          </div>
        </div>
      </header>

      {/* ── What you get ─────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// What you get</div>
          <h2 className="section-title">Sessions now, credits at launch.</h2>
          <p className="section-sub">
            Two things are on the table. One is worth something today; the other is worth something
            the day the platform ships, and only to the first 50 through the door. Both are aimed
            at the same person - someone building a system that is hard enough to be worth
            designing properly.
          </p>
          <div className="grid-3" style={{ marginTop: 32 }}>
            {PERKS.map((p) => (
              <div className="card" key={p.name}>
                <h3>{p.name}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we ask ──────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container container-narrow">
          <div className="sub-eyebrow">What we ask in return</div>
          <p className="prose">
            Nothing that costs money and nothing that ties your hands. Build something you actually
            need. When it breaks - and at 0.1.x it will - tell us exactly where, with enough detail
            that it can be reproduced. That is the whole arrangement. There is no NDA, no
            exclusivity clause and no requirement to say nice things in public; a blunt write-up of
            what did not work is more useful to us than a testimonial.
          </p>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container container-narrow">
          <div className="sub-eyebrow">How it works</div>
          {STEPS.map((s) => (
            <div className="decision" key={s.n}>
              <div className="decision-num">{s.n}</div>
              <div>
                <h3>{s.title}</h3>
                <div className="decision-body">
                  <p>{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fit ──────────────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// Fit</div>
          <h2 className="section-title">Who this is for.</h2>
          <p className="section-sub">
            The programme is small on purpose, so it is worth being honest about who gets value from
            it and who would be better off waiting for 0.2.0.
          </p>
          <div className="grid-2" style={{ marginTop: 32 }}>
            {FIT.map((f) => (
              <div className="card" key={f.name}>
                <h3>{f.name}</h3>
                <div className="decision-body" style={{ marginTop: 4 }}>
                  <ul>
                    {f.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container container-narrow">
          <div className="sub-eyebrow">Questions worth answering up front</div>
          {FAQ.map((f) => (
            <div className="decision" key={f.q}>
              <div className="decision-num">?</div>
              <div>
                <h3>{f.q}</h3>
                <div className="decision-body">
                  <p>{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-card">
            <h2>Tell us what you are building.</h2>
            <p>
              The form takes about two minutes. If you would rather look before you leap, the
              quickstart runs a two-node system on your machine in a few commands, and the roadmap
              lays out exactly what is shipped and what is not.
            </p>
            <div className="hero-ctas" style={{ marginBottom: 0 }}>
              <a
                href={EARLY_ACCESS_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Apply for early access <span className="arrow">→</span>
              </a>
              <Link href="/core/quickstart" className="btn btn-ghost">
                Try the quickstart
              </Link>
            </div>
            <p
              style={{
                marginTop: 22,
                marginBottom: 0,
                fontSize: 13,
                color: "var(--text-faint)",
              }}
            >
              Concessions are capped at the first 50 members; sessions are subject to
              availability. Prefer email?{" "}
              <a href="mailto:dev@cosmonapse.com" className="inline-link">
                dev@cosmonapse.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
