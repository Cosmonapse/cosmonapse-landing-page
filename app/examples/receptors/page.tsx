import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Receptors - CLI, API and Chat Interfaces",
  description:
    "One brain, three interfaces. CliReceptor, ApiReceptor and ChatReceptor turn a command, a request or a chat turn into the same TASK. Nothing new on the wire.",
  path: "/examples/receptors",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "agent CLI",
    "agent HTTP API",
    "voice chat agent",
    "agent interface layer",
  ],
});

export default function ReceptorsPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Receptors", path: "/examples/receptors" },
        ]}
      />
      <ExampleDoc
        number="17"
        difficulty="Beginner"
        title="Receptors: the interface layer."
        folder="17-receptors"
        namespace="receptors"
        runArgs={`"what is a synapse"`}
        lede={
          <>
            One Neuron, three interfaces. A terminal command, an HTTP request and a chat turn all
            become the same TASK, so the Neuron never learns which edge asked. Neurons think,
            Engrams remember, Effectors act, Receptors listen.
          </>
        }
        install={install({ pkgs: "'cosmonapse[receptor]' httpx python-dotenv", hf: true })}
        run={`$ python smoke_test.py                    # offline - all edges, no token
$ python brain.py "what is a synapse"      # one-shot   -> dispatch_and_wait
$ python brain.py --stream "..."           # one-shot   -> dispatch_and_subscribe
$ python brain.py --send "..."             # one-shot   -> dispatch_task
$ python brain.py ping                     # local command, nothing dispatched
$ python brain.py                          # REPL + http://127.0.0.1:8000

$ curl -s  localhost:8000/run -H 'content-type: application/json' -d '{"input": "what is a synapse"}'
$ curl -sN localhost:8000/run -H 'content-type: application/json' -d '{"input": "...", "mode": "stream"}'`}
        output={`cli    : ['echo(0 prior): hello from the cli']
send   : TASK trc_01J...
stream : ['AGENT_OUTPUT']
chat   : 'echo(0 prior): one' then 'echo(2 prior): two'
api    : wait='echo(0 prior): http' send=True stream=True

OK`}
        outputNote="That is smoke_test.py: the Neuron swapped for an echo, every edge exercised offline."
        tree={`17-receptors/
  neurons/assistant.py   the Neuron - {prompt | message, history?} -> {reply}
  receptors/terminal.py  CliReceptor
  receptors/api.py       ApiReceptor - one endpoint, send / wait / stream
  receptors/chat.py      ChatReceptor - one turn, one dispatch, voice optional
  brain.py               a worker node + a node per interface
  smoke_test.py          offline proof that every edge reaches the Neuron
  RECIPES.md             copy-paste setups for every backend and hook`}
        sections={[
          {
            eyebrow: "01 · The concept",
            title: "One funnel over the dispatch trio.",
            prose: (
              <p>
                A Receptor adds no Signal types and no wire format. It emits the TASK an
                orchestrator always emitted, tagged with <code className="inline">meta.receptor</code>{" "}
                so a trace is attributable to its edge.
              </p>
            ),
            snippets: [
              {
                name: "the trio",
                lang: "text",
                code: `shape    Receptor        Dendrite                  you get
send     rx.send(x)      dispatch_task             the emitted TASK
wait     rx.ask(x)       dispatch + Pathway.wait   the rendered result
stream   rx.stream(x)    dispatch_and_subscribe    a live Pathway`,
              },
            ],
          },
          {
            eyebrow: "02 · CLI",
            title: "The command returns the TASK input.",
            prose: (
              <p>
                Parameters become arguments by signature: no default is positional, a default is a{" "}
                <code className="inline">--flag</code>, a <code className="inline">bool</code> default
                is a switch. <code className="inline">local=True</code> answers on the spot.{" "}
                <code className="inline">on_signal</code> is a progress channel that never changes
                the trace. Compare it with the 232-line <code className="inline">cli.py</code> in{" "}
                <Link href="/examples/rag-cli" className="inline-link">Example 16</Link>.
              </p>
            ),
            snippets: [{ name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) }],
          },
          {
            eyebrow: "03 · API",
            title: "One endpoint, the caller picks the shape.",
            prose: (
              <p>
                <code className="inline">mode</code> in the body selects send, wait or stream (SSE).{" "}
                <code className="inline">GET /run/&lt;trace_id&gt;</code> is a second screen on a trace
                someone else started. Mount it on an existing app with{" "}
                <code className="inline">include_router(RECEPTOR.router)</code>.
              </p>
            ),
            snippets: [{ name: "receptors/api.py", code: stripDocstring(CODE["receptors/api.py"]) }],
          },
          {
            eyebrow: "04 · Chat and voice",
            title: "Voice is client-side.",
            prose: (
              <p>
                The page streams each turn over SSE and keeps per-session history, which rides into
                the TASK as <code className="inline">history</code>. With{" "}
                <code className="inline">voice=True</code> it adds a mic button and read-back through
                the browser&apos;s Web Speech API: no audio dependency in Python, no audio on the
                wire.
              </p>
            ),
            snippets: [
              { name: "receptors/chat.py", code: stripDocstring(CODE["receptors/chat.py"]) },
              { name: "neurons/assistant.py", code: stripDocstring(CODE["neurons/assistant.py"]) },
            ],
          },
          {
            eyebrow: "05 · The brain",
            title: "Interfaces are components.",
            prose: (
              <p>
                Each Receptor mounts on its own orchestrator node. <code className="inline">run_brain</code>{" "}
                serves all of them: the api and chat share <code className="inline">127.0.0.1:8000</code>{" "}
                and are merged onto one app. <code className="inline">:quit</code> closes the REPL and
                the HTTP edges keep serving; Ctrl-C stops the brain.
              </p>
            ),
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
          },
        ]}
        related={[
          { href: "/examples/simple-chat", title: "Simple chat", desc: "One Neuron, one ChatReceptor, nothing else." },
          { href: "/examples/orchestrator-api", title: "Orchestrator API", desc: "The HTTP edge, and dispatching from Flask or WSGI." },
          { href: "/examples/agent", title: "Agent", desc: "Terminal and chat Receptors in front of a choreographed brain." },
        ]}
      />
    </>
  );
}
