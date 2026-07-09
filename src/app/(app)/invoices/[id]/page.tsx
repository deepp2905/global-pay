import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheck, CircleDollarSign, Clock4, FileText, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shell/page-header";
import { MethodLabel } from "@/modules/invoices/components/method-label";
import { StatusBadge } from "@/modules/invoices/components/status-badge";
import { getInvoice, METHOD_LABELS, type Invoice } from "@/modules/invoices/data";
import { formatCurrency, formatDate } from "@/lib/utils";

type InvoiceDetailProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: InvoiceDetailProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Invoice ${id}` };
}

/** Static activity trail derived from status — no backend (brief). */
function getActivity(invoice: Invoice) {
  const events = [{ icon: FileText, label: "Invoice issued", date: invoice.date }];
  if (invoice.status !== "pending") {
    events.push({ icon: Clock4, label: "Payment initiated", date: invoice.date });
  }
  if (invoice.status === "paid") {
    events.push({ icon: CircleCheck, label: "Payout completed", date: invoice.dueDate ?? invoice.date });
  }
  if (invoice.status === "failed") {
    events.push({ icon: TriangleAlert, label: "Payout failed — rail rejected the transfer", date: invoice.date });
  }
  return events;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailProps) {
  const { id } = await params;
  const invoice = getInvoice(id);
  if (!invoice) notFound();

  const fields: [string, React.ReactNode][] = [
    ["Contractor", invoice.contractor],
    ["Role", invoice.title],
    ["Country", invoice.country],
    ["Currency", invoice.currency],
    ["Payment method", METHOD_LABELS[invoice.method]],
    ["Invoice ID", invoice.id],
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        back={{ href: "/invoices", label: "Invoices" }}
        title={
          <span className="flex items-center gap-3">
            {invoice.id}
            <StatusBadge status={invoice.status} />
          </span>
        }
        description={`Issued ${formatDate(invoice.date, "long")} · ${invoice.contractor}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(invoice.amount, invoice.currency)}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              ≈ {formatCurrency(invoice.usdValue, "USD")} settlement value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <MethodLabel method={invoice.method} />
            <p className="text-sm text-muted-foreground">
              {invoice.currency} → {invoice.country}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Dates</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p>
              Issued <span className="text-muted-foreground">{formatDate(invoice.date, "long")}</span>
            </p>
            <p>
              Due{" "}
              <span className="text-muted-foreground">
                {invoice.dueDate ? formatDate(invoice.dueDate, "long") : "—"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Invoice details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-xs font-medium text-muted-foreground uppercase">{label}</dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col">
              {getActivity(invoice).map((event, index, list) => (
                <li key={event.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <event.icon className="size-4 shrink-0 text-muted-foreground" />
                    {index < list.length - 1 && <Separator orientation="vertical" className="my-1 flex-1" />}
                  </div>
                  <div className="flex flex-col gap-0.5 pb-5">
                    <p className="text-sm leading-none font-medium">{event.label}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.date, "long")}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleDollarSign className="size-4" />
              Settlement reference {invoice.id.replace("INV", "SET")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
