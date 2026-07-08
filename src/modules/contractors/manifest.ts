import { Users } from "lucide-react";

import type { ModuleManifest } from "@/modules/types";

export const contractorsManifest: ModuleManifest = {
  id: "contractors",
  label: "Contractors",
  icon: Users,
  href: "/contractors",
  group: "workspace",
  description: "Contractor directory and onboarding",
  status: "coming-soon",
};
