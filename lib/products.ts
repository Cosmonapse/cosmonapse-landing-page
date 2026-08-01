/**
 * The Cosmonapse product suite.
 *
 * One source of truth shared by the homepage grid, the Nav "Products"
 * dropdown, and the Footer column, so a product can never be described three
 * different ways on three different surfaces.
 *
 * Colours are drawn from the existing theme accents rather than new tokens,
 * which keeps every product legible in both dark and light mode for free:
 *   Core    -> --accent    (violet / navy)
 *   Genesis -> --accent-3  (pink / vermillion)
 *   Prism   -> --accent-2  (cyan / rust)
 */

export type ProductStatus = "ships" | "building" | "planned";

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  ships: "Ships today",
  building: "In development",
  planned: "Planned",
};

export const PRODUCT_STATUS_COLOR: Record<ProductStatus, string> = {
  ships: "var(--ok-strong)",
  building: "var(--warn)",
  planned: "var(--status-none)",
};

export type Product = {
  /** Route on this site. */
  href: string;
  /** Full name as it appears in a heading. */
  name: string;
  /** Short name for chips, nav rows and eyebrows. */
  short: string;
  /** One line: what it is. Used in the nav dropdown. */
  role: string;
  /** One paragraph: why it exists. Used on the homepage card. */
  desc: string;
  /** The command that starts it, if there is one. */
  command?: string;
  color: string;
  status: ProductStatus;
  /** Three concrete capabilities. Homepage card bullets. */
  bullets: string[];
};

export const PRODUCTS: Product[] = [
  {
    href: "/core",
    name: "Cosmonapse Core",
    short: "Core",
    role: "The protocol, SDK and runtime engine",
    desc:
      "The open Apache 2.0 protocol and the runtime that speaks it. One Signal envelope, one Synapse, replaceable Neurons. Memory (Engram), tools (Effector) and interfaces (Receptor) are first-class primitives, not framework add-ons - and the transport swaps from in-process to NATS or Kafka by changing a URL.",
    command: "pip install cosmonapse",
    color: "var(--accent)",
    status: "ships",
    bullets: [
      "Signal envelope spec + the Python reference SDK",
      "Neuron, Axon, Dendrite, Engram, Effector, Receptor primitives",
      "Memory, NATS and Kafka transports behind one URL",
    ],
  },
  {
    href: "/genesis",
    name: "Cosmonapse Genesis",
    short: "Genesis",
    role: "Design, build and test event-driven systems",
    desc:
      "The designer. Name a brain, scaffold it, and grow it on a canvas - one Synapse surrounded by the Neurons that think, Engrams that remember, Effectors that act and Receptors that listen. Genesis writes each module into your project as real source you own, edits it through the AST rather than regenerating it, then runs the brain and lets you talk to it without leaving the browser.",
    command: "cosmo genesis",
    color: "var(--accent-3)",
    status: "ships",
    bullets: [
      "Canvas: place a primitive, Genesis writes the module and wires brain.py",
      "Code: declarations as forms, handlers as code, edits applied through the AST",
      "Test: run brain.py and drive its Receptors by terminal, HTTP or chat",
    ],
  },
  {
    href: "/prism",
    name: "Cosmonapse Prism",
    short: "Prism",
    role: "Observability for running agent systems",
    desc:
      "The observability plane. Prism is a read-only tap on the Synapse - it never claims a Signal - and turns one event stream into five views: the live neural graph, the per-run execution graph, the causal tree of a task, the raw Signal list, and metrics. Every number is derived from timestamps and lineage already in the envelope, so there is nothing to instrument and nothing extra for the SDK to emit.",
    command: "cosmo prism",
    color: "var(--accent-2)",
    status: "ships",
    bullets: [
      "Brain View: watch Signals fire between participants in real time",
      "Signal Tree: causal parentage from TASK to FINAL, sub-tasks nested",
      "Metrics: success rate, latency, memory hit rate, HITL waits, bidding",
    ],
  },
];

/** Not a product yet - shown as the honest next step, never as a feature. */
export const NEXT_UP = {
  name: "Deployment",
  desc:
    "Serving a brain as a managed, quota-enforced, credential-scoped service is the next layer. Today you deploy Cosmonapse the way you deploy any Python or Node service.",
  status: "planned" as ProductStatus,
};
