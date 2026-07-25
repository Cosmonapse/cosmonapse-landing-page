/**
 * Documentation navigation  -  pure data, no JSX.
 *
 * Each reference (Python / TypeScript / CLI) is a dropdown in the docs
 * sidebar. Every section is its own route: `${base}/${slug}`. `id` is the
 * <Section id> the content component filters on; `slug` is the URL segment.
 *
 * Importing this from a client component is safe because it pulls in no
 * React components  -  only plain objects.
 */

export type DocSection = {
  slug: string;
  id: string;
  label: string;
  /** One-sentence SEO description for this section's page. */
  blurb?: string;
};
export type DocRef = { base: string; label: string; sections: DocSection[] };

export const DOC_REFS: DocRef[] = [
  {
    base: "/docs/python",
    label: "Python SDK",
    sections: [
      { slug: "installation", id: "install", label: "Installation",
        blurb:
          "Install the Cosmonapse Python SDK with pip and check the Python 3.11+ requirement before building your first event-driven agent." },
      { slug: "imports", id: "imports", label: "Top-level imports",
        blurb:
          "Every top-level symbol the cosmonapse Python package exports - what to import for Neurons, Axons, Dendrites, Pathways, Signals, and Engrams." },
      { slug: "neuron", id: "neuron", label: "Neuron  -  sources",
        blurb:
          "The Neuron is the unit of work in an event-driven agent system. Sources, handler signatures, and how a Neuron services Signals it receives." },
      { slug: "axon", id: "axon", label: "Axon",
        blurb:
          "Axon wires a model or service into the protocol as a Neuron. Built-in adapters for OpenAI, Anthropic, Hugging Face, and custom endpoints." },
      { slug: "dendrite", id: "dendrite", label: "Dendrite",
        blurb:
          "Dendrite is the only component that touches the Synapse. Attach Axons, dispatch tasks, and subscribe to the event channel." },
      { slug: "pathway", id: "pathway", label: "Pathway",
        blurb:
          "Pathway gives one trace three consumption shapes - await for request/reply, handlers for reactive callbacks, and async iteration for streaming." },
      { slug: "engram", id: "engram", label: "Engram (shared memory)",
        blurb:
          "Engram is shared memory for Neurons, serviced over RECALL and IMPRINT signals. In-memory, SQLite, Postgres, and vector backends behind one API." },
      { slug: "cortex", id: "cortex", label: "Cortex (alias)",
        blurb:
          "Cortex is the orchestrator alias of Dendrite - the same primitive, named for the role it plays when it coordinates other Neurons." },
      { slug: "lifecycle", id: "lifecycle", label: "Lifecycle hooks",
        blurb:
          "Lifecycle hooks let you run setup and teardown around a Neuron's event handling without subclassing anything." },
      { slug: "synapse", id: "synapse", label: "Synapse",
        blurb:
          "Synapse is the channel every Signal crosses. Connect to an in-process bus for development or NATS and Kafka for production." },
      { slug: "registry", id: "registry", label: "RegistryStore",
        blurb:
          "RegistryStore tracks which Neurons are live and what capabilities they advertise - the discovery layer behind capability-based routing." },
      { slug: "signal", id: "signal", label: "Signal & SignalType",
        blurb:
          "Signal and SignalType define the event envelope every agent speaks. Field-by-field reference for the protocol's shared contract." },
      { slug: "helpers", id: "helpers", label: "ID helpers",
        blurb:
          "ID helpers for generating and parsing the event, trace, and parent identifiers that stitch a distributed agent run together." },
      { slug: "errors", id: "errors", label: "Protocol errors",
        blurb:
          "Protocol error types the Python SDK raises, what triggers each one, and how to handle them inside an agent harness." },
    ],
  },
  {
    base: "/docs/typescript",
    label: "TypeScript SDK",
    sections: [
      { slug: "installation", id: "ts-install", label: "Installation",
        blurb:
          "Install @cosmonapse/sdk with npm and check the Node 18+ requirement before building event-driven agents in TypeScript." },
      { slug: "imports", id: "ts-imports", label: "Top-level imports",
        blurb:
          "Every top-level symbol @cosmonapse/sdk exports - what to import for Neurons, Axons, Dendrites, Pathways, Signals, and Engrams." },
      { slug: "axon", id: "ts-axon", label: "Axon",
        blurb:
          "Axon wires a model or service into the protocol as a Neuron, with TypeScript adapters for OpenAI, Anthropic, Hugging Face, and custom endpoints." },
      { slug: "neuron", id: "ts-neuron", label: "Neuron  -  sources & clarify",
        blurb:
          "The Neuron is the unit of work in a TypeScript agent harness - sources, clarify flow, and handler signatures." },
      { slug: "dendrite", id: "ts-dendrite", label: "Dendrite",
        blurb:
          "Dendrite is the only component that touches the Synapse. Attach Axons, dispatch tasks, and subscribe to the event channel from TypeScript." },
      { slug: "pathway", id: "ts-pathway", label: "Pathway",
        blurb:
          "Pathway gives one trace three consumption shapes in TypeScript - await, on() handlers for reactive callbacks, and async iteration for streaming." },
      { slug: "synapse", id: "ts-synapse", label: "Synapse",
        blurb:
          "Synapse is the channel every Signal crosses. Connect from Node to an in-process bus, NATS, or Kafka." },
      { slug: "registry", id: "ts-registry", label: "RegistryStore",
        blurb:
          "RegistryStore tracks which Neurons are live and what capabilities they advertise - the discovery layer behind capability-based routing." },
      { slug: "engram", id: "ts-engram", label: "Engram (shared memory)",
        blurb:
          "Engram is shared memory for Neurons, serviced over RECALL and IMPRINT signals, with the same API surface as the Python SDK." },
      { slug: "signal", id: "ts-signal", label: "Signal & SignalType",
        blurb:
          "Signal and SignalType define the event envelope every agent speaks. TypeScript types for the protocol's shared contract." },
      { slug: "helpers", id: "ts-ids", label: "ID & trace helpers",
        blurb:
          "ID and trace helpers for generating and propagating the identifiers that stitch a distributed agent run together." },
      { slug: "errors", id: "ts-errors", label: "Protocol errors",
        blurb:
          "Protocol error types the TypeScript SDK throws, what triggers each one, and how to handle them inside an agent harness." },
      { slug: "parity", id: "ts-parity", label: "Parity with Python",
        blurb:
          "Where the TypeScript SDK matches the Python SDK and where it intentionally differs - the parity table for cross-language agent systems." },
    ],
  },
  {
    base: "/docs/cli",
    label: "cosmo CLI",
    sections: [
      { slug: "overview", id: "cli-overview", label: "Overview",
        blurb:
          "The cosmo CLI in one page - scaffold a project, run a Synapse, inspect live Signals, and validate envelopes from the terminal." },
      { slug: "init", id: "cli-init", label: "cosmo init",
        blurb:
          "cosmo init scaffolds a runnable event-driven agent project - config, neurons, effectors, a brain, and a demo you can run immediately." },
      { slug: "synapse", id: "cli-synapse", label: "cosmo synapse",
        blurb:
          "cosmo synapse boots a local Synapse so agents on your machine share one event channel with no broker to install." },
      { slug: "doppler", id: "cli-doppler", label: "cosmo doppler",
        blurb:
          "cosmo doppler tails the live Signal stream in your terminal - the fastest way to see what an event-driven agent system is actually doing." },
      { slug: "prism", id: "cli-prism", label: "cosmo doppler --prism",
        blurb:
          "cosmo doppler --prism serves Doppler Prism, a local browser UI with five views over the same live Signal stream." },
      { slug: "validate", id: "cli-validate", label: "cosmo validate",
        blurb:
          "cosmo validate checks a Signal envelope against the protocol schema before you ship a Neuron that emits it." },
      { slug: "completion", id: "cli-completion", label: "cosmo completion",
        blurb:
          "Install shell completion for the cosmo CLI in bash, zsh, or fish." },
      { slug: "dispatch", id: "cli-dispatch", label: "cosmo dispatch",
        blurb:
          "cosmo dispatch sends a TASK to a live Neuron from the command line - useful for smoke-testing an agent without writing a client." },
      { slug: "registry", id: "cli-registry", label: "cosmo registry",
        blurb:
          "cosmo registry inspects which Neurons are live and what capabilities each one advertises." },
      { slug: "answer", id: "cli-answer", label: "cosmo answer",
        blurb:
          "cosmo answer runs a one-shot query against a live agent harness and prints the FINAL signal." },
      { slug: "schema", id: "cli-schema", label: "cosmo schema",
        blurb:
          "cosmo schema prints the JSON Schema for the Signal envelope so you can validate or codegen against the protocol." },
      { slug: "config", id: "cli-config", label: "Configuration & env",
        blurb:
          "Configuration files and environment variables the cosmo CLI reads, and the precedence order between them." },
      { slug: "exit-codes", id: "cli-exit-codes", label: "Exit codes",
        blurb:
          "Every exit code the cosmo CLI returns and what each one means when scripting against it." },
    ],
  },
];

export function refByBase(base: string): DocRef | undefined {
  return DOC_REFS.find((r) => r.base === base);
}

export function sectionBySlug(base: string, slug: string): DocSection | undefined {
  return refByBase(base)?.sections.find((s) => s.slug === slug);
}
