import type { Metadata } from "next";
import { pageMetadata, KW_PRODUCT } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Roadmap",
  description:
    "Where Cosmonapse is heading: the 0.1.12 line fixes tool calling, 0.2.0 containerizes the local product and freezes the envelope, 0.3.0 opens Cosmonapse Cloud, 1.0.0 lands Brainwaves and stable infra.",
  path: "/roadmap",
  keywords: [
    ...KW_PRODUCT,
    "Cosmonapse roadmap",
    "agent protocol releases",
    "open source AI agent roadmap",
  ],
});

export default function RoadmapPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Roadmap</div>
          <h1 className="page-title">From 0.1.11 to a Stable 1.0.0.</h1>
          <p className="page-sub">
            0.1.11 is out  -  the protocol and SDK shapes are in place, and Effector joins them as the
            action layer. Everything between 0.1.12 and 0.2.0 goes into one thing: making tool calling
            dependable across models. 0.2.0 keeps Cosmonapse a local product but ships it as a
            container, and every envelope and protocol freeze lands in that line. 0.3.0 opens
            Cosmonapse Cloud on top of a frozen wire format. 1.0.0 is the stable foundation  -  the six
            primitives solid, Prism deepened, Brainwaves captured and replayed, Brain architectures
            shareable and deployable.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="timeline">
            <div className="timeline-item current">
              <div className="timeline-version">0.1.11 · shipped  -  the start</div>
              <h2 className="timeline-title">Read the spec. Build the Dendrite by hand.</h2>
              <div className="timeline-body">
                <p>
                  Out now as 0.1.11. The developer reads the envelope spec, writes an Axon and
                  Dendrite using the SDK primitives, chooses a Synapse adapter, and wires their own
                  orchestration logic. Full control, full complexity, appropriate for early adopters. The
                  Python SDK is the complete reference implementation.
                </p>
                <p>What 0.1.x ships:</p>
                <ul>
                  <li>Envelope codec (Pydantic) and <code className="inline">cosmo validate</code></li>
                  <li>Axon  -  agent-side tool, in-process</li>
                  <li>Dendrite  -  synapse-side connector + all orchestration primitives</li>
                  <li>RegistryStore  -  memory / SQLite / Postgres backends</li>
                  <li>MemorySynapse, DevSynapse (TCP+NDJSON), NatsSynapse, KafkaSynapse</li>
                  <li>
                    <code className="inline">cosmo init</code> (project scaffolding),{" "}
                    <code className="inline">cosmo synapse start|view|stop</code>,{" "}
                    <code className="inline">cosmo prism</code>,{" "}
                    <code className="inline">cosmo validate</code>,{" "}
                    <code className="inline">cosmo completion</code> (bash / zsh / fish)
                  </li>
                  <li>
                    <strong>Prism</strong>  -  a local browser frontend for monitoring a live Synapse,
                    served by <code className="inline">cosmo prism</code>. A hero form picks the
                    Synapse URL + namespace, then an animated view streams every Signal on the wildcard
                    subject over a WebSocket in real time
                  </li>
                  <li>LifecycleHooks  -  on_connect / on_refresh / on_schedule</li>
                  <li><code className="inline">connect_synapse(url)</code>  -  build + connect a Synapse in one call</li>
                  <li>
                    Neuron provider factories  -  Ollama, HuggingFace router / TGI / vLLM, OpenAI,
                    Anthropic, OpenAI-compatible hosts (Groq, OpenRouter, Together, Mistral), and
                    any stdio MCP server wrapped as a Neuron
                  </li>
                  <li>
                    <code className="inline">Axon.host</code>  -  deferred Dendrite decorators
                    (<code className="inline">@AXON.host.on_agent_output</code> /{" "}
                    <code className="inline">on_tool_call</code>) that declare a node&apos;s chain
                    behaviour in its Neuron&apos;s module and self-apply on announce
                  </li>
                  <li>
                    <strong>Engram (shared memory)</strong>  -  RECALL / IMPRINT signals,{" "}
                    <code className="inline">EngramBinding</code> + <code className="inline">EngramClient</code>,
                    and three backends (InMemory / SQLite / Postgres)
                  </li>
                  <li>
                    <strong>Pathway</strong>  -  per-trace event handle with three consumption
                    shapes (<code className="inline">await pw.wait()</code>,{" "}
                    <code className="inline">@pw.on(...)</code>,{" "}
                    <code className="inline">async for sig in pw</code>) plus{" "}
                    <code className="inline">scope=&quot;terminal&quot;</code> for the decentralised pattern
                  </li>
                  <li>
                    <strong>Cognition signal family</strong>  -  PLAN, THOUGHT_DELTA, TOOL_CALL,
                    TOOL_RESULT, MEMORY_APPEND, CRITIQUE, ESCALATION, CONSENSUS, CONTEXT_SYNC,
                    each with a matching <code className="inline">emit_*</code> /{" "}
                    <code className="inline">on_*</code> pair
                  </li>
                  <li>
                    <strong>Capability-routed dispatch + competitive bidding</strong>  - {" "}
                    <code className="inline">dispatch(capabilities=...)</code> with queue-group
                    load-balancing, and <code className="inline">dispatch_offer(...)</code> running
                    TASK_OFFER / BID / TASK_AWARDED with <code className="inline">first_bid</code>,{" "}
                    <code className="inline">lowest_cost</code>, or{" "}
                    <code className="inline">highest_confidence</code> selection
                  </li>
                  <li>
                    Dispatch sugar  -  <code className="inline">dispatch_and_wait(...)</code> and{" "}
                    <code className="inline">dispatch_and_subscribe(...)</code>
                  </li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">0.1.12 → 0.2.0 · next  -  tool calling</div>
              <h2 className="timeline-title">Every release in this line fixes tool calls.</h2>
              <div className="timeline-body">
                <p>
                  A single theme for the whole patch line. Tool calling is where open models break
                  first: a harness asks for an action object and gets shorthand keys, prose around the
                  JSON, or a truncated tail. Every release from 0.1.12 up to 0.2.0 goes at the parsers
                  and the contract around them, so that a Neuron that drifts is corrected at the Axon
                  instead of by every harness downstream.
                </p>
                <p>What the 0.1.12 line means:</p>
                <ul>
                  <li>
                    <strong>Tool-call parsing, hardened</strong>  -  the shorthand variants, wrapped
                    and fenced JSON, and partial objects that real models emit get parsed instead of
                    thrown away
                  </li>
                  <li>
                    <strong>Axon output contract</strong>  -  a reject-and-repair path:{" "}
                    <code className="inline">@detects_output</code> raises{" "}
                    <code className="inline">InvalidOutput(reason, hint)</code> and the Axon re-asks
                    its Neuron with the hint (bounded{" "}
                    <code className="inline">output_retries</code>, CRITIQUE signals for Prism), with
                    provider truncation (<code className="inline">finish_reason=&quot;length&quot;</code>)
                    retried the same way
                  </li>
                  <li>
                    <strong>Structured output at the source</strong>  -  <code className="inline">response_format</code>{" "}
                    / <code className="inline">tools</code> passthrough on the OpenAI-compatible
                    Neuron providers, so the provider enforces the schema wherever it can
                  </li>
                  <li>
                    <strong>Effector call paths exercised</strong>  -  TOOL_CALL / TOOL_RESULT round
                    trips tested against the model families the examples actually run on, not just
                    the well-behaved ones
                  </li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">0.2.0 · containerized  -  and frozen</div>
              <h2 className="timeline-title">Still local. Now it ships as a container.</h2>
              <div className="timeline-body">
                <p>
                  0.2.0 does not change what Cosmonapse is: it stays a local product you run yourself.
                  What changes is how you get it standing up  -  a container image and a compose
                  topology instead of a checklist. This is also the line where the wire format stops
                  moving. Any envelope or protocol freeze happens here, so that everything built on
                  top from 0.3.0 onwards has something stable underneath it.
                </p>
                <p>What 0.2.0 means:</p>
                <ul>
                  <li>
                    <strong>Containerized</strong>  -  Synapse, Prism, and the store backends as
                    images with a compose topology, so a full local fabric is one command rather
                    than a setup guide
                  </li>
                  <li>
                    <strong>Envelope freeze</strong>  -  the Signal envelope, the cognition signal
                    family, and the versioning rules around them are locked
                  </li>
                  <li>
                    <strong>Pathways and traces set in stone</strong>  -  the per-trace model
                    (trace_id / parent_id, Pathway scopes, terminal semantics) is frozen and relied upon
                  </li>
                  <li>
                    <strong>The six primitives solid</strong>  -  Synapse, Dendrite, Neuron, Axon,
                    Engram, and Effector working end to end with basic LLMs at minimum
                  </li>
                  <li>
                    <strong>Heavy testing against NATS and Kafka</strong>  -  the networked paths
                    exercised against real brokers in containers, not just memory transports
                  </li>
                  <li>
                    <strong>Agents on the wire</strong>  -  agent systems built from Claude and OpenAI
                    models stress-testing the protocol: long traces, concurrent workflows, bidding
                    under load, Engram-heavy agents. Every gap those workloads expose feeds back into
                    the freeze before it closes
                  </li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">0.3.0 · future  -  Cosmonapse Cloud</div>
              <h2 className="timeline-title">The same fabric, hosted.</h2>
              <div className="timeline-body">
                <p>
                  With a frozen envelope and a containerized runtime, the hosted product is the next
                  step rather than a rewrite. 0.3.0 is the launch of Cosmonapse Cloud: managed
                  Synapses, hosted Engram, and Prism as a service, speaking exactly the protocol the
                  local product speaks. The local path stays first-class  -  Cloud is where you go
                  when you would rather not run the brokers yourself.
                </p>
                <p>What 0.3.0 means:</p>
                <ul>
                  <li><strong>Managed Synapse</strong>  -  hosted transport with the same adapters and the same envelope</li>
                  <li><strong>Hosted Engram</strong>  -  shared memory without standing up Postgres</li>
                  <li><strong>Prism as a service</strong>  -  observability on a hosted fabric, no local port required</li>
                  <li><strong>Local stays local</strong>  -  the same code runs against a self-hosted Synapse or a managed one, by URL</li>
                </ul>
                <p>
                  Timing here is honest rather than precise: Cloud moves when the project gets
                  full-time attention.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-version">1.0.0 · target  -  stable</div>
              <h2 className="timeline-title">A strong protocol foundation.</h2>
              <div className="timeline-body">
                <p>
                  1.0.0 is the point where the foundation is strong enough to disappear: you think in
                  terms of the system you are building, not the protocol underneath it.
                </p>
                <p>What 1.0.0 means:</p>
                <ul>
                  <li><strong>Strong protocol foundation</strong>  -  Synapse, Dendrite, Neuron, Axon, Engram, and Effector from cosmonapse-core are solid</li>
                  <li>
                    <strong>Prism</strong>  -  deeper statistics and cognition analytics on top of the
                    views that ship today, with <strong>Brain</strong> development alongside Synapse
                    development
                  </li>
                  <li>
                    <strong>Brainwaves</strong>  -  capture and replay a task or a set of tasks, and
                    shareable Brain architectures  -  think Terraform, for agent fabrics
                  </li>
                  <li><strong>Infra integration</strong>  -  automated deployments and distributed setups wired into the same tooling, local or on Cloud</li>
                  <li>
                    <strong>The success criterion</strong>  -  consistently building complex RAG
                    LLM / agent systems on Cosmonapse. The capability for agents is already there;
                    1.0.0 is when doing it reliably is unremarkable
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="sub-eyebrow">Known limitations  -  0.1.11</div>
          <p className="prose">
            0.1.11 is a 0.1: the protocol and SDK shapes are in place, and nothing is frozen until
            0.2.0. These are the edges we know about  -  each one points at the milestone that
            closes it.
          </p>
          <ul className="prose" style={{ paddingLeft: 24 }}>
            <li>
              <strong>Open models drift from strict action schemas.</strong> A harness that asks a
              plain-chat LLM for <code className="inline">{"{"}&quot;tool&quot;, &quot;args&quot;{"}"}</code>{" "}
              JSON will eventually get shorthand variants or truncated objects back; today{" "}
              <code className="inline">@detects_output</code> can only transform or error, so every
              harness carries its own fallback parsing. This is the whole point of the 0.1.12 line:
              hardened tool-call parsing, the Axon output contract
              (<code className="inline">InvalidOutput</code> + bounded{" "}
              <code className="inline">output_retries</code>), and provider-side{" "}
              <code className="inline">response_format</code> / <code className="inline">tools</code>
            </li>
            <li>
              <strong>Traces and Pathways are not yet frozen.</strong> The per-trace model
              (trace_id / parent_id, Pathway scopes, terminal semantics) is stable in practice but
              formally locks in 0.2.0
            </li>
            <li>
              <strong>Networked transports need more mileage.</strong> The NATS and Kafka adapters
              work; heavy testing against real brokers is 0.2.0 scope
            </li>
            <li>
              <strong>Setup is manual.</strong> Standing up a full local fabric means running the
              pieces yourself; the container image and compose topology land in 0.2.0
            </li>
          </ul>
        </div>
      </section>

      <section className="section-sm">
        <div className="container container-narrow">
          <div className="sub-eyebrow">Priority order  -  0.1.11 → 1.0.0</div>
          <p className="prose">The order matters. Each milestone lands on the baseline the last one established.</p>
          <ol className="prose" style={{ paddingLeft: 24 }}>
            <li>0.1.11  -  shipped: protocol drafted, the Python SDK and the CLI released, every primitive present</li>
            <li>0.1.12 → 0.2.0  -  one theme: tool calling. Hardened parsers, the Axon output repair contract, provider-side structured output</li>
            <li>0.2.0  -  still local, now containerized. The envelope, the cognition signals, and the trace model freeze here; heavy testing against NATS / Kafka; real agents stress-testing the protocol before the freeze closes</li>
            <li>0.3.0  -  Cosmonapse Cloud: managed Synapse, hosted Engram, Prism as a service, on the frozen protocol. Moves when the project gets full-time attention</li>
            <li>1.0.0  -  strong foundation: Prism deepened with cognition analytics, Brains and Brainwaves, deployment and infra integration, complex RAG / agent systems built consistently</li>
          </ol>
        </div>
      </section>
    </>
  );
}
