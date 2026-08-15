# Decision Log — Global Pay Workspace Foundation

Knowledge transfer for all foundation decisions: what was chosen, what was considered and rejected, and why. Doubles as source material for the walkthrough's "three specific decisions" section.

---

## D1. Product domain: Global contractor payments platform

**Decision:** A fictional cross-border contractor payments product. Modules: Payments Dashboard (overview), Invoices (list with pending / processing / paid states), Invoice Detail (nested sub-route of the list).

**Rejected:** Generic "Acme Corp / Dashboard / Records" placeholder theming.

**Rationale:** The brief leaves theming open ("name and theme them however feels right"). Domain-real mock data (invoice IDs, contractor names, currencies, payout statuses) makes every screen read as a product rather than a template, and the domain aligns with prior fintech experience so mock data instincts are already warm. Picked in the first 30 minutes so it flavors everything downstream.

**Scope trim:** ~~"Create payout" is a **dialog/sheet** launched from the invoice list header, not a page. The brief requires exactly one deep view (list → detail); a second nested flow costs time and proves nothing new. A shadcn dialog with a disabled-on-submit stub covers it.~~ **Reversed post-submission — see D11.** The trim was right under the 3-hour constraint, but a dialog can't hold a review step, and the review is the point of a payout flow.

---

## D2. Global navigation: Collapsible left sidebar with grouped sections

**Decision:** Left sidebar, collapsible, with group labels (e.g., "Workspace" / "Operations") to show structural hierarchy.

**Rejected:**

- **Top nav** — doesn't scale past ~5–6 modules; the brief explicitly asks for scaling past three with hierarchy.
- **Icon-only rail as the primary nav** — hides labels, hurts learnability for daily enterprise users who need speed and clarity.

**Rationale:** Grouped sidebar demonstrates both requirements at once: it visibly scales (groups absorb new modules) and hierarchy is structural, not just visual. Stretch goal only if time allows: a second-level nav within one module.

---

## D3. AI chat panel: Fully hidden when closed, header trigger + keyboard shortcut

**Decision:** Panel fully hides when folded. Reopen affordances: persistent AI toggle button in the shell header (right-aligned) + keyboard shortcut (Cmd+J — unclaimed by browsers) + open/closed state persisted in a cookie (so the server renders the restored layout with no hydration flash, mirroring the shadcn sidebar pattern).

**Rejected:** Collapsed 40px icon rail with a single icon.

**Rationale:** Icon rails earn their width when they multiplex several panels (Jira's right rail, Intercom's inbox rail). With a single chat surface, a rail is dead pixels. The dominant SaaS pattern for a single AI surface is header trigger + shortcut (Notion Cmd+J, GitHub Copilot header icon). The header owns panel toggles; the panel owns nothing when closed.

**Walkthrough note:** This is one of the strongest "considered and rejected" stories — lead with it.

---

## D4. Wayfinding in deep views: One-level breadcrumb with named parent, no separate "Back"

**Decision:** On the detail page, a back-arrow link labeled with the **parent's name** ("← Invoices"), then the page title (invoice ID). Stripe's detail-page pattern. The crumb is a real link to the list route.

**Rejected:**

- **Breadcrumbs + a separate back button** — redundant; the parent crumb _is_ the back affordance.
- **Labeling the link "Back"** — ambiguous between browser history and hierarchy. If the user deep-linked into the detail page, "Back" lies about its destination.

**Rationale:** Breadcrumbs express hierarchy; the browser back button expresses history; the in-app affordance should always be hierarchical and name its destination (NN/g convention). One primitive covers "know where they are and how to get back."

---

## D5. Mobile list view: Column pruning at breakpoints

**Decision:** Hide low-priority columns responsively (`hidden md:table-cell`), keeping roughly contractor, amount, status on the smallest screens. Which columns survive is itself a documented information-priority decision.

**Rejected:**

- **Horizontal scroll** — the lazy answer; reads that way in review.
- **Row-to-card transformation** — looks nicer but costs a second rendering path; not worth it under the deadline.

**Fallback:** If any horizontal scroll is kept, only at a middle breakpoint with a sticky first column.

**Rest of mobile:** Sidebar collapses to a drawer/sheet; chat panel becomes a bottom sheet or full-screen takeover; dashboard and dialog reflow trivially. Target is "degrades gracefully," not a bespoke mobile experience — the brief says "work," not "be reimagined."

---

## D6. Extensibility boundary: Module registry, shell is frozen

**Decision:** Adding module four means: create `modules/settings/` with a `manifest.ts` and a route folder, plus **one line** in `modules/index.ts`. Zero edits to shell/layout components.

**Convention documented in README:** Explicitly define what counts as the shell (frozen) vs. the extension surface (registry + module folders). A one-line registry entry does _not_ count as "touching top-level code."

**Rationale:** The brief's fourth-module test is ambiguous about the boundary; turning that ambiguity into a documented convention is exactly the first-design-engineer move. The registry is the single sanctioned extension point: nav item, route mounting, and module metadata all derive from the manifest.

---

## D7. Command palette: In scope, high priority

**Decision:** Cmd+K palette using shadcn's `Command` component, nav-only scope (~30 min).

**Rationale:** "Jump to any section of the app quickly, without a mouse" is almost certainly pointing at Cmd+K. It's the most direct answer to an explicit requirement and the keyboard-access proof point for the walkthrough. **Cut order:** dark mode and the payout dialog get cut before this does.

---

## D8. Chat stub: Inhabited transcript + scoped animation

**Decision:** A sparkle "welcome" empty state (personalized greeting) + a "thinking" indicator + a staged reveal of a canned response (CSS transition or simple interval appending sentences).

**Rejected:**

- **Empty gray rectangle / bare composer** — wastes the most photogenic region of the app.
- **Per-token streaming simulation** — animation polish here can quietly consume an hour; staged sentence reveal reads the same at a fraction of the cost.

**Revised (2026-07-13):** Reversed the per-token rejection. With the shell finished ahead of the deadline, the time pressure that made staged sentence-reveal the right call no longer applied, and the chat panel is the app's most-demoed surface. Shipped a word-by-word streaming renderer (`StreamedText`) — each word fades in from a soft blur, per-word delay is duration-normalized (~0.8–3s total) with ±30% jitter, and only the latest reply streams. Also swapped the two static prior exchanges for the sparkle welcome state above, added type-anywhere capture, a jump-to-latest control, and a resizable panel. The original rationale still holds _under deadline_; this was a deliberate spend once the deadline was no longer binding. (Good walkthrough material: a documented decision that was consciously flipped when its constraint lifted.)

---

## D9. Dark mode: Yes, but last

**Decision:** Deferred to post-submission. With shadcn the token layer is already CSS variables and `next-themes` is ~15 minutes, so it's cheap — the cheapest proof the token layer actually works — but at a 3-hour deadline it's correctly last. Since the Vercel URL is stable, it lands as a post-submission commit on the same link.

---

## D10. Process: Deploy first, iterate publicly

**Decision:** Deploy the scaffold to Vercel in the first ~20 minutes, before building anything. The submitted URL stays stable across pushes and improves with every commit.

**Rejected:** Build locally for 2.5 hours, deploy at the end.

**Rationale:** The hard constraint is a working Vercel link in 3 hours. Deploy failures (env issues, CI-only build errors) at hour 2.5 mean missing the deadline with a better local app. Deploying first converts the deadline risk to near zero and makes commit hygiene visible.

**Commit hygiene:** Readable sequence of real commits throughout. A single squashed "final" commit is free negative signal in a shared repo.

---

## D11. Payout flow: A three-step flow on one route (reverses the D1 dialog trim)

**Decision:** The payout flow is a real surface at `/payouts` — Details → Review → Initiated — with all three steps on a single route, swapping in place. This supersedes the D1 scope trim that made "create payout" a dialog, and lights up the Payouts module (previously `coming-soon`).

**Rejected:**

- **Keeping the dialog.** A modal can hold a form, but it can't hold a *review* step. The moment before money moves is the one screen that has to be unhurried and fully legible; a 448px dialog fights that.
- **Three separate routes** (`/payouts`, `/payouts/review`, `/payouts/confirm`). Splitting the draft across routes forces either the draft into the URL — where a free-text note and an editable `rate=` param don't belong, and where payout details leak into browser history — or a context provider whose state evaporates on refresh, requiring each downstream route to redirect back to step one anyway. One route owns the draft with no such seam.
- **Breadcrumbs or a segmented stepper for progress.** Breadcrumbs express a hierarchy you can navigate freely; this is a gated linear sequence, and a clickable "Details" crumb on the receipt would imply you can edit a payout that has already been sent. A segmented stepper over-signals for three steps that are each clearly titled. A plain "Step 1 of 2" caption carries the orientation, and the receipt drops it entirely — nothing is left to progress through.

**Rationale:** Step transitions become a deliberate `PANEL_FOLD` rather than a route change, and the back affordance stays honest at every step: "← Invoices" on step one is a real hierarchical link (D4); "← Edit Details" on review walks the step back and preserves the draft; the receipt offers no back link at all, because the payout is terminal — the way out is an explicit "New payout" that resets the draft.

**Numbers:** All figures derive from one rate table and one fee constant in `modules/payouts/data.ts`. The reference mockups had drifted (the same $1,200 showed three different INR totals, and a method card's fee contradicted the review's breakdown), so a single `getTotals()` is what keeps the three steps from disagreeing. Fees are charged to the payer on top of the subtotal, so the contractor receives the full amount entered.

**Validation:** The mockups showed no error states. A payout flow needs them: the draft is gated on contractor, non-zero amount, an available rail, and sufficient balance, and the block is explained in-line rather than left as a dead disabled button.

---

## D12. Paying an existing invoice: the invoice amount is authoritative

**Decision:** An unsettled invoice can be paid directly (`/payouts?invoice=<id>`), which opens the flow **on the review step** with the billed figure loaded. The invoice's own amount and currency are authoritative: you pay what was billed, and the USD leaving the wallet is derived by dividing out the rate. A free-form payout runs the opposite direction — priced in USD, converted outward.

**Rejected:** **Converting the invoice to USD and treating it like any other payout.** One code path, but the number you review would not be the number on the invoice. For a payments product that is a lie, and it is exactly the inconsistency the reference mockups showed (₹12,000 on one screen, $1,200 on the next).

**Consequences:**

- `getTotals()` handles both directions and always returns `subtotal` in USD and `localAmount` in the contractor's currency, so no caller needs to know which way the conversion ran.
- The review card leads with the invoice's currency when settling an invoice, and with USD otherwise.
- Editing an amount **detaches** the draft from its source invoice — otherwise the frozen figure would silently override what the user typed. Changing method or note keeps the link; switching contractor also detaches, since paying someone else cannot settle that invoice.
- Entering at review means there is no earlier step to return to, so the back link names the invoice and editing gets an explicit control on the review card. The "Step 1 of 2" caption is hidden — it would be a lie when there was never a step 1.

**Routing (deliberately *not* status-based redirects):** Every table row still opens the invoice detail page; status only decides what its footer offers — `pending` → "Continue to pay", `failed` → "Retry payout", `processing` → a flat "Payout in progress" (money already moving; a CTA would invite a double-send), `paid` → "Download invoice". An inline Pay/Retry button on unsettled rows was tried and removed: it put a second, competing affordance in a row that already navigates somewhere, and an action that spends money deserves the detail page's context rather than a one-click path from a dense list. Redirecting rows straight into payout screens was rejected: it would strand `/invoices/[id]` as dead code, and the detail page carries what the payout flow does not (settlement reference, issue and due dates, audit trail) — an invoice is a document, a payout is a transaction.

**FX reconciliation:** The rate table was re-fitted to the seed ledger's own `amount`/`usdValue` pairs, so an invoice-sourced payout derives the same USD figure the list and dashboard already show. INR was the one material conflict — the mockups implied 95.34, the ledger implies 83.33 (a 14% gap). The ledger wins, since it is what every other surface displays.

---

## Build order (next 3 hours)

1. Scaffold + deploy to Vercel
2. Shell: sidebar, header, chat panel skeleton
3. Module registry + three routes with rough content
4. Breadcrumb/title pattern on detail page
5. Command palette (Cmd+K)
6. Mobile passes (drawer nav, column pruning, panel sheet)
7. Chat polish (thinking state, staged reveal)
8. Payout dialog
9. Dark mode

Everything after step 5 can land post-submission on the same URL. If forced to cut before the deadline: dark mode first, payout dialog second, chat animation third. Never cut the command palette or the breadcrumb pattern.

---

## Open questions intentionally resolved by convention (for README/walkthrough)

- **"Hierarchy" in nav** → read as structural grouping, not nested nav. Nested nav is stretch, not core.
- **"Foldable"** → read as fully hidden with header affordance, not icon rail (see D3).
- **"Top-level code"** → boundary defined by us: shell frozen, registry is the extension surface (see D6).
- **Time limit** → not enforced; hard constraint is the 3-hour Vercel link, after which iteration continues on the live URL.
