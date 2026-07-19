"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

/** Matches the shell's panel/presence vocabulary (PANEL_FOLD) rather than the
 *  button press spring — this is a surface sliding, not a control being pressed. */
const INDICATOR_SLIDE = { duration: 0.2, ease: "easeOut" } as const;

/**
 * True only after hydration. next-themes resolves the stored theme on the
 * client, so the active segment must stay unset during SSR and first paint
 * rather than flashing a wrong one. useSyncExternalStore gives us that without
 * a setState-in-effect cascade (it never re-subscribes: the snapshot is const).
 */
const emptySubscribe = () => () => {};
function useHydrated() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Light / System / Dark segmented control, pinned under the account card.
 *
 * Renders as a 3-up row when the sidebar is expanded and collapses to a single
 * cycling button on the icon rail, where a segmented control has no room. Theme
 * is undefined until next-themes reads storage on the client, so the active
 * segment stays unset on first paint instead of flashing the wrong one.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { state, isMobile } = useSidebar();
  const mounted = useHydrated();

  const collapsed = state === "collapsed" && !isMobile;

  if (collapsed) {
    return <CollapsedThemeButton theme={mounted ? theme : undefined} setTheme={setTheme} />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex items-center gap-0.5 rounded-lg border bg-background p-0.5"
    >
      {THEMES.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${label} theme`}
                onClick={() => setTheme(value)}
                className={cn(
                  "pointer-events-auto relative flex h-7 flex-1 cursor-pointer items-center justify-center rounded-md",
                  "text-muted-foreground transition-colors hover:text-foreground",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active && "text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="theme-active"
                    transition={INDICATOR_SLIDE}
                    className="absolute inset-0 rounded-md border bg-muted"
                  />
                )}
                <Icon className="relative size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/** Icon-rail fallback: one button cycling light → system → dark. */
function CollapsedThemeButton({
  theme,
  setTheme,
}: {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}) {
  const index = THEMES.findIndex((t) => t.value === theme);
  const current = index === -1 ? THEMES[1] : THEMES[index];
  const next = THEMES[(index === -1 ? 1 : index + 1) % THEMES.length];
  const Icon = current.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setTheme(next.value)}
          aria-label={`Color theme: ${current.label}. Switch to ${next.label}.`}
          className="pointer-events-auto flex size-8 cursor-pointer items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">Switch to {next.label.toLowerCase()}</TooltipContent>
    </Tooltip>
  );
}
