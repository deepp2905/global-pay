import { ReceiptText } from "lucide-react";

import type { ModuleManifest } from "@/modules/types";

export const invoicesManifest: ModuleManifest = {
  id: "invoices",
  label: "Invoices",
  icon: ReceiptText,
  href: "/invoices",
  shortcut: "G I",
  group: "operations",
  description: "Contractor invoices and payout states",
};
