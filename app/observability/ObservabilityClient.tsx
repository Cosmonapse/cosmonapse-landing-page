"use client";

import { useState } from "react";
import PrismPreview from "@/components/PrismPreview";

type ViewId = "brain" | "constellation" | "tree" | "list" | "metrics";

type ViewDef = {
  id: ViewId;
  label: string;
  version: "0.1.9";
  tagline: string;
  /** Sub-line shown in the accordion when expanded. */
  blurb: string;
  /** What the view actually renders. */
  what: string[];
  /** Why it's useful. */
  useful: string[];
  /** Placeholder recording path + caption for the media slot. */
  media: { src: string; namespace?: string; caption: string };
};

const VIEWS: ViewDef[] = [
  {
    id: "brain",
    label: "Brain View",
    version: "0.1.9",
    tagline: "The live neural graph",
    blurb: "Watch a running Synapse think in real time.",
    what: [
      "Every Neuron in the namespace is drawn as a node, wired together by its Axons.",
      "Signals fire as particles that travel between Neurons the instant they hit the wildcard bus  -  REGISTER, TASK, AGENT_OUTPUT, FINAL.",
      "A collapsible side panel streams the raw Signal list next to the graph, so you can read payloads while the animation plays.",
    ],
    useful: [
      "Get an intuitive pulse of load and flow without tailing logs.",
      "See exactly which Neuron picked up a TASK  -  and spot one that never registered or never fired.",
      "Demo a live system: the animation makes distributed cognition legible to people who have never read the protocol.",
    ],
    media: {
      src: "/prism/agent.mp4",
      namespace: "agent",
      caption:
        "Brain View  -  Signals pulse between Neurons on the bus as REGISTER, TASK, AGENT_OUTPUT, and FINAL fire.",
    },
  },
  {
    id: "constellation",
    label: "Constellation",
    version: "0.1.9",
    tagline: "The wiring diagram across runs",
    blurb: "The topology your system actually formed  -  not the one you drew.",
    what: [
      "An aggregate run graph: Neurons, Engrams, and Effectors as nodes.",
      "Edges are colored by channel  -  task, tool, recall, imprint, output  -  so memory and tool wiring read at a glance.",
      "Consistency coloring shows how reliably each edge fires across repeated runs.",
    ],
    useful: [
      "Compare the topology your system formed against the one you intended.",
      "Find flaky pathways that only fire on some runs before they bite you in production.",
      "See where memory (recall / imprint) and Effector tool calls actually happen across the whole Synapse.",
    ],
    media: {
      src: "/prism/constellation.jpg",
      caption:
        "Constellation  -  Neurons, Engrams, and Effectors wired by channel, tinted by cross-run consistency.",
    },
  },
  {
    id: "tree",
    label: "Signal Tree",
    version: "0.1.9",
    tagline: "The causal structure of a task",
    blurb: "Follow exactly what caused what, TASK to FINAL.",
    what: [
      "Signals arranged by parent_id into a tree, grouped by task and nested sub-tasks.",
      "Each node is a Signal; each edge is causal parentage  -  the Signal that triggered the next.",
      "Sub-tasks, tool calls, and clarifications nest under the TASK that spawned them.",
    ],
    useful: [
      "Trace a request down through its sub-tasks to the FINAL without reconstructing order by hand.",
      "Pinpoint where a branch stalled, forked, or looped.",
      "Understand causality, not just chronology  -  the shape of the tree is the shape of the reasoning.",
    ],
    media: {
      src: "/prism/signal-tree.mp4",
      caption:
        "Signal Tree  -  Signals nested by parent_id, revealing the causal structure of a task and its sub-tasks.",
    },
  },
  {
    id: "list",
    label: "Signal List",
    version: "0.1.9",
    tagline: "The chronological trace",
    blurb: "The raw record  -  timestamps, payloads, latencies.",
    what: [
      "Signals on a task's own trace(s) in strict time order, with child tasks excluded.",
      "Per-signal durations so you can see where the time went.",
      "A plain, scannable log built for reading exact contents.",
    ],
    useful: [
      "Get precise ordering when you need the ground truth of what happened when.",
      "Copy exact Signal payloads for a bug report or a test fixture.",
      "Spot the slow step by scanning durations down a single trace.",
    ],
    media: {
      src: "/prism/signal-list.jpg",
      caption:
        "Signal List  -  one task's own trace in chronological order, with payloads and per-signal latency.",
    },
  },
  {
    id: "metrics",
    label: "Metrics",
    version: "0.1.9",
    tagline: "Aggregate health & statistics",
    blurb: "Quantify a system instead of eyeballing it.",
    what: [
      "Per-task and system-wide metrics computed from the same Signal stream.",
      "Health, responsiveness, human-in-the-loop (HITL) waits, and memory (recall / imprint) activity.",
      "Participant breakdowns and consistency across repeated runs.",
    ],
    useful: [
      "Catch latency regressions and runs with excessive clarifications early.",
      "See if one Neuron is quietly doing most of the work.",
      "Track reliability over time rather than trusting a single lucky run.",
    ],
    media: {
      src: "/prism/metrics.mp4",
      caption:
        "Metrics  -  health, responsiveness, HITL, memory, and participants aggregated across the run.",
    },
  },
];

export default function ObservabilityClient() {
  const [active, setActive] = useState<ViewId>("brain");
  const [menuOpen, setMenuOpen] = useState(true);
  const view = VIEWS.find((v) => v.id === active)!;

  return (
    <div className="obs-layout">
      {/* ─── Collapsible left rail: list of every Prism view ─── */}
      <aside className={`obs-rail${menuOpen ? "" : " collapsed"}`} aria-label="Prism views">
        <div className="obs-rail-inner">
          <button
            type="button"
            className="obs-rail-title"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 10 6" width="11" height="7" aria-hidden="true" className="obs-chevron">
              <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Views
          </button>

          {menuOpen && (
            <ul className="obs-viewlist">
              {VIEWS.map((v) => {
                const on = v.id === active;
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      className={`obs-viewbtn${on ? " active" : ""}`}
                      aria-current={on ? "true" : undefined}
                      onClick={() => setActive(v.id)}
                    >
                      <span className="obs-viewbtn-label">{v.label}</span>
                      <span className="obs-badge obs-badge-now">
                        {v.version}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ─── Main content: the selected view explained ─── */}
      <main className="obs-content">
        <div className="obs-view-eyebrow">
          <span className="obs-badge obs-badge-now">
            Available in {view.version}
          </span>
        </div>
        <h2 className="obs-view-title">{view.label}</h2>
        <p className="obs-view-tagline">{view.tagline}</p>
        <p className="obs-view-blurb">{view.blurb}</p>

        {/* Media slot  -  leaves spacing for a screenshot or recording. */}
        <PrismPreview src={view.media.src} namespace={view.media.namespace ?? "demo"} caption={view.media.caption} />

        <div className="obs-cols">
          <section className="obs-block">
            <h3>What you see</h3>
            <ul>
              {view.what.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
          <section className="obs-block">
            <h3>Why it&apos;s useful</h3>
            <ul>
              {view.useful.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
