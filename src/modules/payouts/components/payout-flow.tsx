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
export function PayoutFlow() {
  const flow = usePayoutFlow();
  const { step } = flow;
  const copy = COPY[step];
  const stepIndex = PAYOUT_STEPS.indexOf(step);

  // "Edit Details" walks back a step; the receipt is terminal, so it offers no
  // back link at all — the way out is an explicit action in the summary card.
  const back =
    step === "review"
      ? { label: "Edit Details", onBack: flow.toDetails }
      : step === "details"
        ? { href: "/invoices", label: "Invoices" }
        : undefined;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <PageHeader back={back} title={copy.title} description={copy.description} />
        {/* Minimal progress caption (D11) — a stepper would over-signal, and
            breadcrumbs would falsely imply the steps are freely navigable. */}
        {step !== "receipt" && (
          <p className="text-sm text-muted-foreground tabular-nums">
            Step {stepIndex + 1} of {PAYOUT_STEPS.length - 1}
          </p>
        )}
      </div>

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
