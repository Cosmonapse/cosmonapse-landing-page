import type { Metadata } from "next";
import PathwayClient from "./PathwayClient";

export const metadata: Metadata = {
  title: "Pathway  -  three consumption shapes  -  Examples  -  Cosmonapse",
  description:
    "One primitive, three faces: await pw.wait() for sequential request/reply, @pw.on(SignalType.X) for reactive callbacks, and async for sig in pw: for streaming. Plus scope=\"terminal\" for decentralised orchestration.",
};

export default function PathwayPage() {
  return <PathwayClient />;
}
