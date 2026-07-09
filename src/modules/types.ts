import type { LucideIcon } from "lucide-react";

/**
 * The contract every module fulfills to appear in the app.
 *
 * This is the single extension surface: the sidebar, command palette, and
 * keyboard shortcuts all derive from manifests registered in `modules/index.ts`.
 * Nothing in `components/shell/` may reference a specific module.
 */
export interface ModuleManifest {
  /** Stable unique id, also used as the React key. */
  id: string;
  /** Human-readable name shown in nav and the command palette. */
  label: string;
  /** Lucide icon rendered in the sidebar and palette. */
  icon: LucideIcon;
  /** Route the module mounts at, e.g. "/invoices". */
  href: string;
  /**
   * Optional palette shortcut hint (e.g. "G then D"). Rendering and binding
   * happen in the command palette; modules only declare the key.
   */
  shortcut?: string;
  /** Sidebar section the module belongs to. Groups are the nav hierarchy. */
  group: "workspace" | "operations" | "insights";
  /** One-line description shown in the command palette. */
  description?: string;
  /**
   * "coming-soon" modules appear in nav (dimmed, non-navigable) to show the
   * planned surface area but register no routes. Defaults to "available".
   */
  status?: "available" | "coming-soon";
  /**
   * Module verbs surfaced in the command palette's "Quick actions" group.
   * Href-based so the shell stays module-agnostic — the module's own route
   * reads the param and opens the right surface.
   */
  quickActions?: ModuleQuickAction[];
}

export interface ModuleQuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export type ModuleGroup = ModuleManifest["group"];
