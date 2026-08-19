import type { Metadata } from "next";
import Link from "next/link";
import InstallCommands from "@/components/InstallCommands";
import ProductGrid from "@/components/ProductGrid";
import LineageAttribution from "@/components/diagrams/LineageAttribution";
import ReadOnlyTap from "@/components/diagrams/ReadOnlyTap";
import TwoLegJourney from "@/components/diagrams/TwoLegJourney";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import PrismClient from "./PrismClient";

export const metadata: Metadata = pageMetadata({
  title: "Prism - Observability for AI Systems",
  description:
    "Watch a live event-driven AI system as it runs. Prism turns one Signal stream into five views - Brain, Constellation, Signal Tree, Signal List, Metrics - with no instrumentation.",
  path: "/prism",
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

/**
 * The Metrics sections, as they appear in the tool's own menu. Market /
 * coordination is conditional in the UI - it only renders once something has
 * actually gone out to bid - so it is described that way here too.
 */
const METRICS: { label: string; body: string }[] = [
  {
    label: "Health",
    body: "Tasks completed, failed and still in flight; success rate over decided tasks; retries and escalations.",
  },
  {
    label: "Latency",
    body: "Average, max and count across whole tasks, tool calls and memory operations.",
  },
  {
    label: "Per-task breakdown",
    body: "One row per top-level task, rolled up over every sub-task it spawned.",
  },
  {
    label: "Task time composition",
    body: "Where a task's wall clock went: tool calls, recall, writes, blocked on a person, and the remainder - which is compute.",
  },
  {
    label: "Human in the loop",
    body: "Clarification and permission round-trips, and how often a request was approved rather than denied.",
  },
  {
    label: "Memory effectiveness",
    body: "Read and write volume, latency, write errors, and how often a recall actually returned something.",
  },
  {
    label: "Consistency",
    body: "Whether repeated runs of the same setup produce the same execution graph, scored across every setup that ran twice.",
  },
  {
    label: "Participants",
    body: "Activity per Neuron, Engram, Effector and Receptor - totals, outputs, error rate, capabilities, last seen.",
  },
  {
    label: "Market / coordination",
    body: "Offers, bids per offer, time to award, decline rate and who keeps winning. Only appears if you actually run a bidding system.",
  },
  {
    label: "Longest tool calls",
    body: "The slowest individual TOOL_CALL to TOOL_RESULT round-trips, ranked.",
  },
  {
    label: "Longest memory recalls",
    body: "The slowest individual RECALL to RECALLED round-trips, ranked.",
  },
];

export default function PrismPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Cosmonapse Prism</div>
          <h1 className="page-title">Watch the system think.</h1>
          <p className="page-sub">
            Prism is the observability plane for the suite. It takes the seat a Doppler occupies on
            the bus - a subscriber that joins no queue group, so it competes for nothing and sees
            everything - and turns that one stream into five views: the live graph, the shape of a
            run, the causality behind a task, the raw record, and the numbers.
          </p>
          <div className="hero-ctas" style={{ marginTop: 28 }}>
            <Link href="/core/quickstart" className="btn btn-primary">
              Get it running <span className="arrow">→</span>
            </Link>
            <Link href="/core" className="btn btn-ghost">
              What it reads from
            </Link>
          </div>
          <InstallCommands
            commands={[
              { cmd: "pip install cosmonapse", note: "the cosmo CLI ships with it" },
              { cmd: "cosmo prism", note: "opens on 127.0.0.1:7071" },
            ]}
            caption="ships in 0.1.12 · runs on your machine, connects out to a Synapse"
          />
        </div>
      </header>

      {/* Why tracing is free here */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Why this is different</div>
          <h2 className="section-title">You would have to work to not have a trace.</h2>
          <p className="section-sub">
            In a graph or loop framework, observability is something you add: you wrap calls, thread
            a context object through every layer, and hope nobody forgets on the one path that
            matters. The trace is a parallel artifact you maintain beside the program, and it drifts
            the moment someone adds a branch.
          </p>
          <p className="section-sub" style={{ marginTop: -8 }}>
            An event-driven system has already done the work. Every interaction crossed one bus in
            one envelope format, carrying its own id, its trace and the id of whatever caused it.
            Prism computes everything you see from those three fields and a timestamp. The SDK emits
            nothing extra for observability&rsquo;s sake - there is no instrumentation to add, and no
            way to accidentally leave it out.
          </p>

          <ReadOnlyTap />

          <div className="grid-2">
            <div className="card">
              <h3>Read-only by construction</h3>
              <p>
                Ordinary consumers join a queue group, so exactly one of them gets each message. A
                Doppler joins none, which means it sees every Signal and can never take work away
                from a participant. The bridge is one-way - server to browser, Prism never sends. So
                attaching one to production is not a conversation about blast radius.
              </p>
            </div>
            <div className="card">
              <h3>Causality, not log lines</h3>
              <p>
                Every Signal carries its parent. The Signal Tree reconstructs what caused what from
                TASK to FINAL, with sub-tasks, tool calls and clarifications nested under the step
                that spawned them - and you never passed a trace ID anywhere to get it. Asking
                &ldquo;why did this happen&rdquo; is walking up a tree, not grepping a log.
              </p>
            </div>
            <div className="card">
              <h3>Lineage beats guessing</h3>
              <p>
                A capability-routed run keeps every step on one trace, so &ldquo;whoever spoke
                first&rdquo; would get credit for the whole thing. Prism attributes each Signal to
                the worker of its nearest TASK ancestor instead - which is what makes a handoff read
                correctly, including tasks dispatched undirected, where only the answer reveals who
                took the work.
              </p>
            </div>
            <div className="card">
              <h3>The topology you actually formed</h3>
              <p>
                Constellation draws one run as its execution graph - the Synapse is transport and
                never appears as a node. Run the same setup twice and edges that didn&rsquo;t fire
                every time go dashed, with a structural consistency score behind them. That is a
                question you cannot even ask of a system whose topology is a diagram you drew.
              </p>
            </div>
          </div>

          <LineageAttribution />
        </div>
      </section>

      {/* One vocabulary across the suite */}
      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// Same shapes, three places</div>
          <h2 className="section-title">You are watching the thing you drew.</h2>
          <p className="section-sub">
            A component keeps one silhouette across the whole suite - Neurons are circles, Engrams
            diamonds, Effectors triangles, Receptors cups. You place that shape on the{" "}
            <Link href="/genesis" className="inline-link">Genesis</Link> canvas, it is written into
            your project as a real module, and it is the same shape you watch light up here. Prism
            even gives Receptors their own outer ring, because they are the boundary of the system
            and burying the edge in the middle of the graph would misrepresent it.
          </p>

          <TwoLegJourney />
        </div>
      </section>

      <div className="container">
        <PrismClient />
      </div>

      {/* What metrics really covers */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// Inside Metrics</div>
          <h2 className="section-title">Eleven sections. Nothing measured on purpose.</h2>
          <p className="section-sub">
            Metrics is computed entirely from the rolling Signal buffer. Requests are paired to their
            replies by explicit lineage where it exists and by nearest-earlier match on the same
            trace where it doesn&rsquo;t - so a TOOL_CALL finds its TOOL_RESULT, and a RECALL finds
            its RECALLED, without either side knowing it was being timed.
          </p>
          <div className="usecases">
            {METRICS.map((m) => (
              <div className="usecase" key={m.label}>
                <div className="usecase-title">{m.label}</div>
                <div className="usecase-body">{m.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest limits */}
      <section className="section-sm">
        <div className="container">
          <div className="section-eyebrow">// What it is not</div>
          <h2 className="section-title">A live window, not a data warehouse.</h2>
          <div className="grid-2">
            <div className="card">
              <h3>No cost or token accounting</h3>
              <p>
                Prism measures time, structure and outcome. There is no spend attribution anywhere in
                it today - that is a roadmap item, not something to read between the lines of
                &ldquo;metrics&rdquo;.
              </p>
            </div>
            <div className="card">
              <h3>The buffer is the horizon</h3>
              <p>
                Every view reads the last 500 Signals for that Synapse. That is a deliberate window
                for watching a system work, not a store for querying last Tuesday. If you need
                history, put a Kafka Synapse underneath - the log is durable and replayable, and
                Prism is one of several things that can read it.
              </p>
            </div>
            <div className="card">
              <h3>Composition is approximate</h3>
              <p>
                Task time buckets are summed durations, so overlapping tool calls and recalls can
                sum past the wall clock. The view says so where it shows the numbers rather than
                implying a precision it does not have.
              </p>
            </div>
            <div className="card">
              <h3>It runs locally</h3>
              <p>
                <code className="inline">cosmo prism</code> serves the UI on your machine
                and connects out to a Synapse. There is no hosted collector, no account and nothing
                leaves your network - which is also why there is no retention beyond the buffer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanics */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// How it behaves</div>
          <h2 className="section-title">Built for leaving open.</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Several Synapses at once</h3>
              <p>
                Each Synapse you attach is a tab, and every tab stays mounted and streaming even
                when it isn&rsquo;t on screen - so a background system keeps its socket, its buffer
                and its per-view state. Switching is instant and loses nothing, the set survives a
                refresh, and the URL always points at the tab in front, so a Prism link still means
                exactly one Synapse.
              </p>
            </div>
            <div className="card">
              <h3>Pause, clear, reconnect</h3>
              <p>
                Pause freezes the buffer while the animation keeps playing, so you can stop the list
                scrolling out from under you without losing the live picture. Clear resets it. If the
                bridge drops, Prism reconnects on its own. Every view reads the same buffer, so what
                you see in Metrics is what you can scroll to in the Signal List.
              </p>
            </div>
            <div className="card">
              <h3>Housekeeping stays out of the way</h3>
              <p>
                REGISTER, DEREGISTER, HEARTBEAT and DISCOVER fold into one lifecycle bucket rather
                than cluttering the task view. Memory traffic that arrives on its own trace - an
                imprint fired from a hook, say - gets stitched back onto the task that was in flight
                at the time.
              </p>
            </div>
            <div className="card">
              <h3>Receptors are inferred, not registered</h3>
              <p>
                A Receptor adds no Signal type and no wire format; it emits the same TASK an
                orchestrator always did and marks its authorship in the envelope&rsquo;s metadata.
                Prism synthesises a node from that, which is why the interface a request came in
                through shows up in the graph without the protocol growing to accommodate it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-eyebrow">// The rest of the suite</div>
          <h2 className="section-title">What Prism is watching.</h2>
          <ProductGrid exclude="/prism" />
        </div>
      </section>
    </>
  );
}
