import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Orchestrator API - FastAPI, Flask, WSGI",
  description:
    "Put an HTTP edge in front of a Neuron: an ApiReceptor with send, wait and stream modes, or dispatch from the Flask or WSGI app you already run.",
  path: "/examples/orchestrator-api",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "FastAPI AI agent",
    "Flask LLM agent",
    "agent HTTP endpoint",
  ],
});

export default function OrchestratorApiPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Orchestrator API", path: "/examples/orchestrator-api" },
        ]}
      />
      <ExampleDoc
        number="05"
        difficulty="Intermediate"
        title="An HTTP edge for a Neuron."
        folder="05-orchestrator-api"
        namespace="api-demo"
        prismSrc="/prism/orchestrator-api.mp4"
        lede={
          <>
            The Neuron never sees HTTP and the web framework never sees the Synapse. The default
            edge is an <code className="inline">ApiReceptor</code>; if you already run Flask or a
            WSGI server, that app dispatches from an orchestrator node of its own.
          </>
        }
        install={install({ pkgs: "'cosmonapse[receptor]' httpx python-dotenv flask", hf: true })}
        run={`$ python brain.py
$ curl -s localhost:8000/ask -H 'content-type: application/json' \\
       -d '{"prompt": "What is a synapse?"}'
$ curl -s localhost:8000/neurons`}
        output={`{"response":"A synapse is the junction where ...","trace_id":"trc_01J..."}
{"neurons":["worker"]}`}
        outputNote="Exact text varies - the model is stochastic."
        tree={`05-orchestrator-api/
  neurons/chat.py        the HF worker
  receptors/api.py       ApiReceptor at POST /ask, plus GET /neurons
  brain.py               worker-node + api-node, and build_edge() for existing apps
  flask_app.py           an app that is already Flask
  wsgi_app.py            raw WSGI, no framework
  handlers_reference.py  orchestrator-side @on_* handlers, for reference`}
        sections={[
          {
            eyebrow: "01 · The worker",
            title: "Nothing about HTTP.",
            snippets: [{ name: "neurons/chat.py", code: stripDocstring(CODE["neurons/chat.py"]) }],
          },
          {
            eyebrow: "02 · The Receptor",
            title: "One endpoint, three shapes.",
            prose: (
              <>
                <p>
                  <code className="inline">ApiReceptor</code> is the edge every hand-rolled FastAPI
                  app used to be: the lifespan, the body model, the 504 on timeout. The body is the
                  TASK input. The same endpoint also accepts{" "}
                  <code className="inline">{`{"input": ..., "mode": "send" | "wait" | "stream"}`}</code>,
                  and <code className="inline">GET /ask/&lt;trace_id&gt;</code> streams a trace
                  someone else started.
                </p>
                <p>
                  <code className="inline">on_result</code> shapes the response.{" "}
                  <code className="inline">route()</code> adds ordinary routes to the same router.
                  On FastAPI already? <code className="inline">app.include_router(RECEPTOR.router)</code>.
                </p>
              </>
            ),
            snippets: [{ name: "receptors/api.py", code: stripDocstring(CODE["receptors/api.py"]) }],
          },
          {
            eyebrow: "03 · The brain",
            title: "A worker node, an api node, and an edge builder.",
            prose: (
              <p>
                <code className="inline">build_edge</code> is for a framework you already run: an
                orchestrator node with no Receptor, which your app dispatches from directly.
              </p>
            ),
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
          },
          {
            eyebrow: "04 · An existing Flask app",
            title: "Sync framework, async node in a thread.",
            prose: (
              <p>
                Flask handlers are synchronous, so the node runs on an asyncio loop in a background
                thread and each request submits a <code className="inline">dispatch_and_wait</code>{" "}
                to it. The app talks to <code className="inline">brain.py</code> over a shared
                synapse; <code className="inline">wsgi_app.py</code> is the same pattern with no
                framework at all.
              </p>
            ),
            snippets: [
              { name: "flask_app.py", code: stripDocstring(CODE["flask_app.py"]) },
              {
                name: "terminal",
                lang: "sh",
                code: `$ cosmo synapse start memory --namespace=api-demo
$ SYNAPSE_URL=cosmo://127.0.0.1:7070 python brain.py        # the worker (and /ask)
$ SYNAPSE_URL=cosmo://127.0.0.1:7070 python flask_app.py    # :5000
$ curl -s localhost:5000/ask -H 'content-type: application/json' -d '{"prompt": "hi"}'`,
              },
            ],
          },
          {
            eyebrow: "05 · Handlers",
            title: "React to the namespace, not just your request.",
            prose: (
              <p>
                <code className="inline">dispatch_and_wait</code> resolves the caller. Decorators on
                an orchestrator node are for everything else: logging, metrics, clarification
                answers, escalations, a live worker roster. Filters narrow them by{" "}
                <code className="inline">neuron=</code>, <code className="inline">capability=</code>{" "}
                or <code className="inline">trace_id=</code>. See also{" "}
                <Link href="/examples/pathway" className="inline-link">Pathway</Link> for
                trace-scoped handlers.
              </p>
            ),
            snippets: [{ name: "handlers_reference.py", code: blocks(CODE["handlers_reference.py"], ["attach_handlers"]) }],
          },
        ]}
        related={[
          { href: "/examples/receptors", title: "Receptors", desc: "CLI, API and chat onto one brain." },
          { href: "/examples/real-world-neurons", title: "Real-world Neurons", desc: "HTTP routes that dispatch TASKs and call Effectors." },
          { href: "/examples/rag", title: "Full RAG system", desc: "An API whose routes run a three-stage pipeline." },
        ]}
      />
    </>
  );
}
