"use client";

import { Pencil } from "lucide-react";

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

export function PayoutReviewStep({ flow }: { flow: ReturnType<typeof usePayoutFlow> }) {
  const { draft, profile, currency, totals, send, toDetails, enteredAtReview } = flow;
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

      {/* The commit bar: the number and the button that sends it, side by side. */}
      <Card className={cardCls}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className={eyebrowCls}>You pay</span>
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(totals.total, "USD")}
            </span>
          </div>
          <Button size="lg" onClick={send}>
            Send {formatCurrency(totals.total, "USD")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
