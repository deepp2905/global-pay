import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold">Invoices</h1>
      <p className="text-sm text-muted-foreground">Placeholder — the invoice table lands in Phase 3.</p>
    </div>
  );
}
