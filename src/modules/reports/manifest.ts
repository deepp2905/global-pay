import { ChartColumn } from "lucide-react";

import type { ModuleManifest } from "@/modules/types";

export const reportsManifest: ModuleManifest = {
  id: "reports",
  label: "Reports",
  icon: ChartColumn,
  href: "/reports",
  group: "insights",
  description: "Spend, FX, and payout analytics",
  status: "coming-soon",
};
