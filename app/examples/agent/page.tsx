import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExampleDoc, { install } from "@/components/ExampleDoc";
import { blocks, brainBuilders, stripDocstring } from "@/lib/highlight";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS, KW_REACTIVE } from "@/lib/seo";
import { CODE } from "./code";

export const metadata: Metadata = pageMetadata({
  title: "Agent - Choreographed, No Loop",
  description:
    "A capability-routed agent with no supervisor loop. A Receptor dispatches one TASK and waits for FINAL; each node's chain handler creates the next TASK.",
  path: "/examples/agent",
  keywords: [
    ...KW_REACTIVE,
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "agent without a while loop",
    "autonomous agent architecture",
    "agentic workflow",
    "ReAct alternative",
  ],
});

const planner = CODE["neurons/model/planner.py"];
const research = CODE["neurons/model/research.py"];

export default function AgentPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Agent", path: "/examples/agent" },
        ]}
      />
      <ExampleDoc
        number="14"
        difficulty="Advanced"
        title="An agent with no loop."
        folder="14-agent"
        namespace="agent"
        runArgs={`"Research X, then write a Python CLI that does Y"`}
        prismSrc="/prism/agent.mp4"
        lede={
          <>
            A planner, two specialists, four tools and one memory. An interface dispatches one
            capability-routed TASK and waits for the trace&apos;s FINAL. There is no supervisor
            loop: each node picks up the output it cares about and creates the next TASK. Ask the
            same goal twice and the answer comes from the Engram.
          </>
        }
        install={install({
          pkgs: "'cosmonapse[receptor]' httpx python-dotenv 'mcp<2'",
          hf: true,
          note: "uv (for uvx) and Node 18+ on PATH - the tools are MCP servers",
        })}
        run={`$ python brain.py "Research the Collatz conjecture, then write a Python CLI that prints the sequence for N"
$ python brain.py --stream "..."     # every Signal of the chain as it happens
$ python brain.py memory             # what it remembers this session
$ python brain.py                    # REPL, plus the chat page at http://127.0.0.1:8000`}
        output={`  . get_current_time
  . search
  . fetch
  . get_current_time
  . write_file
  . get_current_time
# Research the Collatz conjecture, then write a Python CLI ...

## Research note 1
The Collatz conjecture asks whether repeatedly applying n/2 or 3n+1 ...

## Generated solution
Saved to \`.../14-agent/report/solution.py\`

## Sources
- https://en.wikipedia.org/wiki/Collatz_conjecture

--- 2 step(s), source: web
report : report/answer.md
code   : report/solution.py`}
        outputNote="The notes and the script vary with the model; the chain does not. The same goal a second time finishes in one step with source: memory."
        tree={`14-agent/
  config.py                 settings, hf_token()
  neurons/model/planner.py  stock LLM Neuron + hooks + its chain handler
  neurons/model/research.py search, fetch, note, hand back
  neurons/model/coding.py   write the script, save it, hand back
  effector/                 websearch, fetch, clock, files - MCP servers as Effectors
  engram/agent_memory.py    the memory + its on_imprint_signal mirror to disk
  receptors/terminal.py     CliReceptor - a goal becomes one TASK
  receptors/chat.py         ChatReceptor - the same TASK from a browser
  helpers.py                MCPEffector, task_input(), result_of()
  brain.py                  a node per agent, per tool group, per interface`}
        sections={[
          {
            eyebrow: "01 · One dispatch",
            title: "Routed, terminal-scoped, not finalised.",
            prose: (
              <>
                <p>
                  The interface sends one TASK to <code className="inline">capabilities=[&quot;planner&quot;]</code>{" "}
                  and waits. Two arguments matter for a choreographed brain.{" "}
                  <code className="inline">scope=&quot;terminal&quot;</code> wakes the caller for
                  FINAL or ERROR only.{" "}
                  <code className="inline">finalize=False</code> stops the SDK promoting the first
                  worker&apos;s AGENT_OUTPUT to FINAL; left unset, the run would end one step in with
                  the planner&apos;s routing decision as the answer. The planner node emits FINAL
                  itself.
                </p>
                <p>
                  <code className="inline">on_signal(TOOL_CALL)</code> is observation only: it
                  prints progress and changes nothing on the trace. The chat Receptor builds the
                  identical TASK, so nothing under <code className="inline">neurons/</code> knows
                  which edge asked.
                </p>
              </>
            ),
            snippets: [{ name: "receptors/terminal.py", code: stripDocstring(CODE["receptors/terminal.py"]) }],
          },
          {
            eyebrow: "02 · Stock Neurons",
            title: "The planner is a model plus hooks.",
            prose: (
              <p>
                <code className="inline">Axon.huggingface()</code> is the model.{" "}
                <code className="inline">@AXON.before_task</code> shapes the input: check the
                Engram for a remembered answer, recall this run&apos;s progress, ground the prompt
                with the clock Effector. <code className="inline">@AXON.detects_output</code> parses
                the route and echoes the chain state. No node holds run state; it rides the TASK
                inputs and progress is recalled from memory.
              </p>
            ),
            snippets: [{ name: "neurons/model/planner.py", code: blocks(planner, ["AXON", "situate", "decide"]) }],
          },
          {
            eyebrow: "03 · The chain",
            title: "Dendrites create the TASKs.",
            prose: (
              <p>
                <code className="inline">@AXON.host.on_agent_output(neuron=&quot;planner&quot;)</code>{" "}
                is a deferred host decorator, applied to whichever node hosts the planner. On a
                research or coding route it dispatches the next TASK on the same trace; on finish it
                assembles the report from the Engram, imprints it, and emits FINAL, which resolves
                the interface&apos;s Pathway.
              </p>
            ),
            snippets: [{ name: "neurons/model/planner.py", code: blocks(planner, ["chain"]) }],
          },
          {
            eyebrow: "04 · A specialist",
            title: "Research: search, fetch, note, hand back.",
            prose: (
              <p>
                Agents own their tools: the research hook calls{" "}
                <code className="inline">call_tool</code> on the websearch and fetch Effectors, and
                its chain handler hands control back to the planner by capability. Tool calls ride
                TOOL_CALL and TOOL_RESULT on the same trace; they are not TASKs.
              </p>
            ),
            snippets: [{ name: "neurons/model/research.py", code: blocks(research, ["gather", "note_and_imprint", "chain"]) }],
          },
          {
            eyebrow: "05 · Tools and memory",
            title: "MCP servers as Effectors; memory with a host reaction.",
            prose: (
              <p>
                Each tool is one line over a shared <code className="inline">MCPEffector</code>{" "}
                adapter in <code className="inline">helpers.py</code>, which warms the server at
                start and closes it on stop. The Engram module also declares what its host does
                with an imprint: mirror the answer to disk through the files Effector.
              </p>
            ),
            snippets: [
              { name: "effector/websearch.py", code: stripDocstring(CODE["effector/websearch.py"]) },
              { name: "engram/agent_memory.py", code: stripDocstring(CODE["engram/agent_memory.py"]) },
            ],
          },
          {
            eyebrow: "06 · The brain",
            title: "Deployment only.",
            prose: (
              <p>
                Agent nodes are <code className="inline">role=&quot;orchestrator&quot;</code>{" "}
                because their chain handlers dispatch TASKs. Tool and memory nodes are workers:
                TOOL_CALL is not role-gated, only TASK and STOP are. See{" "}
                <Link href="/examples/receptors" className="inline-link">Receptors</Link> for the
                interface layer on its own.
              </p>
            ),
            snippets: [{ name: "brain.py", code: brainBuilders(CODE["brain.py"]) }],
          },
        ]}
        related={[
          { href: "/examples/claude-harness", title: "Claude-code-style harness", desc: "A REPL coding agent with native tool dialects and a subagent." },
          { href: "/examples/rag-cli", title: "RAG CLI", desc: "The same chain pattern with one Neuron, one Engram, one Effector." },
          { href: "/examples/pathway", title: "Pathway", desc: "scope=\"terminal\" and what FINAL resolves." },
        ]}
      />
    </>
  );
}
