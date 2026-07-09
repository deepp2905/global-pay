import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, CircleCheck, Clock4, FileText, TriangleAlert } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shell/page-header";
import { InvoiceActions } from "@/modules/invoices/components/invoice-actions";
import { MethodLabel } from "@/modules/invoices/components/method-label";
import { getInvoice, METHOD_LABELS, STATUS_LABELS, type Invoice } from "@/modules/invoices/data";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

type InvoiceDetailProps = { params: Promise<{ id: string }> };

const eyebrowCls = "text-xs font-medium text-muted-foreground uppercase";
const cardCls = "rounded-xl border ring-0";

export async function generateMetadata({ params }: InvoiceDetailProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Invoice ${id}` };
}

type Tone = "muted" | "success" | "destructive";
type ActivityEvent = { icon: typeof FileText; label: string; sub?: string; date: string; tone: Tone };

/** Static activity trail derived from status — no backend (brief). */
function getActivity(invoice: Invoice): ActivityEvent[] {
  const events: ActivityEvent[] = [
    {
      icon: FileText,
      label: "Invoice issued",
      sub: formatCurrency(invoice.amount, invoice.currency),
      date: invoice.date,
      tone: "muted",
    },
  ];
  if (invoice.status !== "pending") {
    events.push({
      icon: Clock4,
      label: "Payment initiated",
      sub: METHOD_LABELS[invoice.method],
      date: invoice.date,
      tone: "muted",
    });
  }
  if (invoice.status === "paid") {
    events.push({
      icon: CircleCheck,
      label: "Payout completed",
      sub: `+${formatCurrency(invoice.usdValue, "USD")} settled`,
      date: invoice.dueDate ?? invoice.date,
      tone: "success",
    });
  }
  if (invoice.status === "failed") {
    events.push({
      icon: TriangleAlert,
      label: "Payout failed",
      sub: "Rail rejected the transfer",
      date: invoice.date,
      tone: "destructive",
    });
  }
  return events;
}

const toneRing: Record<Tone, string> = {
  muted: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
};

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

  const activity = getActivity(invoice);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-8">
      <PageHeader back={{ href: "/invoices", label: "Invoices" }} />

      {/* Who was paid, and how much — the first things to confirm post-payout. */}
      <Card className={cardCls}>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
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
            <Badge variant="secondary" className="gap-1.5">
              <CalendarDays />
              Issued {formatDate(invoice.date, "long")}
            </Badge>
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

      {/* The trail — did it complete, and when. */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col">
            {activity.map((event, index, list) => (
              <li key={event.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn("flex size-5 items-center justify-center rounded-full", toneRing[event.tone])}>
                    <event.icon className="size-3" />
                  </span>
                  {index < list.length - 1 && <Separator orientation="vertical" className="my-1 flex-1" />}
                </div>
                <div className={cn("flex flex-1 items-start justify-between gap-3", index < list.length - 1 && "pb-5")}>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm leading-none font-medium">{event.label}</p>
                    {event.sub && <p className="text-sm text-muted-foreground tabular-nums">{event.sub}</p>}
                  </div>
                  <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                    {formatDate(event.date, "long")}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <InvoiceActions
        status={invoice.status}
        usdLabel={formatCurrency(invoice.usdValue, "USD")}
        pdf={{
          id: invoice.id,
          status: STATUS_LABELS[invoice.status],
          contractor: invoice.contractor,
          role: invoice.title,
          destination: invoice.country,
          amount: `${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${invoice.currency}`,
          settlement: formatCurrency(invoice.usdValue, "USD"),
          method: METHOD_LABELS[invoice.method],
          issued: formatDate(invoice.date, "long"),
          due: invoice.dueDate ? formatDate(invoice.dueDate, "long") : "-",
          reference: invoice.id.replace("INV", "SET"),
        }}
      />
    </div>
  );
}
