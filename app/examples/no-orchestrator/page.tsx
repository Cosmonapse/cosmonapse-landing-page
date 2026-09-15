import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "No Orchestrator - Agent Choreography",
  description:
    "Decentralised load distribution with no Cortex: every peer runs the same pure owner_of(trace_id) and claims its share with zero coordination.",
  path: "/examples/no-orchestrator",
  keywords: [
    ...KW_REACTIVE,
    ...KW_EVENT_DRIVEN,
    "decentralised agents",
    "choreography over orchestration",
    "leaderless agent coordination",
    "agents without a supervisor loop",
  ],
});

const brain = CODE["brain.py"];

export default function NoOrchestratorPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "No Orchestrator", path: "/examples/no-orchestrator" },
        ]}
      />
      <ExampleDoc
        number="07"
        difficulty="Intermediate"
        title="No orchestrator."
        folder="07-no-orchestrator"
        namespace="quickstart"
        runArgs="poems"
        prismSrc="/prism/no-orchestrator.mp4"
        lede={
          <>
            No cortex, no queue group, no rotation. The interface drops a TASK addressed to{" "}
            <code className="inline">pool</code>, every peer runs the same pure function over its
            trace id, and only the owner answers.
          </>
        }
        install={install({ pkgs: "cosmonapse httpx python-dotenv", hf: true })}
        run={`$ python brain.py poems        # four prompts - watch who claims each
$ python brain.py "the sun"`}
        output={`worker-b answered: Golden light ascends ...
worker-a answered: Pale moon in the dark ...
worker-a answered: Endless blue expanse ...
worker-b answered: Invisible hands ...`}
        outputNote="Which peer owns a trace depends on its random trace id; the split evens out over many TASKs."
        tree={`07-no-orchestrator/
  config.py              PEERS = ("worker-a", "worker-b")
  neurons/pool.py        make_axon(peer_id) - not attached to a Dendrite
  receptors/terminal.py  neuron="pool"; reports which peer answered
  brain.py               owner_of() + a peer node each`}
        sections={[
          {
            eyebrow: "01 · The claim",
            title: "A pure function every peer agrees on.",
            prose: (
              <>
                <p>
                  <code className="inline">owner_of</code> hashes the trace id onto the peer list.
                  Every peer computes the same answer independently, so exactly one claims each TASK
                  and nobody coordinates. Adding a peer is adding an id to{" "}
                  <code className="inline">PEERS</code>.
                </p>
                <p>
                  The peer observes TASKs with <code className="inline">on_task_signal</code> rather
                  than attaching its Axon, because nothing is addressed to its id. The owner runs{" "}
                  <code className="inline">axon.handle_task</code> itself and publishes the reply on
                  the synapse.
                </p>
              </>
            ),
            snippets: [{ name: "brain.py", code: blocks(brain, ["owner_of", "build_peer"]) }],
          },
          {
            eyebrow: "02 · The interface",
            title: "Drops work in, routes nothing.",
            prose: (
              <p>
                The Receptor addresses <code className="inline">pool</code>, which no Axon is
                attached as. It still resolves, because it waits on the trace, not on a particular
                worker: the owner&apos;s AGENT_OUTPUT carries the same trace id.
              </p>
            ),
            snippets: [
              { name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) },
              { name: "neurons/pool.py", code: stripDocstring(CODE["neurons/pool.py"]) },
            ],
          },
        ]}
        related={[
          { href: "/examples/round-robin", title: "Round robin", desc: "The same pool with the choice made at the interface." },
          { href: "/examples/agent", title: "Agent", desc: "Choreography for a multi-step task: nodes create the next TASK." },
          { href: "/examples/bidding", title: "Bidding", desc: "Peers that compete for work instead of hashing for it." },
        ]}
      />
    </>
  );
}
