"use client";

import * as React from "react";
import { ArrowRight, Download, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { buildInvoicePdf, type InvoicePdfData } from "@/modules/invoices/components/invoice-pdf";
import type { InvoiceStatus } from "@/modules/invoices/data";

/**
 * Footer for the invoice detail page: the USD amount on the left, a
 * status-driven CTA on the right. Paid invoices download a generated PDF
 * (opened in a new tab); everything else routes into the pay flow.
 */
export function InvoiceActions({
  status,
  usdLabel,
  pdf,
}: {
  status: InvoiceStatus;
  usdLabel: string;
  pdf: InvoicePdfData;
}) {
  const router = useRouter();
  const isPaid = status === "paid";

  function downloadInvoice() {
    const url = URL.createObjectURL(buildInvoicePdf(pdf));
    window.open(url, "_blank", "noopener");
    // Give the new tab time to load before releasing the blob.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground uppercase">{isPaid ? "Paid" : "You pay"}</span>
        <span className="text-xl font-semibold tracking-tight tabular-nums">{usdLabel}</span>
      </div>
      {isPaid ? (
        <Button onClick={downloadInvoice}>
          <Download data-icon="inline-start" />
          Download invoice
        </Button>
      ) : status === "failed" ? (
        <Button onClick={() => router.push("/invoices?action=new-payout")}>
          <RotateCcw data-icon="inline-start" />
          Retry payout
        </Button>
      ) : (
        <Button onClick={() => router.push("/invoices?action=new-payout")}>
          Continue to pay
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}
    </div>
  );
}
