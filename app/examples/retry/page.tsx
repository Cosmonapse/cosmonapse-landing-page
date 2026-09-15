import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_HARNESS, KW_REACTIVE } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Retry, STOP and Rollback",
  description:
    "Fault tolerance on the event channel: retry a stuck stage on a fresh trace, STOP the abandoned attempt, and roll back a half-finished Engram write. Offline.",
  path: "/examples/retry",
  keywords: [
    ...KW_HARNESS,
    ...KW_REACTIVE,
    "agent error handling",
    "retry with backoff",
    "cancelling an agent run",
    "compensating transactions",
    "resilient AI pipelines",
  ],
});

const terminal = CODE["receptors/terminal.py"];

export default function RetryPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Retry & Rollback", path: "/examples/retry" },
        ]}
      />
      <ExampleDoc
        number="13"
        difficulty="Advanced"
        title="Retry, STOP & rollback."
        folder="13-retry"
        namespace="retry-demo"
        runArgs="all"
        prismSrc="/prism/retry.mp4"
        lede={
          <>
            Three resilience patterns on plain dispatch: retry a stalled stage on a fresh trace,
            STOP the attempt you abandoned, and replay an Engram&apos;s journal to undo a
            half-finished write. Fully offline: no token, no network.
          </>
        }
        install={install()}
        run={`$ python brain.py all          # the three scenarios in order
$ python brain.py retry
$ python brain.py give-up
$ python brain.py rollback`}
        output={`1. retry survives a stalled stage
   attempt 1 stuck (TimeoutError) -> STOP + re-dispatch on a fresh trace
   answer on attempt 2: answer to 'what is a Dendrite?'

2. retry gives up
   gave up after 2 attempts, each STOPped (2 invocations)

3. roll back a half-finished ingest
   index size before ingest: 0
   ingest result: ERROR (ingest of 'doc' crashed after 3 chunks)
   index size after crash: 3  (partial write)
   stop_trace(rollback=True): 3 inverse ops replayed
   index size after rollback: 0  (clean)`}
        tree={`13-retry/
  config.py              appends ../11-rag to sys.path
  index.py               VECTORS - 11-rag's VectorEngram
  neurons/ingester.py    imprints chunks; crashes after fail_after on request
  neurons/generator.py   stalls for the first stall_first calls per question
  receptors/terminal.py  retry, give-up, rollback, all
  brain.py               index-node + ingester-node + generator-node + terminal-node`}
        sections={[
          {
            eyebrow: "01 · Failure on request",
            title: "A generator that stalls, an ingester that crashes.",
            prose: (
              <p>
                The TASK says how to misbehave, so one running brain serves every scenario. The
                generator counts calls per question and sleeps past the retry timeout for the first{" "}
                <code className="inline">stall_first</code>. The ingester raises after{" "}
                <code className="inline">fail_after</code> chunks, leaving a partial write behind.
              </p>
            ),
            snippets: [
              { name: "neurons/generator.py", code: stripDocstring(CODE["neurons/generator.py"]) },
              { name: "neurons/ingester.py", code: blocks(CODE["neurons/ingester.py"], ["ingest_neuron", "AXON"]) },
            ],
          },
          {
            eyebrow: "02 · run_with_retry",
            title: "Retry a stuck stage on a fresh trace.",
            prose: (
              <p>
                A stage is stuck when no terminal Signal arrives within{" "}
                <code className="inline">timeout_s</code>, or it returns a recoverable ERROR. Before
                each re-dispatch the abandoned attempt is STOPped, so a stalled worker cannot keep
                running, or keep writing to an Engram, behind the retry.{" "}
                <code className="inline">on_retry</code> is for logging and metrics.
              </p>
            ),
            snippets: [{ name: "receptors/terminal.py", code: blocks(terminal, ["retry", "give_up"]) }],
          },
          {
            eyebrow: "03 · stop_trace + rollback",
            title: "Cancel a workflow and undo its writes.",
            prose: (
              <p>
                <code className="inline">stop_trace</code> broadcasts STOP on a trace; every node
                cancels its in-flight work for that trace and acks with STOPPED. With{" "}
                <code className="inline">rollback=True</code> each hosted Engram also replays its
                per-trace inverse-op journal. The journal commits on FINAL only, so an ERROR leaves
                it in place to roll back.
              </p>
            ),
            snippets: [{ name: "receptors/terminal.py", code: blocks(terminal, ["rollback"]) }],
          },
          {
            eyebrow: "04 · The brain",
            title: "Engram, two Neurons, a terminal.",
            snippets: [
              { name: "index.py", code: stripDocstring(CODE["index.py"]) },
              { name: "brain.py", code: brainBuilders(CODE["brain.py"]) },
            ],
          },
        ]}
        related={[
          { href: "/examples/rag", title: "Full RAG system", desc: "The VectorEngram and ingest path these scenarios break." },
          { href: "/examples/engram-integration", title: "Integrating an Engram", desc: "recall / imprint and the imprint ops." },
          { href: "/examples/pathway", title: "Pathway", desc: "What run_with_retry waits on." },
        ]}
      />
    </>
  );
}
