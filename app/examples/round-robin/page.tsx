import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Round Robin - Load-Balanced Agents",
  description:
    "A pool of identical HF worker Neurons and a terminal Receptor that sends each prompt to the next one. No cortex class, no futures. Any transport.",
  path: "/examples/round-robin",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    "agent load balancing",
    "round robin workers",
    "NATS AI agents",
    "Kafka AI agents",
    "scaling LLM workers",
  ],
});

export default function RoundRobinPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Round Robin", path: "/examples/round-robin" },
        ]}
      />
      <ExampleDoc
        number="03"
        difficulty="Beginner"
        title="Round robin."
        folder="03-round-robin"
        namespace="quickstart"
        runArgs="haikus"
        prismSrc="/prism/round-robin.mp4"
        lede={
          <>
            Two identical Hugging Face workers, each its own node with its own id, and a terminal
            that sends every prompt to the next worker in line. The rotation is three lines in the
            interface; the workers never learn it exists.
          </>
        }
        install={install({ pkgs: "cosmonapse httpx python-dotenv", hf: true })}
        run={`$ python brain.py haikus              # four prompts, alternating workers
$ python brain.py "haiku: the sun"     # one prompt, next worker in line
$ python brain.py                      # REPL - every line rotates`}
        output={`worker-a -> Morning light breaks through ...
worker-b -> Silver moon ascends ...
worker-a -> Waves crash on the shore ...
worker-b -> Whispers through the trees ...`}
        outputNote="Exact text varies - the model is stochastic. The alternation does not."
        tree={`03-round-robin/
  config.py              WORKERS = ("worker-a", "worker-b")
  neurons/pool.py        make_axon(worker_id) - same Neuron, different id
  receptors/terminal.py  the rotation
  brain.py               one node per worker + terminal-node`}
        sections={[
          {
            eyebrow: "01 · The pool",
            title: "One Neuron, many ids.",
            prose: (
              <p>
                A factory rather than a module-level <code className="inline">AXON</code>: an Axon
                attaches to exactly one Dendrite, and the brain builds one per worker id.
              </p>
            ),
            snippets: [{ name: "neurons/pool.py", code: stripDocstring(CODE["neurons/pool.py"]) }],
          },
          {
            eyebrow: "02 · The rotation",
            title: "Pick the next id, ask with it.",
            prose: (
              <p>
                A Receptor&apos;s target is usually fixed at construction, but{" "}
                <code className="inline">ask()</code> takes <code className="inline">neuron=</code>{" "}
                or <code className="inline">capabilities=</code> per call. So the command picks the
                next worker from <code className="inline">itertools.cycle</code> and asks it.{" "}
                <code className="inline">ask()</code> opens the Pathway on the trace and resolves on
                that worker&apos;s AGENT_OUTPUT, which is everything the old hand-rolled futures did.
                The commands are <code className="inline">local=True</code> because they choose
                their own target instead of handing an input to the Receptor.
              </p>
            ),
            snippets: [{ name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) }],
          },
          {
            eyebrow: "03 · The brain",
            title: "A node per worker.",
            prose: (
              <p>
                Each worker gets a Dendrite with <code className="inline">dendrite_id</code> set to
                its worker id, so it is separately addressable and separately visible in Prism.
                Moving <code className="inline">worker-b</code> to another machine is running its
                builder there against the same <code className="inline">SYNAPSE_URL</code>.
              </p>
            ),
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
            after: (
              <p>
                No fixed order needed? Give the workers identical capabilities and dispatch with{" "}
                <code className="inline">capabilities=[&quot;chat&quot;]</code>. Dendrites with the
                same capability profile share a queue group and the broker load-balances, as in{" "}
                <Link href="/examples/capability-routing" className="inline-link">capability routing</Link>.
              </p>
            ),
          },
        ]}
        related={[
          { href: "/examples/no-orchestrator", title: "No orchestrator", desc: "Drop the rotation: peers claim work by trace-id hash." },
          { href: "/examples/capability-routing", title: "Capability routing", desc: "Name the capability, let the broker pick the worker." },
          { href: "/examples/bidding", title: "Bidding", desc: "Offer the work and let workers compete on price." },
        ]}
      />
    </>
  );
}
