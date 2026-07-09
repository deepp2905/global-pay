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

**The one rule:** the *shell* is frozen; the *registry* is the extension point. The sidebar, command palette, and keyboard shortcuts all derive from `modules/index.ts` — nothing in `components/shell/` names a specific module. Adding a module never touches top-level code (a one-line registry entry doesn't count).

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
  group: "workspace",          // "workspace" | "operations" | "insights"
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
  settingsManifest,   // ← this
];
```

The sidebar item (grouped, with active state), and command-palette entry all appear automatically. Ship a module before its routes are ready by adding `status: "coming-soon"` — it renders dimmed with a "Soon" badge and registers nothing else.

Deep views follow the wayfinding pattern: a nested route (`/invoices/[id]`) whose `PageHeader` gets `back={{ href: "/invoices", label: "Invoices" }}` — a real link named after the parent. No separate "Back" button; the browser owns history, the crumb owns hierarchy.

## The design system

### Tokens

All color, radius, and font decisions live in `src/app/globals.css` as CSS variables, mapped into Tailwind by `@theme inline`. **Extend the shadcn set, never replace it** — e.g. status colors are added alongside `--destructive`:

| Token | Role |
| --- | --- |
| `--primary` | Brand blue — actions, active nav, logo |
| `--success` / `--warning` / `--destructive` | Payout states: paid / processing / failed (each with a dark-mode value) |
| `--secondary`, `--muted` | Pending state, surfaces, captions |
| `--sidebar-*` | Sidebar-scoped surface set (from shadcn) |
| `--radius` | Single radius scale; components derive sm→4xl from it |

Rules: no hardcoded hex in components — go through a token. Type scale: page titles `text-xl font-semibold tracking-tight`, card/section titles `text-base`/`text-sm font-medium`, captions `text-sm text-muted-foreground`. Numbers in tables and stats use `tabular-nums`.

### Primitives

shadcn/ui components are vendored into `src/components/ui/` (add more with `npx shadcn@latest add <name>`). Shared app-level primitives live in `components/shell/` — notably **`PageHeader`** (title/description/actions/back-link), used by every module. Module-specific compositions (e.g. `StatusBadge`, `InvoicesTable`) stay inside their module folder.

### Conventions

- **Animations use Motion** (`motion/react`) for anything custom — panel slides, presence, staged reveals. shadcn's built-in CSS transitions and hover/focus styling stay CSS. (See `AGENTS.md`.)
- **Keyboard first:** every critical path works without a mouse. Current map: **⌘J** chat panel · **Ctrl+B** sidebar · **⌘K** command palette (in progress). Active nav gets `aria-current="page"`; panels wire `aria-expanded`/`aria-controls`; hidden-but-mounted surfaces get `inert`.
- **Pointers:** anything clickable shows `cursor: pointer` (Tailwind v4 preflight defaults buttons to `default`; overridden in the base layer). Disabled states keep the default cursor.
- **Server components by default**; `"use client"` only where interactivity demands it (shell internals, table filters, chat).
- **Mobile = graceful degradation:** the table prunes columns by information priority (currency → title → method → date; contractor/amount/status always survive), the sidebar becomes a drawer, the chat panel a sheet.

## Status

| Done | Pending |
| --- | --- |
| Shell: registry-driven sidebar (grouped, collapsible, coming-soon modules), header, foldable AI panel (hybrid, ⌘J, cookie-persisted) | Command palette (⌘K) + full keyboard audit |
| Module registry + contract, 3 live modules: Dashboard (stats + recent activity), Invoices (tabs, search, sort, selection, pagination), Invoice detail (summary, fields, activity trail) | Chat stub polish (transcript, thinking state, staged reply) |
| Wayfinding: PageHeader + named-parent back link | "New Payout" dialog |
| Design tokens incl. status colors; Motion animation standard; mobile column pruning | Dark mode toggle (tokens already dark-ready) |

Deployed on Vercel — every push to `master` goes live.

---

*Case-study companion docs: `BRIEF.md` (original assignment) and `DECISIONS.md` (every architectural decision with rejected alternatives).*
