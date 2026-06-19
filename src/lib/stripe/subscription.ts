import { getStripeClient } from "./client";

/**
 * Cancel a Stripe subscription immediately.
 */
export async function cancelStripeSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  const stripe = getStripeClient();

  if (!stripe) {
    return { success: false, error: "Stripe is not configured" };
  }

  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel Stripe subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to cancel subscription",
    };
  }
}
