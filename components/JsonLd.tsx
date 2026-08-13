import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Site-wide structured data, rendered once in the root layout as a single
 * @graph so the nodes can reference each other by @id.
 *
 * Claims here must stay true: the SoftwareApplication node asserts a free,
 * Apache-2.0 developer tool - if the licence or pricing ever changes, this
 * file changes with it.
 */

const GITHUB = "https://github.com/Cosmonapse/cosmonapse-core";

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
      description:
        "Cosmonapse builds the platform suite for event-driven AI systems: the open Core protocol and SDKs, the Genesis designer, and the Prism observability plane.",
      email: "dev@cosmonapse.com",
      sameAs: [
        "https://x.com/Cosmonapse",
        "https://github.com/Cosmonapse",
        "https://www.reddit.com/r/cosmonapse/",
        "https://www.producthunt.com/products/cosmonapse",
        "https://www.youtube.com/channel/UCj_wZY6OiIRUaeKzxytHlPw",
        "https://www.instagram.com/cosmonapse/",
        "https://www.tiktok.com/@cosmonapse",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "Platform suite for event-driven AI systems - Core protocol and SDKs, Genesis designer, Prism observability.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "AI agent platform",
      operatingSystem: "Linux, macOS, Windows",
      url: SITE_URL,
      downloadUrl: GITHUB,
      softwareVersion: "0.1.11",
      license: "https://www.apache.org/licenses/LICENSE-2.0",
      programmingLanguage: "Python",
      description:
        "Cosmonapse is a platform suite for building event-driven AI systems. Core is the open protocol, SDKs and runtime: components communicate as Neurons over a single Signal envelope on one channel, so systems are choreographed reactively instead of driven by an orchestrator loop. Genesis is the designer that lays a system out on a canvas and writes real source into your project. Prism is the read-only observability plane over the same Signal stream.",
      featureList: [
        "Event-driven signal envelope shared by every agent",
        "Reactive choreography with no central orchestrator loop",
        "Replaceable Neurons behind a uniform Axon interface",
        "Engram shared memory over RECALL / IMPRINT signals",
        "Capability-based routing and task bidding",
        "Live Signal observability through Prism - graph, causal tree and metrics",
        "Genesis visual designer that writes and surgically edits real project source",
        "Receptors: CLI, HTTP and chat interfaces into the same dispatch path",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
