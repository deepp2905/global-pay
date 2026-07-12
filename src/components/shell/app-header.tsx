"use client";

import { Search, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ModShortcut } from "@/components/shell/mod-shortcut";
import { PILL_FADE_IN, PILL_FADE_OUT, useChatPanel } from "@/hooks/use-chat-panel";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { modules } from "@/modules";

/**
 * Shell header: mobile nav trigger + active module label on the left, the AI
 * assistant pill on the right (D3). The pill and panel never animate on the
 * same clock: opening fades the pill out first, then the panel slides in;
 * closing collapses the panel first, then the pill fades in at rest — so the
 * pill never visibly drifts while the header resizes.
 */
export function AppHeader() {
  const pathname = usePathname();
  const { open, toggle } = useChatPanel();
  const { setOpen: setSearchOpen } = useCommandPalette();

  const activeModule = modules.find((m) => pathname === m.href || pathname.startsWith(`${m.href}/`));

  return (
    // Sticky so global controls (search, AI) stay reachable while the main
    // content scrolls.
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1.5 md:hidden" />
      <Separator orientation="vertical" className="!h-4 md:hidden" />
      {/* Redundant on desktop (sidebar active state + page h1 both name the
          module); kept on mobile where the sidebar is hidden. */}
      <span className="text-sm font-medium md:hidden">{activeModule?.label}</span>

      <div className="ml-auto flex items-center gap-2">
        {/* Global search lives here (not the sidebar) so it stays reachable
            whether the sidebar is expanded, collapsed to icons, or closed. */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchOpen(true)}
          className="w-56 justify-start gap-2 rounded-full px-3 font-normal text-muted-foreground max-sm:w-8 max-sm:px-0 max-sm:justify-center"
        >
          <Search className="text-muted-foreground" />
          <span className="hidden truncate sm:inline">Search anything</span>
          <ModShortcut keyLabel="K" className="ml-auto hidden sm:inline-flex" />
        </Button>

        <AnimatePresence initial={false}>
          {!open && (
            <motion.div
              key="ai-pill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: PILL_FADE_IN }}
              exit={{ opacity: 0, transition: PILL_FADE_OUT }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    id="ai-assistant-trigger"
                    variant="outline"
                    size="sm"
                    onClick={toggle}
                    aria-expanded={open}
                    aria-controls="chat-panel"
                    className="rounded-full"
                  >
                    <Sparkles />
                    Ask AI
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <ModShortcut keyLabel="J" />
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
