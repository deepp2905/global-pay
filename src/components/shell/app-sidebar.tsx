"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getModuleGroups } from "@/modules";

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
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
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map(({ group, label, modules }) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {modules.map((module) => {
                  const active = isActiveRoute(pathname, module.href);
                  return (
                    <SidebarMenuItem key={module.id}>
                      <SidebarMenuButton asChild isActive={active} tooltip={module.label}>
                        <Link href={module.href} aria-current={active ? "page" : undefined}>
                          <module.icon />
                          <span>{module.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
