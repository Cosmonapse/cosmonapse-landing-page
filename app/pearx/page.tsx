import type { Metadata } from "next";
import YcClient from "../ycombinator/YcClient";

/**
 * /pearx - the PearX application link.
 *
 * Deliberately the same page as /ycombinator and /speedrun: one demo, three
 * URLs, so each application carries its own link and the traffic on it is
 * attributable. The demo itself lives in app/ycombinator/ and is imported
 * rather than copied, so the three can never drift apart.
 */
export const metadata: Metadata = {
  title: "The smallest useful agent  -  Cosmonapse",
  description:
    "One Neuron, one Engram, one Effector. Replay a real RAG trace Signal by Signal, then read the code that produced it - every primitive annotated.",
};

export default function PearxPage() {
  return <YcClient />;
}
