"use client";

import React from "react";

type Props = {
  /**
   * Path to the recording, served from /public - e.g. "/genesis/canvas.mp4".
   * Videos (.mp4 / .webm / .mov) render as a muted looping autoplay <video>;
   * anything else renders as an <img>, so animated GIFs work too.
   *
   * Until the asset exists at `public{src}`, the frame falls back to a
   * placeholder that names the exact path to drop it at. That is deliberate:
   * an empty slot should look intentional to a visitor and be self-documenting
   * to whoever is capturing the recordings.
   */
  src: string;
  /** Text in the frame's address bar. Defaults to the Prism dev URL. */
  address?: string;
  /** Label on the placeholder pill, e.g. "GENESIS PREVIEW". */
  badge?: string;
  /** Caption under the frame. */
  caption?: string;
  /** Accessible description of what the recording shows. */
  alt?: string;
  /** Accent colour for the placeholder pill. Defaults to the brand accent. */
  accent?: string;
  /** Override the 880px default - the homepage hero slot runs wider. */
  maxWidth?: number;
};

/**
 * A framed, lazy-loaded slot for a product recording.
 *
 * Shares the .prism-* styles with PrismPreview (which is now a thin wrapper
 * over this) so every demo across the site sits in identical browser chrome.
 */
export default function DemoFrame({
  src,
  address = "http://127.0.0.1:7071",
  badge = "PREVIEW",
  caption,
  alt,
  accent,
  maxWidth,
}: Props) {
  const [failed, setFailed] = React.useState(false);
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  const label = alt ?? caption ?? "Cosmonapse product recording";

  return (
    <figure className="prism-preview" style={maxWidth ? { maxWidth } : undefined}>
      <div className="prism-bar">
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
        <span className="prism-url">{address}</span>
      </div>
      <div className="prism-stage">
        {!failed ? (
          isVideo ? (
            <video
              src={src}
              className="prism-img"
              aria-label={label}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onError={() => setFailed(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={label}
              loading="lazy"
              className="prism-img"
              onError={() => setFailed(true)}
            />
          )
        ) : (
          <div className="prism-placeholder">
            <div className="prism-badge" style={accent ? { color: accent } : undefined}>
              &#9654; {badge}
            </div>
            <p>
              Drop your recording at <code className="inline">public{src}</code>
            </p>
          </div>
        )}
      </div>
      {caption ? <figcaption className="prism-caption">{caption}</figcaption> : null}
    </figure>
  );
}
