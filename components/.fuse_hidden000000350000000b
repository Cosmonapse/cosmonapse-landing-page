"use client";

import React from "react";

type Props = {
  /**
   * Path to the recording, served from /public. Defaults to one shared
   * capture used across every example; pass a per-example path to override.
   * Both animated GIFs and looping videos (.mp4 / .webm) are supported.
   */
  src?: string;
  /** Namespace shown in the frame's address bar, e.g. "rag". */
  namespace?: string;
  /** Caption under the frame. */
  caption?: string;
};

/**
 * A framed, lazy-loaded placeholder for an animated Prism recording. If `src`
 * points at a video (.mp4 / .webm / .mov) it renders a muted, looping,
 * autoplaying <video>; otherwise it renders an <img> (e.g. a GIF). Until the
 * asset exists at `public{src}`, the frame shows an inline placeholder telling
 * you exactly where to drop it.
 */
export default function PrismPreview({
  src = "/prism/prism-demo.gif",
  namespace,
  caption = "Prism renders every Signal on the bus as it fires — REGISTER, TASK, AGENT_OUTPUT, FINAL.",
}: Props) {
  const [failed, setFailed] = React.useState(false);
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  const addr = namespace
    ? `http://127.0.0.1:7071  ·  -n ${namespace}`
    : "http://127.0.0.1:7071";
  const alt = namespace
    ? `Prism showing Signals animating in the ${namespace} namespace`
    : "Prism showing Signals animating between Neurons";

  return (
    <figure className="prism-preview">
      <div className="prism-bar">
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
        <span className="prism-url">{addr}</span>
      </div>
      <div className="prism-stage">
        {!failed ? (
          isVideo ? (
            <video
              src={src}
              className="prism-img"
              aria-label={alt}
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
              alt={alt}
              loading="lazy"
              className="prism-img"
              onError={() => setFailed(true)}
            />
          )
        ) : (
          <div className="prism-placeholder">
            <div className="prism-badge">&#9654; PRISM PREVIEW</div>
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
