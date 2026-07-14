<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules

These are binding conventions for anyone (human or agent) building on this foundation. They exist because each was settled after real iteration — following them avoids re-litigating decisions and keeps new surfaces consistent with the shell. The narrative "why" behind the architecture lives in `DECISIONS.md`; the human-facing tour is in `README.md`. This file is the rulebook.

## Aesthetic

- **Flat, subtle, minimal is the house style.** Prefer borders and low-contrast surfaces over shadows and fills. When a shadow is needed, keep it soft and small (`shadow-xs`/`shadow-sm`; `shadow-md`/`shadow-xl` only for true overlays like the chat panel or floating controls). Cards are flat. Tooltips are light and quiet, not heavy popovers. If a new element looks "loud" next to the sidebar and table, it's wrong — dial it down.
- **Match an existing surface before inventing values.** New components should borrow the radius, spacing, motion, and type treatment of the closest existing analog (card = `rounded-xl` like the table; a floating panel = the chat panel's motion) rather than picking fresh numbers. Consistency beats local optimization.

## Tokens & values

- **No hardcoded values in components — not just colors.** Colors go through a token (`src/app/globals.css`, never a raw hex). The same discipline applies to radius (`rounded-*` off the `--radius` scale), type (use the scale below), and motion (use the shared transition constants). If you find yourself typing a literal `px`/hex/duration, check for a token or shared constant first.
- **Type scale:** page titles `text-xl font-semibold tracking-tight`; card/section titles `text-base`/`text-sm font-medium`; captions `text-sm text-muted-foreground`. Numbers in tables and stats use `tabular-nums`.

## Animation

- **Use Motion.** All custom transitions and animations (panel slides, presence mount/unmount, staged reveals, layout shifts) use the `motion` package (`import { motion, AnimatePresence } from "motion/react"`). Exceptions: shadcn/ui primitives' built-in CSS transitions and pure hover/focus styling stay CSS.
- **Reuse the canonical motion vocabulary; don't re-guess feel values.** The dialed-in constants are the source of truth: panel/presence transitions use `{ duration: 0.2, ease: "easeOut" }` (see `PANEL_FOLD` in `src/hooks/use-chat-panel.tsx`); button/row press uses a low-bounce spring `{ type: "spring", duration: 0.12, bounce: 0.1 }` (`TAP_TRANSITION` in `button.tsx`); route transitions use `ease-out-quad`. Match these rather than introducing new springs/durations. When two things animate in sequence (e.g. the header pill hiding as the panel opens), stagger with an explicit delay derived from the other element's duration — don't overlap them.
- **Always honor `prefers-reduced-motion`.**

## Interaction & accessibility (non-negotiable)

- **Every critical path works from the keyboard.** Three global shortcuts, each accepting **⌘ (macOS) or Ctrl (Win/Linux)** — `+K` palette, `+J` chat panel, `+B` sidebar. Render the correct modifier per platform via `ModShortcut`. Active nav gets `aria-current="page"`; toggles wire `aria-expanded`/`aria-controls`; hidden-but-mounted surfaces get `inert`; clickable rows are keyboard-activatable (Enter *and* Space) and skip disabled/coming-soon items in the tab order.
- **`cursor: pointer` on anything clickable** (Tailwind v4 preflight defaults buttons to `default`; the base layer overrides this). Disabled states keep the default cursor — never `not-allowed` masquerading as disabled, and never a resize/other cursor bleeding through from a sibling layer.
- **Tooltips open after the shared 400ms hover-intent delay** (set once on the shell's `TooltipProvider` — don't set per-tooltip delays). Stateful controls get stateful labels ("Open sidebar" / "Close sidebar"), not one static label.

## Layering & clipping (the bugs that cost the most iteration)

- **Opaque overlays must cover everything behind them — including rounded corners and gaps, not just the obvious rectangle.** A sticky bar or backdrop that needs to hide content behind it must be fully opaque across its whole footprint (reach for `inset-0` coverage), or content bleeds through at the corners and edges. State the invariant ("nothing shows through"), don't patch one edge at a time.
- **Interactive affordances must not be clipped by a parent's `overflow-hidden` or header stacking.** Hover outlines, focus rings, status dots, and badges that sit at a container's edge need the parent to allow `overflow-visible` (or the affordance moved up the stacking context). When something at an element's edge looks cropped, suspect parent `overflow`/`z-index` first — it's almost never the element itself.

## Architecture boundary

- **The shell is frozen; the module registry is the extension surface.** Nothing in `components/shell/` names a specific module. Adding a module = a manifest + a route folder + one line in `src/modules/index.ts` (that one line does not count as "touching top-level code"). See `README.md` for the step-by-step and `DECISIONS.md` (D6) for why.
- **Server components by default;** `"use client"` only where interactivity demands it.
- **Mobile is graceful degradation, not a bespoke build:** the table prunes columns by information priority (currency → title → method → date drop first; contractor/amount/status always survive), the sidebar becomes a drawer, the chat panel a sheet.
