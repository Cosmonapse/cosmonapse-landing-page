import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";
import { plain, py, sh } from "@/lib/highlight";

// ---------------------------------------------------------------------------
// The shared shape of every /examples/<slug> page.
//
// Server component on purpose: the example source (app/examples/<slug>/code.ts,
// synced from cosmonapse-examples) is highlighted at build time and only the
// rendered HTML reaches the browser.
// ---------------------------------------------------------------------------

export const EXAMPLES_REPO = "https://github.com/Cosmonapse/cosmonapse-examples";

export type Snippet = {
  /** Shown in the code card header, e.g. "neurons/greeter.py". */
  name?: string;
  code: string;
  lang?: "py" | "sh" | "text";
};

export type DocSection = {
  eyebrow: string;
  title?: string;
  prose?: React.ReactNode;
  snippets?: Snippet[];
  /** Rendered after the snippets. */
  after?: React.ReactNode;
};

export type ExampleDocProps = {
  number: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  lede: React.ReactNode;
  /** Folder name in cosmonapse-examples, e.g. "02-building-a-neuron". */
  folder: string;
  install: string;
  run: string;
  output?: string;
  outputNote?: string;
  tree: string;
  sections: DocSection[];
  namespace: string;
  /** Arguments shown after `python brain.py` in the real-synapse step. */
  runArgs?: string;
  /** The command that starts the example. Defaults to "python brain.py". */
  entry?: string;
  prismSrc?: string;
  related: { href: string; title: string; desc: string }[];
};

const W = 880;

/** The install block every page starts from. */
export function install(o: { pkgs?: string; hf?: boolean; note?: string } = {}): string {
  const lines = [
    "$ git clone https://github.com/Cosmonapse/cosmonapse-examples",
    `$ pip install ${o.pkgs ?? "cosmonapse"}`,
  ];
  if (o.note) lines.push(`# ${o.note}`);
  if (o.hf) {
    lines.push("# a Hugging Face token with read scope, in cosmonapse-examples/.env");
    lines.push('$ echo "HF_TOKEN=hf_xxxxxxxxxxxxxxxx" >> cosmonapse-examples/.env');
  }
  return lines.join("\n");
}

function render(s: Snippet): string {
  if (s.lang === "sh") return sh(s.code.replace(/\n$/, ""));
  if (s.lang === "text") return plain(s.code.replace(/\n$/, ""));
  return py(s.code.replace(/\n$/, ""));
}

function Section({ eyebrow, title, prose, snippets, after }: DocSection) {
  return (
    <section className="section-sm">
      <div className="container">
        <div className="sub-eyebrow">{eyebrow}</div>
        {title && <h2 className="sub-title">{title}</h2>}
        {prose && <div className="exdoc-prose">{prose}</div>}
        {snippets?.map((s, i) => (
          <div key={i} style={{ marginTop: i ? 16 : 0 }}>
            <CodeBlock filename={s.name} html={render(s)} maxWidth={W} />
          </div>
        ))}
        {after && <div className="exdoc-prose exdoc-after">{after}</div>}
      </div>
    </section>
  );
}

export default function ExampleDoc(p: ExampleDocProps) {
  const folderUrl = `${EXAMPLES_REPO}/tree/main/${p.folder}`;
  const args = p.runArgs ? ` ${p.runArgs}` : "";
  const entry = p.entry ?? "python brain.py";
  const transport = [
    "# terminal 1 - a dev synapse (TCP, single host)",
    `$ cosmo synapse start memory --namespace=${p.namespace}`,
    "",
    "# terminal 2 - the same brain, over that synapse",
    `$ SYNAPSE_URL=cosmo://127.0.0.1:7070 ${entry}${args}`,
    "",
    "# terminal 3 - Prism, the live view (http://127.0.0.1:7071)",
    `$ cosmo prism --url=cosmo://127.0.0.1:7070 -n ${p.namespace}`,
    "",
    "# production transports - only the URL changes",
    `$ SYNAPSE_URL=nats://127.0.0.1:4222 ${entry}${args}`,
    `$ SYNAPSE_URL=kafka://127.0.0.1:9092 ${entry}${args}`,
  ].join("\n");

  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">
            {`// Example ${p.number} · ${p.difficulty}`}
          </div>
          <h1 className="page-title">{p.title}</h1>
          <div className="page-sub">{p.lede}</div>
          <div className="exdoc-links">
            <a href={folderUrl} target="_blank" rel="noopener noreferrer" className="inline-link">
              {`cosmonapse-examples/${p.folder}`}
            </a>
          </div>
        </div>
      </header>

      <Section
        eyebrow="Install & run"
        prose={
          <p>
            Clone the examples repo, install, and run from inside the example&apos;s
            folder.
          </p>
        }
        snippets={[
          { name: "terminal", lang: "sh", code: `${p.install}\n\n$ cd cosmonapse-examples/${p.folder}\n${p.run}` },
          ...(p.output ? [{ lang: "text" as const, code: p.output }] : []),
        ]}
        after={p.outputNote ? <p className="exdoc-note">{p.outputNote}</p> : undefined}
      />

      <Section
        eyebrow="Layout"
        title="One component per file, one Dendrite per node."
        prose={
          <p>
            The skeleton <code className="inline">cosmo init</code> scaffolds. Modules under{" "}
            <code className="inline">neurons/</code>, <code className="inline">engram/</code>,{" "}
            <code className="inline">effector/</code> and <code className="inline">receptors/</code>{" "}
            declare behaviour; <code className="inline">brain.py</code> owns deployment - which node
            hosts what.
          </p>
        }
        snippets={[{ name: p.folder, lang: "text", code: p.tree }]}
      />

      {p.sections.map((s, i) => (
        <Section key={i} {...s} />
      ))}

      <Section
        eyebrow="Over a real synapse"
        title="Same code, different transport."
        prose={
          <p>
            With <code className="inline">SYNAPSE_URL</code> unset the brain runs on an in-process
            bus. Point it at a synapse and nothing in the modules changes. Prism attaches to any
            shared synapse and animates every Signal as it crosses.
          </p>
        }
        snippets={[{ name: "terminal", lang: "sh", code: transport }]}
        after={
          p.prismSrc ? (
            <div style={{ marginTop: 8 }}>
              <PrismPreview namespace={p.namespace} src={p.prismSrc} />
            </div>
          ) : undefined
        }
      />

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            {p.related.map((r) => (
              <Link key={r.href} href={r.href} className="card">
                <div className="card-icon">→</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .exdoc-prose { color: var(--text-dim); max-width: 760px; margin-bottom: 20px; line-height: 1.65; }
        .exdoc-prose p { margin: 0 0 12px; }
        .exdoc-prose p:last-child { margin-bottom: 0; }
        .exdoc-prose ul { margin: 0 0 12px; padding-left: 20px; }
        .exdoc-prose li { margin: 4px 0; }
        .exdoc-after { margin-top: 16px; margin-bottom: 0; }
        .exdoc-note { color: var(--text-faint); font-size: 12.5px; }
        .exdoc-links { margin-top: 14px; font-family: var(--font-mono, ui-monospace, monospace); font-size: 13px; }
        .page-sub p { margin: 0 0 10px; }
      `}</style>
    </>
  );
}
