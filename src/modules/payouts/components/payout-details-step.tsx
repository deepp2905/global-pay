"use client";

import * as React from "react";
import { AlertCircle, CircleDollarSign, Landmark, Wallet, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getContractorProfiles, type PaymentMethod } from "@/modules/invoices/data";
import { METHOD_OPTIONS, VALIDATION_MESSAGES, type AmountMode } from "@/modules/payouts/data";
import type { usePayoutFlow } from "@/modules/payouts/use-payout-flow";
import { cn, formatCurrency } from "@/lib/utils";

const methodIcons: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  bank: Landmark,
  wallet: Wallet,
  usdc: CircleDollarSign,
};

/** Local currencies never show cents — INR 99,503 reads cleaner than 99,503.34. */
function formatLocal(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

export function PayoutDetailsStep({ flow }: { flow: ReturnType<typeof usePayoutFlow> }) {
  const { draft, profile, currency, totals, error, update, selectContractor, toReview } = flow;
  const contractors = React.useMemo(() => getContractorProfiles(), []);

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        toReview();
      }}
    >
      <div className="flex flex-col gap-3">
        <Label htmlFor="payout-contractor">Select Contractor</Label>
        <Select value={draft.contractor} onValueChange={selectContractor}>
          {/* h-auto: the trigger holds a two-line identity block, not a single value. */}
          <SelectTrigger id="payout-contractor" className="h-auto w-full py-3">
            <SelectValue placeholder="Choose who you're paying" />
          </SelectTrigger>
          <SelectContent>
            {contractors.map((contractor) => (
              <SelectItem key={contractor.name} value={contractor.name}>
                <span className="flex flex-col gap-0.5 text-left">
                  <span className="font-medium">{contractor.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {contractor.title} · {contractor.country}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label htmlFor={draft.mode === "hourly" ? "payout-rate" : "payout-fixed"}>Amount</Label>
          <Tabs value={draft.mode} onValueChange={(value) => update("mode", value as AmountMode)}>
            <TabsList>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
              <TabsTrigger value="fixed">Fixed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {draft.mode === "hourly" ? (
          <div className="flex items-center gap-3">
            <MoneyInput
              id="payout-rate"
              label="Hourly rate"
              suffix="USD"
              value={draft.rate}
              onChange={(value) => update("rate", value)}
              className="flex-1"
            />
            <X className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <MoneyInput
              id="payout-hours"
              label="Hours"
              suffix="HRS"
              value={draft.hours}
              onChange={(value) => update("hours", value)}
              className="w-36"
              hideSymbol
            />
          </div>
        ) : (
          <MoneyInput
            id="payout-fixed"
            label="Amount"
            suffix="USD"
            value={draft.fixed}
            onChange={(value) => update("fixed", value)}
          />
        )}

        {/* The conversion line: what it costs you, and what actually lands. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {draft.mode === "hourly" && totals.subtotal > 0
              ? `Total = ${formatCurrency(totals.subtotal, "USD")}`
              : profile
                ? `${profile.name.split(" ")[0]} receives ≈ ${formatLocal(totals.localAmount, currency)}`
                : "Select a contractor to see the converted amount"}
          </span>
          {profile && currency !== "USD" && (
            <span className="tabular-nums">1 USD = {totals.rate.toLocaleString("en-US")} {currency}</span>
          )}
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">Payment Method</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {METHOD_OPTIONS.map((option) => {
            const Icon = methodIcons[option.method];
            const selected = draft.method === option.method;
            const disabled = Boolean(option.unavailable);

            return (
              <button
                key={option.method}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => update("method", option.method)}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left transition-colors outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                  selected ? "border-primary bg-primary/[0.03]" : "hover:bg-muted/50",
                  disabled && "cursor-default border-transparent bg-muted/50 text-muted-foreground hover:bg-muted/50"
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <Icon className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-sm tabular-nums", selected ? "font-medium text-primary" : "text-muted-foreground")}>
                    {option.unavailable ?? `${formatCurrency(option.fee, "USD")} fee`}
                  </span>
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-sm text-muted-foreground">{option.speed}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <Label htmlFor="payout-note">
          Note to contractor <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="payout-note"
          rows={4}
          placeholder="e.g. June Retainer"
          value={draft.note}
          onChange={(event) => update("note", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {/* Explains the block rather than leaving a dead disabled button. */}
        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {VALIDATION_MESSAGES[error]}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full">
          Continue to review
        </Button>
      </div>
    </form>
  );
}

/**
 * Money field with a leading symbol and a trailing unit. Kept as text with a
 * numeric inputMode — type="number" brings scroll-wheel mutation and spinners
 * that don't belong on an amount someone is about to send.
 */
function MoneyInput({
  id,
  label,
  suffix,
  value,
  onChange,
  className,
  hideSymbol,
}: {
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  hideSymbol?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {!hideSymbol && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
          $
        </span>
      )}
      <Input
        id={id}
        aria-label={label}
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))}
        className={cn("h-12 pr-14 tabular-nums", hideSymbol ? "pl-3" : "pl-7")}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}
