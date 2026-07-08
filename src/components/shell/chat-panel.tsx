"use client";

import { SendHorizontal, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatPanel } from "@/hooks/use-chat-panel";
import { cn } from "@/lib/utils";

function ChatPanelBody() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            Chat transcript placeholder — prior exchanges and the staged reply land in the chat-polish phase.
          </p>
        </div>
      </ScrollArea>
      <form className="border-t p-4" onSubmit={(event) => event.preventDefault()}>
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Ask about payouts, invoices…"
            aria-label="Message the AI assistant"
            rows={2}
            className="min-h-0 resize-none"
          />
          <Button type="submit" size="icon" disabled>
            <SendHorizontal />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * The foldable AI panel (D3): fully hidden when closed, no rail. Desktop
 * renders a right-hand column that compresses the main content; mobile
 * renders a full-height sheet.
 */
export function ChatPanel() {
  const { open, setOpen } = useChatPanel();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4" /> AI Assistant
            </SheetTitle>
            <SheetDescription className="sr-only">Chat with the workspace AI assistant</SheetDescription>
          </SheetHeader>
          <ChatPanelBody />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      id="chat-panel"
      aria-label="AI assistant"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 overflow-hidden border-l bg-background transition-[width] duration-200 ease-out md:block",
        open ? "w-[380px]" : "w-0 border-l-0"
      )}
    >
      {/* Fixed-width inner wrapper so content doesn't reflow mid-transition. */}
      <div className="flex h-full w-[380px] flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <Sparkles className="size-4" />
          <span className="text-sm font-medium">AI Assistant</span>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
            <X />
            <span className="sr-only">Close AI assistant</span>
          </Button>
        </div>
        <ChatPanelBody />
      </div>
    </aside>
  );
}
