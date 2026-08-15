"use client";

import * as React from "react";

import { getContractorProfile, getInvoice, type Invoice } from "@/modules/invoices/data";
import { EMPTY_DRAFT, getTotals, validateDraft, type PayoutDraft } from "@/modules/payouts/data";

export const PAYOUT_STEPS = ["details", "review", "receipt"] as const;
export type PayoutStep = (typeof PAYOUT_STEPS)[number];

/**
 * Seeds a draft from an invoice: its amount and currency become authoritative.
 * `fixed` is pre-filled with the USD equivalent so that detaching (editing the
 * amount on the details step) leaves the field populated rather than blank —
 * the user adjusts a real number instead of retyping from nothing.
 */
function draftFromInvoice(invoice: Invoice): PayoutDraft {
  return {
    ...EMPTY_DRAFT,
    contractor: invoice.contractor,
    mode: "fixed",
    fixed: invoice.usdValue.toFixed(2),
    method: invoice.method,
    // Note stays empty: it's a message to the contractor, and the invoice ID
    // it settles is already shown as its own row on the review card.
    source: { invoiceId: invoice.id, amount: invoice.amount, currency: invoice.currency },
  };
}

/**
 * Owns the payout draft across all three steps (D11: one route, stepped state).
 *
 * Deliberately not persisted and not in the URL — a half-filled payout has no
 * business surviving a refresh or leaking into browser history, and the note
 * field is free text. A cold load lands on step one with an empty form, which
 * is the correct state for a payout that was never sent.
 *
 * The one exception is `?invoice=` — an ID is safe to put in a URL, and the
 * invoice supplies every figure, so those loads skip straight to review.
 */
export function usePayoutFlow(invoiceId?: string) {
  const sourceInvoice = invoiceId ? getInvoice(invoiceId) : undefined;

  const [step, setStep] = React.useState<PayoutStep>(sourceInvoice ? "review" : "details");
  const [draft, setDraft] = React.useState<PayoutDraft>(
    sourceInvoice ? draftFromInvoice(sourceInvoice) : EMPTY_DRAFT
  );
  /**
   * True when the flow opened straight on review from an invoice. Derived from
   * the prop rather than latched, because the page remounts on a different
   * `?invoice=` (see its `key`) — so this is already constant for the
   * component's lifetime, and survives stepping back to edit.
   */
  const enteredAtReview = Boolean(sourceInvoice);
  /** Set once the user first tries to advance, so errors aren't shown pre-emptively. */
  const [submitted, setSubmitted] = React.useState(false);

  const profile = draft.contractor ? getContractorProfile(draft.contractor) : undefined;
  // An invoice fixes its own currency; otherwise it's the contractor's.
  const currency = draft.source?.currency ?? profile?.currency ?? "USD";
  const totals = getTotals(draft, currency);
  const error = validateDraft(draft, currency);

  /**
   * Editing an amount field detaches the draft from its source invoice —
   * otherwise the invoice's frozen figure would silently override what the
   * user just typed. Changing the method or note keeps the link, since
   * neither contradicts the billed amount.
   */
  // Plain functions throughout: the React Compiler handles memoization, and
  // hand-written useCallback deps here defeat it (the compiler bails when it
  // can't prove the manual memo is preserved).
  function update<K extends keyof PayoutDraft>(key: K, value: PayoutDraft[K]) {
    const detaches = key === "rate" || key === "hours" || key === "fixed" || key === "mode";
    setDraft((prev) => ({ ...prev, [key]: value, ...(detaches && prev.source ? { source: undefined } : {}) }));
  }

  /**
   * Selecting a contractor preselects the rail they were last paid over —
   * a sensible default, but only until the user expresses a preference, so
   * this never overwrites a method they picked themselves. Also detaches from
   * a source invoice: paying someone else can't settle that invoice.
   */
  function selectContractor(name: string) {
    const next = getContractorProfile(name);
    setDraft((prev) => ({
      ...prev,
      contractor: name,
      method: next?.method ?? prev.method,
      source: prev.source && prev.contractor !== name ? undefined : prev.source,
    }));
  }

  function toReview() {
    setSubmitted(true);
    if (validateDraft(draft, currency)) return false;
    setStep("review");
    return true;
  }

  function toDetails() {
    setStep("details");
  }

  /** Terminal transition — the receipt has no path back to an editable draft. */
  function send() {
    setStep("receipt");
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setSubmitted(false);
    setStep("details");
  }

  return {
    step,
    draft,
    profile,
    currency,
    totals,
    enteredAtReview,
    error: submitted ? error : null,
    update,
    selectContractor,
    toReview,
    toDetails,
    send,
    reset,
  };
}
