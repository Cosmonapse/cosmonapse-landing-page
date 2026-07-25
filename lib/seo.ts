/**
 * Central SEO configuration.
 *
 * Every page builds its <head> through `pageMetadata()` so that canonical
 * URLs, OpenGraph, and Twitter cards stay consistent and can never drift.
 * Keyword clusters live here too - the three we compete on are
 * event-driven AI, reactive AI, and harness engineering.
 */

import type { Metadata } from "next";

export const SITE_URL = "https://cosmonapse.dev";
export const SITE_NAME = "Cosmonapse";
export const TWITTER = "@Cosmonapse";

/** Head term. Everything else on the site orbits this phrase. */
export const PRIMARY_KEYWORD = "event-driven AI agents";

/** Cluster 1 - event-driven / signal-based agent architecture. */
export const KW_EVENT_DRIVEN = [
  "event-driven AI",
  "event-driven AI agents",
  "event-driven agent architecture",
  "event-driven multi-agent systems",
  "event-driven LLM orchestration",
  "agent event bus",
  "signal-based agents",
  "message-driven AI agents",
  "pub/sub AI agents",
  "asynchronous AI agents",
];

/** Cluster 2 - reactive AI / reactive systems heritage. */
export const KW_REACTIVE = [
  "reactive AI",
  "reactive AI agents",
  "reactive agent framework",
  "reactive multi-agent systems",
  "reactive AI architecture",
  "event-driven vs orchestrated agents",
  "choreography over orchestration",
  "backpressure for AI agents",
  "streaming agent responses",
];

/** Cluster 3 - harness engineering (the category we are defining). */
export const KW_HARNESS = [
  "harness engineering",
  "AI harness engineering",
  "agent harness",
  "LLM harness",
  "model harness",
  "multi-agent harness",
  "agent harness framework",
  "building an AI agent harness",
  "context engineering",
  "agent runtime",
];

/** Product / protocol terms that convert once someone is already looking. */
export const KW_PRODUCT = [
  "Cosmonapse",
  "agent protocol",
  "open agent protocol",
  "multi-agent framework",
  "AI agent SDK",
  "Python agent framework",
  "TypeScript agent framework",
  "distributed cognition",
  "A2A protocol alternative",
  "agent observability",
];

export const KEYWORDS_ALL = [
  ...KW_EVENT_DRIVEN,
  ...KW_REACTIVE,
  ...KW_HARNESS,
  ...KW_PRODUCT,
];

export type PageSeo = {
  /** Title without the site suffix - the suffix is applied by the template. */
  title: string;
  description: string;
  /** Root-relative path, e.g. "/quickstart". Used for the canonical URL. */
  path: string;
  keywords?: string[];
  /** Set true only for pages that should stay out of the index. */
  noindex?: boolean;
};

/**
 * Build a complete Metadata object: canonical + OpenGraph + Twitter, all
 * derived from one description so the three never disagree.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noindex,
}: PageSeo): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: keywords && keywords.length ? keywords : undefined,
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: TWITTER,
      creator: TWITTER,
    },
  };
}

/**
 * Metadata for a docs reference section. Falls back to the reference-level
 * description when a section has no blurb of its own, so a newly added
 * sidebar entry is never left with an empty <meta description>.
 */
export function docsMetadata(opts: {
  sectionLabel?: string;
  blurb?: string;
  refLabel: string;
  refDescription: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const { sectionLabel, blurb, refLabel, refDescription, path, keywords } = opts;

  // Sidebar labels use an em-dash-ish "  -  " separator; collapse it so the
  // title reads cleanly in a SERP.
  const label = sectionLabel?.replace(/\s+-\s+/g, " - ").trim();

  return pageMetadata({
    title: label ? `${label} - ${refLabel} Reference` : `${refLabel} Reference`,
    description: blurb ?? refDescription,
    path,
    keywords,
  });
}
