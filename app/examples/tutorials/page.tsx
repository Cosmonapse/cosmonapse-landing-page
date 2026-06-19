import type { Metadata } from "next";
import TutorialsClient from "./TutorialsClient";

export const metadata: Metadata = {
  title: "Tutorials  -  Examples  -  Cosmonapse",
  description:
    "Eleven incremental tutorials for the Cosmonapse Python SDK, sorted by what you need next  -  from hello-world in twelve lines to the production switch from MemorySynapse to NATS or Kafka. Plus the full cosmo CLI reference.",
};

export default function TutorialsPage() {
  return <TutorialsClient />;
}
