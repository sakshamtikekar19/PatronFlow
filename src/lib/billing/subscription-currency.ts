import { BILLING_CONFIG } from "./config";

export type SubscriptionCurrency = "INR" | "USD";

const COUNTRY_HEADER_KEYS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
] as const;

/**
 * Read ISO country code from common CDN / hosting headers (Vercel, Cloudflare).
 */
export function getCountryFromHeaders(
  headers: Headers | { get(name: string): string | null }
): string | null {
  for (const key of COUNTRY_HEADER_KEYS) {
    const value = headers.get(key);
    if (value) return value.toUpperCase();
  }
  return null;
}

/**
 * Resolve checkout currency from geo headers.
 * India → INR; all other / unknown countries → USD.
 */
export function resolveSubscriptionCurrency(
  countryCode?: string | null
): SubscriptionCurrency {
  if (countryCode?.toUpperCase() === "IN") return "INR";
  return "USD";
}

/**
 * Razorpay plan ID for the given currency.
 * INR falls back to legacy RAZORPAY_PLAN_ID so existing production envs keep working.
 */
export function getRazorpayPlanId(currency: SubscriptionCurrency): string | null {
  if (currency === "INR") {
    return (
      process.env.RAZORPAY_PLAN_INR?.trim() ||
      process.env.RAZORPAY_PLAN_ID?.trim() ||
      null
    );
  }
  return process.env.RAZORPAY_PLAN_USD?.trim() || null;
}

export function isRazorpayCurrencyConfigured(
  currency: SubscriptionCurrency
): boolean {
  return Boolean(getRazorpayPlanId(currency));
}

export function getSubscriptionPriceForCurrency(currency: SubscriptionCurrency) {
  const plan = BILLING_CONFIG.plans[0];
  if (currency === "INR") {
    return {
      currency: "INR" as const,
      amountMinor: plan.priceINR,
      label: "₹4,999",
    };
  }
  return {
    currency: "USD" as const,
    amountMinor: plan.priceUSD,
    label: "$99",
  };
}

export function formatSubscriptionPrice(currency: SubscriptionCurrency): string {
  const { amountMinor, currency: code } = getSubscriptionPriceForCurrency(currency);
  if (amountMinor <= 0) return "—";
  return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}
