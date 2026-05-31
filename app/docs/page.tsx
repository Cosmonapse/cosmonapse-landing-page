import { redirect } from "next/navigation";

export default function DocsPage() {
  // Docs are split per-surface (Python / TypeScript / Engram / CLI), each its
  // own page. Land on the Python SDK reference by default.
  redirect("/docs/python");
}
