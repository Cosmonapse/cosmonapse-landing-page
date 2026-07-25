import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_HARNESS } from "@/lib/seo";
import TutorialsClient from "./TutorialsClient";

export const metadata: Metadata = pageMetadata({
  title: "Tutorials - Agent Engineering",
  description:
    "A guided track through building agent harnesses on Cosmonapse, from a single Neuron to a multi-agent RAG system. Every step is runnable and builds on the last.",
  path: "/examples/tutorials",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_HARNESS,
    "AI agent tutorial",
    "learn multi-agent systems",
    "agent engineering course",
  ],
});

export default function TutorialsPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Tutorials", path: "/examples/tutorials" },
        ]}
      />
      <TutorialsClient />
    </>
  );
}
