import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe client instance.
 * Returns null if Stripe is not configured (STRIPE_SECRET_KEY not set).
 */
export function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }

  return stripeInstance;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
