# Decision Log — Instalily Case Study Foundation

Knowledge transfer for all foundation decisions: what was chosen, what was considered and rejected, and why. Doubles as source material for the walkthrough's "three specific decisions" section.

---

## D1. Product domain: Global contractor payments platform

**Decision:** A fictional cross-border contractor payments product. Modules: Payments Dashboard (overview), Invoices (list with pending / processing / paid states), Invoice Detail (nested sub-route of the list).

**Rejected:** Generic "Acme Corp / Dashboard / Records" placeholder theming.

**Rationale:** The brief leaves theming open ("name and theme them however feels right"). Domain-real mock data (invoice IDs, contractor names, currencies, payout statuses) makes every screen read as a product rather than a template, and the domain aligns with prior fintech experience so mock data instincts are already warm. Picked in the first 30 minutes so it flavors everything downstream.

**Scope trim:** "Create payout" is a **dialog/sheet** launched from the invoice list header, not a page. The brief requires exactly one deep view (list → detail); a second nested flow costs time and proves nothing new. A shadcn dialog with a disabled-on-submit stub covers it.

---

## D2. Global navigation: Collapsible left sidebar with grouped sections

**Decision:** Left sidebar, collapsible, with group labels (e.g., "Workspace" / "Operations") to show structural hierarchy.

**Rejected:**
- **Top nav** — doesn't scale past ~5–6 modules; the brief explicitly asks for scaling past three with hierarchy.
- **Icon-only rail as the primary nav** — hides labels, hurts learnability for daily enterprise users who need speed and clarity.

**Rationale:** Grouped sidebar demonstrates both requirements at once: it visibly scales (groups absorb new modules) and hierarchy is structural, not just visual. Stretch goal only if time allows: a second-level nav within one module.

---

## D3. AI chat panel: Fully hidden when closed, header trigger + keyboard shortcut

**Decision:** Panel fully hides when folded. Reopen affordances: persistent AI toggle button in the shell header (right-aligned) + keyboard shortcut (Cmd+J — unclaimed by browsers) + open/closed state persisted in localStorage.

**Rejected:** Collapsed 40px icon rail with a single icon.

**Rationale:** Icon rails earn their width when they multiplex several panels (Jira's right rail, Intercom's inbox rail). With a single chat surface, a rail is dead pixels. The dominant SaaS pattern for a single AI surface is header trigger + shortcut (Notion Cmd+J, GitHub Copilot header icon). The header owns panel toggles; the panel owns nothing when closed.

**Walkthrough note:** This is one of the strongest "considered and rejected" stories — lead with it.

---

## D4. Wayfinding in deep views: One-level breadcrumb with named parent, no separate "Back"

**Decision:** On the detail page, a back-arrow link labeled with the **parent's name** ("← Invoices"), then the page title (invoice ID). Stripe's detail-page pattern. The crumb is a real link to the list route.

**Rejected:**
- **Breadcrumbs + a separate back button** — redundant; the parent crumb *is* the back affordance.
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

**Convention documented in README:** Explicitly define what counts as the shell (frozen) vs. the extension surface (registry + module folders). A one-line registry entry does *not* count as "touching top-level code."

**Rationale:** The brief's fourth-module test is ambiguous about the boundary; turning that ambiguity into a documented convention is exactly the first-design-engineer move. The registry is the single sanctioned extension point: nav item, route mounting, and module metadata all derive from the manifest.

---

## D7. Command palette: In scope, high priority

**Decision:** Cmd+K palette using shadcn's `Command` component, nav-only scope (~30 min).

**Rationale:** "Jump to any section of the app quickly, without a mouse" is almost certainly pointing at Cmd+K. It's the most direct answer to an explicit requirement and the keyboard-access proof point for the walkthrough. **Cut order:** dark mode and the payout dialog get cut before this does.

---

## D8. Chat stub: Inhabited transcript + scoped animation

**Decision:** Two static prior exchanges (so the panel looks inhabited in screenshots) + a three-dot pulse "thinking" indicator + staged reveal of a canned response (CSS transition or simple interval appending sentences).

**Rejected:**
- **Empty gray rectangle / bare composer** — wastes the most photogenic region of the app.
- **Per-token streaming simulation** — animation polish here can quietly consume an hour; staged sentence reveal reads the same at a fraction of the cost.

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
