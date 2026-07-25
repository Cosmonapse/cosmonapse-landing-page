import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, KW_EVENT_DRIVEN, KW_REACTIVE } from "@/lib/seo";
import BiddingClient from "./BiddingClient";

export const metadata: Metadata = pageMetadata({
  title: "Task Bidding - Offer, Bid, Award",
  description:
    "Workers answer a TASK_OFFER with BIDs; the producer picks by first_bid, lowest_cost or highest_confidence and emits TASK_AWARDED. Atomic claim, mixed fleets.",
  path: "/examples/bidding",
  keywords: [
    ...KW_EVENT_DRIVEN,
    ...KW_REACTIVE,
    "contract net protocol",
    "agent task auction",
    "agent bidding",
    "cost-aware model routing",
  ],
});

export default function BiddingPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Examples", path: "/examples" },
          { name: "Task Bidding", path: "/examples/bidding" },
        ]}
      />
      <BiddingClient />
    </>
  );
}
