import React from "react";
import CodeBlock from "@/components/CodeBlock";
import { Section, type TocGroup } from "./shared";

/** Render a single <Section> by id, or the whole reference when no id is given. */
function pickSection(all: React.ReactElement, section?: string) {
  if (!section) return all;
  const children = (all.props as { children?: React.ReactNode }).children;
  const match = React.Children.toArray(children).find(
    (k) => React.isValidElement(k) && (k.props as { id?: string }).id === section,
  );
  return <>{match ?? all}</>;
}

export const cliToc: TocGroup = {
  title: "cosmo CLI",
  items: [
    { href: "#cli-overview", label: "Overview" },
    { href: "#cli-init", label: "cosmo init" },
    { href: "#cli-synapse", label: "cosmo synapse" },
    { href: "#cli-doppler", label: "cosmo doppler" },
    { href: "#cli-prism", label: "cosmo doppler --prism" },
    { href: "#cli-validate", label: "cosmo validate" },
    { href: "#cli-completion", label: "cosmo completion" },
    { href: "#cli-dispatch", label: "cosmo dispatch" },
    { href: "#cli-registry", label: "cosmo registry" },
    { href: "#cli-answer", label: "cosmo answer" },
    { href: "#cli-schema", label: "cosmo schema" },
    { href: "#cli-config", label: "Configuration & env" },
    { href: "#cli-exit-codes", label: "Exit codes" },
  ],
};

/* ─────────────────────────────  CODE SNIPPETS  ───────────────────────────── */

const cliRootSnippet = `<span class="tk-op">$</span> cosmo <span class="tk-op">--</span>help

Usage: cosmo [OPTIONS] COMMAND [ARGS]...

  Cosmonapse developer tooling.

Options
  <span class="tk-op">--</span>version   Show the version and exit.
  <span class="tk-op">--</span>help      Show this message and exit.

Commands
  answer       Interactively answer CLARIFICATION / PERMISSION requests.
  completion   Print a shell-completion script (bash / zsh / fish).
  dispatch     Dispatch a TASK and print the reply.
  doppler      Attach a read-only Doppler to a Synapse namespace.
  init         Scaffold a minimal Axon + Dendrite project.
  registry     Inspect the Neuron registry of a namespace.
  schema       Print the Signal envelope JSON Schema.
  synapse      Manage Cosmonapse synapse servers (start / view / stop).
  validate     Validate Signal envelopes against the spec.`;

const cliInitSnippet = `<span class="tk-op">$</span> cosmo init my-app <span class="tk-op">--</span>namespace<span class="tk-op">=</span>demo

Scaffolded my-app in /path/to/my-app
  <span class="tk-op">+</span> worker.py
  <span class="tk-op">+</span> orchestrator.py
  <span class="tk-op">+</span> README.md

Next steps:
  cd my-app
  cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>demo
  python worker.py        <span class="tk-cm"># in a second terminal</span>
  python orchestrator.py  <span class="tk-cm"># in a third terminal</span>`;

const cliCompletionSnippet = `<span class="tk-cm"># Load completions in the current shell:</span>
<span class="tk-op">$</span> <span class="tk-kw">eval</span> <span class="tk-str">"$(cosmo completion bash)"</span>
<span class="tk-op">$</span> <span class="tk-kw">eval</span> <span class="tk-str">"$(cosmo completion zsh)"</span>

<span class="tk-cm"># Or install permanently:</span>
<span class="tk-op">$</span> cosmo completion bash <span class="tk-op">&gt;</span> ~/.local/share/bash-completion/completions/cosmo
<span class="tk-op">$</span> cosmo completion zsh <span class="tk-op">&gt;</span> ~/.zfunc/_cosmo
<span class="tk-op">$</span> cosmo completion fish <span class="tk-op">&gt;</span> ~/.config/fish/completions/cosmo.fish`;

const cliSynapseSnippet = `<span class="tk-op">$</span> cosmo synapse <span class="tk-op">--</span>help

Manage Cosmonapse synapse servers.

Subcommands
  start     Boot a synapse (memory / nats / kafka) and stream Signals.
  view      List namespaces, or stream Signals for one namespace.
  stop      Gracefully stop a running namespace.

<span class="tk-cm"># ── cosmo synapse start ─────────────────────────────────────</span>
<span class="tk-op">$</span> cosmo synapse start <span class="tk-op">&lt;</span>transport<span class="tk-op">&gt;</span> [options]

Arguments
  transport               memory <span class="tk-op">|</span> nats <span class="tk-op">|</span> kafka

Options
  <span class="tk-op">--</span>namespace, <span class="tk-op">-n</span> <span class="tk-op">&lt;</span>ns<span class="tk-op">&gt;</span>   Namespace.            Default: dev
  <span class="tk-op">--</span>host <span class="tk-op">&lt;</span>addr<span class="tk-op">&gt;</span>           Bind address (memory). Default: 127.0.0.1
  <span class="tk-op">--</span>port <span class="tk-op">&lt;</span>n<span class="tk-op">&gt;</span>              TCP port (memory).    Default: 7070
  <span class="tk-op">--</span>broker <span class="tk-op">&lt;</span>url<span class="tk-op">&gt;</span>          Broker URL (nats/kafka).
  <span class="tk-op">--</span>quiet                  Don't stream Signals to stdout.

Examples

<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>quickstart

  URL:        cosmo://127.0.0.1:7070
  Namespace:  quickstart
  Transport:  TCP <span class="tk-op">+</span> NDJSON  (single-host dev only)

  Connect a Dendrite with:
    <span class="tk-kw">await</span> connect_synapse(<span class="tk-str">'cosmo://127.0.0.1:7070'</span>)

  Ctrl-C  or  cosmo synapse stop <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">--</span>namespace<span class="tk-op">=</span>quickstart
  <span class="tk-op">────────────────────────────────────────────────</span>

<span class="tk-op">$</span> cosmo synapse start nats <span class="tk-op">--</span>namespace<span class="tk-op">=</span>prod <span class="tk-op">--</span>broker<span class="tk-op">=</span>nats://localhost:4222

<span class="tk-cm"># ── cosmo synapse view / stop ────────────────────────────────</span>
<span class="tk-op">$</span> cosmo synapse view <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070               <span class="tk-cm"># list all namespaces</span>
<span class="tk-op">$</span> cosmo synapse view <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> dev      <span class="tk-cm"># stream live signals</span>
<span class="tk-op">$</span> cosmo synapse stop <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> dev      <span class="tk-cm"># graceful stop</span>`;

const cliDopplerSnippet = `<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>help

Attach a read-only Doppler to a Synapse namespace and stream Signals.

Usage
  cosmo doppler <span class="tk-op">--</span>url <span class="tk-op">&lt;</span>url<span class="tk-op">&gt;</span> <span class="tk-op">--</span>namespace <span class="tk-op">&lt;</span>ns<span class="tk-op">&gt;</span> [filters] [output]

Options
  <span class="tk-op">--</span>url <span class="tk-op">&lt;</span>url<span class="tk-op">&gt;</span>             Synapse URL, e.g. cosmo://127.0.0.1:7070
  <span class="tk-op">--</span>namespace, <span class="tk-op">-n</span> <span class="tk-op">&lt;</span>ns<span class="tk-op">&gt;</span>   Namespace to observe.       Default: dev
  <span class="tk-op">--</span>synapse <span class="tk-op">&lt;</span>url/ns<span class="tk-op">&gt;</span>      Legacy combined form (path-encoded namespace).
  <span class="tk-op">--</span>type <span class="tk-op">&lt;</span>TYPE<span class="tk-op">&gt;</span>            Filter to specific signal types. Repeatable.
  <span class="tk-op">--</span>trace <span class="tk-op">&lt;</span>trc_…<span class="tk-op">&gt;</span>          Filter to a single trace_id.
  <span class="tk-op">--</span>neuron <span class="tk-op">&lt;</span>id<span class="tk-op">&gt;</span>            Filter to a single neuron id.
  <span class="tk-op">--</span>json                   Output one JSON object per line (CLI mode).
  <span class="tk-op">--</span>payload                Show a payload preview alongside each signal.
  <span class="tk-op">--</span>prism                  Launch the Prism browser visualization instead of stdout.
  <span class="tk-op">--</span>port <span class="tk-op">&lt;</span>n<span class="tk-op">&gt;</span>              Local port for the Prism server. Default: 7071

Examples

<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> quickstart
  REGISTER      neuron<span class="tk-op">=</span>hello-neuron
  TASK          trace<span class="tk-op">=</span>trc_…  neuron<span class="tk-op">=</span>hello-neuron
  AGENT_OUTPUT  trace<span class="tk-op">=</span>trc_…  neuron<span class="tk-op">=</span>hello-neuron

<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> dev <span class="tk-op">--</span>type<span class="tk-op">=</span>AGENT_OUTPUT <span class="tk-op">--</span>type<span class="tk-op">=</span>ERROR
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> dev <span class="tk-op">--</span>trace<span class="tk-op">=</span>trc_01JV…
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> dev <span class="tk-op">--</span>json <span class="tk-op">|</span> jq <span class="tk-str">'select(.type=="ERROR")'</span>`;

const cliPrismSnippet = `<span class="tk-cm"># Launch Prism  -  the browser visualization for the Doppler.</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism                                          <span class="tk-cm"># opens Prism, enter the synapse URL in the form</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>port<span class="tk-op">=</span>8080                              <span class="tk-cm"># serve on a custom port</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> dev      <span class="tk-cm"># skip the form, attach directly</span>

  Prism serving on http://127.0.0.1:7071
  WS bridge   /ws  →  streams one JSON Signal envelope per message

<span class="tk-cm"># Prism is a single-page app (Vite + React + TS) bundled into the cosmonapse wheel.</span>
<span class="tk-cm"># The Python side serves static assets + a WebSocket bridge; no Node on the install path.</span>`;

const cliValidateSnippet = `<span class="tk-op">$</span> cosmo validate <span class="tk-op">--</span>help

Validate Signal envelopes against the spec  -  from a file, stdin, or live.

Usage
  cosmo validate [FILE] [options]

Arguments
  FILE                    JSON file to validate. Reads stdin if omitted.

Options
  <span class="tk-op">--</span>live                   Validate signals live on the Synapse.
  <span class="tk-op">--</span>namespace <span class="tk-op">&lt;</span>ns<span class="tk-op">&gt;</span>         Namespace (--live mode only). Default: default
  <span class="tk-op">--</span>strict                 Exit 1 on the first violation.
  <span class="tk-op">--</span>warnings               Show advisory warnings too.

Examples

<span class="tk-op">$</span> cosmo validate signal.json
  <span class="tk-op">●</span> valid: TASK trace<span class="tk-op">=</span>trc_01JV… neuron<span class="tk-op">=</span>answerer

<span class="tk-op">$</span> echo <span class="tk-str">'{"type":"TASK"}'</span> <span class="tk-op">|</span> cosmo validate
  <span class="tk-op">✗</span> invalid: missing required field <span class="tk-str">'id'</span>

<span class="tk-op">$</span> cosmo validate <span class="tk-op">--</span>live <span class="tk-op">--</span>namespace<span class="tk-op">=</span>dev <span class="tk-op">--</span>strict`;

const cliDispatchSnippet = `<span class="tk-op">$</span> cosmo dispatch --help

Dispatch a TASK and print the reply.

Usage
  cosmo dispatch --url &lt;url&gt; [options]

Options
  --url &lt;url&gt;             Synapse URL (cosmo:// | nats:// | kafka://). Required.
  --namespace, -n &lt;ns&gt;    Namespace to dispatch into.        Default: dev
  --neuron &lt;id&gt;           Addressed dispatch: the target Axon's neuron_id.
  --capabilities &lt;a,b&gt;    Capability-routed dispatch (comma-separated).
  --input &lt;json&gt;          TASK input as a JSON object.       Default: {}
  --offer                  Use TASK_OFFER / BID / TASK_AWARDED instead of direct dispatch.
  --deadline-ms &lt;n&gt;       Bid-collection window for --offer. Default: 250
  --select &lt;strategy&gt;     first_bid | lowest_cost | highest_confidence. Default: first_bid
  --wait / --no-wait       Wait for the reply.                Default: --wait
  --timeout &lt;s&gt;           Seconds to wait for a reply.       Default: 30.0
  --scope &lt;scope&gt;         Pathway scope while waiting: all | terminal. Default: terminal
  --json                   Print the raw reply Signal as JSON.

Examples

<span class="tk-cm"># Addressed dispatch, wait for the reply (terminal-handler finalize)</span>
<span class="tk-op">$</span> cosmo dispatch --url=cosmo://127.0.0.1:7070 -n dev \\
    --neuron=answerer --input='{"q": "hi"}'

<span class="tk-cm"># Capability-routed</span>
<span class="tk-op">$</span> cosmo dispatch --url=cosmo://127.0.0.1:7070 --capabilities=summarize \\
    --input='{"text": "..."}'

<span class="tk-cm"># Auction it instead: collect BIDs, award the cheapest</span>
<span class="tk-op">$</span> cosmo dispatch --url=cosmo://127.0.0.1:7070 --offer \\
    --capabilities=summarize --select=lowest_cost --input='{"text": "..."}'`;

const cliRegistrySnippet = `<span class="tk-op">$</span> cosmo registry --help

Inspect the Neuron registry of a namespace.

Subcommands
  list      Emit DISCOVER and print every Neuron that announces itself.

Options (list)
  --url &lt;url&gt;             Synapse URL (cosmo:// | nats:// | kafka://). Required.
  --namespace, -n &lt;ns&gt;    Namespace.                          Default: dev
  --capability &lt;cap&gt;      Only Neurons declaring this capability.
  --timeout &lt;s&gt;           Seconds to collect REGISTER replies. Default: 1.5
  --json                   Machine-readable output.

Example

<span class="tk-op">$</span> cosmo registry list --url=cosmo://127.0.0.1:7070 -n dev
  NEURON       STATUS      CAPABILITIES
  answerer     registered  text, qa
  summarizer   registered  summarize, english`;

const cliAnswerSnippet = `<span class="tk-op">$</span> cosmo answer --help

Interactively answer CLARIFICATION / PERMISSION requests.

Usage
  cosmo answer --url &lt;url&gt; [options]

Options
  --url &lt;url&gt;             Synapse URL (cosmo:// | nats:// | kafka://). Required.
  --namespace, -n &lt;ns&gt;    Namespace to watch.                 Default: dev
  --trace &lt;trc_…&gt;         Only answer requests on this trace.
  --redispatch             Reply by re-dispatching a follow-up TASK to the asking
                           Neuron (respond_to_clarification / respond_to_permission)
                           instead of emitting a discrete answer signal.

Example

<span class="tk-op">$</span> cosmo answer --url=cosmo://127.0.0.1:7070 -n dev
  watching namespace 'dev' for CLARIFICATION / PERMISSION (Ctrl-C to quit)

  [trc_01JV…] CLARIFICATION from neuron=answerer
    question: Which topic?
  your answer: billing
  → CLARIFICATION_ANSWER emitted (parent_id = the request's id)`;

const cliSchemaSnippet = `<span class="tk-op">$</span> cosmo schema --help

Print the Signal envelope JSON Schema (protocol major version 1).

Options
  --types                  List the SignalType vocabulary instead of the schema.
  --output, -o &lt;path&gt;     Write to a file instead of stdout.

Examples

<span class="tk-op">$</span> cosmo schema | jq '.properties | keys'
<span class="tk-op">$</span> cosmo schema --types
<span class="tk-op">$</span> cosmo schema -o signal.schema.json`;

const exitCodesSnippet = `<span class="tk-cm"># cosmo commands use a small, conventional set of exit codes:</span>

  0    Success.
  1    Operational / validation failure   <span class="tk-cm"># raised via SystemExit(1)</span>
  2    Invalid usage / arguments          <span class="tk-cm"># bad flags (from Click)</span>
  130  Interrupted by Ctrl-C              <span class="tk-cm"># standard POSIX SIGINT</span>`;

const configSnippet = `<span class="tk-cm"># 0.1.x has no TOML config file yet  -  flags are passed explicitly.</span>
<span class="tk-cm"># The only environment variable the CLI reads today:</span>

  COSMONAPSE_STATE_DIR    <span class="tk-cm"># where 'cosmo synapse' keeps its run state.</span>
                          <span class="tk-cm"># Default: ~/.cosmonapse</span>

<span class="tk-cm"># Example: keep dev-synapse state under the repo</span>
<span class="tk-op">$</span> COSMONAPSE_STATE_DIR<span class="tk-op">=</span>./.cosmo-state cosmo synapse start memory <span class="tk-op">-n</span> dev`;

/* ─────────────────────────────  COMPONENT  ───────────────────────────── */

export default function CliDocs({ section }: { section?: string }) {
  const all = (
    <>
      <div className="docs-megasection">
        <div className="docs-megasection-label">cosmo CLI</div>
        <h2 className="docs-megasection-title">
          The command-line interface to a Cosmonapse fabric.
        </h2>
        <p className="docs-megasection-sub">
          <code className="inline">cosmo</code> is the operator&rsquo;s entry point: boot a dev
          synapse, tail traffic, dispatch and answer from the shell, inspect the registry, and
          validate envelopes. It is a Click application installed alongside the Python SDK.
        </p>
      </div>

      <Section id="cli-overview" eyebrow="CLI · 01" title="Overview">
        <p className="docs-p">
          <code className="inline">cosmo</code> is installed when you{" "}
          <code className="inline">pip install cosmonapse</code>  -  the CLI ships inside that single
          distribution (entry point <code className="inline">cosmo.main:cli</code>). Once installed,
          the binary is on your <code className="inline">PATH</code>. It exposes{" "}
          <code className="inline">init</code>, <code className="inline">synapse</code>,{" "}
          <code className="inline">dispatch</code>, <code className="inline">registry</code>,{" "}
          <code className="inline">answer</code>, <code className="inline">schema</code>,{" "}
          <code className="inline">doppler</code>, <code className="inline">validate</code>, and{" "}
          <code className="inline">completion</code>.
        </p>
        <CodeBlock html={cliRootSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-init" eyebrow="CLI · 02" title="cosmo init">
        <p className="docs-p">
          Scaffold a minimal, runnable project  -  a worker{" "}
          <code className="inline">Dendrite</code> hosting an <code className="inline">Axon</code>, and
          an orchestrator that dispatches one task and prints the result. Three files
          (<code className="inline">worker.py</code>, <code className="inline">orchestrator.py</code>,{" "}
          <code className="inline">README.md</code>) are written into{" "}
          <code className="inline">./NAME</code>; pass <code className="inline">--namespace</code> to
          choose the namespace and <code className="inline">--force</code> to write into a non-empty
          directory.
        </p>
        <CodeBlock html={cliInitSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-synapse" eyebrow="CLI · 03" title="cosmo synapse">
        <p className="docs-p">
          Boot the local dev synapse  -  a zero-dependency TCP + NDJSON broker  -  and stream every
          Signal that crosses it. The same subject-matching semantics as MemorySynapse and NATS, so
          code written against the dev server runs unchanged in production.
        </p>
        <CodeBlock html={cliSynapseSnippet} maxWidth={860} />
        <p className="docs-p">
          Run state (which namespaces are live, on which ports) is kept under{" "}
          <code className="inline">~/.cosmonapse</code> by default  -  override the location with the{" "}
          <code className="inline">COSMONAPSE_STATE_DIR</code> environment variable.{" "}
          <code className="inline">cosmo synapse stop</code> reads that state to find the running
          server.
        </p>
      </Section>

      <Section id="cli-doppler" eyebrow="CLI · 04" title="cosmo doppler">
        <p className="docs-p">
          A Doppler is any process that subscribes to the channel as a passive, read-only consumer.{" "}
          <code className="inline">cosmo doppler</code> is the built-in one  -  it tails every envelope,
          applies filters, and renders to stdout (or the Prism browser UI with{" "}
          <code className="inline">--prism</code>, documented below). Pass <code className="inline">--json</code> to emit
          one JSON object per line for piping to <code className="inline">jq</code>. Give it a{" "}
          <code className="inline">--url</code> and a <code className="inline">--namespace</code> (the
          same shape as <code className="inline">cosmo synapse</code>); the legacy{" "}
          <code className="inline">--synapse=url/namespace</code> form is still accepted.
        </p>
        <CodeBlock html={cliDopplerSnippet} maxWidth={860} />
      </Section>

      <Section id="cli-prism" eyebrow="CLI · 04b" title="cosmo doppler --prism">
        <p className="docs-p">
          Pass <code className="inline">--prism</code> to <code className="inline">cosmo doppler</code>{" "}
          to launch <strong>Prism</strong>, the browser visualization for the Doppler, instead of
          streaming envelopes to stdout. It boots a local server (default port{" "}
          <code className="inline">7071</code>) that serves a single-page app and a WebSocket bridge;
          each connection opens its own Synapse subscriber, so you can switch URL and namespace from
          the form without restarting. Pre-fill the target with{" "}
          <code className="inline">--url</code> and <code className="inline">--namespace</code> to skip
          the form, or set <code className="inline">--port</code> to serve elsewhere.
        </p>
        <CodeBlock html={cliPrismSnippet} maxWidth={860} />
      </Section>

      <Section id="cli-validate" eyebrow="CLI · 05" title="cosmo validate">
        <p className="docs-p">
          Validate Signal envelopes against the spec. Pass a JSON file as the positional argument, or
          pipe one in on stdin; add <code className="inline">--live</code> to validate signals as they
          cross a synapse. <code className="inline">--strict</code> exits 1 on the first violation;{" "}
          <code className="inline">--warnings</code> surfaces advisory issues too.
        </p>
        <CodeBlock html={cliValidateSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-completion" eyebrow="CLI · 06" title="cosmo completion">
        <p className="docs-p">
          Print a shell-completion script for <code className="inline">bash</code>,{" "}
          <code className="inline">zsh</code>, or <code className="inline">fish</code>.{" "}
          <code className="inline">eval</code> it to enable completion for the current shell, or
          redirect it into your shell&rsquo;s completion directory to install it permanently.
        </p>
        <CodeBlock html={cliCompletionSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-dispatch" eyebrow="CLI · 07" title="cosmo dispatch">
        <p className="docs-p">
          Fire a one-off TASK from the shell  -  addressed (<code className="inline">--neuron</code>),
          capability-routed (<code className="inline">--capabilities</code>), or auctioned
          (<code className="inline">--offer</code>)  -  and print the reply. By default it waits with{" "}
          <code className="inline">--scope=terminal</code>, which tags the TASK with{" "}
          <code className="inline">finalize</code> so a stock worker&rsquo;s AGENT_OUTPUT is promoted
          to FINAL (terminal-handler finalize).
        </p>
        <CodeBlock html={cliDispatchSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-registry" eyebrow="CLI · 08" title="cosmo registry">
        <p className="docs-p">
          Inspect the live Neuron registry of a namespace.{" "}
          <code className="inline">cosmo registry list</code> emits a{" "}
          <code className="inline">DISCOVER</code> Signal, collects the REGISTER replies for{" "}
          <code className="inline">--timeout</code> seconds, and prints every Neuron that announced
          itself  -  no <code className="inline">registry_store</code> required.
        </p>
        <CodeBlock html={cliRegistrySnippet} maxWidth={820} />
      </Section>

      <Section id="cli-answer" eyebrow="CLI · 09" title="cosmo answer">
        <p className="docs-p">
          Be the human in the loop from the shell. <code className="inline">cosmo answer</code>{" "}
          watches a namespace for <code className="inline">CLARIFICATION</code> /{" "}
          <code className="inline">PERMISSION</code> requests and prompts you for each one. By
          default it emits the discrete <code className="inline">CLARIFICATION_ANSWER</code> /{" "}
          <code className="inline">PERMISSION_DECISION</code> signal (consumed via{" "}
          <code className="inline">await_decision()</code> or the matching handlers); pass{" "}
          <code className="inline">--redispatch</code> to instead close the loop by re-dispatching a
          follow-up TASK to the asking Neuron.
        </p>
        <CodeBlock html={cliAnswerSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-schema" eyebrow="CLI · 10" title="cosmo schema">
        <p className="docs-p">
          Print the machine-checkable JSON Schema of the Signal envelope (protocol major version
          1), or the <code className="inline">SignalType</code> vocabulary with{" "}
          <code className="inline">--types</code>. Useful for wiring non-SDK producers and CI
          contract checks.
        </p>
        <CodeBlock html={cliSchemaSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-config" eyebrow="CLI · 11" title="Configuration & environment">
        <p className="docs-p">
          The 0.1.x line keeps configuration explicit  -  every option is a command-line flag. There is no TOML
          config file yet (a layered config file is a future addition). The one environment variable
          the CLI honours today controls where the dev synapse stores its run state.
        </p>
        <CodeBlock html={configSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-exit-codes" eyebrow="CLI · 12" title="Exit codes">
        <p className="docs-p">
          <code className="inline">cosmo</code> uses a small, conventional set of exit codes so CI
          scripts and shell pipelines stay predictable.
        </p>
        <CodeBlock html={exitCodesSnippet} maxWidth={760} />
      </Section>
    </>
  );

  return pickSection(all, section);
}
