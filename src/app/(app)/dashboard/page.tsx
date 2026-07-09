import type { Metadata } from "next";
import { CircleCheck, Clock4, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      label: "Outstanding",
      value: formatCurrency(outstanding, "USD"),
      caption: "Pending + processing, USD settlement",
      icon: TrendingUp,
    },
    {
      label: "Paid, last 30 days",
      value: formatCurrency(paidLast30, "USD"),
      caption: "Completed payouts",
      icon: CircleCheck,
    },
    {
      label: "Awaiting approval",
      value: String(pendingCount),
      caption: "Invoices in pending state",
      icon: Clock4,
    },
    {
      label: "Active contractors",
      value: String(getContractors().length),
      caption: "Across all corridors",
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
          <Card key={stat.label} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <RecentInvoices />
    </div>
  );
}
