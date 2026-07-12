"use client";

import { CornerDownLeft, PanelLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";
import { ModShortcut } from "@/components/shell/mod-shortcut";
import { markChromeNavigation } from "@/components/shell/route-transition";
import { useChatPanel } from "@/hooks/use-chat-panel";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { modules } from "@/modules";

/**
 * Cmd/Ctrl+K palette (D7): Quick actions (module verbs from manifest
 * quickActions), Recents (module navigation), Actions (shell toggles). All
 * module entries derive from the registry — the shell names no module.
 * Only the global shortcuts (palette, AI panel, sidebar) are surfaced as
 * hints; there are no per-module shortcuts.
 */
export function CommandPalette() {
  const router = useRouter();
  const { open, setOpen } = useCommandPalette();
  const { toggle: toggleChat } = useChatPanel();
  const { toggleSidebar } = useSidebar();

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  // Palette jumps are launcher navigation, not in-page drilling — skip the
  // route transition so they land instantly.
  function navigate(href: string) {
    markChromeNavigation();
    router.push(href);
  }

  const quickActions = modules.filter((m) => m.status !== "coming-soon").flatMap((m) => m.quickActions ?? []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Jump to a module or run an action"
    >
      {/* This style's CommandDialog doesn't provide the cmdk root itself. */}
      <Command>
        <CommandInput placeholder="Search modules and actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            {quickActions.map((action) => (
              <CommandItem key={action.id} value={action.label} onSelect={() => run(() => navigate(action.href))}>
                <action.icon />
                <span>{action.label}</span>
                <CommandShortcut>
                  <Kbd>
                    <CornerDownLeft aria-label="Enter" />
                  </Kbd>
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recents">
            {modules.map((module) => {
              const soon = module.status === "coming-soon";
              return (
                <CommandItem
                  key={module.id}
                  value={`Go to ${module.label} ${module.description ?? ""}`}
                  disabled={soon}
                  onSelect={() => run(() => navigate(module.href))}
                >
                  <module.icon />
                  <span>Go to {module.label}</span>
                  {soon && <CommandShortcut>Soon</CommandShortcut>}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="Toggle AI assistant chat" onSelect={() => run(toggleChat)}>
              <Sparkles />
              <span>Toggle AI assistant</span>
              <CommandShortcut>
                <ModShortcut keyLabel="J" />
              </CommandShortcut>
            </CommandItem>
            <CommandItem value="Toggle sidebar collapse" onSelect={() => run(toggleSidebar)}>
              <PanelLeft />
              <span>Toggle sidebar</span>
              <CommandShortcut>
                <ModShortcut keyLabel="B" />
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      {/* px-5 keeps the hints clear of the dialog's 4xl corner arc.
          Hidden below sm — keycap hints are keyboard affordances. */}
      <div className="hidden items-center gap-4 border-t px-5 py-2.5 text-xs text-muted-foreground sm:flex">
        <span className="flex items-center gap-1.5">
          Select
          <KbdGroup>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
          </KbdGroup>
        </span>
        <span className="flex items-center gap-1.5">
          Open
          <Kbd>
            <CornerDownLeft aria-label="Enter" />
          </Kbd>
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          Open menu
          <ModShortcut keyLabel="K" />
        </span>
      </div>
    </CommandDialog>
  );
}
