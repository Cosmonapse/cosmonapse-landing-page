import CodeBlock from "@/components/CodeBlock";
import { Section, type TocGroup } from "./shared";

export const cliToc: TocGroup = {
  title: "cosmo CLI",
  items: [
    { href: "#cli-overview", label: "Overview" },
    { href: "#cli-synapse", label: "cosmo synapse" },
    { href: "#cli-doppler", label: "cosmo doppler" },
    { href: "#cli-validate", label: "cosmo validate" },
    { href: "#cli-dispatch", label: "cosmo dispatch (v0.3)" },
    { href: "#cli-registry", label: "cosmo registry (v0.3)" },
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
  doppler    Attach a read-only Doppler to a Synapse namespace.
  synapse    Manage Cosmonapse synapse servers (start / view / stop).
  validate   Validate Signal envelopes against the spec.

<span class="tk-cm"># Planned for v0.3: dispatch, registry.</span>`;

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
  cosmo doppler <span class="tk-op">--</span>synapse <span class="tk-op">&lt;</span>url/namespace<span class="tk-op">&gt;</span> [filters] [output]

Options
  <span class="tk-op">--</span>synapse <span class="tk-op">&lt;</span>url/ns<span class="tk-op">&gt;</span>      REQUIRED. Synapse URL incl. namespace,
                          e.g. cosmo://127.0.0.1:7070/dev
  <span class="tk-op">--</span>type <span class="tk-op">&lt;</span>TYPE<span class="tk-op">&gt;</span>            Filter to specific signal types. Repeatable.
  <span class="tk-op">--</span>trace <span class="tk-op">&lt;</span>trc_…<span class="tk-op">&gt;</span>          Filter to a single trace_id.
  <span class="tk-op">--</span>neuron <span class="tk-op">&lt;</span>id<span class="tk-op">&gt;</span>            Filter to a single neuron id.
  <span class="tk-op">--</span>json                   Output one JSON object per line (CLI mode).
  <span class="tk-op">--</span>payload                Show a payload preview alongside each signal.
  <span class="tk-op">--</span>ui                     Launch a browser UI instead of stdout.
  <span class="tk-op">--</span>port <span class="tk-op">&lt;</span>n<span class="tk-op">&gt;</span>              Local port for the UI server. Default: 7072

Examples

<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>synapse<span class="tk-op">=</span>cosmo://127.0.0.1:7070/quickstart
  REGISTER      neuron<span class="tk-op">=</span>hello-neuron
  TASK          trace<span class="tk-op">=</span>trc_…  neuron<span class="tk-op">=</span>hello-neuron
  AGENT_OUTPUT  trace<span class="tk-op">=</span>trc_…  neuron<span class="tk-op">=</span>hello-neuron

<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>synapse<span class="tk-op">=</span>cosmo://127.0.0.1:7070/dev <span class="tk-op">--</span>type<span class="tk-op">=</span>AGENT_OUTPUT <span class="tk-op">--</span>type<span class="tk-op">=</span>ERROR
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>synapse<span class="tk-op">=</span>cosmo://127.0.0.1:7070/dev <span class="tk-op">--</span>trace<span class="tk-op">=</span>trc_01JV…
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>synapse<span class="tk-op">=</span>cosmo://127.0.0.1:7070/dev <span class="tk-op">--</span>json <span class="tk-op">|</span> jq <span class="tk-str">'select(.type=="ERROR")'</span>`;

const cliValidateSnippet = `<span class="tk-op">$</span> cosmo validate <span class="tk-op">--</span>help

Validate Signal envelopes against the spec — from a file, stdin, or live.

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

const cliDispatchSnippet = `<span class="tk-cm"># cosmo dispatch — planned for v0.3.</span>
<span class="tk-cm"># Will fire a single TASK from the shell and optionally wait for FINAL / ERROR.</span>
<span class="tk-cm"># Not available in v0.2 — dispatch from Python instead:</span>

<span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatch_task</span>(
    neuron<span class="tk-op">=</span><span class="tk-str">"answerer"</span>,
    input<span class="tk-op">=</span>{<span class="tk-str">"q"</span>: <span class="tk-str">"hi"</span>},
)`;

const cliRegistrySnippet = `<span class="tk-cm"># cosmo registry — planned for v0.3.</span>
<span class="tk-cm"># Will inspect / query a RegistryStore (list, show, capabilities, prune)</span>
<span class="tk-cm"># without writing Python. Not available in v0.2 — read the registry from</span>
<span class="tk-cm"># a Dendrite instead:</span>

snapshot <span class="tk-op">=</span> <span class="tk-kw">await</span> dendrite.<span class="tk-fn">registry_snapshot</span>(include_deregistered<span class="tk-op">=</span><span class="tk-kw">True</span>)
<span class="tk-kw">for</span> rec <span class="tk-kw">in</span> snapshot:
    <span class="tk-fn">print</span>(rec.neuron_id, rec.status, rec.capabilities)`;

const exitCodesSnippet = `<span class="tk-cm"># cosmo commands use a small, conventional set of exit codes:</span>

  0    Success.
  1    Operational / validation failure   <span class="tk-cm"># raised via SystemExit(1)</span>
  2    Invalid usage / arguments          <span class="tk-cm"># bad flags (from Click)</span>
  130  Interrupted by Ctrl-C              <span class="tk-cm"># standard POSIX SIGINT</span>`;

const configSnippet = `<span class="tk-cm"># v0.2 has no TOML config file yet — flags are passed explicitly.</span>
<span class="tk-cm"># The only environment variable the CLI reads today:</span>

  COSMONAPSE_STATE_DIR    <span class="tk-cm"># where 'cosmo synapse' keeps its run state.</span>
                          <span class="tk-cm"># Default: ~/.cosmonapse</span>

<span class="tk-cm"># Example: keep dev-synapse state under the repo</span>
<span class="tk-op">$</span> COSMONAPSE_STATE_DIR<span class="tk-op">=</span>./.cosmo-state cosmo synapse start memory <span class="tk-op">-n</span> dev`;

/* ─────────────────────────────  COMPONENT  ───────────────────────────── */

export default function CliDocs() {
  return (
    <>
      <div className="docs-megasection">
        <div className="docs-megasection-label">cosmo CLI</div>
        <h2 className="docs-megasection-title">
          The command-line interface to a Cosmonapse fabric.
        </h2>
        <p className="docs-megasection-sub">
          <code className="inline">cosmo</code> is the operator&rsquo;s entry point: boot a dev
          synapse, tail traffic, and validate envelopes. It is a Click application installed
          alongside the Python SDK. Dispatch and registry subcommands are planned for v0.3.
        </p>
      </div>

      <Section id="cli-overview" eyebrow="CLI · 01" title="Overview">
        <p className="docs-p">
          <code className="inline">cosmo</code> is installed when you{" "}
          <code className="inline">pip install cosmonapse</code> — the CLI ships inside that single
          distribution (entry point <code className="inline">cosmo.main:cli</code>). Once installed,
          the binary is on your <code className="inline">PATH</code>. In v0.2 it exposes three
          commands.
        </p>
        <CodeBlock html={cliRootSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-synapse" eyebrow="CLI · 02" title="cosmo synapse">
        <p className="docs-p">
          Boot the local dev synapse — a zero-dependency TCP + NDJSON broker — and stream every
          Signal that crosses it. The same subject-matching semantics as MemorySynapse and NATS, so
          code written against the dev server runs unchanged in production.
        </p>
        <CodeBlock html={cliSynapseSnippet} maxWidth={860} />
        <p className="docs-p">
          Run state (which namespaces are live, on which ports) is kept under{" "}
          <code className="inline">~/.cosmonapse</code> by default — override the location with the{" "}
          <code className="inline">COSMONAPSE_STATE_DIR</code> environment variable.{" "}
          <code className="inline">cosmo synapse stop</code> reads that state to find the running
          server.
        </p>
      </Section>

      <Section id="cli-doppler" eyebrow="CLI · 03" title="cosmo doppler">
        <p className="docs-p">
          A Doppler is any process that subscribes to the channel as a passive, read-only consumer.{" "}
          <code className="inline">cosmo doppler</code> is the built-in one — it tails every envelope,
          applies filters, and renders to stdout (or a browser UI with{" "}
          <code className="inline">--ui</code>). Pass <code className="inline">--json</code> to emit
          one JSON object per line for piping to <code className="inline">jq</code>. The{" "}
          <code className="inline">--synapse</code> flag is required and carries the namespace as its
          path segment.
        </p>
        <CodeBlock html={cliDopplerSnippet} maxWidth={860} />
      </Section>

      <Section id="cli-validate" eyebrow="CLI · 04" title="cosmo validate">
        <p className="docs-p">
          Validate Signal envelopes against the spec. Pass a JSON file as the positional argument, or
          pipe one in on stdin; add <code className="inline">--live</code> to validate signals as they
          cross a synapse. <code className="inline">--strict</code> exits 1 on the first violation;{" "}
          <code className="inline">--warnings</code> surfaces advisory issues too.
        </p>
        <CodeBlock html={cliValidateSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-dispatch" eyebrow="CLI · 05" title="cosmo dispatch — planned (v0.3)">
        <p className="docs-p">
          A one-off TASK from the shell is on the roadmap for v0.3. Until then, dispatch from Python
          with <code className="inline">dispatch_task()</code>.
        </p>
        <CodeBlock html={cliDispatchSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-registry" eyebrow="CLI · 06" title="cosmo registry — planned (v0.3)">
        <p className="docs-p">
          A registry inspector (<code className="inline">list</code> / <code className="inline">show</code>{" "}
          / <code className="inline">capabilities</code> / <code className="inline">prune</code>) is
          also planned for v0.3. For now, read the registry from a Dendrite that was given a{" "}
          <code className="inline">registry_store</code>.
        </p>
        <CodeBlock html={cliRegistrySnippet} maxWidth={820} />
      </Section>

      <Section id="cli-config" eyebrow="CLI · 07" title="Configuration & environment">
        <p className="docs-p">
          v0.2 keeps configuration explicit — every option is a command-line flag. There is no TOML
          config file yet (a layered config file is a future addition). The one environment variable
          the CLI honours today controls where the dev synapse stores its run state.
        </p>
        <CodeBlock filename="env" html={configSnippet} maxWidth={820} />
      </Section>

      <Section id="cli-exit-codes" eyebrow="CLI · 08" title="Exit codes">
        <p className="docs-p">
          <code className="inline">cosmo</code> uses a small, conventional set of exit codes so CI
          scripts and shell pipelines stay predictable.
        </p>
        <CodeBlock html={exitCodesSnippet} maxWidth={760} />
      </Section>
    </>
  );
}
