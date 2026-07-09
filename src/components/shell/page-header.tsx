import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Standard page title block for all modules. Deep views pass `back` — a real
 * link labeled with the parent's name (D4, Stripe pattern): breadcrumbs
 * express hierarchy, the browser back button expresses history, and no
 * separate "Back" button exists.
 */
export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: React.ReactNode;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {back && (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
