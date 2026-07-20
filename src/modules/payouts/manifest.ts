import { Banknote, BanknoteArrowUp } from "lucide-react";

import type { ModuleManifest } from "@/modules/types";

export const payoutsManifest: ModuleManifest = {
  id: "payouts",
  label: "Payouts",
  icon: Banknote,
  href: "/payouts",
  group: "operations",
  description: "Send a payout to a contractor",
  quickActions: [
    {
      id: "new-payout",
      label: "New Payout",
      icon: BanknoteArrowUp,
      href: "/payouts",
    },
  ],
};
