import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import YcClient from "../ycombinator/YcClient";

/**
 * /speedrun - the a16z SPEEDRUN application link.
 *
 * Deliberately the same page as /ycombinator and /pearx: one demo, three
 * URLs, so each application carries its own link and the traffic on it is
 * attributable. The demo itself lives in app/ycombinator/ and is imported
 * rather than copied, so the three can never drift apart.
 */
// All three demo URLs canonicalise to /ycombinator so Google sees one page,
// not three duplicates competing with each other.
export const metadata: Metadata = pageMetadata({
  title: "The smallest useful agent",
  description:
    "One Neuron, one Engram, one Effector. Replay a real RAG trace Signal by Signal, then read the code that produced it - every primitive annotated.",
  path: "/ycombinator",
});

export default function SpeedrunPage() {
  return <YcClient />;
}
