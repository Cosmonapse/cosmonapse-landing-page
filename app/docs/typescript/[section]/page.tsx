import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsShell from "../../DocsShell";
import TypeScriptDocs from "../../typescript";
import { refByBase, sectionBySlug } from "../../docsNav";

const BASE = "/docs/typescript";

export function generateStaticParams() {
  return refByBase(BASE)!.sections.map((s) => ({ section: s.slug }));
}

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  const sec = sectionBySlug(BASE, params.section);
  return {
    title: sec
      ? `${sec.label}  -  TypeScript SDK Reference  -  Cosmonapse`
      : "TypeScript SDK Reference  -  Cosmonapse",
    description:
      "Cosmonapse @cosmonapse/sdk TypeScript API reference  -  wire-compatible with the Python SDK.",
  };
}

export default function TypeScriptSectionPage({ params }: { params: { section: string } }) {
  const sec = sectionBySlug(BASE, params.section);
  if (!sec) notFound();

  return (
    <DocsShell
      title="TypeScript SDK reference."
      sub={
        <>
          The <code className="inline">@cosmonapse/sdk</code> surface  -  the idiomatic TypeScript port
          of the same protocol. Verified against <code className="inline">packages/ts-sdk</code>.
        </>
      }
    >
      <TypeScriptDocs section={sec.id} />
    </DocsShell>
  );
}
