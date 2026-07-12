"use client";

import * as React from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { PANEL_FOLD, PANEL_OPEN_DELAY, useChatPanel } from "@/hooks/use-chat-panel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = 380;

/** Composer: auto-growing textarea with the send control pinned inside it. */
function ChatComposer() {
  const [value, setValue] = React.useState("");

  return (
    <form className="border-t p-3" onSubmit={(event) => event.preventDefault()}>
      <div className="relative rounded-2xl border bg-background transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask about payouts, invoices…"
          aria-label="Message the AI assistant"
          rows={1}
          className="field-sizing-content max-h-40 w-full resize-none bg-transparent px-3.5 py-2.5 pr-12 text-sm outline-none placeholder:text-muted-foreground"
        />
        {/* absolute bottom pin keeps the button in place as the field grows */}
        <Button
          type="submit"
          size="icon-xs"
          disabled={!value.trim()}
          className="absolute right-2 bottom-2 rounded-full"
        >
          <ArrowUp />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
}

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
      <ChatComposer />
    </div>
  );
}

/** Header + body for the desktop presentations (the sheet brings its own header). */
function ChatPanelChrome({
  onClose,
  closeButtonRef,
}: {
  onClose: () => void;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <Sparkles className="size-4" />
        <span className="text-sm font-medium">Ask AI</span>
        <Button ref={closeButtonRef} variant="ghost" size="icon" className="ml-auto" onClick={onClose}>
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
 * Opening waits for the header pill to fade (see use-chat-panel timing).
 */
export function ChatPanel() {
  const { open, setOpen } = useChatPanel();
  const isMobile = useIsMobile();
  const isOverlay = useMediaQuery("(max-width: 1279px)");
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const prevOpenRef = React.useRef(open);

  // The pill unmounts while the panel is open, so hand focus to the panel's
  // close button on open and back to the pill on close. Skipped on mount so
  // a cookie-restored open panel doesn't steal focus.
  React.useEffect(() => {
    if (prevOpenRef.current === open) return;
    prevOpenRef.current = open;
    if (isMobile) return; // the sheet manages its own focus
    if (open) {
      closeButtonRef.current?.focus();
    } else {
      document.getElementById("ai-assistant-trigger")?.focus();
    }
  }, [open, isMobile]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4" /> Ask AI
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
            animate={{ x: 0, transition: { ...PANEL_FOLD, delay: PANEL_OPEN_DELAY } }}
            exit={{ x: "100%", transition: PANEL_FOLD }}
          >
            <ChatPanelChrome onClose={() => setOpen(false)} closeButtonRef={closeButtonRef} />
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
      transition={open ? { ...PANEL_FOLD, delay: PANEL_OPEN_DELAY } : PANEL_FOLD}
    >
      {/* Fixed-width inner wrapper so content doesn't reflow mid-transition. */}
      <div className="h-full" style={{ width: PANEL_WIDTH }}>
        <ChatPanelChrome onClose={() => setOpen(false)} closeButtonRef={closeButtonRef} />
      </div>
    </motion.aside>
  );
}
