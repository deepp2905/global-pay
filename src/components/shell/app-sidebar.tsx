"use client";

import { ChevronsUpDown, Headset, MessageSquareText, PanelLeft, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ModShortcut } from "@/components/shell/mod-shortcut";
import { markChromeNavigation } from "@/components/shell/route-transition";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { getModuleGroups } from "@/modules";
import type { ModuleManifest } from "@/modules";

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ModuleNavItem({ module, active }: { module: ModuleManifest; active: boolean }) {
  if (module.status === "coming-soon") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-disabled
          // tabIndex={-1} skips it in the keyboard tab order (aria-disabled alone
          // does not); aria-disabled still announces the state to assistive tech.
          tabIndex={-1}
          tooltip={`${module.label} — coming soon`}
          // Keep pointer events so the tooltip still shows on hover (the button
          // variant would otherwise disable them for aria-disabled), and don't
          // let the hover fall through to the background open-sidebar affordance.
          className="pointer-events-auto opacity-60 aria-disabled:pointer-events-auto"
        >
          <module.icon />
          <span>{module.label}</span>
        </SidebarMenuButton>
        <SidebarMenuBadge className="text-xs text-muted-foreground">Soon</SidebarMenuBadge>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={module.label} className="pointer-events-auto">
        <Link href={module.href} aria-current={active ? "page" : undefined} onClick={markChromeNavigation}>
          <module.icon />
          <span>{module.label}</span>
        </Link>
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
              <SidebarMenuButton tooltip={item.label} className="pointer-events-auto">
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
        <SidebarMenuButton
          size="lg"
          tooltip="Account"
          // overflow-visible so the avatar's online badge (which sits at the
          // corner with an outward ring) isn't clipped by the button's rounded
          // box. The card chrome (border/fill/shadow) is dropped when collapsed
          // so it doesn't render as a white ring around the bare avatar.
          className="pointer-events-auto overflow-visible border bg-background shadow-xs group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
        >
          <Avatar>
            <AvatarFallback>DP</AvatarFallback>
            <AvatarBadge className="bg-emerald-500" aria-label="Online" />
          </Avatar>
          <div className="grid flex-1 text-left leading-tight whitespace-nowrap transition-opacity duration-150 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:duration-100">
            <span className="truncate font-medium">Deep Patel</span>
            <span className="truncate text-xs text-muted-foreground">deephemapatel@gmail.com</span>
          </div>
          <ChevronsUpDown className="text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/**
 * Full-panel click-to-expand target, active only while the sidebar is
 * collapsed. Sits behind the nav (interactive items render above it with their
 * own pointer cursor), so clicking any empty area of the collapsed rail expands
 * it. Disabled entirely when expanded — no click-anywhere, no resize cursor.
 */
function SidebarBackgroundToggle() {
  const { toggleSidebar, state } = useSidebar();
  if (state !== "collapsed") return null;
  return (
    <button
      type="button"
      aria-label="Expand sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      // z-0 so the interactive layers (relative z-10) paint above it; otherwise
      // this absolutely-positioned button would sit on top of the toggle/nav and
      // hijack their cursor + clicks.
      className="absolute inset-0 z-0 cursor-e-resize"
    />
  );
}

/** Collapse toggle in the sidebar header: a panel icon with a roomy rectangular hit area. */
function SidebarCollapseButton() {
  const { toggleSidebar, isMobile, state, setOpenMobile } = useSidebar();

  // The mobile drawer is full-bleed, so there's no backdrop left to tap for
  // dismissal — it needs an explicit close control or it's a trap. No tooltip:
  // hover intent is meaningless on touch.
  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenMobile(false)}
        aria-label="Close navigation"
        className="h-8 shrink-0 rounded-lg px-2 text-sidebar-foreground"
      >
        <X />
        <span className="sr-only">Close navigation</span>
      </Button>
    );
  }

  const label = state === "collapsed" ? "Open sidebar" : "Close sidebar";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          aria-label={label}
          // Expanded: roomy rectangular hit area with soft radii. Collapsed:
          // collapse to a square icon slot (size-8 p-2) matching the nav buttons
          // exactly — including their foreground color, so it reads as active
          // (a muted grey looked disabled next to the crisp rail icons).
          className="h-8 shrink-0 rounded-lg px-2 text-sidebar-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
        >
          <PanelLeft />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        <span>{label}</span>
        <ModShortcut keyLabel="B" />
      </TooltipContent>
    </Tooltip>
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

  // z-40 lifts the whole sidebar container above the sticky header (z-30) so the
  // right-edge rail's hover affordance spans the full height. The sidebar body is
  // opaque and sits left of the header, so this doesn't visually overlap anything
  // — only the rail seam benefits.
  return (
    <Sidebar collapsible="icon" className="z-40 select-none">
      {/* Background click target: toggles the sidebar from any empty area. Nav
          items re-enable pointer events so they keep their own click + cursor. */}
      <SidebarBackgroundToggle />
      <SidebarHeader className="pointer-events-none">
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:gap-0">
          {/* Brand mark — presentational only: not a link, not hoverable. The
              whole block (logo + label) fades on opacity only, timed against the
              width anim like the "Soon" tags: fade in during the 2nd half, out
              during the 1st. It also vacates its width on collapse so the toggle
              centers, but that's independent of the opacity fade. */}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-2 py-1.5 opacity-100 transition-opacity delay-[120ms] duration-100 ease-linear select-none group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:min-w-0 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0 group-data-[collapsible=icon]:duration-100">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              G
            </div>
            <span className="truncate font-semibold whitespace-nowrap">Global Pay</span>
          </div>
          <div className="pointer-events-auto relative z-10">
            <SidebarCollapseButton />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pointer-events-none relative z-10">
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
      <SidebarFooter className="pointer-events-none relative z-10">
        <SidebarUserItem />
        <div className="px-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <ThemeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
