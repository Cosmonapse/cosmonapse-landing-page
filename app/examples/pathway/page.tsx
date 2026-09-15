import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Pathway - Await, React or Stream",
  description:
    "One primitive, three shapes: await for request/reply, on(SignalType) for reactive callbacks, async iteration for streaming. Plus terminal-scope orchestration.",
  path: "/examples/pathway",
  keywords: [
    ...KW_REACTIVE,
    ...KW_EVENT_DRIVEN,
    "streaming agent output",
    "reactive callbacks",
    "async agent responses",
    "request reply over event bus",
  ],
});

const terminal = CODE["receptors/terminal.py"];

export default function PathwayPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Pathway", path: "/examples/pathway" },
        ]}
      />
      <ExampleDoc
        number="04"
        difficulty="Beginner"
        title="Pathway - three shapes."
        folder="04-pathway"
        namespace="demo"
        runArgs="shapes"
        prismSrc="/prism/pathway.mp4"
        lede={
          <>
            <code className="inline">dispatch</code> returns a Pathway: a handle on one trace that
            can be awaited, subscribed to, or iterated. Every Receptor is built on it. No token
            needed.
          </>
        }
        install={install()}
        run={`$ python brain.py shapes                    # all three, written out by hand
$ python brain.py "ship feature X"          # wait, via the Receptor
$ python brain.py --stream "ship feature X" # iterate, via the Receptor`}
        output={`1) wait    -> {'plan': ['step-1', 'step-2'], 'goal': 'ship feature X'}
2) on      -> {'plan': ['step-1', 'step-2'], 'goal': 'ship feature Y'}
3) iterate -> AGENT_OUTPUT`}
        tree={`04-pathway/
  neurons/planner.py     a plain async function answering "plan"
  receptors/terminal.py  plan (the Receptor's default) + shapes (by hand)
  brain.py               planner-node + terminal-node`}
        sections={[
          {
            eyebrow: "01 · The worker",
            title: "One Axon serves every shape.",
            prose: (
              <p>
                The shapes are all caller-side. The planner answers a TASK the same way however the
                caller chooses to consume the reply.
              </p>
            ),
            snippets: [{ name: "neurons/planner.py", code: stripDocstring(CODE["neurons/planner.py"]) }],
          },
          {
            eyebrow: "02 · Through a Receptor",
            title: "wait is the default, --stream iterates.",
            prose: (
              <p>
                The Receptor routes by capability, so the terminal never names the planner.{" "}
                <code className="inline">python brain.py &quot;...&quot;</code> is request/reply,{" "}
                <code className="inline">--stream</code> walks every Signal on the trace, and{" "}
                <code className="inline">--send</code> fires and forgets.
              </p>
            ),
            snippets: [{ name: "receptors/terminal.py", code: blocks(terminal, ["RECEPTOR", "plan"]) }],
          },
          {
            eyebrow: "03 · By hand",
            title: "await pw.wait() · @pw.on(...) · async for sig in pw.",
            prose: (
              <ul>
                <li>
                  <code className="inline">dispatch_and_wait</code> blocks until the first terminal
                  Signal, closes the Pathway, and returns the Signal.
                </li>
                <li>
                  <code className="inline">dispatch_and_subscribe</code> returns the live Pathway;{" "}
                  <code className="inline">@pw.on(SignalType.X)</code> callbacks fire for this trace
                  only, not the whole namespace.
                </li>
                <li>
                  <code className="inline">async for sig in pw</code> yields every Signal on the
                  trace as it arrives.
                </li>
              </ul>
            ),
            snippets: [{ name: "receptors/terminal.py", code: blocks(terminal, ["shapes"]) }],
          },
          {
            eyebrow: "04 · Two more tools",
            title: "scope=\"terminal\" and observe_pathway.",
            prose: (
              <p>
                <code className="inline">scope=&quot;terminal&quot;</code> delivers only FINAL,
                ERROR, CLARIFICATION and PERMISSION: the caller wakes for a conclusion or a decision,
                while intermediate work is handled peer to peer.{" "}
                <code className="inline">observe_pathway</code> opens a Pathway in observer role on a
                trace someone else started, without emitting a TASK.
              </p>
            ),
            snippets: [
              {
                name: "shapes.py",
                code: `pw = await orch.dispatch(capabilities=["plan"], input={"goal": "..."},
                         scope="terminal", finalize=False)
sig = await pw.wait(timeout_s=60.0)          # FINAL / ERROR / CLARIFICATION / PERMISSION

pw = await monitor.observe_pathway(trace_id="trc_01J...")
assert pw.role == "observer"
async for sig in pw:
    print(sig.type.value)`,
              },
            ],
          },
          {
            eyebrow: "05 · The brain",
            title: "Two nodes.",
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
          },
        ]}
        related={[
          { href: "/examples/building-a-neuron", title: "Building a Neuron", desc: "The smallest program, and the Receptor that wraps the wait shape." },
          { href: "/examples/receptors", title: "Receptors", desc: "One brain, three interfaces, the same three shapes." },
          { href: "/examples/agent", title: "Agent", desc: "scope=\"terminal\" in practice: dispatch once, wait for FINAL." },
        ]}
      />
    </>
  );
}
