import * as React from "react";

// SSR renders the widest layout; corrected on hydration.
function getServerSnapshot() {
  return false;
}

/** Subscribe to a CSS media query. SSR-safe via useSyncExternalStore. */
export function useMediaQuery(query: string) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = React.useCallback(() => window.matchMedia(query).matches, [query]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
