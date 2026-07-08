<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules

- **Animations: use Motion.** All custom transitions and animations (panel slides, presence mount/unmount, staged reveals, layout shifts) use the `motion` package (`import { motion, AnimatePresence } from "motion/react"`). Exceptions: shadcn/ui primitives' built-in CSS transitions and pure hover/focus styling stay CSS.
