"use client";

import { ArrowRight, Download, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/modules/invoices/data";

/**
 * Footer for the invoice detail page: the USD amount on the left, a
 * status-driven CTA on the right. UI only — no payment or download backend.
 */
export function InvoiceActions({ status, usdLabel }: { status: InvoiceStatus; usdLabel: string }) {
  const router = useRouter();
  const isPaid = status === "paid";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground uppercase">{isPaid ? "Paid" : "You pay"}</span>
        <span className="text-xl font-semibold tracking-tight tabular-nums">{usdLabel}</span>
      </div>
      {isPaid ? (
        <Button>
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
