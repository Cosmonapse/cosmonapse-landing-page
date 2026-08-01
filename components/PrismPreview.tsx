"use client";

import DemoFrame from "@/components/DemoFrame";

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
 * A Prism recording slot: DemoFrame pre-filled with Prism's port, badge and
 * namespace-aware address bar. Kept as its own component because the examples
 * pages call it in a dozen places with just a src and a namespace.
 */
export default function PrismPreview({
  src = "/prism/prism-demo.gif",
  namespace,
  caption = "Prism renders every Signal on the bus as it fires - REGISTER, TASK, AGENT_OUTPUT, FINAL.",
}: Props) {
  return (
    <DemoFrame
      src={src}
      address={
        namespace ? `http://127.0.0.1:7071  ·  -n ${namespace}` : "http://127.0.0.1:7071"
      }
      badge="PRISM PREVIEW"
      caption={caption}
      alt={
        namespace
          ? `Prism showing Signals animating in the ${namespace} namespace`
          : "Prism showing Signals animating between Neurons"
      }
      accent="var(--accent-2)"
    />
  );
}
