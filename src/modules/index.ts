import { dashboardManifest } from "@/modules/dashboard/manifest";
import { invoicesManifest } from "@/modules/invoices/manifest";
import type { ModuleGroup, ModuleManifest } from "@/modules/types";

/**
 * The module registry — the one place a new module is wired into the app.
 *
 * To add a module: create `modules/<name>/manifest.ts`, mount its route under
 * `app/(app)/<name>/`, and add the manifest here. The sidebar, command
 * palette, and shortcuts pick it up automatically. See README "How to add a
 * new module".
 */
export const modules: ModuleManifest[] = [dashboardManifest, invoicesManifest];

const GROUP_ORDER: ModuleGroup[] = ["workspace", "operations"];

export const GROUP_LABELS: Record<ModuleGroup, string> = {
  workspace: "Workspace",
  operations: "Operations",
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
