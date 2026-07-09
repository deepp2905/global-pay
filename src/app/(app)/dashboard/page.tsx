import type { Metadata } from "next";
import { CircleCheck, Clock4, TrendingUp, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shell/page-header";
import { RecentInvoices } from "@/modules/dashboard/components/recent-invoices";
import { dashboardManifest } from "@/modules/dashboard/manifest";
import { getContractors, invoices } from "@/modules/invoices/data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

/** Aggregates over settlement (USD) values — static mock math, no backend. */
function getStats() {
  const outstanding = invoices
    .filter((i) => i.status === "pending" || i.status === "processing")
    .reduce((sum, i) => sum + i.usdValue, 0);
  const paidLast30 = invoices
    .filter((i) => i.status === "paid" && i.date >= "2026-06-08")
    .reduce((sum, i) => sum + i.usdValue, 0);
  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  return [
    {
      value: formatCurrency(outstanding, "USD"),
      label: "Outstanding · USD settlement",
      icon: TrendingUp,
    },
    {
      value: formatCurrency(paidLast30, "USD"),
      label: "Paid · last 30 days",
      icon: CircleCheck,
    },
    {
      value: String(pendingCount),
      label: "Invoices awaiting approval",
      icon: Clock4,
    },
    {
      value: String(getContractors().length),
      label: "Active contractors",
      icon: Users,
    },
  ];
}

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <PageHeader title={dashboardManifest.label} description="Cross-border payout activity at a glance" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {getStats().map((stat) => (
          <Card key={stat.label} className="border ring-0">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground">
                <stat.icon className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <RecentInvoices />
    </div>
  );
}
