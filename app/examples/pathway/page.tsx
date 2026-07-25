import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import PathwayClient from "./PathwayClient";

export const metadata: Metadata = pageMetadata({
  title: "Pathway - Await, React or Stream",
  description:
    "One primitive, three shapes: await for request/reply, on(SignalType) for reactive callbacks, async iteration for streaming. Plus terminal-scope orchestration.",
  path: "/examples/pathway",
  keywords: [
    ...KW_REACTIVE,
    ...KW_EVENT_DRIVEN,
    "streaming agent output",
    "reactive callbacks",
    "async agent responses",
    "request reply over event bus",
  ],
});

export default function PathwayPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Pathway", path: "/examples/pathway" },
        ]}
      />
      <PathwayClient />
    </>
  );
}
