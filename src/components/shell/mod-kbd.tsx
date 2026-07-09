"use client";

import { Command } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { useIsMac } from "@/hooks/use-is-mac";

/**
 * The platform modifier keycap: ⌘ on Apple devices, Ctrl elsewhere. Every
 * displayed shortcut hint goes through this so hints never lie about the OS.
 * (Handlers accept metaKey OR ctrlKey, so behavior already matches.)
 */
export function ModKbd() {
  const isMac = useIsMac();
  return <Kbd>{isMac ? <Command aria-label="Cmd" /> : "Ctrl"}</Kbd>;
}
