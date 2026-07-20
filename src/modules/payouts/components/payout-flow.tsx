"use client";

import { AnimatePresence, motion } from "motion/react";

import { PageHeader } from "@/components/shell/page-header";
import { PANEL_FOLD } from "@/hooks/use-chat-panel";
import { PayoutDetailsStep } from "@/modules/payouts/components/payout-details-step";
import { PayoutReceiptStep } from "@/modules/payouts/components/payout-receipt-step";
import { PayoutReviewStep } from "@/modules/payouts/components/payout-review-step";
import { PAYOUT_STEPS, usePayoutFlow } from "@/modules/payouts/use-payout-flow";

const COPY = {
  details: { title: "Payout Details", description: "Pay a contractor. Review every figure before anything moves." },
  review: { title: "Review Payout", description: "Review every figure before anything moves." },
  receipt: { title: "Payout Initiated", description: "The transfer is on its way. Nothing further is needed." },
} as const;

/**
 * The whole payout flow on one route (D11). Steps swap in place rather than
 * navigating: the draft lives in one component, and the transition becomes a
 * deliberate fold instead of a route change. `?step=` is deliberately absent —
 * a payout draft shouldn't be deep-linkable or restorable from history.
 */
export function PayoutFlow({ invoiceId }: { invoiceId?: string } = {}) {
  const flow = usePayoutFlow(invoiceId);
  const { step } = flow;
  const copy = COPY[step];
  const stepIndex = PAYOUT_STEPS.indexOf(step);

  // The back link always names a real destination (D4). On review it walks the
  // step back — except when the flow *opened* on review from an invoice, where
  // there is no earlier step to return to, so it names the invoice instead
  // (editing is still reachable, via an explicit control on the review card).
  // The receipt is terminal and offers none; the way out is an explicit action.
  const enteredAtReview = Boolean(invoiceId) && flow.enteredAtReview;
  const back =
    step === "review"
      ? enteredAtReview
        ? { href: `/invoices/${invoiceId}`, label: `Invoice ${invoiceId}` }
        : { label: "Edit Details", onBack: flow.toDetails }
      : step === "details"
        ? { href: "/invoices", label: "Invoices" }
        : undefined;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-4 md:p-8">
      <PageHeader
        back={back}
        title={copy.title}
        description={copy.description}
        // Minimal progress caption (D11), parked at the right edge of the title
        // row: a stepper would over-signal, and breadcrumbs would falsely imply
        // the steps are freely navigable. The receipt has nothing left to
        // progress through, so it shows none.
        // Hidden when the flow opened at review from an invoice: "Step 2 of 2"
        // is a lie when there was never a step 1.
        actions={
          step !== "receipt" && !enteredAtReview ? (
            <p className="text-sm text-muted-foreground tabular-nums">
              Step {stepIndex + 1} of {PAYOUT_STEPS.length - 1}
            </p>
          ) : undefined
        }
      />


      {/* mode="wait" so the outgoing step clears before the next folds in —
          overlapping two full-height forms would shift the page under the cursor. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={PANEL_FOLD}
        >
          {step === "details" && <PayoutDetailsStep flow={flow} />}
          {step === "review" && <PayoutReviewStep flow={flow} />}
          {step === "receipt" && <PayoutReceiptStep flow={flow} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
