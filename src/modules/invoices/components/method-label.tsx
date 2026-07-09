import { CircleDollarSign, Landmark, Wallet } from "lucide-react";

import { METHOD_LABELS, type PaymentMethod } from "@/modules/invoices/data";

const methodIcons: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  bank: Landmark,
  wallet: Wallet,
  usdc: CircleDollarSign,
};

export function MethodLabel({ method }: { method: PaymentMethod }) {
  const Icon = methodIcons[method];
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <Icon className="size-4 text-muted-foreground" />
      {METHOD_LABELS[method]}
    </span>
  );
}
