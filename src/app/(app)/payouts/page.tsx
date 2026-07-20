import type { Metadata } from "next";

import { PayoutFlow } from "@/modules/payouts/components/payout-flow";

export const metadata: Metadata = {
  title: "New Payout",
};

type PayoutsPageProps = { searchParams: Promise<{ invoice?: string }> };

export default async function PayoutsPage({ searchParams }: PayoutsPageProps) {
  const { invoice } = await searchParams;
  // key: remount the flow when the source invoice changes, so the draft is
  // seeded fresh rather than carrying a previous invoice's figures.
  return <PayoutFlow key={invoice ?? "new"} invoiceId={invoice} />;
}
