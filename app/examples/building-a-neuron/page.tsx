import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc from "@/components/ExampleDoc";
import { brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Building a Neuron",
  description:
    "The smallest Cosmonapse program: one Neuron, one Axon, one Receptor, one TASK, one reply. Runs in-process with python brain.py, no broker to install.",
  path: "/examples/building-a-neuron",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "how to build an AI agent",
    "minimal agent example",
    "first agent tutorial",
  ],
});

export default function BuildingNeuronPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Building a Neuron", path: "/examples/building-a-neuron" },
        ]}
      />
      <ExampleDoc
        number="02"
        difficulty="Beginner"
        title="Building a Neuron."
        folder="02-building-a-neuron"
        namespace="demo"
        runArgs={`"Say hello in one line."`}
        prismSrc="/prism/building-a-neuron.mp4"
        lede={
          <>
            The smallest Cosmonapse program: one LLM Neuron backed by Hugging Face, one Axon, one
            Receptor, one TASK, one reply. Single process, in-process{" "}
            <Link href="/core/concepts" className="inline-link">Synapse</Link>, no broker. Every
            other example adds something to this shape.
          </>
        }
        install={`$ git clone https://github.com/Cosmonapse/cosmonapse-examples
$ pip install cosmonapse httpx python-dotenv
# a Hugging Face token with read scope, in cosmonapse-examples/.env
$ echo "HF_TOKEN=hf_xxxxxxxxxxxxxxxx" >> cosmonapse-examples/.env`}
        run={`$ python brain.py "Say hello to a project called Cosmonapse in one line."
$ python brain.py --stream "..."     # every Signal on the trace as it lands
$ python brain.py                    # a REPL on the same brain`}
        output={`[AGENT_OUTPUT] Hello, Cosmonapse! Glad to have you on the bus.`}
        outputNote="Exact text varies - the model is stochastic."
        tree={`02-building-a-neuron/
  config.py              settings + hf_token()
  neurons/greeter.py     the Neuron and its Axon
  receptors/terminal.py  the interface - a prompt becomes a TASK
  brain.py               greeter-node + terminal-node, run_brain`}
        sections={[
          {
            eyebrow: "01 · The Neuron",
            title: "An LLM, behind the same interface as a function.",
            prose: (
              <>
                <p>
                  A <Link href="/core/concepts" className="inline-link">Neuron</Link> is anything
                  that satisfies <code className="inline">async fn(input, context) → output</code>.{" "}
                  <code className="inline">Neuron(source=&quot;huggingface&quot;, ...)</code> returns
                  an async callable of that shape around any OpenAI-compatible chat endpoint. Switch{" "}
                  <code className="inline">source=&quot;ollama&quot;</code> and nothing else in the
                  program changes.
                </p>
                <p>
                  The <Link href="/core/concepts" className="inline-link">Axon</Link> gives the
                  Neuron an addressable id and capabilities, and turns its return value into a
                  protocol-valid AGENT_OUTPUT Signal. It never touches the Synapse.
                </p>
              </>
            ),
            snippets: [{ name: "neurons/greeter.py", code: stripDocstring(CODE["neurons/greeter.py"]) }],
          },
          {
            eyebrow: "02 · The Receptor",
            title: "A command becomes a TASK.",
            prose: (
              <p>
                A <Link href="/core/concepts" className="inline-link">Receptor</Link> is the
                interface primitive. The command function returns the TASK input; the argparse
                tree, the REPL, <code className="inline">--stream</code> and{" "}
                <code className="inline">--send</code> are derived from it. The default shape is
                request/reply: dispatch, open a Pathway on the trace, wait for the terminal Signal,
                render it.
              </p>
            ),
            snippets: [{ name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) }],
          },
          {
            eyebrow: "03 · The brain",
            title: "Two nodes, one bus.",
            prose: (
              <>
                <p>
                  A <Link href="/core/concepts" className="inline-link">Dendrite</Link> is a
                  node&apos;s attachment to the Synapse: it hosts components, emits REGISTER and
                  HEARTBEAT for them, and routes inbound TASKs. The greeter gets a{" "}
                  <code className="inline">role=&quot;worker&quot;</code> node, which may answer
                  TASKs but not emit them. The Receptor originates TASKs, so it mounts on an
                  orchestrator node of its own.
                </p>
                <p>
                  <code className="inline">run_brain</code> starts every node before serving any
                  interface, so a command can never reach an Axon whose REGISTER has not gone out.
                </p>
              </>
            ),
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
            after: (
              <p>
                Below the builders, <code className="inline">main()</code> opens the synapse
                (in-process unless <code className="inline">SYNAPSE_URL</code> is set) and calls{" "}
                <code className="inline">run_brain(build_greeter(synapse), build_terminal(synapse))</code>.
                That part is the same in every example.
              </p>
            ),
          },
          {
            eyebrow: "04 · Swap the model",
            title: "The endpoint is the only provider-specific line.",
            snippets: [
              {
                name: "neurons/greeter.py",
                code: `endpoint="https://router.huggingface.co"                         # default
endpoint="https://<your-endpoint>.endpoints.huggingface.cloud"  # dedicated HF endpoint
endpoint="http://localhost:8080"                                # local TGI / vLLM / LM Studio

# For Ollama, switch source - same Axon, same brain.
greeter = Neuron(source="ollama", model="llama3")`,
              },
            ],
          },
        ]}
        related={[
          { href: "/examples/engram-integration", title: "Integrating an Engram", desc: "Bind shared memory and call recall() / imprint() from inside the Neuron." },
          { href: "/examples/pathway", title: "Pathway - three shapes", desc: "What the Receptor is built on: wait, subscribe, iterate." },
          { href: "/examples/round-robin", title: "Round robin", desc: "A pool of identical workers and a rotating interface." },
        ]}
      />
    </>
  );
}
