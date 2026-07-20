/**
 * Payout flow constants — rates, fees, and the derived-total math.
 *
 * Every figure in the flow derives from this one table so the three steps can
 * never disagree with each other (the reference mockups drifted: the same
 * $1,200 showed three different INR totals). No backend, so rates are frozen.
 */

import type { PaymentMethod } from "@/modules/invoices/data";

/** Frozen mid-market rates, USD → local. The flow prices in USD and converts. */
export const FX_RATES: Record<string, number> = {
  USD: 1,
  INR: 95.34,
  EUR: 0.92,
  GBP: 0.79,
  SGD: 1.34,
  AED: 3.67,
  JPY: 141.2,
  MXN: 18.55,
  BRL: 5.4,
  VND: 25400,
  NGN: 1580,
  KRW: 1340,
  ARS: 1025,
  TWD: 32.1,
  BGN: 1.8,
};

/** Flat platform fee, charged on every payout regardless of rail. */
export const PLATFORM_FEE = 1.99;

export interface MethodOption {
  method: PaymentMethod;
  label: string;
  /** Settlement speed, shown under the label. */
  speed: string;
  /** Rail fee on top of PLATFORM_FEE. */
  fee: number;
  /**
   * Rails the workspace hasn't onboarded render disabled with a reason in
   * place of the fee — the flow shows the full menu so the gap is legible.
   */
  unavailable?: string;
}

export const METHOD_OPTIONS: MethodOption[] = [
  { method: "bank", label: "Bank Transfer", speed: "1-3 business days", fee: 4.99 },
  { method: "wallet", label: "Paynetic Wallet", speed: "Instant", fee: 1.99 },
  { method: "usdc", label: "Crypto", speed: "Instant · USDC", fee: 0, unavailable: "Not added" },
];

/** Available balance the payout draws against, mirroring the sidebar footer. */
export const WALLET_BALANCE = 123400.31;

export type AmountMode = "hourly" | "fixed";

export interface PayoutDraft {
  contractor: string;
  mode: AmountMode;
  /** Hourly rate when mode is "hourly"; ignored otherwise. */
  rate: string;
  /** Hours worked when mode is "hourly"; ignored otherwise. */
  hours: string;
  /** Flat amount when mode is "fixed"; ignored otherwise. */
  fixed: string;
  method: PaymentMethod;
  note: string;
}

export const EMPTY_DRAFT: PayoutDraft = {
  contractor: "",
  mode: "hourly",
  rate: "",
  hours: "",
  fixed: "",
  method: "bank",
  note: "",
};

/** Parses a user-typed money/number field. Blank and garbage both read as 0. */
function parseAmount(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function getMethodOption(method: PaymentMethod) {
  return METHOD_OPTIONS.find((option) => option.method === method) ?? METHOD_OPTIONS[0];
}

export interface PayoutTotals {
  /** What the contractor is owed, in USD. */
  subtotal: number;
  platformFee: number;
  methodFee: number;
  /** subtotal + fees — what leaves the workspace wallet. */
  total: number;
  /** Subtotal converted to the contractor's local currency. */
  localAmount: number;
  currency: string;
  rate: number;
}

/**
 * The single source of truth for every figure the flow displays. Fees are
 * charged to the payer on top of the subtotal, so the contractor always
 * receives the full amount entered — the alternative (netting fees out of the
 * contractor's pay) is a different product decision and would need saying out
 * loud in the UI.
 */
export function getTotals(draft: PayoutDraft, currency: string): PayoutTotals {
  const subtotal = draft.mode === "hourly" ? parseAmount(draft.rate) * parseAmount(draft.hours) : parseAmount(draft.fixed);
  const methodFee = getMethodOption(draft.method).fee;
  const rate = FX_RATES[currency] ?? 1;

  return {
    subtotal,
    platformFee: PLATFORM_FEE,
    methodFee,
    total: subtotal + PLATFORM_FEE + methodFee,
    localAmount: subtotal * rate,
    currency,
    rate,
  };
}

export type ValidationError = "no-contractor" | "no-amount" | "insufficient-balance" | "method-unavailable";

export const VALIDATION_MESSAGES: Record<ValidationError, string> = {
  "no-contractor": "Select a contractor to continue.",
  "no-amount": "Enter an amount greater than zero.",
  "insufficient-balance": "This payout exceeds your available balance.",
  "method-unavailable": "This payment method isn't set up yet.",
};

/**
 * Gate for advancing past step one. Returns the first blocking problem so the
 * form can explain itself, rather than a bare disabled button.
 */
export function validateDraft(draft: PayoutDraft, currency: string): ValidationError | null {
  if (!draft.contractor) return "no-contractor";
  if (getMethodOption(draft.method).unavailable) return "method-unavailable";

  const { subtotal, total } = getTotals(draft, currency);
  if (subtotal <= 0) return "no-amount";
  if (total > WALLET_BALANCE) return "insufficient-balance";

  return null;
}
