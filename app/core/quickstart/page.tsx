import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import QuickstartTabs from "./QuickstartTabs";

export const metadata: Metadata = pageMetadata({
  title: "Quickstart - Build an Event-Driven AI Agent",
  description:
    "Get an event-driven AI agent running in minutes: wire it by hand with the SDK, or place it on the Genesis canvas and let it write the files.",
  path: "/core/quickstart",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "AI agent quickstart",
    "build an AI agent in Python",
    "agent SDK tutorial",
    "pip install cosmonapse",
    "LLM agent getting started",
  ],
});

export default function QuickstartPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Quickstart</div>
          <h1 className="page-title">First Five Minutes.</h1>
          <p className="page-sub">
            Two ways to get an Axon backed by Hugging Face wired to a Dendrite and talking across a
            local Synapse. <strong>Core</strong> builds it by hand, one file at a time, so you see
            every wire. <strong>Genesis</strong> builds the same thing on a canvas. No Docker. No
            running broker. Just <code className="inline">pip install</code> and a few minutes.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <QuickstartTabs />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">// What to read next</div>
          <div className="grid-3">
            <Link href="/core/protocol" className="card">
              <div className="card-icon">→</div>
              <h3>Envelope spec</h3>
              <p>The canonical wire format. Every field, every message type, validation rules.</p>
            </Link>
            <Link href="/core/concepts" className="card">
              <div className="card-icon">→</div>
              <h3>Concepts</h3>
              <p>The full Core vocabulary, grouped by the job each primitive does.</p>
            </Link>
            <Link href="/roadmap" className="card">
              <div className="card-icon">→</div>
              <h3>Roadmap</h3>
              <p>
                v0.1 manual SDK · v0.2 Axon-as-MCP · v0.3 declarative router · v0.4 router agent.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
