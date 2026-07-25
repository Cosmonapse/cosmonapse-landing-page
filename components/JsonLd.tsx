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
        "Cosmonapse builds the open protocol and SDKs for event-driven AI agents and reactive multi-agent harnesses.",
      email: "dev@cosmonapse.com",
      sameAs: [
        "https://x.com/Cosmonapse",
        "https://github.com/Cosmonapse",
        "https://www.reddit.com/r/cosmonapse/",
        "https://www.producthunt.com/products/cosmonapse",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "Open protocol and SDK for event-driven AI agents and reactive multi-agent harnesses.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "AI agent framework",
      operatingSystem: "Linux, macOS, Windows",
      url: SITE_URL,
      downloadUrl: GITHUB,
      softwareVersion: "0.1.8",
      license: "https://www.apache.org/licenses/LICENSE-2.0",
      programmingLanguage: ["Python", "TypeScript"],
      description:
        "Cosmonapse is an open protocol and SDK for building event-driven AI agents. Agents communicate as Neurons over a single Signal envelope on one channel, so multi-agent harnesses are choreographed reactively instead of driven by an orchestrator loop. Python and TypeScript SDKs, a cosmo CLI, shared Engram memory, and Doppler Prism observability.",
      featureList: [
        "Event-driven signal envelope shared by every agent",
        "Reactive choreography with no central orchestrator loop",
        "Replaceable Neurons behind a uniform Axon interface",
        "Engram shared memory over RECALL / IMPRINT signals",
        "Capability-based routing and task bidding",
        "Live Signal observability through Doppler Prism",
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
