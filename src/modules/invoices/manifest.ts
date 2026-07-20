import { ReceiptText } from "lucide-react";

import type { ModuleManifest } from "@/modules/types";

// The "New Payout" quick action moved to the payouts manifest when the flow
// became a real route — the verb belongs to the module that owns the surface.
export const invoicesManifest: ModuleManifest = {
  id: "invoices",
  label: "Invoices",
  icon: ReceiptText,
  href: "/invoices",
  group: "operations",
  description: "Contractor invoices and payout states",
};
