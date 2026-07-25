import { SITE_URL } from "@/lib/seo";

/**
 * BreadcrumbList structured data for nested routes. Emits no markup - the
 * site already shows its own visual breadcrumb / eyebrow, this is purely
 * the machine-readable trail so search results render a path instead of a
 * bare URL.
 */

export type Crumb = { name: string; path: string };

export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
