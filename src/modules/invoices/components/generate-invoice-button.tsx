"use client";

import { FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Primary action on the invoice detail page. No backend (brief) — it opens the
 * browser's print dialog so the page can be saved as a PDF "invoice", which is
 * a genuine action rather than a dead stub.
 */
export function GenerateInvoiceButton() {
  return (
    <Button onClick={() => window.print()}>
      <FileDown data-icon="inline-start" />
      Generate invoice
    </Button>
  );
}
