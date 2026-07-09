import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Clock, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shell/page-header";
import { InvoiceActions } from "@/modules/invoices/components/invoice-actions";
import { MethodLabel } from "@/modules/invoices/components/method-label";
import { StatusBadge } from "@/modules/invoices/components/status-badge";
import { getInvoice, METHOD_LABELS, type Invoice } from "@/modules/invoices/data";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

type InvoiceDetailProps = { params: Promise<{ id: string }> };

const eyebrowCls = "text-xs font-medium text-muted-foreground uppercase";
const cardCls = "rounded-xl border ring-0";

export async function generateMetadata({ params }: InvoiceDetailProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Invoice ${id}` };
}

type StepState = "done" | "pending" | "failed";
type Step = { label: string; sub?: string; date?: string; state: StepState };

/** The fixed three-step payout trail; step states derive from status (no backend). */
function getTimeline(invoice: Invoice): Step[] {
  const initiated = invoice.status !== "pending";
  const paid = invoice.status === "paid";
  const failed = invoice.status === "failed";

  return [
    {
      label: "Invoice issued",
      sub: formatCurrency(invoice.amount, invoice.currency),
      date: invoice.date,
      state: "done",
    },
    {
      label: "Payment initiated",
      sub: METHOD_LABELS[invoice.method],
      date: initiated ? invoice.date : undefined,
      state: initiated ? "done" : "pending",
    },
    failed
      ? { label: "Payout failed", sub: "Rail rejected the transfer", date: invoice.date, state: "failed" }
      : {
          label: "Payout completed",
          sub: paid ? `+${formatCurrency(invoice.usdValue, "USD")} settled` : undefined,
          date: paid ? (invoice.dueDate ?? invoice.date) : undefined,
          state: paid ? "done" : "pending",
        },
  ];
}

const stepTone: Record<StepState, string> = {
  done: "bg-success/10 text-success",
  pending: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
};

/** Only a tick (cleared) or a clock (pending) — plus a cross for the failed terminal step. */
function StepIcon({ state }: { state: StepState }) {
  const Icon = state === "failed" ? X : state === "done" ? Check : Clock;
  return <Icon className="size-3" />;
}

/** A label → value row for the payment-details list. */
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 text-sm first:pt-0 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailProps) {
  const { id } = await params;
  const invoice = getInvoice(id);
  if (!invoice) notFound();

  const timeline = getTimeline(invoice);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-8">
      <PageHeader back={{ href: "/invoices", label: "Invoices" }} />

      {/* Who was paid, and how much — the first things to confirm post-payout. */}
      <Card className={cardCls}>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarFallback>{getInitials(invoice.contractor)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-lg leading-none font-semibold">{invoice.contractor}</span>
                <span className="text-sm text-muted-foreground">
                  {invoice.title} · {invoice.country}
                </span>
              </div>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <span className={eyebrowCls}>Payout amount</span>
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(invoice.amount, invoice.currency)}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              ≈ {formatCurrency(invoice.usdValue, "USD")} settlement value
            </span>
          </div>
        </CardContent>
      </Card>

      {/* How the money moved and the audit references. */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-base">Payment details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col">
            <DetailRow label="Payment method">
              <MethodLabel method={invoice.method} />
            </DetailRow>
            <DetailRow label="Currency">{invoice.currency}</DetailRow>
            <DetailRow label="Destination">{invoice.country}</DetailRow>
            <DetailRow label="Issued">{formatDate(invoice.date, "long")}</DetailRow>
            <DetailRow label="Due">{invoice.dueDate ? formatDate(invoice.dueDate, "long") : "—"}</DetailRow>
            <DetailRow label="Invoice ID">
              <span className="tabular-nums">{invoice.id}</span>
            </DetailRow>
            <DetailRow label="Settlement reference">
              <span className="tabular-nums">{invoice.id.replace("INV", "SET")}</span>
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      {/* Fixed three-step trail: green tick for cleared steps, grey clock for pending. */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col">
            {timeline.map((step, index, list) => (
              <li key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn("flex size-5 items-center justify-center rounded-full", stepTone[step.state])}>
                    <StepIcon state={step.state} />
                  </span>
                  {index < list.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className={cn("flex flex-1 items-start justify-between gap-3", index < list.length - 1 && "pb-5")}>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm leading-none font-medium">{step.label}</p>
                    {step.sub && <p className="text-sm text-muted-foreground tabular-nums">{step.sub}</p>}
                  </div>
                  {step.date && (
                    <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                      {formatDate(step.date, "long")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <InvoiceActions status={invoice.status} usdLabel={formatCurrency(invoice.usdValue, "USD")} />
    </div>
  );
}
