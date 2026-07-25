import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import RagMcpClient from "./RagMcpClient";

export const metadata: Metadata = pageMetadata({
  title: "RAG + MCP Coding Agent",
  description:
    "RAG-grounded code generation that lands on disk and runs: a coder Neuron recalls the style guide, an MCP Neuron writes the file, a runner executes it.",
  path: "/examples/rag-mcp",
  keywords: [
    ...KW_HARNESS,
    ...KW_EVENT_DRIVEN,
    "AI coding agent",
    "MCP filesystem agent",
    "code generation agent",
    "autonomous coding harness",
  ],
});

export default function RagMcpPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "RAG + MCP Coding Agent", path: "/examples/rag-mcp" },
        ]}
      />
      <RagMcpClient />
    </>
  );
}
