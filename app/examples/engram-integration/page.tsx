import type { Metadata } from "next";
import EngramIntegrationClient from "./EngramIntegrationClient";

export const metadata: Metadata = {
  title: "Integrating an Engram — Examples — Cosmonapse",
  description:
    "Bind shared memory to a Neuron with EngramBinding. Call recall() and imprint() from inside the Neuron without ever touching the protocol. Backed by InMemoryEngram, SqliteEngram, or PostgresEngram — same API.",
};

export default function EngramIntegrationPage() {
  return <EngramIntegrationClient />;
}
