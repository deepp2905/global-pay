"use client";

import {
  ChevronsUpDown,
  Command,
  Headset,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getModuleGroups } from "@/modules";
import type { ModuleManifest } from "@/modules";

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ModuleNavItem({ module, active }: { module: ModuleManifest; active: boolean }) {
  if (module.status === "coming-soon") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton aria-disabled tooltip={`${module.label} — coming soon`} className="opacity-60">
          <module.icon />
          <span>{module.label}</span>
        </SidebarMenuButton>
        <SidebarMenuBadge className="text-xs text-muted-foreground">Soon</SidebarMenuBadge>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={module.label}>
        <Link href={module.href} aria-current={active ? "page" : undefined}>
          <module.icon />
          <span>{module.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** Search affordance styled as an input. UI only — will open the command palette later. */
function SidebarSearchItem() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Search" className="border bg-background text-muted-foreground shadow-xs">
        <Search />
        <span>Search anything</span>
        <KbdGroup className="ml-auto group-data-[collapsible=icon]:hidden">
          <Kbd>
            <Command aria-label="Cmd" />
          </Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

const supportItems = [
  { label: "Feedback", icon: MessageSquareText },
  { label: "Help & Support", icon: Headset },
  { label: "Settings", icon: Settings },
];

/** Static support links pinned below the module nav. UI only for now. */
function SidebarSupportGroup() {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupLabel>Support</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {supportItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton tooltip={item.label}>
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/** Signed-in account card. UI only — no account menu yet. */
function SidebarUserItem() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip="Account" className="border bg-background shadow-xs">
          <Avatar>
            <AvatarFallback>DP</AvatarFallback>
            <AvatarBadge className="bg-emerald-500" aria-label="Online" />
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-medium">Deep Patel</span>
            <span className="truncate text-xs text-muted-foreground">deephemapatel@gmail.com</span>
          </div>
          <ChevronsUpDown className="text-muted-foreground" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** Collapse control lives inside the sidebar; hidden in the mobile sheet. */
function SidebarCollapseItem() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  if (isMobile) return null;
  const collapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={toggleSidebar} tooltip="Expand sidebar (Ctrl+B)">
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          <span>Collapse</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/**
 * Global navigation. The module nav renders entirely from the registry — this
 * file never names a specific module (see modules/index.ts). Search, support
 * links, and the account card are static shell affordances, not modules.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const groups = getModuleGroups();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Global Pay">
              <Link href="/dashboard">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  G
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Global Pay</span>
                  <span className="text-xs text-muted-foreground">Payments workspace</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarSearchItem />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map(({ group, label, modules }) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {modules.map((module) => (
                  <ModuleNavItem key={module.id} module={module} active={isActiveRoute(pathname, module.href)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarSupportGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarCollapseItem />
        <SidebarUserItem />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
