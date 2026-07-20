"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The "New Payout" CTA. A client component because `Button` is Motion-wrapped
 * (press feedback) and can't be rendered from a server page — this keeps the
 * host page a server component instead of pulling the whole route client-side.
 */
export function NewPayoutButton() {
  return (
    <Button asChild>
      <Link href="/payouts">
        <Plus data-icon="inline-start" />
        New Payout
      </Link>
    </Button>
  );
}
