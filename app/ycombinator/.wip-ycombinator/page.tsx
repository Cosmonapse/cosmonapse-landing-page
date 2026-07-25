import type { Metadata } from "next";
import YcClient from "./YcClient";

export const metadata: Metadata = {
  title: "The smallest useful agent  -  Cosmonapse",
  description:
    "One Neuron, one Engram, one Effector. Replay a real RAG trace Signal by Signal, then read the code that produced it - every primitive annotated.",
};

export default function YcombinatorPage() {
  return <YcClient />;
}
