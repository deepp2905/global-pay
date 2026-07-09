import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "USD" → "$800.00", "INR" → "₹5,001.45". Crypto codes fall back to "0.134 ETH". */
export function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** "2026-07-03" → "Jul 3" (short) or "Jul 3, 2026" (long). */
export function formatDate(isoDate: string, style: "short" | "long" = "short") {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(style === "long" && { year: "numeric" }),
  }).format(date);
}

/** "Priya Sharma" → "PS" for avatar fallbacks. */
export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
