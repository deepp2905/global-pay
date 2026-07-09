"use client";

import * as React from "react";

const CHAT_PANEL_COOKIE = "chat_panel_open";
const CHAT_PANEL_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * One clock for the pill/panel choreography (never simultaneous):
 * open  = pill fades out fast → panel slides in after PANEL_OPEN_DELAY;
 * close = panel collapses → pill fades in at rest, delayed by the fold.
 * Sequencing, not a shared transition, is what hides the header reflow.
 */
export const PANEL_FOLD = { duration: 0.2, ease: "easeOut" as const };
export const PILL_FADE_OUT = { duration: 0.1, ease: "easeOut" as const };
export const PANEL_OPEN_DELAY = 0.12;
export const PILL_FADE_IN = { delay: PANEL_FOLD.duration, duration: 0.15, ease: "easeOut" as const };

type ChatPanelContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const ChatPanelContext = React.createContext<ChatPanelContextValue | null>(null);

export function useChatPanel() {
  const context = React.useContext(ChatPanelContext);
  if (!context) {
    throw new Error("useChatPanel must be used within a ChatPanelProvider.");
  }
  return context;
}

/**
 * Owns the AI chat panel's open state. Persisted in a cookie (mirroring the
 * shadcn sidebar pattern) so the server renders the restored state without a
 * flash. Toggled by the header button and Cmd/Ctrl+J.
 */
export function ChatPanelProvider({
  defaultOpen = false,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  // Sync the cookie with React state so the next server render restores it.
  React.useEffect(() => {
    document.cookie = `${CHAT_PANEL_COOKIE}=${open}; path=/; max-age=${CHAT_PANEL_COOKIE_MAX_AGE}`;
  }, [open]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "j" && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggle = React.useCallback(() => setOpen((prev) => !prev), []);

  const value = React.useMemo<ChatPanelContextValue>(() => ({ open, setOpen, toggle }), [open, toggle]);

  return <ChatPanelContext.Provider value={value}>{children}</ChatPanelContext.Provider>;
}
