"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

/**
 * Direction-aware entry animation for drilling between routes.
 *
 * Only in-page navigation animates — following a link inside the page body,
 * such as an invoice row → that invoice's detail. Navigating through the
 * sidebar (chrome) is instant, so moving around the app via the nav never
 * animates; see `markChromeNavigation`.
 *
 * Direction comes from route depth: going deeper slides the new page in from
 * the right (forward), coming back out slides it in from the left. Only the
 * entering page animates — there is no exit fade — which keeps a single clear
 * motion and avoids the App-Router flash where the freshly committed page
 * paints at full opacity for a frame before an exit sequence hides it.
 */

/**
 * Set by chrome (the sidebar, command palette) right before it triggers a
 * navigation, so the next route change renders with no animation. The
 * transition reads it while deriving the entering offset and clears it in an
 * effect once the change has committed. A plain module-level holder (not state/
 * context) keeps callers decoupled from this component.
 */
const chromeNav = { pending: false };

export function markChromeNavigation() {
  chromeNav.pending = true;
}

/** Depth beyond the top-level segment, e.g. /invoices/INV-1 is one level deeper. */
function routeDepth(pathname: string) {
  return pathname.split("/").filter(Boolean).length;
}

const DISTANCE = 24;
const TRANSITION = { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const }; // ease-out-quad

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Derive the entering page's offset the moment the pathname changes (the
  // "adjust state on prop change" idiom — done in render, not an effect, so the
  // value is set before the new page paints). Chrome navigations (flagged just
  // before the push) resolve to 0 offset, i.e. no slide. Reading the flag here
  // is idempotent — safe under a double-invoked render — and it's cleared in the
  // effect below once the change has committed.
  const [prev, setPrev] = React.useState({ pathname, offset: 0 });
  if (pathname !== prev.pathname) {
    const direction = Math.sign(routeDepth(pathname) - routeDepth(prev.pathname));
    setPrev({ pathname, offset: chromeNav.pending ? 0 : direction * DISTANCE });
  }

  React.useEffect(() => {
    // One-shot: clear after the navigation that set it has been consumed.
    chromeNav.pending = false;
  }, [pathname]);

  const offset = shouldReduceMotion ? 0 : prev.offset;
  const animate = offset !== 0;

  // No AnimatePresence / exit: the outgoing page unmounts instantly and the new
  // one animates in on its own. Keying the motion element on pathname is what
  // re-runs `initial`. This is deliberately a single-element enter — an exit
  // sequence is what caused the flash (the freshly committed page painting at
  // full opacity for a frame before being hidden to fade back in).
  return (
    <motion.div
      key={pathname}
      initial={animate ? { opacity: 0, x: offset } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={TRANSITION}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}
