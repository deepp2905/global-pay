# Case Study Brief — Instalily AI

> Original assignment, preserved verbatim for reference. See `DECISIONS.md` for how each requirement and ambiguity was resolved.

## Goal

Build the shared foundation for a B2B enterprise workspace app. Focus on the top-level layout, navigation, and design system that product features will live inside, not the features themselves. Multiple product surfaces will be built on top, so extensibility and consistency are the point.

Imagine you are the first design engineer at a fast-growing enterprise software company where the engineering team is doubling and multiple product surfaces are landing next quarter. Two audiences to design for:

- **Enterprise employees** who navigate the app daily need speed, clarity, and consistency.
- **The developers and designers building on top** need clear extension points, good defaults, and a system.

## What to build

### The layout

Build the top-level app frame:

- A main content area for the active module
- A foldable right-side AI chat panel, independent of the main content. UI only with a stubbed chat surface.
- Responsive behavior. Layout must work on both desktop and mobile.

### The navigation

The user should be able to:

- Move through a global navigation that scales past three modules, with hierarchy and keyboard access
- Jump to any section of the app quickly, without a mouse
- Know where they are inside a deep view, and how to get back

Pick the primitives that fit these needs.

### Three example modules

Mount three placeholder modules to show the app in use. No real backend, no business logic. Name and theme them however feels right.

1. **Dashboard.** A home or overview page with static cards or widgets.
2. **List view.** A paginated or filterable list of records with mock rows.
3. **Detail view.** A nested page reached by clicking into a row from the list, as a sub-route of the list.

## What we're looking for

### Craft and polish

The foundation should feel considered and intentional, the kind of product people enjoy using. Typography, spacing, font-size hierarchy, layout, and visual details are chosen with care. The same care extends to accessibility: the critical paths (main nav, module switching, opening the panel) work fully from the keyboard, and color contrast holds up throughout.

### Extensibility

A new engineer or designer should be able to add a fourth module without touching the top-level code. They should know how to add a nav item, mount a route, use existing components, and follow the tokens.

### Scaffolding

A starter kit comes pre-configured with Next.js, shadcn/ui, and Tailwind CSS. Everything else is up to you: file structure, folder organization, component architecture, naming, tokens.

## Deliverables

- A private GitHub repo, shared with **@TANJX** and **@bill-instalily**
- A README that covers:
  - Architecture at a glance: where things live, and why
  - How to add a new module, with concrete steps
  - The design system: tokens, primitives, and conventions
- A deployed URL (Vercel offers free tier)
- A 5-minute walkthrough during the follow-up call, covering:
  - Three specific decisions on how the foundation is shaped: what was considered, what was rejected
  - Adding a hypothetical fourth module, walked through in code
  - What another week would add
  - How AI factored in: what was accepted, what was overridden, what was pushed back on

AI tools are welcome. The model can't one-shot layout, hierarchy, naming, or architecture. How it's directed matters.

---

*GOOD LUCK! — THE INSTALILY TEAM*
