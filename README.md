# InstaLILY Design Engineer Case Study — Starter

Pre-configured with **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**. Everything else — file structure, folder organization, component architecture, naming, tokens — is up to you.

## Getting started

Requires Node.js 20.9+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script           | What it does                    |
| ---------------- | ------------------------------- |
| `npm run dev`    | Start the dev server            |
| `npm run build`  | Production build                |
| `npm run start`  | Serve the production build      |
| `npm run lint`   | ESLint                          |
| `npm run format` | Prettier (with Tailwind plugin) |

## What's included — and what's deliberately not

- **shadcn/ui** is initialized (Radix base, neutral palette, CSS variables). Only `button` is installed, as proof the pipeline works — we expect you to add the components you need with `npx shadcn@latest add <component>`, and to make deliberate choices about which primitives fit the brief.
- **Design tokens**: `src/app/globals.css` carries the stock shadcn light/dark variables. No theme switching is wired up — whether and how theming exists is your call, and so is evolving the tokens.
- **Typography**: we did not pick a font for you. The `create-next-app` Geist default is wired through `--font-sans` / `--font-mono` in `src/app/layout.tsx` so it's a one-line swap. Treat it as a placeholder, not a choice.
- **The home page** (`src/app/page.tsx`) is intentionally blank. Replace it.
- No layout primitives, no nav, no state management, no extra folders. Structure is part of what we're evaluating.

## Before you submit

1. `git init`, then push to a **private** GitHub repo shared with **@TANJX** and **@bill-instalily**.
2. Deploy it (Vercel free tier works).
3. **Replace this README with your own**, per the brief: architecture at a glance, how to add a new module, and your design system's tokens, primitives, and conventions.
