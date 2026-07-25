import type { Metadata } from "next";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import ObservabilityClient from "./ObservabilityClient";

export const metadata: Metadata = pageMetadata({
  title: "Agent Observability - Doppler Prism",
  description:
    "Watch a live multi-agent system as it runs. Doppler Prism gives five views - Brain, Constellation, Signal Tree, Signal List, Metrics - over one event stream.",
  path: "/observability",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    "AI agent observability",
    "LLM tracing",
    "multi-agent debugging",
    "agent monitoring tool",
    "distributed tracing for agents",
    "agent event viewer",
  ],
});

export default function ObservabilityPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Doppler Prism</div>
          <h1 className="page-title">Observability</h1>
          <p className="page-sub">
            Prism is a local browser frontend, served by{" "}
            <code className="inline">cosmo doppler --prism</code>. Point it at a running Synapse and
            namespace and it streams every Signal on the wildcard bus  -  then lets you look at that
            same stream five different ways.
          </p>
        </div>
      </header>

      <div className="container">
        {/* Release disclaimer */}
        <div className="obs-disclaimer" role="note">
          <span className="obs-disclaimer-badge">Heads up</span>
          <p>
            <strong>Brain View</strong> ships today in <strong>0.1.8</strong>. Constellation, Signal
            Tree, Signal List, and Metrics arrive in <strong>0.1.9</strong>. Screenshots and
            recordings below are placeholders until each view lands.
          </p>
        </div>

        <ObservabilityClient />
      </div>
    </>
  );
}
