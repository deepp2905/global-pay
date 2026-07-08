import { ShieldCheck } from "lucide-react";

import type { ModuleManifest } from "@/modules/types";

export const complianceManifest: ModuleManifest = {
  id: "compliance",
  label: "Compliance",
  icon: ShieldCheck,
  href: "/compliance",
  group: "operations",
  description: "KYC, tax forms, and jurisdiction rules",
  status: "coming-soon",
};
