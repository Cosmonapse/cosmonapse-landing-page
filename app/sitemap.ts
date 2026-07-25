import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { DOC_REFS } from "./docs/docsNav";

/**
 * Sitemap. Docs routes are derived from DOC_REFS so a new section added to
 * the sidebar is indexed automatically. Redirect-only routes (/docs,
 * /docs/python, /docs/typescript, /docs/engram, /docs/cli) are excluded -
 * a sitemap should only list 200s.
 */

const EXAMPLE_SLUGS = [
  "building-a-neuron",
  "orchestrator-api",
  "round-robin",
  "pathway",
  "engram-integration",
  "no-orchestrator",
  "real-world-neurons",
  "capability-routing",
  "bidding",
  "rag",
  "rag-mcp",
  "retry",
  "agent",
  "tutorials",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core = [
    { url: `${SITE_URL}/`, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE_URL}/quickstart`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${SITE_URL}/protocol`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${SITE_URL}/concepts`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/examples`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE_URL}/observability`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/roadmap`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE_URL}/community-examples`, priority: 0.4, changeFrequency: "monthly" },
  ].map((e) => ({ ...e, lastModified: now })) as MetadataRoute.Sitemap;

  const examples: MetadataRoute.Sitemap = EXAMPLE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/examples/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const docs: MetadataRoute.Sitemap = DOC_REFS.flatMap((ref) =>
    ref.sections.map((sec) => ({
      url: `${SITE_URL}${ref.base}/${sec.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  return [...core, ...examples, ...docs];
}
