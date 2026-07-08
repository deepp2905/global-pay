"use client";

import { Command, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChatPanel } from "@/hooks/use-chat-panel";
import { modules } from "@/modules";

/**
 * Shell header: mobile nav trigger + active module label on the left, the AI
 * assistant pill on the right (D3). The pill stays put while the panel is
 * open (pressed state) so toggling responds instantly in place. Desktop
 * sidebar collapse lives inside the sidebar itself.
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              id="ai-assistant-trigger"
              variant="outline"
              size="sm"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="chat-panel"
              className={open ? "rounded-full bg-accent text-accent-foreground" : "rounded-full"}
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
      </div>
    </header>
  );
}
