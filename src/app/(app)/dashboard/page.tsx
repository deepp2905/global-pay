import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Placeholder — stat cards and recent invoices land in Phase 3.</p>
    </main>
  );
}
