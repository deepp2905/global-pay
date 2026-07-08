"use client";

import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChatPanel } from "@/hooks/use-chat-panel";
import { modules } from "@/modules";

/**
 * Shell header: sidebar trigger + active module label on the left, panel
 * toggles on the right. The header owns panel affordances (D3) — the chat
 * panel itself has no persistent presence when closed.
 */
export function AppHeader() {
  const pathname = usePathname();
  const { open, toggle } = useChatPanel();

  const activeModule = modules.find((m) => pathname === m.href || pathname.startsWith(`${m.href}/`));

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1.5" />
      <Separator orientation="vertical" className="!h-4" />
      <span className="text-sm font-medium">{activeModule?.label}</span>
      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="chat-panel"
              className={open ? "bg-accent text-accent-foreground" : undefined}
            >
              <Sparkles />
              <span className="sr-only">Toggle AI assistant</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">AI assistant (Ctrl+J)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
