import type { Metadata } from "next";

import { PayoutFlow } from "@/modules/payouts/components/payout-flow";

export const metadata: Metadata = {
  title: "New Payout",
};

export default function PayoutsPage() {
  return <PayoutFlow />;
}
