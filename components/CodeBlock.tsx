import React from "react";

type Props = {
  filename?: string;
  html: string;
  /** "flat" uses the lighter card style; "elevated" gets the glow box-shadow */
  variant?: "flat" | "elevated";
  maxWidth?: number | string;
};

/**
 * Renders pre-formatted code with optional inline highlighting via
 * dangerouslySetInnerHTML. The HTML passed in is always static at call
 * sites (no user input), so there is no XSS surface here.
 *
 * Use this for anything containing literal `{`, `}`, quotes, or
 * apostrophes that would otherwise need careful JSX escaping.
 */
export default function CodeBlock({
  filename,
  html,
  variant = "flat",
  maxWidth,
}: Props) {
  const cardClass = variant === "elevated" ? "code-card" : "code-card-flat";
  const style = maxWidth ? { maxWidth } : undefined;

  return (
    <div className={cardClass} style={style}>
      {filename && (
        <div className="code-header">
          <div className="dots">
            <span />
            <span />
            <span />
          </div>
          <span className="filename">{filename}</span>
        </div>
      )}
      <pre className="codeblock" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
