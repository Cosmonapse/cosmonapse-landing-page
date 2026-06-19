import type { Metadata } from "next";
import RagMcpClient from "./RagMcpClient";

export const metadata: Metadata = {
  title: "RAG + MCP Coding Agent  -  Examples  -  Cosmonapse",
  description:
    "RAG-grounded code generation that lands on disk and runs. A coder Neuron recalls the team style guide from a VectorEngram, an MCP filesystem Neuron writes the file, and a runner Neuron executes it  -  retrieve, write, run, on one trace.",
};

export default function RagMcpPage() {
  return <RagMcpClient />;
}
