"use client";

import { Command, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PILL_FADE_IN, PILL_FADE_OUT, useChatPanel } from "@/hooks/use-chat-panel";
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

  const activeModule = modules.find((m) => pathname === m.href || pathname.startsWith(`${m.href}/`));

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1.5 md:hidden" />
      <Separator orientation="vertical" className="!h-4 md:hidden" />
      <span className="text-sm font-medium">{activeModule?.label}</span>
      <div className="ml-auto flex items-center gap-1">
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
                    AI Assistant
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <KbdGroup>
                    <Kbd>
                      <Command aria-label="Cmd" />
                    </Kbd>
                    <Kbd>J</Kbd>
                  </KbdGroup>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
