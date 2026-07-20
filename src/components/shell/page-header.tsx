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
  title?: React.ReactNode;
  description?: string;
  /**
   * Deep views pass a parent link. Multi-step flows that live on one route
   * pass `onBack` instead — same affordance, but it walks the step back
   * rather than navigating (see the payout flow).
   */
  back?: { href?: string; label: string; onBack?: () => void };
  actions?: React.ReactNode;
}) {
  const hasTitleBlock = title != null || description != null || actions != null;
  const backCls =
    "inline-flex w-fit cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground";
  return (
    // gap-2 sets the back link apart from the title; the title/description
    // group keeps a tight gap-1 so the caption stays bound to the title.
    <div className="flex flex-col gap-2">
      {back &&
        (back.onBack ? (
          <button type="button" onClick={back.onBack} className={backCls}>
            <ArrowLeft className="size-4" />
            {back.label}
          </button>
        ) : (
          <Link href={back.href ?? "#"} className={backCls}>
            <ArrowLeft className="size-4" />
            {back.label}
          </Link>
        ))}
      {hasTitleBlock && (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {title != null && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
    </div>
  );
}
