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

const PANEL_MIN_WIDTH = 320;
const PANEL_WIDTH = 380;
const PANEL_MAX_WIDTH = 500;

const clampWidth = (w: number) => Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, w));

/**
 * User-resizable panel width via a left-edge drag handle. The panel grows to
 * the left (it's docked/anchored right), so a drag left widens it. Clamped to
 * [PANEL_MIN_WIDTH, PANEL_MAX_WIDTH].
 */
function useResizableWidth() {
  const [width, setWidth] = React.useState(PANEL_WIDTH);
  const [resizing, setResizing] = React.useState(false);

  // Suppress text selection and force the resize cursor globally while dragging.
  React.useEffect(() => {
    if (!resizing) return;
    const prev = { cursor: document.body.style.cursor, select: document.body.style.userSelect };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prev.cursor;
      document.body.style.userSelect = prev.select;
    };
  }, [resizing]);

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;
      setResizing(true);

      const onMove = (e: PointerEvent) => {
        // Anchored right: moving the pointer left (negative delta) widens.
        setWidth(clampWidth(startWidth + (startX - e.clientX)));
      };
      const onUp = () => {
        setResizing(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [width]
  );

  return { width, resizing, onPointerDown };
}

/** Drag affordance on the panel's left edge for resizing. */
function ResizeHandle({ onPointerDown, active }: { onPointerDown: (e: React.PointerEvent) => void; active: boolean }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize chat panel"
      onPointerDown={onPointerDown}
      className={cn(
        // Sits just inside the left edge so overflow-hidden on the docked panel
        // doesn't clip it. Wide grab area, thin visible rule.
        "absolute inset-y-0 left-0 z-10 w-2 cursor-col-resize",
        "after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-transparent after:transition-colors hover:after:bg-border",
        active && "after:bg-primary"
      )}
    />
  );
}

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

// Canned replies — a stub "AI" picks one at random. No backend.
const LOREM_REPLIES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Payouts to that contractor settled on the standard rail; nothing is blocked on your end.",
  "Sed do eiusmod tempor incididunt ut labore. Based on the current invoices, the outstanding balance clears within the usual two-day window.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco. That invoice is in a processing state — the destination bank confirms shortly.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse. I can draft a new payout for you; just confirm the amount and currency.",
];

const THINKING_MIN = 900;
const THINKING_MAX = 2200;

/**
 * Owns the mock chat thread: sending appends a user bubble, flips to a
 * "thinking" state, then after a randomized delay appends a canned AI reply.
 * Purely front-end — there is no model behind it.
 */
function useChatThread() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const send = React.useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    setThinking(true);

    const delay = THINKING_MIN + Math.random() * (THINKING_MAX - THINKING_MIN);
    timer.current = setTimeout(() => {
      const reply = LOREM_REPLIES[Math.floor(Math.random() * LOREM_REPLIES.length)];
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
      setThinking(false);
    }, delay);
  }, []);

  return { messages, thinking, send };
}

/** A single chat bubble — right-aligned for the user, left for the assistant. */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        )}
      >
        {message.text}
      </div>
    </motion.div>
  );
}

/** Thinking indicator: a shimmering label while the reply is pending. */
function ThinkingRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex justify-start"
      aria-live="polite"
    >
      <span className="text-shimmer text-sm font-medium">Thinking…</span>
    </motion.div>
  );
}

/** Composer: auto-growing textarea with the send control pinned inside it. */
function ChatComposer({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [value, setValue] = React.useState("");

  function submit() {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  }

  return (
    <form
      className="border-t p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="relative rounded-2xl border bg-background transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends; Shift+Enter inserts a newline.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Ask about payouts, invoices…"
          aria-label="Message the AI assistant"
          rows={1}
          className="field-sizing-content max-h-40 w-full resize-none bg-transparent px-3.5 py-2.5 pr-12 text-sm outline-none placeholder:text-muted-foreground"
        />
        {/* absolute bottom pin keeps the button in place as the field grows */}
        <Button
          type="submit"
          size="icon-xs"
          disabled={!value.trim() || disabled}
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
  const { messages, thinking, send } = useChatThread();
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Keep the newest message / the thinking row in view.
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const empty = messages.length === 0 && !thinking;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          {empty && (
            <p className="text-sm text-muted-foreground">
              Ask about payouts, invoices, or contractors to get started.
            </p>
          )}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <AnimatePresence>{thinking && <ThinkingRow key="thinking" />}</AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <ChatComposer onSend={send} disabled={thinking} />
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
  const { width, resizing, onPointerDown } = useResizableWidth();
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
            className="fixed inset-y-0 right-0 z-40 border-l bg-background shadow-xl"
            style={{ width }}
            initial={{ x: "100%" }}
            animate={{ x: 0, transition: { ...PANEL_FOLD, delay: PANEL_OPEN_DELAY } }}
            exit={{ x: "100%", transition: PANEL_FOLD }}
          >
            <ResizeHandle onPointerDown={onPointerDown} active={resizing} />
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
      className={cn("relative sticky top-0 h-svh shrink-0 overflow-hidden bg-background", open && "border-l")}
      initial={false}
      animate={{ width: open ? width : 0 }}
      // Skip the fold easing while dragging so resize tracks the pointer 1:1.
      transition={resizing ? { duration: 0 } : open ? { ...PANEL_FOLD, delay: PANEL_OPEN_DELAY } : PANEL_FOLD}
    >
      {open && <ResizeHandle onPointerDown={onPointerDown} active={resizing} />}
      {/* Fixed-width inner wrapper so content doesn't reflow mid-transition. */}
      <div className="h-full" style={{ width }}>
        <ChatPanelChrome onClose={() => setOpen(false)} closeButtonRef={closeButtonRef} />
      </div>
    </motion.aside>
  );
}
