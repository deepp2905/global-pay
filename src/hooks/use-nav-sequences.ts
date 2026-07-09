"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { modules } from "@/modules";

const SEQUENCE_WINDOW_MS = 1000;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA";
}

/**
 * Linear-style navigation sequences, driven by manifest `shortcut` fields
 * ("G D" → press g, then d within a second). Suppressed while typing.
 * Browsers reserve Cmd/Ctrl+digit, which is why sequences instead (D7 note).
 */
export function useNavSequences() {
  const router = useRouter();
  const armedAtRef = React.useRef(0);

  React.useEffect(() => {
    const sequences = new Map<string, string>();
    for (const m of modules) {
      const parts = m.shortcut?.split(" ");
      if (m.status !== "coming-soon" && parts?.length === 2 && parts[0] === "G") {
        sequences.set(parts[1].toLowerCase(), m.href);
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "g") {
        armedAtRef.current = Date.now();
        return;
      }
      if (Date.now() - armedAtRef.current < SEQUENCE_WINDOW_MS) {
        const href = sequences.get(key);
        if (href) {
          event.preventDefault();
          router.push(href);
        }
        armedAtRef.current = 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);
}
