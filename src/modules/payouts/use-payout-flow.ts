"use client";

import * as React from "react";

import { getContractorProfile } from "@/modules/invoices/data";
import { EMPTY_DRAFT, getTotals, validateDraft, type PayoutDraft } from "@/modules/payouts/data";

export const PAYOUT_STEPS = ["details", "review", "receipt"] as const;
export type PayoutStep = (typeof PAYOUT_STEPS)[number];

/**
 * Owns the payout draft across all three steps (D11: one route, stepped state).
 *
 * Deliberately not persisted and not in the URL — a half-filled payout has no
 * business surviving a refresh or leaking into browser history, and the note
 * field is free text. A cold load lands on step one with an empty form, which
 * is the correct state for a payout that was never sent.
 */
export function usePayoutFlow() {
  const [step, setStep] = React.useState<PayoutStep>("details");
  const [draft, setDraft] = React.useState<PayoutDraft>(EMPTY_DRAFT);
  /** Set once the user first tries to advance, so errors aren't shown pre-emptively. */
  const [submitted, setSubmitted] = React.useState(false);

  const profile = draft.contractor ? getContractorProfile(draft.contractor) : undefined;
  const currency = profile?.currency ?? "USD";
  const totals = getTotals(draft, currency);
  const error = validateDraft(draft, currency);

  const update = React.useCallback(<K extends keyof PayoutDraft>(key: K, value: PayoutDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Selecting a contractor preselects the rail they were last paid over —
   * a sensible default, but only until the user expresses a preference, so
   * this never overwrites a method they picked themselves.
   */
  const selectContractor = React.useCallback((name: string) => {
    const next = getContractorProfile(name);
    setDraft((prev) => ({ ...prev, contractor: name, method: next?.method ?? prev.method }));
  }, []);

  const toReview = React.useCallback(() => {
    setSubmitted(true);
    if (validateDraft(draft, currency)) return false;
    setStep("review");
    return true;
  }, [draft, currency]);

  const toDetails = React.useCallback(() => setStep("details"), []);

  /** Terminal transition — the receipt has no path back to an editable draft. */
  const send = React.useCallback(() => setStep("receipt"), []);

  const reset = React.useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setSubmitted(false);
    setStep("details");
  }, []);

  return {
    step,
    draft,
    profile,
    currency,
    totals,
    error: submitted ? error : null,
    /** True when the draft is complete, regardless of whether errors are shown yet. */
    valid: error === null,
    update,
    selectContractor,
    toReview,
    toDetails,
    send,
    reset,
  };
}
