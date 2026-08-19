import type { Metadata } from "next";
import YcClient from "./YcClient";

/**
 * /ycombinator - the Y Combinator application link, and the home of the demo
 * itself. /speedrun (a16z SPEEDRUN) and /pearx (PearX) import YcClient from
 * here so all three URLs stay byte-identical without three copies to keep in
 * sync. If this page is ever renamed, update those two imports.
 */
export const metadata: Metadata = {
  title: "The smallest useful agent  -  Cosmonapse",
  description:
    "One Neuron, one Engram, one Effector. Replay a real RAG trace Signal by Signal, then read the code that produced it - every primitive annotated.",
};

export default function YcombinatorPage() {
  return <YcClient />;
}
