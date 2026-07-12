"use client";

import { ArrowRight, Download, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/modules/invoices/data";

/**
 * Footer for the invoice detail page: the USD amount on the left, a
 * status-driven CTA on the right. UI only — no payment or download backend.
 * Sticks to the bottom while scrolling, then settles into place at the end of
 * the page. The sticky wrapper carries an opaque background that fills the gap
 * below the card so page content never shows through as it scrolls under it.
 */
export function InvoiceActions({ status, usdLabel }: { status: InvoiceStatus; usdLabel: string }) {
  const router = useRouter();
  const isPaid = status === "paid";

  return (
    <div className="sticky bottom-0 z-10 -mb-4 pb-8 md:-mb-8">
      {/* Opaque backdrop behind the card and its bottom offset, so scrolling
          content never shows through — including behind the card's rounded
          corners. Its top aligns with the card top; the gap above is page
          background (same color), so no seam. */}
      <div className="pointer-events-none absolute inset-0 bg-background" />
      <div className="relative flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
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
    </div>
  );
}
