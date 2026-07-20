"use client";

import * as React from "react";
import { ArrowUp, ChevronDown, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

const THINKING_MIN = 4000;
const THINKING_MAX = 7000;

/**
 * Owns the mock chat thread: sending appends a user bubble, flips to a
 * "thinking" state, then after a randomized delay appends a canned AI reply.
 * Purely front-end — there is no model behind it. Starts empty so the panel
 * can show its sparkle welcome state until the first exchange.
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

/**
 * Streams an assistant reply word by word with an LLM-like texture: each word
 * fades in from a soft blur. Per-word delay is duration-normalized so the whole
 * reply lands in ~0.8–3s regardless of length, with ±30% jitter so the rhythm
 * is irregular like real token generation. Whitespace tokens emit instantly.
 * `onProgress` fires per reveal so the caller can pin the scroll to the bottom.
 */
function StreamedText({ text, onProgress }: { text: string; onProgress?: () => void }) {
  // Split into words + whitespace so spacing is preserved and emitted for free.
  const tokens = React.useMemo(() => text.match(/\S+|\s+/g) ?? [], [text]);
  const wordCount = React.useMemo(() => tokens.filter((t) => /\S/.test(t)).length, [tokens]);
  const [revealed, setRevealed] = React.useState(0);

  // Keep the latest progress callback without reading a ref during render.
  const progressRef = React.useRef(onProgress);
  React.useEffect(() => {
    progressRef.current = onProgress;
  });

  React.useEffect(() => {
    if (tokens.length === 0) return;
    const baseDelay = Math.min(3000, Math.max(800, wordCount * 90)) / Math.max(1, wordCount);
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const step = (i: number) => {
      if (cancelled || i >= tokens.length) return;
      setRevealed(i + 1);
      progressRef.current?.();
      // Whitespace emits instantly; words carry the jittered per-word delay.
      const isSpace = !/\S/.test(tokens[i]);
      const delay = isSpace ? 0 : baseDelay * (0.7 + Math.random() * 0.6);
      timer = setTimeout(() => step(i + 1), delay);
    };
    timer = setTimeout(() => step(0), 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tokens, wordCount]);

  return (
    <span>
      {tokens.slice(0, revealed).map((token, i) =>
        /\S/.test(token) ? (
          <motion.span
            key={i}
            initial={{ opacity: 0, filter: "blur(1px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="inline-block"
          >
            {token}
          </motion.span>
        ) : (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>
            {token}
          </span>
        )
      )}
    </span>
  );
}

/**
 * A single message. The user's message is a right-aligned bubble; the
 * assistant "speaks" as plain left-aligned text with no background (the
 * ChatGPT/Claude convention). Only the newest assistant reply streams —
 * older ones render statically so re-renders don't replay the animation.
 */
function MessageBubble({
  message,
  stream,
  onProgress,
}: {
  message: ChatMessage;
  stream?: boolean;
  onProgress?: () => void;
}) {
  const isUser = message.role === "user";

  if (!isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="text-sm whitespace-pre-wrap text-foreground"
      >
        {stream ? <StreamedText text={message.text} onProgress={onProgress} /> : message.text}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] rounded-2xl bg-primary px-3.5 py-2 text-sm text-primary-foreground">
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

/**
 * Welcome state shown before the first exchange: a sparkle plus a personalized
 * greeting, left-aligned. Fades in softly on mount.
 */
function WelcomeState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-1 flex-col items-start justify-center gap-3 px-2 text-left"
    >
      <Sparkles className="size-7 text-foreground" />
      <div className="space-y-1">
        <h2 className="text-base font-medium text-foreground">Welcome Deep! How can I help you today?</h2>
        <p className="text-sm text-muted-foreground">Ask me anything about your payments, invoices, or payouts.</p>
      </div>
    </motion.div>
  );
}

/** Composer: auto-growing textarea with the send control pinned inside it. */
function ChatComposer({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [value, setValue] = React.useState("");

  // Type-anywhere capture: any printable key pressed while nothing else is
  // focused funnels into the draft and focuses the composer (Spotlight-style).
  // Ignores modifier combos, multi-char keys, and typing in other fields; off
  // while the assistant is busy.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (disabled) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return; // multi-char keys (Enter, Tab, arrows…)

      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable) return;
      }

      const input = document.getElementById("chat-composer-input") as HTMLTextAreaElement | null;
      if (!input) return;
      event.preventDefault();
      setValue((prev) => prev + event.key);
      input.focus();
      // Caret to the end after the value updates.
      requestAnimationFrame(() => {
        const end = input.value.length;
        input.setSelectionRange(end, end);
      });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled]);

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
          id="chat-composer-input"
          placeholder="Message the assistant…"
          aria-label="Message the AI assistant"
          rows={1}
          className="field-sizing-content max-h-40 min-h-16 w-full resize-none bg-transparent px-3.5 py-3 pr-13 text-sm outline-none placeholder:text-muted-foreground"
        />
        {/* absolute bottom pin keeps the button in place as the field grows */}
        <Button
          type="submit"
          size="icon-sm"
          disabled={!value.trim() || disabled}
          className="absolute right-1.5 bottom-1.5 rounded-full"
        >
          <ArrowUp />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
}

// Distance (px) from the bottom past which the "jump to latest" button appears.
const JUMP_THRESHOLD = 16;

/** Transcript + composer, shared by every panel presentation. */
function ChatPanelBody() {
  const { messages, thinking, send } = useChatThread();
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = React.useState(true);
  // Live mirror of atBottom for closures (stream pin) that don't re-render.
  const atBottomRef = React.useRef(true);
  const hasExchange = messages.length > 0;

  // The last assistant message is the only one that streams; a set of ids that
  // have already streamed keeps older replies static across re-renders. Which
  // id is currently streaming is tracked in state (not read from a ref during
  // render) and settled the first time a fresh assistant reply arrives.
  const streamedIds = React.useRef<Set<string>>(new Set());
  const [streamingId, setStreamingId] = React.useState<string | null>(null);
  const lastMessage = messages[messages.length - 1];

  React.useEffect(() => {
    if (lastMessage?.role === "assistant" && !streamedIds.current.has(lastMessage.id)) {
      streamedIds.current.add(lastMessage.id);
      setStreamingId(lastMessage.id);
    }
  }, [lastMessage]);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Grab the Radix viewport once so we can measure scroll distance from bottom.
  const measure = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const next = distance <= JUMP_THRESHOLD;
    atBottomRef.current = next;
    setAtBottom(next);
  }, []);

  React.useEffect(() => {
    const el = document
      .getElementById("chat-panel-scroll")
      ?.querySelector<HTMLDivElement>("[data-slot=scroll-area-viewport]");
    viewportRef.current = el ?? null;
    if (!el) return;
    el.addEventListener("scroll", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  // Keep the newest message / the thinking row in view when we're already at
  // the bottom (don't yank the user back down if they've scrolled up to read).
  React.useEffect(() => {
    if (atBottom) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, thinking]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Bubbles anchor to the bottom: override Radix's display:table inner
          wrapper to a full-height flex box so the message column can push its
          content down — a short thread sits at the bottom and only scrolls once
          it overflows. */}
      <ScrollArea
        id="chat-panel-scroll"
        className="min-h-0 flex-1 *:data-[slot=scroll-area-viewport]:*:flex! *:data-[slot=scroll-area-viewport]:*:h-full"
      >
        <div className="flex min-h-full flex-1 flex-col justify-end gap-4 p-4">
          {!hasExchange && !thinking ? (
            <WelcomeState />
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                stream={message.id === streamingId}
                onProgress={() => {
                  if (atBottomRef.current) scrollToBottom("auto");
                }}
              />
            ))
          )}
          <AnimatePresence>{thinking && <ThinkingRow key="thinking" />}</AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Jump-to-latest: a dark chevron floating above the composer, shown only
          while scrolled up from the bottom. */}
      <AnimatePresence>
        {!atBottom && (
          <motion.button
            type="button"
            onClick={() => scrollToBottom()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-20 left-1/2 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
            aria-label="Jump to latest message"
          >
            <ChevronDown className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button ref={closeButtonRef} variant="ghost" size="icon" className="ml-auto" onClick={onClose}>
              <X />
              <span className="sr-only">Close AI assistant</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Close</TooltipContent>
        </Tooltip>
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

  // On open, focus the composer so the user can type immediately; on close,
  // return focus to the pill (which remounts). Skipped on mount so a cookie-
  // restored open panel doesn't steal focus. The rAF lets the panel mount/slide
  // in first (esp. the mobile sheet) before we move focus into it.
  React.useEffect(() => {
    if (prevOpenRef.current === open) return;
    prevOpenRef.current = open;
    if (isMobile) return; // the sheet manages its own focus
    if (open) {
      requestAnimationFrame(() => document.getElementById("chat-composer-input")?.focus());
    } else {
      document.getElementById("ai-assistant-trigger")?.focus();
    }
  }, [open, isMobile]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          // Full-bleed: no max-width cap, so the sheet spans the device across
          // the whole mobile range (the sm: cap otherwise bit at 640–767px).
          className="w-full max-w-none p-0"
          onOpenAutoFocus={(event) => {
            // Focus the composer instead of Radix's default first focusable.
            event.preventDefault();
            document.getElementById("chat-composer-input")?.focus();
          }}
        >
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
