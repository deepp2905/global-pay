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
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";
import { useChatPanel } from "@/hooks/use-chat-panel";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useNavSequences } from "@/hooks/use-nav-sequences";
import { modules } from "@/modules";

function ShortcutHint({ shortcut }: { shortcut: string }) {
  return (
    <KbdGroup className="ml-auto">
      {shortcut.split(" ").map((key, index) => (
        <Kbd key={index}>{key}</Kbd>
      ))}
    </KbdGroup>
  );
}

/**
 * Cmd/Ctrl+K palette (D7): Quick actions (module verbs from manifest
 * quickActions), Recents (module navigation), Actions (shell toggles). All
 * module entries derive from the registry — the shell names no module. Also
 * hosts the registry-driven G-sequences so keyboard paths live in one place.
 */
export function CommandPalette() {
  const router = useRouter();
  const { open, setOpen } = useCommandPalette();
  const { toggle: toggleChat } = useChatPanel();
  const { toggleSidebar } = useSidebar();

  useNavSequences();

  function run(action: () => void) {
    setOpen(false);
    action();
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
              <CommandItem key={action.id} value={action.label} onSelect={() => run(() => router.push(action.href))}>
                <action.icon />
                <span>{action.label}</span>
                <Kbd className="ml-auto">
                  <CornerDownLeft aria-label="Enter" />
                </Kbd>
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
                  onSelect={() => run(() => router.push(module.href))}
                >
                  <module.icon />
                  <span>Go to {module.label}</span>
                  {soon ? (
                    <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                  ) : (
                    module.shortcut && <ShortcutHint shortcut={module.shortcut} />
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="Toggle AI assistant chat" onSelect={() => run(toggleChat)}>
              <Sparkles />
              <span>Toggle AI assistant</span>
              <ShortcutHint shortcut="⌘ J" />
            </CommandItem>
            <CommandItem value="Toggle sidebar collapse" onSelect={() => run(toggleSidebar)}>
              <PanelLeft />
              <span>Toggle sidebar</span>
              <ShortcutHint shortcut="Ctrl B" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <div className="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground">
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
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </span>
      </div>
    </CommandDialog>
  );
}
