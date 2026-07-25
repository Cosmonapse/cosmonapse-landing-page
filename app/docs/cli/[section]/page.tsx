import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsShell from "../../DocsShell";
import CliDocs from "../../cli";
import { refByBase, sectionBySlug } from "../../docsNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { docsMetadata, KW_HARNESS } from "@/lib/seo";

const BASE = "/docs/cli";

export function generateStaticParams() {
  return refByBase(BASE)!.sections.map((s) => ({ section: s.slug }));
}

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  const sec = sectionBySlug(BASE, params.section);
  return docsMetadata({
    sectionLabel: sec?.label,
    blurb: sec?.blurb,
    refLabel: "cosmo CLI",
    refDescription:
      "Reference for the cosmo developer CLI - commands, flags, configuration, and exit codes for running and inspecting agent harnesses.",
    path: `${BASE}/${params.section}`,
    keywords: [...KW_HARNESS, "cosmo CLI", "AI agent CLI", "agent developer tools"],
  });
}

export default function CliSectionPage({ params }: { params: { section: string } }) {
  const sec = sectionBySlug(BASE, params.section);
  if (!sec) notFound();

  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Docs", path: "/docs/cli" },
          { name: "cosmo CLI", path: "/docs/cli" },
          { name: sec.label.replace(/\s+-\s+/g, " - "), path: `${BASE}/${sec.slug}` },
        ]}
      />
    <DocsShell
      title="cosmo CLI reference."
      sub={
        <>
          Every command and flag for the <code className="inline">cosmo</code> developer CLI, verified
          against <code className="inline">packages/cli</code>.
        </>
      }
    >
      <CliDocs section={sec.id} />
    </DocsShell>
    </>
  );
}
