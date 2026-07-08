"use client";

import { SendHorizontal, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatPanel } from "@/hooks/use-chat-panel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = 380;
const FOLD_TRANSITION = { duration: 0.2, ease: "easeOut" as const };

/** Transcript + composer, shared by every panel presentation. */
function ChatPanelBody() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
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

/** Header + body for the desktop presentations (the sheet brings its own header). */
function ChatPanelChrome({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <Sparkles className="size-4" />
        <span className="text-sm font-medium">AI Assistant</span>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose}>
          <X />
          <span className="sr-only">Close AI assistant</span>
        </Button>
      </div>
      <ChatPanelBody />
    </div>
  );
}

/**
 * The foldable AI panel (D3): fully hidden when closed, no rail. Responsive
 * hybrid: ≥xl it docks and compresses the main content (copilot-alongside-
 * work standard); md–xl it slides over the content so the module isn't
 * crushed; <md it becomes a sheet. Motion drives the fold per project rule.
 */
export function ChatPanel() {
  const { open, setOpen } = useChatPanel();
  const isMobile = useIsMobile();
  const isOverlay = useMediaQuery("(max-width: 1279px)");

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

  if (isOverlay) {
    return (
      <AnimatePresence>
        {open && (
          <motion.aside
            id="chat-panel"
            aria-label="AI assistant"
            className="fixed inset-y-0 right-0 z-40 w-[380px] border-l bg-background shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={FOLD_TRANSITION}
          >
            <ChatPanelChrome onClose={() => setOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      id="chat-panel"
      aria-label="AI assistant"
      aria-hidden={!open}
      inert={!open}
      className={cn("sticky top-0 h-svh shrink-0 overflow-hidden bg-background", open && "border-l")}
      initial={false}
      animate={{ width: open ? PANEL_WIDTH : 0 }}
      transition={FOLD_TRANSITION}
    >
      {/* Fixed-width inner wrapper so content doesn't reflow mid-transition. */}
      <div className="h-full" style={{ width: PANEL_WIDTH }}>
        <ChatPanelChrome onClose={() => setOpen(false)} />
      </div>
    </motion.aside>
  );
}
