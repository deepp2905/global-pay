import { LayoutDashboard } from "lucide-react";

import type { ModuleManifest } from "@/modules/types";

export const dashboardManifest: ModuleManifest = {
  id: "dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  href: "/dashboard",
  shortcut: "G D",
  group: "workspace",
  description: "Payout activity at a glance",
};
