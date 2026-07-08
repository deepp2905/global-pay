import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/shell/app-header";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { ChatPanel } from "@/components/shell/chat-panel";
import { ChatPanelProvider } from "@/hooks/use-chat-panel";

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
    <TooltipProvider>
      <ChatPanelProvider defaultOpen={chatDefaultOpen}>
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
            <div className="flex-1">{children}</div>
          </SidebarInset>
          <ChatPanel />
        </SidebarProvider>
      </ChatPanelProvider>
    </TooltipProvider>
  );
}
