import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsShell from "../../DocsShell";
import CliDocs from "../../cli";
import { refByBase, sectionBySlug } from "../../docsNav";

const BASE = "/docs/cli";

export function generateStaticParams() {
  return refByBase(BASE)!.sections.map((s) => ({ section: s.slug }));
}

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  const sec = sectionBySlug(BASE, params.section);
  return {
    title: sec
      ? `${sec.label} — cosmo CLI Reference — Cosmonapse`
      : "cosmo CLI Reference — Cosmonapse",
    description:
      "Reference for the cosmo developer CLI — commands, flags, configuration, and exit codes.",
  };
}

export default function CliSectionPage({ params }: { params: { section: string } }) {
  const sec = sectionBySlug(BASE, params.section);
  if (!sec) notFound();

  return (
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
  );
}
