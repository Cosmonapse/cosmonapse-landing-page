"use client";

import { useState } from "react";
import PrismPreview from "@/components/PrismPreview";

type ViewId = "brain" | "constellation" | "tree" | "list" | "metrics";

type ViewDef = {
  id: ViewId;
  label: string;
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
    tagline: "The live neural graph",
    blurb: "Watch a running Synapse think in real time.",
    what: [
      "The Synapse sits at the centre as a ringed soma with every participant it has seen orbiting it. Neurons, Engrams and Effectors share the inner ring; Receptors get a ring of their own further out, because they are the boundary of the brain and putting the edge of the system in the middle of it would read wrong.",
      "Each node is tinted by the last Signal type it emitted, so the graph is a heat map of what each participant is currently doing - and anything that has deregistered fades to grey instead of vanishing.",
      "Signals fire as coloured particles the moment they hit the wildcard bus. A request and the reply it provokes are drawn as one two-leg journey - source, through the Synapse, to destination - rather than two unrelated blips, by holding the outbound leg for a few seconds and pairing it with whatever answers on the same trace.",
      "A collapsible side panel streams the raw Signal list beside the graph. It can group by task and pathway or run flat, and any row expands from payload to the full envelope.",
    ],
    useful: [
      "Get an intuitive pulse of load and flow without tailing logs.",
      "See exactly which Neuron picked up a TASK  -  and spot one that never registered, never fired, or quietly deregistered mid-run.",
      "Hover any participant for its kind, capabilities, Signal count and last activity.",
      "Demo a live system: the animation makes distributed cognition legible to people who have never read the protocol.",
    ],
    media: {
      src: "/prism/agent.mp4",
      namespace: "agent",
      caption:
        "Brain View  -  Signals pulse between participants on the bus as REGISTER, TASK, AGENT_OUTPUT and FINAL fire.",
    },
  },
  {
    id: "constellation",
    label: "Constellation",
    tagline: "One run, drawn as its execution graph",
    blurb: "The topology your system actually formed  -  not the one you drew.",
    what: [
      "One node per participant that took part in the run  -  Receptors, Neurons, Engrams, Effectors  -  outlined in red if anything errored there, and carrying its share of the run's activity on hover. The Synapse is transport, so it never appears: when A tool-calls B the envelope crosses the bus, but the edge drawn is A → B.",
      "Edges are typed by channel and coloured accordingly: task (delegation, and the entry edge from the Receptor that started it), tool, recall, imprint, and output for a sub-task's FINAL returning to whoever delegated it. Each edge carries how many requests went along it and how many came back.",
      "Senders are resolved by lineage rather than by trace. Every Signal is attributed to the worker of its nearest TASK ancestor, which is what makes a capability-routed handoff read correctly  -  the whole run lives on one trace, so \"whoever spoke first\" would otherwise be credited with all of it.",
      "Runs are grouped into setups by their task prompt. An edge that did not fire in every run of a setup renders dashed, and the setup carries a consistency score  -  the mean pairwise similarity of its runs' graphs, counting structure only and ignoring load and timing on purpose.",
    ],
    useful: [
      "Compare the topology your system formed against the one you intended.",
      "Find flaky pathways that only fire on some runs before they bite you in production.",
      "See where memory and tool calls actually happen inside a run, rather than where you assume they do.",
      "Prove a refactor did not change the shape of the system: same setup, same graph, consistency stays at 100%.",
    ],
    media: {
      src: "/prism/constellation.jpg",
      caption:
        "Constellation  -  the participants of one run wired by channel, with a structural consistency score across repeated runs.",
    },
  },
  {
    id: "tree",
    label: "Signal Tree",
    tagline: "The causal structure of a task",
    blurb: "Follow exactly what caused what, TASK to FINAL.",
    what: [
      "Every Signal of one task, arranged by parent_id into a tree. Each node is a Signal; each edge is causal parentage  -  the Signal that triggered the next  -  with sub-tasks, tool calls and clarifications nesting under whatever spawned them.",
      "Laid out with a proper tidy-tree algorithm (Reingold-Tilford), so a wide or lopsided run stays readable and nothing overlaps. A simpler layout is one click away when you want children packed tight under their parent instead.",
      "Click any node to open the envelope: id, trace_id, parent_id, directed target and timestamp, with the payload shown by default and the full Signal one toggle away.",
    ],
    useful: [
      "Trace a request down through its sub-tasks to the FINAL without reconstructing order by hand.",
      "Pinpoint where a branch stalled, forked, or looped.",
      "Understand causality, not just chronology  -  the shape of the tree is the shape of the reasoning.",
      "Answer \"why did this happen\" for a single Signal by walking up its ancestors instead of grepping a log.",
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
    tagline: "The chronological record",
    blurb: "The raw trace  -  timestamps, payloads, and a copy you can send someone.",
    what: [
      "Tasks as collapsible rows, each headed by the prompt it started from, its duration, how many Signals it covers, how many child tasks it spawned, and whether it completed, failed or is still in flight.",
      "Inside a task, its own Signals indented by lineage and ordered by time within each level, with child tasks listed separately so one task's record never gets tangled with another's.",
      "Any Signal expands from its payload to the complete envelope, so what you read is exactly what crossed the wire.",
      "A one-click text export of a whole task  -  the full trace, nesting included, as a plain .txt file.",
    ],
    useful: [
      "Get the ground truth of what happened when, in the order it happened.",
      "Attach a complete, readable trace to a bug report instead of pasting screenshots.",
      "Lift an exact payload out of a real run to use as a test fixture.",
      "Scan a list of tasks by duration and status to find the one worth opening.",
    ],
    media: {
      src: "/prism/signal-list.jpg",
      caption:
        "Signal List  -  tasks as collapsible rows with duration and status, expandable to the full envelope of every Signal.",
    },
  },
  {
    id: "metrics",
    label: "Metrics",
    tagline: "Aggregate health and statistics",
    blurb: "Quantify a system instead of eyeballing it.",
    what: [
      "Eleven sections behind one menu: Health, Latency, Per-task breakdown, Task time composition, Human-in-the-loop, Memory effectiveness, Consistency, Participants, Longest tool calls, Longest memory recalls  -  plus Market / coordination, which only appears once something has actually put a task out to bid.",
      "Task time composition splits each task's wall clock into tool calls, recall, writes, time blocked on a person, and the remainder, which is compute. The buckets are summed durations, so they are approximate where operations overlap  -  the view says so rather than implying a precision it doesn't have.",
      "Every number is derived from Signal timestamps and parent links already in the envelope. Requests are paired to replies by explicit lineage where it exists and nearest-earlier match on the same trace where it doesn't, so nothing had to be instrumented to be measured.",
    ],
    useful: [
      "Catch latency regressions and runs with excessive clarifications early.",
      "See if one Neuron is quietly doing most of the work, or quietly producing most of the errors.",
      "Find out whether your memory layer is earning its place  -  recall hit rate is a number, not a feeling.",
      "Track reliability over time rather than trusting a single lucky run.",
    ],
    media: {
      src: "/prism/metrics.mp4",
      caption:
        "Metrics  -  health, latency, task composition, HITL, memory and participants, all derived from the same Signal buffer.",
    },
  },
];

export default function PrismClient() {
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
