import type { Metadata } from "next";

import { PageHeader } from "@/components/shell/page-header";
import { InvoicesTable } from "@/modules/invoices/components/invoices-table";
import { PayoutDialog } from "@/modules/invoices/components/payout-dialog";
import { invoicesManifest } from "@/modules/invoices/manifest";

export const metadata: Metadata = {
  title: "Invoices",
};

type InvoicesPageProps = { searchParams: Promise<{ action?: string }> };

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const { action } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title={invoicesManifest.label}
        description={invoicesManifest.description}
        actions={<PayoutDialog defaultOpen={action === "new-payout"} />}
      />
      <InvoicesTable />
    </div>
  );
}
