# Global Pay — Enterprise Workspace Foundation

A B2B workspace foundation for a fictional cross-border contractor-payments product, built as the InstaLILY design-engineer case study. The deliverable is the **shell, navigation, and design system** that product modules live inside — three example modules (Dashboard, Invoices, Invoice detail) show it in use.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui (radix-luma) · Motion

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also the CI check)
npm run lint       # ESLint
npm run format     # Prettier + Tailwind class sorting
```

---

## Architecture at a glance

```
src/
  app/
    layout.tsx            ← root: html/body/fonts only          ─┐
    (app)/                                                       │ SHELL — frozen.
      layout.tsx          ← mounts <AppShell> around all routes  │ Modules never
  components/                                                    │ edit these.
    shell/                ← sidebar, header, chat panel,        ─┘
                            command surface, PageHeader
    ui/                   ← shadcn primitives (installed via CLI)
  modules/                ← EXTENSION SURFACE — where product work happens
    index.ts              ← the module registry: ONE line per module
    types.ts              ← ModuleManifest, the contract
    <module>/manifest.ts  ← each module declares itself
    <module>/components/  ← module-private components
    <module>/data.ts      ← module-owned (mock) data
  hooks/                  ← shared client hooks (chat panel state, media queries)
  lib/utils.ts            ← cn(), formatCurrency, formatDate, getInitials
```

**The one rule:** the _shell_ is frozen; the _registry_ is the extension point. The sidebar, command palette, and keyboard shortcuts all derive from `modules/index.ts` — nothing in `components/shell/` names a specific module. Adding a module never touches top-level code (a one-line registry entry doesn't count).

Why this shape:

- **Registry over convention-scanning** — an explicit array is greppable, type-checked, and orders the nav deliberately. No magic file discovery.
- **Module-owned folders** — deleting `modules/invoices/` + its route folder removes the feature completely; nothing else references it except its registry line.
- **Shell state in cookies** (sidebar collapsed, chat panel open) — the server renders your restored layout with zero hydration flash, mirroring the shadcn sidebar's own pattern. Trade-off: module routes render dynamically.
- **AI chat panel is responsive-hybrid** — ≥1280px it docks and compresses content (work alongside the copilot); 768–1280px it slides over; below that it's a sheet. Fully hidden when closed — reopen from the header pill or **⌘J**.

## How to add a new module

Adding "Settings" takes three steps — no shell edits:

**1. Create the manifest** — `src/modules/settings/manifest.ts`:

```ts
import { Settings } from "lucide-react";
import type { ModuleManifest } from "@/modules/types";

export const settingsManifest: ModuleManifest = {
  id: "settings",
  label: "Settings",
  icon: Settings,
  href: "/settings",
  group: "workspace", // "workspace" | "operations" | "insights"
  description: "Workspace configuration",
};
```

**2. Mount the route** — `src/app/(app)/settings/page.tsx`:

```tsx
import { PageHeader } from "@/components/shell/page-header";
import { settingsManifest } from "@/modules/settings/manifest";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <PageHeader title={settingsManifest.label} description={settingsManifest.description} />
      {/* module content */}
    </div>
  );
}
```

**3. Register it** — one line in `src/modules/index.ts`:

```ts
export const modules: ModuleManifest[] = [
  dashboardManifest,
  contractorsManifest,
  invoicesManifest,
  // ...
  settingsManifest, // ← this
];
```

The sidebar item (grouped, with active state), and command-palette entry all appear automatically. Ship a module before its routes are ready by adding `status: "coming-soon"` — it renders dimmed with a "Soon" badge and registers nothing else.

Deep views follow the wayfinding pattern: a nested route (`/invoices/[id]`) whose `PageHeader` gets `back={{ href: "/invoices", label: "Invoices" }}` — a real link named after the parent. No separate "Back" button; the browser owns history, the crumb owns hierarchy.

## The design system

### Tokens

All color, radius, and font decisions live in `src/app/globals.css` as CSS variables, mapped into Tailwind by `@theme inline`. **Extend the shadcn set, never replace it** — e.g. status colors are added alongside `--destructive`:

| Token                                       | Role                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `--primary`                                 | Brand blue — actions, active nav, logo                                  |
| `--success` / `--warning` / `--destructive` | Payout states: paid / processing / failed (each with a dark-mode value) |
| `--secondary`, `--muted`                    | Pending state, surfaces, captions                                       |
| `--sidebar-*`                               | Sidebar-scoped surface set (from shadcn)                                |
| `--radius`                                  | Single radius scale; components derive sm→4xl from it                   |

Rules: no hardcoded hex in components — go through a token. Type scale: page titles `text-xl font-semibold tracking-tight`, card/section titles `text-base`/`text-sm font-medium`, captions `text-sm text-muted-foreground`. Numbers in tables and stats use `tabular-nums`.

### Primitives

shadcn/ui components are vendored into `src/components/ui/` (add more with `npx shadcn@latest add <name>`). Shared app-level primitives live in `components/shell/` — notably **`PageHeader`** (title/description/actions/back-link), used by every module. Module-specific compositions (e.g. `StatusBadge`, `InvoicesTable`) stay inside their module folder.

### Conventions

- **Animations use Motion** (`motion/react`) for anything custom — panel slides, presence, staged reveals. shadcn's built-in CSS transitions and hover/focus styling stay CSS. (See `AGENTS.md`.)
- **Keyboard first:** every critical path works without a mouse. Three global shortcuts, each accepting **⌘ (macOS) or Ctrl (Windows/Linux)** — `+K` command palette · `+J` AI chat panel · `+B` sidebar. Hints render the correct modifier per platform (`ModShortcut`). Active nav gets `aria-current="page"`; panels wire `aria-expanded`/`aria-controls`; hidden-but-mounted surfaces get `inert`.
- **Tooltips** open after a 400ms hover-intent delay (set once on the shell's `TooltipProvider`), so pointer sweeps across the UI don't flash tooltips.
- **Pointers:** anything clickable shows `cursor: pointer` (Tailwind v4 preflight defaults buttons to `default`; overridden in the base layer). Disabled states keep the default cursor.
- **Server components by default**; `"use client"` only where interactivity demands it (shell internals, table filters, chat).
- **Mobile = graceful degradation:** the table prunes columns by information priority (currency → title → method → date; contractor/amount/status always survive), the sidebar becomes a drawer, the chat panel a sheet.

## Status

**Done**

- **Shell** — registry-driven sidebar (grouped sections, icon-rail collapse, `coming-soon` modules, search, support links, account card) with polished collapse behavior: click-anywhere-to-expand on the collapsed rail, a full-height edge hover affordance, and a stateful "Open/Close sidebar" tooltip; header with the AI pill; foldable AI panel (responsive hybrid, cookie-persisted, sequenced pill/panel choreography).
- **Chat panel** — word-by-word streaming replies (soft blur-in, duration-normalized), sparkle welcome state, "thinking" indicator, type-anywhere capture, jump-to-latest control, and a resizable panel width. Stubbed front-end (canned replies); the interaction layer is production-shaped.
- **Module registry + contract**, and 3 live modules: **Dashboard** (stat cards + recent-invoices table), **Invoices** (status tabs, contractor search, sortable date, row selection, client pagination, column pruning), **Invoice detail** (summary cards, field grid, activity trail).
- **Wayfinding** — shared `PageHeader` with the named-parent back link.
- **Command palette (⌘/Ctrl+K)** — Quick actions / Recents / Actions, registry-derived, with a keycap footer. Three global shortcuts (`+K` palette, `+J` panel, `+B` sidebar), platform-correct modifier hints (`ModShortcut`).
- **"New Payout" dialog** — from the list header CTA or the palette quick action (`?action=new-payout`).
- **Design system** — tokens incl. status + brand-blue focus ring; Motion animation standard with `prefers-reduced-motion`; flat cards; `cursor: pointer` on interactive elements.
- **Mobile** — sidebar drawer, chat sheet, table column pruning; verified at 375px.

**Pending**

- Dark-mode toggle (`next-themes`; token layer is already dark-ready).
- README add-a-module rehearsal (build a hidden 4th module to verify the steps).
- Wire the chat panel to a real streaming model API (the stub is shaped to swap in with minimal change).

Deployed on Vercel — every push to `master` goes live.

---

_Case-study companion docs: `BRIEF.md` (original assignment) and `DECISIONS.md` (every architectural decision with rejected alternatives)._
