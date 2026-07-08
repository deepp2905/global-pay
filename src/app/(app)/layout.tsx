import { cookies } from "next/headers";

import { AppShell } from "@/components/shell/app-shell";

/**
 * Layout for all module routes. The app shell (sidebar, header, chat panel)
 * mounts here — module pages only ever render main-content children.
 *
 * Panel states are cookie-persisted so the server renders the user's last
 * layout without a flash of default state.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sidebarDefaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const chatDefaultOpen = cookieStore.get("chat_panel_open")?.value === "true";

  return (
    <AppShell sidebarDefaultOpen={sidebarDefaultOpen} chatDefaultOpen={chatDefaultOpen}>
      {children}
    </AppShell>
  );
}
