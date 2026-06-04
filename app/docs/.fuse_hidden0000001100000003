/**
 * Documentation navigation — pure data, no JSX.
 *
 * Each reference (Python / TypeScript / CLI) is a dropdown in the docs
 * sidebar. Every section is its own route: `${base}/${slug}`. `id` is the
 * <Section id> the content component filters on; `slug` is the URL segment.
 *
 * Importing this from a client component is safe because it pulls in no
 * React components — only plain objects.
 */

export type DocSection = { slug: string; id: string; label: string };
export type DocRef = { base: string; label: string; sections: DocSection[] };

export const DOC_REFS: DocRef[] = [
  {
    base: "/docs/python",
    label: "Python SDK",
    sections: [
      { slug: "installation", id: "install", label: "Installation" },
      { slug: "imports", id: "imports", label: "Top-level imports" },
      { slug: "neuron", id: "neuron", label: "Neuron — sources" },
      { slug: "axon", id: "axon", label: "Axon" },
      { slug: "dendrite", id: "dendrite", label: "Dendrite" },
      { slug: "pathway", id: "pathway", label: "Pathway" },
      { slug: "engram", id: "engram", label: "Engram (shared memory)" },
      { slug: "cortex", id: "cortex", label: "Cortex (alias)" },
      { slug: "lifecycle", id: "lifecycle", label: "Lifecycle hooks" },
      { slug: "synapse", id: "synapse", label: "Synapse" },
      { slug: "registry", id: "registry", label: "RegistryStore" },
      { slug: "signal", id: "signal", label: "Signal & SignalType" },
      { slug: "helpers", id: "helpers", label: "ID helpers" },
      { slug: "errors", id: "errors", label: "Protocol errors" },
    ],
  },
  {
    base: "/docs/typescript",
    label: "TypeScript SDK",
    sections: [
      { slug: "installation", id: "ts-install", label: "Installation" },
      { slug: "imports", id: "ts-imports", label: "Top-level imports" },
      { slug: "axon", id: "ts-axon", label: "Axon" },
      { slug: "neuron", id: "ts-neuron", label: "Neuron — sources & clarify" },
      { slug: "dendrite", id: "ts-dendrite", label: "Dendrite" },
      { slug: "synapse", id: "ts-synapse", label: "Synapse" },
      { slug: "registry", id: "ts-registry", label: "RegistryStore" },
      { slug: "signal", id: "ts-signal", label: "Signal & SignalType" },
      { slug: "helpers", id: "ts-ids", label: "ID helpers" },
      { slug: "errors", id: "ts-errors", label: "Protocol errors" },
      { slug: "parity", id: "ts-parity", label: "Parity with Python" },
    ],
  },
  {
    base: "/docs/cli",
    label: "cosmo CLI",
    sections: [
      { slug: "overview", id: "cli-overview", label: "Overview" },
      { slug: "init", id: "cli-init", label: "cosmo init" },
      { slug: "synapse", id: "cli-synapse", label: "cosmo synapse" },
      { slug: "doppler", id: "cli-doppler", label: "cosmo doppler" },
      { slug: "validate", id: "cli-validate", label: "cosmo validate" },
      { slug: "completion", id: "cli-completion", label: "cosmo completion" },
      { slug: "dispatch", id: "cli-dispatch", label: "cosmo dispatch (planned)" },
      { slug: "registry", id: "cli-registry", label: "cosmo registry (planned)" },
      { slug: "config", id: "cli-config", label: "Configuration & env" },
      { slug: "exit-codes", id: "cli-exit-codes", label: "Exit codes" },
    ],
  },
];

export function refByBase(base: string): DocRef | undefined {
  return DOC_REFS.find((r) => r.base === base);
}

export function sectionBySlug(base: string, slug: string): DocSection | undefined {
  return refByBase(base)?.sections.find((s) => s.slug === slug);
}
