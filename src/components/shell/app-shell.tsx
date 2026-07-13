import { MotionConfig } from "motion/react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/shell/app-header";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { ChatPanel } from "@/components/shell/chat-panel";
import { CommandPalette } from "@/components/shell/command-palette";
import { RouteTransition } from "@/components/shell/route-transition";
import { ChatPanelProvider } from "@/hooks/use-chat-panel";
import { CommandPaletteProvider } from "@/hooks/use-command-palette";

/**
 * The top-level app frame: sidebar | header + main content | chat panel.
 * Frozen surface (D6) — modules extend the app through the registry, never
 * by editing this tree.
 */
export function AppShell({
  children,
  sidebarDefaultOpen,
  chatDefaultOpen,
}: {
  children: React.ReactNode;
  sidebarDefaultOpen: boolean;
  chatDefaultOpen: boolean;
}) {
  return (
    // reducedMotion="user" disables Motion transforms for prefers-reduced-motion users.
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={400}>
        <ChatPanelProvider defaultOpen={chatDefaultOpen}>
          <CommandPaletteProvider>
            <SidebarProvider defaultOpen={sidebarDefaultOpen}>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
              >
                Skip to content
              </a>
              <AppSidebar />
              <SidebarInset id="main-content" tabIndex={-1} className="min-w-0">
                <AppHeader />
                <div className="flex-1">
                  <RouteTransition>{children}</RouteTransition>
                </div>
              </SidebarInset>
              <ChatPanel />
              <CommandPalette />
            </SidebarProvider>
          </CommandPaletteProvider>
        </ChatPanelProvider>
      </TooltipProvider>
    </MotionConfig>
  );
}
