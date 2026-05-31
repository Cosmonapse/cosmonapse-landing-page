import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsShell from "../../DocsShell";
import PythonDocs from "../../python";
import EngramDocs from "../../engram";
import { refByBase, sectionBySlug } from "../../docsNav";

const BASE = "/docs/python";

export function generateStaticParams() {
  return refByBase(BASE)!.sections.map((s) => ({ section: s.slug }));
}

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  const sec = sectionBySlug(BASE, params.section);
  return {
    title: sec
      ? `${sec.label} — Python SDK Reference — Cosmonapse`
      : "Python SDK Reference — Cosmonapse",
    description:
      "Cosmonapse Python SDK API reference — class signatures, parameters, and worked examples.",
  };
}

export default function PythonSectionPage({ params }: { params: { section: string } }) {
  const sec = sectionBySlug(BASE, params.section);
  if (!sec) notFound();

  // Engram is a large subsystem — render the full reference inline here
  // (this is its canonical home) instead of a pointer to a second page.
  const isEngram = sec.id === "engram";

  return (
    <DocsShell
      title={isEngram ? "Engram reference." : "Python SDK reference."}
      sub={
        isEngram ? (
          <>
            The <code className="inline">cosmonapse.engram</code> subsystem — shared memory for
            Neurons, serviced over <code className="inline">RECALL</code> /{" "}
            <code className="inline">IMPRINT</code> signals. Verified against{" "}
            <code className="inline">packages/python-sdk/cosmonapse/engram</code> and{" "}
            <code className="inline">ENGRAM_DESIGN.md</code>.
          </>
        ) : (
          <>
            <code className="inline">cosmonapse</code> Python package — verified against{" "}
            <code className="inline">packages/python-sdk</code>. If something here disagrees with the
            code, the code wins.
          </>
        )
      }
    >
      {isEngram ? <EngramDocs /> : <PythonDocs section={sec.id} />}
    </DocsShell>
  );
}
