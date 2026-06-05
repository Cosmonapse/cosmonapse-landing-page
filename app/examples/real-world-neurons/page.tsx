import type { Metadata } from "next";
import RealWorldNeuronsClient from "./RealWorldNeuronsClient";

export const metadata: Metadata = {
  title: "Real-world Neurons (API + MCP)  -  Examples  -  Cosmonapse",
  description:
    "A Neuron is anything that interacts with the real world. One Cortex dispatches to two very different workers  -  an HTTP API (Flask / Express) and a wrapped stdio MCP server  -  behind the identical Axon interface. The same topology across five language × transport stacks.",
};

export default function RealWorldNeuronsPage() {
  return <RealWorldNeuronsClient />;
}
