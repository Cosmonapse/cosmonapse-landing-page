import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Simple Chat - One Neuron, One Receptor",
  description:
    "The smallest chat app the Cosmonapse SDK can express: Axon.huggingface() for the model, a ChatReceptor for the browser, run_brain to serve it.",
  path: "/examples/simple-chat",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "simple AI chat app",
    "Hugging Face chatbot",
    "minimal chat agent",
  ],
});

export default function SimpleChatPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Simple Chat", path: "/examples/simple-chat" },
        ]}
      />
      <ExampleDoc
        number="18"
        difficulty="Beginner"
        title="Simple chat."
        folder="18-simple-chat-hf"
        namespace="simple-chat-hf"
        lede={
          <>
            The smallest chat app the SDK can express: one Axon wrapping a Hugging Face model, one
            ChatReceptor turning a browser turn into a TASK, and a <code className="inline">brain.py</code>{" "}
            that builds two nodes. No config module.
          </>
        }
        install={install({ pkgs: "'cosmonapse[receptor]' python-dotenv", hf: true })}
        run={`$ python brain.py
$ open http://127.0.0.1:8000`}
        tree={`18-simple-chat-hf/
  neurons/assistant.py   Axon.huggingface(...) + a hook that folds chat history in
  receptors/chat.py      the ChatReceptor
  brain.py               worker + edge, run_brain`}
        sections={[
          {
            eyebrow: "01 · The Neuron",
            title: "Axon.huggingface() and one hook.",
            prose: (
              <p>
                <code className="inline">Axon.huggingface()</code> pairs the Axon with a Hugging Face
                Neuron in one call. The ChatReceptor sends prior turns as{" "}
                <code className="inline">history</code>; the model only reads{" "}
                <code className="inline">prompt</code>, so a <code className="inline">before_task</code>{" "}
                hook folds the transcript in before the Neuron runs.
              </p>
            ),
            snippets: [{ name: "neurons/assistant.py", code: stripDocstring(CODE["neurons/assistant.py"]) }],
          },
          {
            eyebrow: "02 · The Receptor",
            title: "A served page, one TASK per turn.",
            snippets: [{ name: "receptors/chat.py", code: stripDocstring(CODE["receptors/chat.py"]) }],
          },
          {
            eyebrow: "03 · The brain",
            title: "Two nodes, even this small.",
            prose: (
              <p>
                A Receptor may only mount on an orchestrator node, because it originates TASKs, so
                the worker and the edge are separate Dendrites. Open the folder in{" "}
                <Link href="/genesis" className="inline-link">Genesis</Link> to run and talk to it
                from the Test tab.
              </p>
            ),
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
          },
        ]}
        related={[
          { href: "/examples/receptors", title: "Receptors", desc: "CLI, API and chat onto one brain." },
          { href: "/examples/building-a-neuron", title: "Building a Neuron", desc: "The same shape with a terminal instead of a browser." },
          { href: "/examples/agent", title: "Agent", desc: "A chat page in front of a choreographed agent." },
        ]}
      />
    </>
  );
}
