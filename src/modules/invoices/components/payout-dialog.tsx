"use client";

import * as React from "react";
import { BanknoteArrowUp, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getContractors, METHOD_LABELS, type PaymentMethod } from "@/modules/invoices/data";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "SGD", "AED"];

/**
 * "Create payout" is a dialog, not a page (D1 scope trim): the brief needs
 * exactly one deep view, and a second nested flow proves nothing new. Submit
 * is a stub — no backend. Opens from the list header CTA or via the palette
 * quick action (?action=new-payout).
 */
export function PayoutDialog({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    // Drop ?action=new-payout so refresh/share doesn't reopen the dialog.
    if (!next && defaultOpen) router.replace("/invoices", { scroll: false });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" />
          New Payout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BanknoteArrowUp className="size-4" />
            New payout
          </DialogTitle>
          <DialogDescription>
            Send a one-off payout to a contractor. Demo only — nothing is submitted.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="payout-contractor">Contractor</Label>
            <Select>
              <SelectTrigger id="payout-contractor" className="w-full">
                <SelectValue placeholder="Select a contractor" />
              </SelectTrigger>
              <SelectContent>
                {getContractors().map((contractor) => (
                  <SelectItem key={contractor} value={contractor}>
                    {contractor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="payout-amount">Amount</Label>
              <Input id="payout-amount" type="number" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="payout-currency">Currency</Label>
              <Select defaultValue="USD">
                <SelectTrigger id="payout-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="payout-method">Payment method</Label>
            <Select defaultValue="bank">
              <SelectTrigger id="payout-method" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((method) => (
                  <SelectItem key={method} value={method}>
                    {METHOD_LABELS[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled>
              Create payout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
