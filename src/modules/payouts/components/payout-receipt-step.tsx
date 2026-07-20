"use client";

import Link from "next/link";
import { Check, Clock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/modules/invoices/components/status-badge";
import { getMethodOption } from "@/modules/payouts/data";
import type { usePayoutFlow } from "@/modules/payouts/use-payout-flow";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

const cardCls = "rounded-xl border ring-0";
const eyebrowCls = "text-xs font-medium text-muted-foreground uppercase";

/** Business-day offset for the settlement estimate — weekends don't clear. */
function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date.toISOString().slice(0, 10);
}

export function PayoutReceiptStep({ flow }: { flow: ReturnType<typeof usePayoutFlow> }) {
  const { draft, profile, currency, totals, reset } = flow;
  if (!profile) return null;

  const method = getMethodOption(draft.method);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const instant = method.speed.startsWith("Instant");
  const settlement = instant ? today : addBusinessDays(now, 3);

  const timeline = [
    { label: "Invoice created", sub: formatCurrency(totals.subtotal, "USD"), date: today, done: true },
    { label: "Payout initiated", sub: `via ${method.label}`, date: today, done: true },
    { label: "Payout completed", sub: instant ? "Settled" : "Pending", date: settlement, done: instant },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card className={cardCls}>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
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
            <StatusBadge status={instant ? "paid" : "processing"} />
          </div>
          <Separator />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className={eyebrowCls}>Payout amount</span>
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {formatCurrency(totals.localAmount, currency)}
              </span>
            </div>
            {currency !== "USD" && (
              <span className="text-sm text-muted-foreground tabular-nums">
                ≈ {formatCurrency(totals.subtotal, "USD")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col">
            {timeline.map((step, index, list) => (
              <li key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full",
                      step.done ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.done ? <Check className="size-3" /> : <Clock className="size-3" />}
                  </span>
                  {index < list.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className={cn("flex flex-1 items-start justify-between gap-3", index < list.length - 1 && "pb-5")}>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm leading-none font-medium">{step.label}</p>
                    <p className="text-sm text-muted-foreground tabular-nums">{step.sub}</p>
                  </div>
                  <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                    {step.done ? "" : "Est. "}
                    {formatDate(step.date, "long")}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className={eyebrowCls}>You paid</span>
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(totals.total, "USD")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Resets the draft rather than navigating — leaving a stale draft
                mounted would let browser-back land on a sent payout's review. */}
            <Button variant="ghost" onClick={reset}>
              New payout
            </Button>
            <Button variant="outline" asChild>
              <Link href="/invoices">Back to invoices</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
