"use client";

import { Command } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { useIsMac } from "@/hooks/use-is-mac";
import { cn } from "@/lib/utils";

/**
 * A modifier + key shortcut hint rendered as "⌘ + K" (macOS) / "Ctrl + K"
 * (Windows/Linux): fill-less keycaps joined by a plus, colored by context so
 * it reads correctly on both light surfaces and dark tooltips.
 */
export function ModShortcut({ keyLabel, className }: { keyLabel: string; className?: string }) {
  const isMac = useIsMac();
  return (
    // Fill-less keys don't need keycap width/padding — keep them tight.
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <Kbd className="h-auto min-w-0 px-0">{isMac ? <Command aria-label="Command" /> : "Ctrl"}</Kbd>
      <span aria-hidden>+</span>
      <Kbd className="h-auto min-w-0 px-0">{keyLabel}</Kbd>
    </span>
  );
}
