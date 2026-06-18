/**
 * Billing configuration - all pricing and plan details in one place.
 * Update these values to change pricing without code changes.
 */

export const BILLING_CONFIG = {
  /** Number of days for free trial */
  trialDays: 30,

  /** Grace period in days after payment failure before restricting access */
  gracePeriodDays: 3,

  /** Default currency based on detected region */
  defaultCurrency: {
    IN: "INR",
    default: "USD",
  },

  /** Available plans */
  plans: [
    {
      id: "pro",
      name: "PatronFlow Pro",
      description: "All-inclusive plan with unlimited features",
      priceINR: 0, // Configure when ready to launch
      priceUSD: 0, // Configure when ready to launch
      features: [
        "Unlimited feedback collection",
        "Customer database",
        "Loyalty programs",
        "Event management",
        "QR code analytics",
        "Recovery workflows",
        "Email notifications",
        "Priority support",
      ],
    },
  ],
} as const;

export type PlanId = (typeof BILLING_CONFIG.plans)[number]["id"];

/**
 * Get the plan configuration by ID
 */
export function getPlanConfig(planId: PlanId) {
  return BILLING_CONFIG.plans.find((p) => p.id === planId);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string): string {
  if (amount === 0) return "Free during beta";

  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100); // Amounts stored in smallest unit (paise/cents)
}

/**
 * Calculate trial end date
 */
export function getTrialEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + BILLING_CONFIG.trialDays);
  return date;
}

/**
 * Check if a date is within the grace period
 */
export function isInGracePeriod(periodEndDate: Date): boolean {
  const now = new Date();
  const graceEnd = new Date(periodEndDate);
  graceEnd.setDate(graceEnd.getDate() + BILLING_CONFIG.gracePeriodDays);
  return now <= graceEnd;
}
