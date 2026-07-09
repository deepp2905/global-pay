import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type InvoiceStatus } from "@/modules/invoices/data";
import { cn } from "@/lib/utils";

/** Dot + label pill, colored through the status tokens (success/warning/destructive). */
const statusStyles: Record<InvoiceStatus, { badge: string; dot: string }> = {
  pending: { badge: "bg-secondary text-secondary-foreground", dot: "bg-muted-foreground" },
  processing: { badge: "bg-warning/10 text-warning", dot: "bg-warning" },
  paid: { badge: "bg-success/10 text-success", dot: "bg-success" },
  failed: { badge: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const styles = statusStyles[status];
  return (
    <Badge variant="secondary" className={cn("gap-1.5", styles.badge)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", styles.dot)} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
