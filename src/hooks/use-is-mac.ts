import * as React from "react";

// Static per pageload; subscribe is a no-op.
function subscribe() {
  return () => {};
}

function getSnapshot() {
  return /mac|iphone|ipad|ipod/i.test(window.navigator.platform || window.navigator.userAgent);
}

// SSR can't know the OS; render the Windows/Linux form and correct on hydration.
function getServerSnapshot() {
  return false;
}

/** True on Apple platforms — drives ⌘ vs Ctrl in shortcut hints. */
export function useIsMac() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
