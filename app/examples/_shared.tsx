import React from "react";
import type { Combo, Step } from "@/components/ComboExample";

// ---------------------------------------------------------------------------
// Transport-only snippets shared by every worked example.
//
// The Install and "start the broker" steps depend only on the transport, not
// on the topology  -  so they live here and are reused by round-robin and
// no-orchestrator alike. The worker / cortex / producer bodies are
// topology-specific and live in each example's client component.
//
// Steps carry a plain title in `eyebrow`; ComboExample auto-numbers them.
// ---------------------------------------------------------------------------

/** The synapse URL each Python combo connects to. */
export const PY_URL: Record<"py-dev" | "py-nats" | "py-kafka", string> = {
  "py-dev": "cosmo://127.0.0.1:7070",
  "py-nats": "nats://127.0.0.1:4222",
  "py-kafka": "kafka://127.0.0.1:9092",
};

export const isPython = (c: Combo) => c.startsWith("py-");

// ---------------------------------------------------------------------------
// Install
// ---------------------------------------------------------------------------

const INSTALL_HTML: Record<Combo, string> = {
  "py-dev": `<span class="tk-cm"># SDK + CLI + httpx (used by the HuggingFace Neuron wrapper)</span>
pip install <span class="tk-op">-e</span> cosmonapse-core/packages/python-sdk
pip install <span class="tk-op">-e</span> cosmonapse-core/packages/cli
pip install httpx

<span class="tk-cm"># Hugging Face token  -  read scope is enough</span>
<span class="tk-op">$</span> export HF_TOKEN<span class="tk-op">=</span>hf_xxxxxxxxxxxxxxxxxxxxxxxx`,

  "py-nats": `<span class="tk-cm"># SDK with the NATS extra + httpx for the HF Neuron</span>
pip install <span class="tk-str">"cosmonapse[nats]"</span>
pip install httpx

<span class="tk-op">$</span> export HF_TOKEN<span class="tk-op">=</span>hf_xxxxxxxxxxxxxxxxxxxxxxxx`,

  "py-kafka": `<span class="tk-cm"># SDK with the Kafka extra + httpx for the HF Neuron</span>
pip install <span class="tk-str">"cosmonapse[kafka]"</span>
pip install httpx

<span class="tk-op">$</span> export HF_TOKEN<span class="tk-op">=</span>hf_xxxxxxxxxxxxxxxxxxxxxxxx`,

  "ts-dev": `<span class="tk-cm"># The TypeScript SDK. MemorySynapse needs no broker.</span>
npm install <span class="tk-op">@</span>cosmonapse/sdk
npm install <span class="tk-op">-D</span> tsx        <span class="tk-cm"># run .ts files directly</span>`,

  "ts-nats": `<span class="tk-cm"># The TypeScript SDK + the optional nats driver</span>
npm install <span class="tk-op">@</span>cosmonapse/sdk nats
npm install <span class="tk-op">-D</span> tsx`,
};

const INSTALL_PROSE: Record<Combo, React.ReactNode> = {
  "py-dev": (
    <>
      The dev <code className="inline">devsynapse</code> ships in the CLI  -  no
      external broker to install.
    </>
  ),
  "py-nats": (
    <>
      Only the <code className="inline">nats</code> extra differs from the dev
      install. The worker, cortex, and Neuron code is byte-for-byte identical.
    </>
  ),
  "py-kafka": (
    <>
      Only the <code className="inline">kafka</code> extra differs. Kafka gives
      you a durable, replayable log of every Signal that crossed the Synapse.
    </>
  ),
  "ts-dev": (
    <>
      One package. <code className="inline">MemorySynapse</code> is in-process,
      so this combo runs in a single Node process with no broker at all.
    </>
  ),
  "ts-nats": (
    <>
      The <code className="inline">nats</code> driver is an optional dependency,
      lazy-imported only when you construct a{" "}
      <code className="inline">NatsSynapse</code>.
    </>
  ),
};

export function installStep(combo: Combo): Step {
  return {
    eyebrow: "Install",
    prose: INSTALL_PROSE[combo],
    html: INSTALL_HTML[combo],
    maxWidth: 760,
  };
}

// ---------------------------------------------------------------------------
// Start the broker  (skipped for in-process MemorySynapse)
// ---------------------------------------------------------------------------

export function brokerStep(combo: Combo): Step | null {
  switch (combo) {
    case "py-dev":
      return {
        eyebrow: "Start the Synapse",
        prose: (
          <>
            One bus, one namespace. The CLI also streams every Signal that
            crosses it to stdout, so the synapse terminal doubles as a Doppler.
            For a live view, open <strong>Prism</strong> in a second terminal
            right after the Synapse is up  -  every Signal animates across the bus
            in your browser as the workers below come online.
          </>
        ),
        maxWidth: 760,
        html: `<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>quickstart

<span class="tk-cm">  URL:        cosmo://127.0.0.1:7070</span>
<span class="tk-cm">  Namespace:  quickstart</span>
<span class="tk-cm">  Transport:  TCP + NDJSON  (single-host dev only)</span>
<span class="tk-cm">  ────────────────────────────────────────────────</span>

<span class="tk-cm"># terminal 2  -  live browser visualization (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> quickstart`,
      };
    case "py-nats":
    case "ts-nats":
      return {
        eyebrow: "Start a NATS server",
        prose: (
          <>
            Any NATS server works  -  here&apos;s the official image. Subjects,
            wildcards, queue groups and request/reply all map natively.
          </>
        ),
        maxWidth: 760,
        html: `<span class="tk-cm"># Plain NATS  -  no JetStream needed for this example</span>
<span class="tk-op">$</span> docker run <span class="tk-op">-p</span> 4222:4222 nats:2.10

<span class="tk-cm"># …or, if you have it on PATH:</span>
<span class="tk-op">$</span> nats-server

<span class="tk-cm"># optional  -  watch it live in Prism (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>nats://127.0.0.1:4222 <span class="tk-op">-n</span> quickstart`,
      };
    case "py-kafka":
      return {
        eyebrow: "Start a Kafka broker",
        prose: (
          <>
            Any Kafka-compatible broker works. Leave{" "}
            <code className="inline">auto.create.topics.enable=true</code> on so
            the <code className="inline">cosmonapse.*</code> topics appear on
            first publish.
          </>
        ),
        maxWidth: 760,
        html: `<span class="tk-cm"># Redpanda is a single-binary, Kafka-API broker  -  great for dev</span>
<span class="tk-op">$</span> docker run <span class="tk-op">-p</span> 9092:9092 \\
    redpandadata/redpanda:latest \\
    redpanda start <span class="tk-op">--</span>smp 1 <span class="tk-op">--</span>overprovisioned \\
    <span class="tk-op">--</span>kafka-addr PLAINTEXT://0.0.0.0:9092 \\
    <span class="tk-op">--</span>advertise-kafka-addr PLAINTEXT://127.0.0.1:9092

<span class="tk-cm"># optional  -  watch it live in Prism (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>kafka://127.0.0.1:9092 <span class="tk-op">-n</span> quickstart`,
      };
    case "ts-dev":
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Run-command builder.
// ---------------------------------------------------------------------------

const brokerRunLine: Record<Combo, string | null> = {
  "py-dev": `<span class="tk-cm"># terminal 1  -  the bus</span>\n<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>quickstart`,
  "py-nats": `<span class="tk-cm"># terminal 1  -  the bus</span>\n<span class="tk-op">$</span> docker run <span class="tk-op">-p</span> 4222:4222 nats:2.10`,
  "py-kafka": `<span class="tk-cm"># terminal 1  -  the bus</span>\n<span class="tk-op">$</span> docker run <span class="tk-op">-p</span> 9092:9092 redpandadata/redpanda:latest redpanda start <span class="tk-op">--</span>smp 1`,
  "ts-dev": null,
  "ts-nats": `<span class="tk-cm"># terminal 1  -  the bus</span>\n<span class="tk-op">$</span> docker run <span class="tk-op">-p</span> 4222:4222 nats:2.10`,
};

/**
 * Build the "Run the topology" step.
 * `procs` lists the terminals after the broker  -  each `cmd` is already
 * token-highlighted.
 */
export function runStep(
  combo: Combo,
  procs: { label: string; cmd: string }[],
): Step {
  const broker = brokerRunLine[combo];
  const blocks: string[] = [];
  let n = broker ? 2 : 1;
  if (broker) blocks.push(broker);
  for (const p of procs) {
    blocks.push(
      `<span class="tk-cm"># terminal ${n}  -  ${p.label}</span>\n<span class="tk-op">$</span> ${p.cmd}`,
    );
    n += 1;
  }
  return {
    eyebrow: "Run the topology",
    prose:
      combo === "ts-dev" ? (
        <>
          One process. <code className="inline">MemorySynapse</code> wires
          everything together in-memory  -  no terminals to juggle. For a
          multi-process version, switch to the NATS tab.
        </>
      ) : (
        <>
          Separate terminals, one Synapse shared by all. Start the bus first,
          then the workers, then the driver.
        </>
      ),
    maxWidth: 760,
    html: blocks.join("\n\n"),
  };
}