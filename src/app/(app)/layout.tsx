/**
 * Layout for all module routes. The app shell (sidebar, header, chat panel)
 * mounts here — module pages only ever render main-content children.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
