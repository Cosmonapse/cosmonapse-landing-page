import type { Metadata } from "next";
import DocsClient from "./DocsClient";

export const metadata: Metadata = {
  title: "Documentation — Cosmonapse Python, TypeScript & CLI Reference",
  description:
    "Complete reference for the Cosmonapse Python SDK, the @cosmonapse/sdk TypeScript SDK, and the cosmo command-line interface. Classes, methods, signatures, flags, exit codes, and worked examples.",
};

export default function DocsPage() {
  return <DocsClient />;
}
