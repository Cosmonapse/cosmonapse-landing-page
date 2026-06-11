import type { Metadata } from "next";
import BiddingClient from "./BiddingClient";

export const metadata: Metadata = {
  title: "Bidding  -  TASK_OFFER / BID / TASK_AWARDED  -  Examples  -  Cosmonapse",
  description:
    "Competitive bidding for capability-routed dispatch. Workers respond to TASK_OFFER with BIDs; the producer picks a winner by first_bid, lowest_cost, or highest_confidence and emits TASK_AWARDED. Atomic claim for heterogeneous deployments.",
};

export default function BiddingPage() {
  return <BiddingClient />;
}
