import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Task Bidding - Offer, Bid, Award",
  description:
    "Workers answer a TASK_OFFER with BIDs; the producer picks by first_bid, lowest_cost or highest_confidence and emits TASK_AWARDED. Atomic claim, mixed fleets.",
  path: "/examples/bidding",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    "contract net protocol",
    "agent task auction",
    "agent bidding",
    "cost-aware model routing",
  ],
});

export default function BiddingPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Bidding", path: "/examples/bidding" },
        ]}
      />
      <ExampleDoc
        number="10"
        difficulty="Advanced"
        title="Bidding."
        folder="10-bidding"
        namespace="demo"
        runArgs={`offer "..."`}
        prismSrc="/prism/bidding.mp4"
        lede={
          <>
            Offer work instead of assigning it: TASK_OFFER, BID, TASK_AWARDED, AGENT_OUTPUT. Two
            bidders share a capability but not a price, so the selection strategy decides who wins.
            No token needed.
          </>
        }
        install={install()}
        run={`$ python brain.py offer "... a long article ..."                         # lowest_cost
$ python brain.py offer "... a long article ..." --select highest_confidence
$ python brain.py offer "... a long article ..." --select first_bid`}
        output={`[lowest_cost] winner: summarizer-a
... a long article .......
[highest_confidence] winner: summarizer-b
... a long article .......`}
        tree={`10-bidding/
  neurons/summarizer.py  make_axon(id, cost, eta_ms, confidence) + its bidding policy
  receptors/terminal.py  offer - dispatch_offer, then wait
  brain.py               a node per bidder + terminal-node`}
        sections={[
          {
            eyebrow: "01 · Why",
            title: "Routing covers the homogeneous case.",
            prose: (
              <p>
                <Link href="/examples/capability-routing" className="inline-link">Capability routing</Link>{" "}
                trusts the broker to deliver a TASK once within a queue group of identical workers.
                When workers differ in cost, latency or quality, the producer should choose. Bidding
                is that choice as a protocol: the offer is broadcast, bids come back, one worker is
                awarded, everyone else is declined.
              </p>
            ),
          },
          {
            eyebrow: "02 · The bidders",
            title: "The policy lives next to the Neuron.",
            prose: (
              <p>
                <code className="inline">@axon.host.on_task_offer</code> is a deferred host
                decorator: it is applied to whichever Dendrite hosts the Axon, and registering it
                replaces that node&apos;s automatic bidder. <code className="inline">bid()</code>{" "}
                bypasses the orchestrator role guard, because bidding is a worker announcing it can
                take work, not orchestration.
              </p>
            ),
            snippets: [{ name: "neurons/summarizer.py", code: stripDocstring(CODE["neurons/summarizer.py"]) }],
          },
          {
            eyebrow: "03 · The producer",
            title: "dispatch_offer returns a Pathway.",
            prose: (
              <p>
                Bids are collected for <code className="inline">deadline_ms</code>, then{" "}
                <code className="inline">select</code> picks: <code className="inline">first_bid</code>{" "}
                ends the window at the first bid, <code className="inline">lowest_cost</code> and{" "}
                <code className="inline">highest_confidence</code> drain it. The awarded
                worker&apos;s node turns TASK_AWARDED into an internal TASK, and its AGENT_OUTPUT
                arrives on the Pathway.
              </p>
            ),
            snippets: [
              { name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) },
              {
                name: "on the bus",
                lang: "text",
                code: `terminal-node     --[TASK_OFFER]------------------>  broadcast
summarizer-a      --[BID cost=0.002 conf=0.82]---->  terminal-node
summarizer-b      --[BID cost=0.005 conf=0.97]---->  terminal-node
                                                     (deadline_ms passes, select picks)
terminal-node     --[TASK_AWARDED summarizer-a]--->  bus
terminal-node     --[TASK_DECLINED summarizer-b]-->  bus
summarizer-a      --[AGENT_OUTPUT]---------------->  the Pathway`,
              },
            ],
          },
          {
            eyebrow: "04 · The brain",
            title: "Two bidders, one terminal.",
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
          },
        ]}
        related={[
          { href: "/examples/capability-routing", title: "Capability routing", desc: "The broker-level alternative for identical workers." },
          { href: "/examples/pathway", title: "Pathway", desc: "What dispatch_offer hands back." },
          { href: "/examples/no-orchestrator", title: "No orchestrator", desc: "Claiming work with no producer decision at all." },
        ]}
      />
    </>
  );
}
