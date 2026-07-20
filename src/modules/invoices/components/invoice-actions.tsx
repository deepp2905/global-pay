"use client";

import { ArrowRight, Download, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/modules/invoices/data";

/**
 * Footer for the invoice detail page: the USD amount on the left, a
 * status-driven CTA on the right. UI only — no payment or download backend.
 * Sticks to the bottom while scrolling, then settles into place at the end of
 * the page. The sticky wrapper carries an opaque background that fills the gap
 * below the card so page content never shows through as it scrolls under it.
 *
 * Only unsettled invoices offer a payout path (pending → pay, failed → retry),
 * and it carries the invoice id so the flow opens on review with the billed
 * figure already loaded. `processing` money is already moving and `paid` money
 * has landed — neither should offer a second send.
 */
export function InvoiceActions({ id, status, usdLabel }: { id: string; status: InvoiceStatus; usdLabel: string }) {
  const isPaid = status === "paid";
  const payoutHref = `/payouts?invoice=${encodeURIComponent(id)}`;

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
          <Button asChild>
            <Link href={payoutHref}>
              <RotateCcw data-icon="inline-start" />
              Retry payout
            </Link>
          </Button>
        ) : status === "pending" ? (
          <Button asChild>
            <Link href={payoutHref}>
              Continue to pay
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        ) : (
          // processing: the transfer is already in flight — the page's own
          // timeline is the status, and a CTA here would invite a double-send.
          <span className="text-sm text-muted-foreground">Payout in progress</span>
        )}
      </div>
    </div>
  );
}
