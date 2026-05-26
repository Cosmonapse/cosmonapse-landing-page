import React from "react";

export type TocGroup = {
  title: string;
  items: { href: string; label: string }[];
};

export type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

export const Section = ({ id, eyebrow, title, children }: SectionProps) => (
  <section id={id} className="docs-section">
    <div className="sub-eyebrow">{eyebrow}</div>
    <h2 className="docs-h2">{title}</h2>
    {children}
  </section>
);

export type ApiCardProps = {
  id?: string;
  name: string;
  kind: string;
  summary: string;
  children?: React.ReactNode;
};

export const ApiCard = ({ id, name, kind, summary, children }: ApiCardProps) => (
  <div id={id} className="api-card">
    <div className="api-card-head">
      <span className="api-card-kind">{kind}</span>
      <code className="api-card-name">{name}</code>
    </div>
    <p className="api-card-summary">{summary}</p>
    {children}
  </div>
);
