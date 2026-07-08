"use client";

import { ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

/** Collapse toggle in the sidebar header (reference: compact chevron button). */
function SidebarCollapseButton() {
  const { toggleSidebar, isMobile } = useSidebar();
  if (isMobile) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="size-7 shrink-0 border text-muted-foreground"
        >
          <ChevronsUpDown className="size-3.5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>B</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Global navigation. Renders entirely from the module registry — this file
 * never names a specific module (see modules/index.ts).
 */
export function AppSidebar() {
  const pathname = usePathname();
  const groups = getModuleGroups();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
          <SidebarMenu className="min-w-0 flex-1">
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
          </SidebarMenu>
          <SidebarCollapseButton />
        </div>
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
