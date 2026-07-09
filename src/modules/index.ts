import { complianceManifest } from "@/modules/compliance/manifest";
import { contractorsManifest } from "@/modules/contractors/manifest";
import { dashboardManifest } from "@/modules/dashboard/manifest";
import { invoicesManifest } from "@/modules/invoices/manifest";
import { payoutsManifest } from "@/modules/payouts/manifest";
import { reportsManifest } from "@/modules/reports/manifest";
import type { ModuleGroup, ModuleManifest } from "@/modules/types";

/**
 * The module registry — the one place a new module is wired into the app.
 *
 * To add a module: create `modules/<name>/manifest.ts`, mount its route under
 * `app/(app)/<name>/`, and add the manifest here. The sidebar and command
 * palette pick it up automatically. See README "How to add a new module".
 */
export const modules: ModuleManifest[] = [
  dashboardManifest,
  contractorsManifest,
  invoicesManifest,
  payoutsManifest,
  complianceManifest,
  reportsManifest,
];

const GROUP_ORDER: ModuleGroup[] = ["workspace", "operations", "insights"];

export const GROUP_LABELS: Record<ModuleGroup, string> = {
  workspace: "Workspace",
  operations: "Operations",
  insights: "Insights",
};

/** Modules bucketed by sidebar group, in display order. Empty groups are omitted. */
export function getModuleGroups(): { group: ModuleGroup; label: string; modules: ModuleManifest[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    modules: modules.filter((m) => m.group === group),
  })).filter((g) => g.modules.length > 0);
}

export type { ModuleGroup, ModuleManifest } from "@/modules/types";
