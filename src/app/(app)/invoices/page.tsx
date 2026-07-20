import type { Metadata } from "next";

import { PageHeader } from "@/components/shell/page-header";
import { InvoicesTable } from "@/modules/invoices/components/invoices-table";
import { invoicesManifest } from "@/modules/invoices/manifest";
import { NewPayoutButton } from "@/modules/payouts/components/new-payout-button";

export const metadata: Metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title={invoicesManifest.label}
        description={invoicesManifest.description}
        actions={<NewPayoutButton />}
      />
      <InvoicesTable />
    </div>
  );
}
