"use client";

import * as React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MethodLabel } from "@/modules/invoices/components/method-label";
import { StatusBadge } from "@/modules/invoices/components/status-badge";
import { invoices, type Invoice } from "@/modules/invoices/data";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

const PAGE_SIZE = 10;
const STATUS_TABS = ["all", "pending", "processing", "paid"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

/**
 * Reference-informed layout: segmented status tabs + contractor search in the
 * card toolbar; select / contractor / title / amount / currency / method /
 * status / sortable date columns; numbered pagination. Column pruning order
 * (D5): currency and title go first, then method, then date — contractor,
 * amount, and status survive the smallest screens.
 */
export function InvoicesTable() {
  const router = useRouter();
  const [tab, setTab] = React.useState<StatusTab>("all");
  const [query, setQuery] = React.useState("");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices
      .filter((invoice) => (tab === "all" ? true : invoice.status === tab))
      .filter((invoice) => (q ? invoice.contractor.toLowerCase().includes(q) : true))
      .sort((a, b) => (sortDir === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  }, [tab, query, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allPageRowsSelected = pageRows.length > 0 && pageRows.every((row) => selected.has(row.id));

  function toggleRow(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function togglePage(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const row of pageRows) {
        if (checked) next.add(row.id);
        else next.delete(row.id);
      }
      return next;
    });
  }

  function openInvoice(invoice: Invoice) {
    router.push(`/invoices/${invoice.id}`);
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as StatusTab);
            setPage(1);
          }}
          className="max-w-full overflow-x-auto"
        >
          <TabsList>
            {STATUS_TABS.map((status) => (
              <TabsTrigger key={status} value={status} className="capitalize">
                {status === "all" ? "All" : status}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contractors…"
            aria-label="Search contractors"
            className="pl-9"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table>
        <caption className="sr-only">Contractor invoices with payout status</caption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allPageRowsSelected}
                onCheckedChange={(checked) => togglePage(checked === true)}
                aria-label="Select all invoices on this page"
              />
            </TableHead>
            <TableHead>Contractor</TableHead>
            <TableHead className="hidden lg:table-cell">Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden xl:table-cell">Currency</TableHead>
            <TableHead className="hidden md:table-cell">Payment method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell" aria-sort={sortDir === "desc" ? "descending" : "ascending"}>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-foreground"
                onClick={() => setSortDir((dir) => (dir === "desc" ? "asc" : "desc"))}
              >
                Date
                <ArrowUpDown className="size-3.5" />
                <span className="sr-only">
                  Sort by date, currently {sortDir === "desc" ? "newest" : "oldest"} first
                </span>
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No invoices match the current filters.
              </TableCell>
            </TableRow>
          )}
          {pageRows.map((invoice) => (
            <TableRow
              key={invoice.id}
              className="cursor-pointer"
              onClick={() => openInvoice(invoice)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.target === event.currentTarget) openInvoice(invoice);
              }}
            >
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selected.has(invoice.id)}
                  onCheckedChange={(checked) => toggleRow(invoice.id, checked === true)}
                  aria-label={`Select invoice ${invoice.id}`}
                />
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2.5 font-medium">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">{getInitials(invoice.contractor)}</AvatarFallback>
                  </Avatar>
                  {invoice.contractor}
                </span>
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{invoice.title}</TableCell>
              <TableCell className="tabular-nums">{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
              <TableCell className="hidden text-muted-foreground xl:table-cell">{invoice.currency}</TableCell>
              <TableCell className="hidden md:table-cell">
                <MethodLabel method={invoice.method} />
              </TableCell>
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
        <p className="text-sm text-muted-foreground">
          {selected.size > 0 && <span className="mr-2 font-medium text-foreground">{selected.size} selected ·</span>}
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
        </p>
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft />
            <span className="sr-only">Previous page</span>
          </Button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={n === currentPage ? "secondary" : "ghost"}
              size="icon-sm"
              className={cn(n === currentPage && "pointer-events-none")}
              aria-current={n === currentPage ? "page" : undefined}
              onClick={() => setPage(n)}
            >
              {n}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight />
            <span className="sr-only">Next page</span>
          </Button>
        </nav>
      </div>
    </div>
  );
}
