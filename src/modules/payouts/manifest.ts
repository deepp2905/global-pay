import { Banknote } from "lucide-react";

import type { ModuleManifest } from "@/modules/types";

export const payoutsManifest: ModuleManifest = {
  id: "payouts",
  label: "Payouts",
  icon: Banknote,
  href: "/payouts",
  group: "operations",
  description: "Scheduled and completed payout runs",
  status: "coming-soon",
};
