"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/modules/invoices/components/status-badge";
import { invoices } from "@/modules/invoices/data";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

/** Compact latest-activity table linking into the invoices module. */
export function RecentInvoices() {
  const router = useRouter();
  const recent = [...invoices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <section className="flex flex-col gap-3 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent invoices</h2>
        <Link href="/invoices" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <caption className="sr-only">Six most recent invoices</caption>
          <TableHeader>
            <TableRow>
              <TableHead>Contractor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="cursor-pointer"
                onClick={() => router.push(`/invoices/${invoice.id}`)}
              >
                <TableCell>
                  <span className="flex items-center gap-2.5 font-medium">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">{getInitials(invoice.contractor)}</AvatarFallback>
                    </Avatar>
                    {invoice.contractor}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                  {formatDate(invoice.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
