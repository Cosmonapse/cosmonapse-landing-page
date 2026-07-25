import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsShell from "../../DocsShell";
import TypeScriptDocs from "../../typescript";
import { refByBase, sectionBySlug } from "../../docsNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { docsMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";

const BASE = "/docs/typescript";

export function generateStaticParams() {
  return refByBase(BASE)!.sections.map((s) => ({ section: s.slug }));
}

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  const sec = sectionBySlug(BASE, params.section);
  return docsMetadata({
    sectionLabel: sec?.label,
    blurb: sec?.blurb,
    refLabel: "TypeScript SDK",
    refDescription:
      "Cosmonapse @cosmonapse/sdk TypeScript API reference - wire-compatible with the Python SDK for building event-driven AI agents in Node.",
    path: `${BASE}/${params.section}`,
    keywords: [...KW_HARNESS, ...KW_EVENT_DRIVEN, "TypeScript AI agent SDK", "Node.js agent framework", "@cosmonapse/sdk"],
  });
}

export default function TypeScriptSectionPage({ params }: { params: { section: string } }) {
  const sec = sectionBySlug(BASE, params.section);
  if (!sec) notFound();

  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Docs", path: "/docs/typescript" },
          { name: "TypeScript SDK", path: "/docs/typescript" },
          { name: sec.label.replace(/\s+-\s+/g, " - "), path: `${BASE}/${sec.slug}` },
        ]}
      />
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
    </>
  );
}
