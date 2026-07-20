"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Pencil } from "lucide-react";

import { PANEL_FOLD } from "@/hooks/use-chat-panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MethodLabel } from "@/modules/invoices/components/method-label";
import { getMethodOption } from "@/modules/payouts/data";
import type { usePayoutFlow } from "@/modules/payouts/use-payout-flow";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

const cardCls = "rounded-xl border ring-0";
const eyebrowCls = "text-xs font-medium text-muted-foreground uppercase";

/** Deterministic masked account per contractor — no backend, but stable per person. */
function getAccountRef(name: string) {
  const digits = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 10000;
  return String(digits).padStart(4, "0");
}

const BANK_BY_COUNTRY: Record<string, string> = {
  India: "HDFC Bank",
  Singapore: "DBS Bank",
  Germany: "Deutsche Bank",
  France: "BNP Paribas",
  Brazil: "Itaú Unibanco",
  Mexico: "BBVA México",
  Japan: "MUFG Bank",
  UAE: "Emirates NBD",
  Portugal: "Millennium BCP",
  Bulgaria: "UniCredit Bulbank",
  "South Korea": "KB Kookmin Bank",
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 text-sm first:pt-0 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function FeeRow({ label, value, total }: { label: string; value: string; total?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={total ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={total ? "text-base font-semibold tabular-nums" : "font-medium tabular-nums"}>{value}</span>
    </div>
  );
}

/** How long the fake rail call takes before the receipt appears. */
const SEND_DURATION = 1600;

export function PayoutReviewStep({ flow }: { flow: ReturnType<typeof usePayoutFlow> }) {
  const { draft, profile, currency, totals, send, toDetails, enteredAtReview } = flow;
  const [sending, setSending] = React.useState(false);

  // No backend, but the pause is the point: sending money should feel like it
  // takes a moment and should lock the screen while it does, so the button
  // can't be pressed twice.
  React.useEffect(() => {
    if (!sending) return;
    const timer = setTimeout(send, SEND_DURATION);
    return () => clearTimeout(timer);
  }, [sending, send]);

  if (!profile) return null;

  const method = getMethodOption(draft.method);
  const today = new Date().toISOString().slice(0, 10);
  const destination =
    draft.method === "bank"
      ? `${BANK_BY_COUNTRY[profile.country] ?? "Local bank"} ····${getAccountRef(profile.name)}`
      : draft.method === "wallet"
        ? `Paynetic Wallet ····${getAccountRef(profile.name)}`
        : `USDC ····${getAccountRef(profile.name)}`;

  return (
    <div className="flex flex-col gap-6">
      <Card className={cardCls}>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="text-lg leading-none font-semibold">{profile.name}</span>
              <span className="text-sm text-muted-foreground">
                {profile.title} · {profile.country}
              </span>
            </div>
          </div>
          <Separator />
          {/* An invoice is billed in its own currency, so that figure leads and
              the USD cost is derived. A free-form payout is priced in USD and
              converts outward — same card, opposite emphasis. */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className={eyebrowCls}>Payout amount</span>
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {draft.source
                  ? formatCurrency(totals.localAmount, currency)
                  : formatCurrency(totals.subtotal, "USD")}
              </span>
            </div>
            {currency !== "USD" && (
              <span className="text-sm text-muted-foreground tabular-nums">
                ≈{" "}
                {draft.source
                  ? formatCurrency(totals.subtotal, "USD")
                  : formatCurrency(totals.localAmount, currency)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Payment details</CardTitle>
          {/* Entering at review skips the details step, so editing needs its own
              way in — the back link is spent naming the invoice. */}
          {enteredAtReview && (
            <Button variant="ghost" size="sm" onClick={toDetails}>
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col">
            {draft.source && (
              <DetailRow label="Settles invoice">
                <span className="tabular-nums">{draft.source.invoiceId}</span>
              </DetailRow>
            )}
            <DetailRow label="Method">
              <MethodLabel method={draft.method} />
            </DetailRow>
            <DetailRow label="Account details">
              <span className="inline-flex items-center gap-2">
                <span className="tabular-nums">{destination}</span>
                <Badge variant="secondary">Verified</Badge>
              </span>
            </DetailRow>
            <DetailRow label="Currency">{currency}</DetailRow>
            {currency !== "USD" && (
              <DetailRow label="Conversion rate">
                <span className="tabular-nums">
                  1 USD = {totals.rate.toLocaleString("en-US")} {currency}
                </span>
              </DetailRow>
            )}
            <DetailRow label="Arrives">{method.speed}</DetailRow>
            <DetailRow label="Invoice date">{formatDate(today, "long")}</DetailRow>
            {draft.note && <DetailRow label="Note">{draft.note}</DetailRow>}
          </dl>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-base">Fees</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <FeeRow label="Payout amount" value={formatCurrency(totals.subtotal, "USD")} />
          <FeeRow label="Platform fee" value={formatCurrency(totals.platformFee, "USD")} />
          <FeeRow label={`${method.label} fee`} value={formatCurrency(totals.methodFee, "USD")} />
          <Separator />
          <FeeRow label="Total amount" value={formatCurrency(totals.total, "USD")} total />
        </CardContent>
      </Card>

      {/* The commit bar sticks 64px off the bottom so the amount and the button
          that sends it stay together and on screen through a long review —
          the figure must never be scrolled away from its own confirm.
          Mirrors the invoice footer's construction (invoice-actions.tsx),
          including the opaque backdrop: it spans the card *and* its bottom
          offset, so scrolling content can't show through at the rounded
          corners or in the gap beneath. */}
      <div className="sticky bottom-16 z-10 -mb-4 pb-4 md:-mb-8">
        {/* The backdrop must span the card *and* the 64px the bar floats above,
            or rows scrolling past reappear in that gap. -bottom-16 stretches
            it to the viewport edge; inset-x-0 covers the rounded corners. */}
        <div className="pointer-events-none absolute -bottom-16 top-0 inset-x-0 bg-background" />
        <div className="relative flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className={eyebrowCls}>You pay</span>
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(totals.total, "USD")}
            </span>
          </div>
          <Button size="lg" onClick={() => setSending(true)} disabled={sending}>
            Send {formatCurrency(totals.total, "USD")}
          </Button>
        </div>
      </div>

      {/* Blocks the whole viewport while the payout is in flight: the one
          moment where a stray second click could mean a second transfer.
          Fixed rather than absolute so it also covers the sidebar and header —
          nothing on screen should look actionable mid-send. */}
      <AnimatePresence>
        {sending && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-foreground/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={PANEL_FOLD}
            role="alertdialog"
            aria-busy="true"
            aria-label="Initiating payout"
          >
            <Loader2 className="size-6 animate-spin text-background" />
            <p className="text-sm font-medium text-background">Initiating payout…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
