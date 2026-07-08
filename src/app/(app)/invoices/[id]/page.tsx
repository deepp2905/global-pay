import type { Metadata } from "next";

type InvoiceDetailProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: InvoiceDetailProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Invoice ${id}` };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailProps) {
  const { id } = await params;
  return (
    <main className="p-8">
      <h1 className="text-lg font-semibold">Invoice {id}</h1>
      <p className="text-sm text-muted-foreground">Placeholder — detail layout lands in Phase 3.</p>
    </main>
  );
}
