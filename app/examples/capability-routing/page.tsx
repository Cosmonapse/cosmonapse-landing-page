import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Capability-Based Agent Routing",
  description:
    "Name the capability, never the worker. Routed dispatch hands each TASK to one live Neuron that advertises it; a registry lists who can, right now.",
  path: "/examples/capability-routing",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    "agent routing",
    "capability discovery",
    "service registry for agents",
    "dynamic agent dispatch",
  ],
});

const terminal = CODE["receptors/terminal.py"];

export default function CapabilityRoutingPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Capability Routing", path: "/examples/capability-routing" },
        ]}
      />
      <ExampleDoc
        number="09"
        difficulty="Advanced"
        title="Capability routing."
        folder="09-capability-routing"
        namespace="quickstart"
        runArgs="demo"
        prismSrc="/prism/capability-routing.mp4"
        lede={
          <>
            Tasks name the capability they need, never a worker id.{" "}
            <code className="inline">capabilities=[...]</code> publishes on the routed subject and
            the broker delivers the TASK to exactly one Dendrite whose advertised capabilities cover
            it. No token needed.
          </>
        }
        install={install()}
        run={`$ python brain.py demo
$ python brain.py summarize "Neurons are plain functions that..."
$ python brain.py who translate`}
        output={`-> summarize summarizer <- summary: Cosmonapse is an event-driven substrate ...
-> translate translator <- [fr] Hello, world
-> summarize summarizer <- summary: Neurons are plain functions that......`}
        tree={`09-capability-routing/
  neurons/roles.py       summarizer + translator, different capabilities
  receptors/terminal.py  route by capability; who lists providers
  brain.py               a node per role + terminal-node`}
        sections={[
          {
            eyebrow: "01 · The workers",
            title: "Capabilities are advertised, not configured.",
            prose: (
              <p>
                Each Axon&apos;s capabilities ride its REGISTER. Nothing on the calling side keeps a
                list of workers.
              </p>
            ),
            snippets: [{ name: "neurons/roles.py", code: stripDocstring(CODE["neurons/roles.py"]) }],
          },
          {
            eyebrow: "02 · Routed dispatch",
            title: "ask(..., capabilities=[...]).",
            prose: (
              <p>
                The terminal holds no ids. Identical capability profiles share a queue group, so two
                summarizers would load-balance and each TASK is still delivered once. The rendered
                reply shows <code className="inline">sig.directed.id</code>: who actually answered.
              </p>
            ),
            snippets: [{ name: "receptors/terminal.py", code: blocks(terminal, ["RECEPTOR", "render", "summarize", "translate", "demo"]) }],
          },
          {
            eyebrow: "03 · Discovery",
            title: "Who can do this, right now?",
            prose: (
              <p>
                Routing does not need a registry; listing does. A node with a{" "}
                <code className="inline">registry_store</code> folds REGISTER, HEARTBEAT and
                DEREGISTER into a live view that <code className="inline">find_neurons</code> reads.
                REGISTER rides the bus like any Signal, so a fresh process polls briefly.
              </p>
            ),
            snippets: [
              { name: "receptors/terminal.py", code: blocks(terminal, ["who"]) },
              { name: "brain.py", code: brainBuilders(CODE["brain.py"]) },
            ],
          },
        ]}
        related={[
          { href: "/examples/bidding", title: "Bidding", desc: "When capability profiles overlap: offer, bid, award." },
          { href: "/examples/round-robin", title: "Round robin", desc: "Addressed dispatch across a fixed pool." },
          { href: "/examples/agent", title: "Agent", desc: "A whole agent chained by capability-routed TASKs." },
        ]}
      />
    </>
  );
}
