import { getStripeClient } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";

interface CreateCheckoutSessionParams {
  restaurantId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSessionResult {
  url: string | null;
  error?: string;
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession({
  restaurantId,
  email,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();

  if (!stripe) {
    return { url: null, error: "Stripe is not configured" };
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return { url: null, error: "Stripe price ID is not configured" };
  }

  const supabase = createAdminClient();

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("provider_customer_id")
    .eq("restaurant_id", restaurantId)
    .single();

  let customerId = subscription?.provider_customer_id;

  if (!customerId) {
    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        restaurant_id: restaurantId,
      },
    });
    customerId = customer.id;

    // Store the customer ID
    await supabase
      .from("subscriptions")
      .update({
        provider_customer_id: customerId,
        provider: "stripe",
      })
      .eq("restaurant_id", restaurantId);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          restaurant_id: restaurantId,
        },
      },
      allow_promotion_codes: true,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Failed to create Stripe checkout session:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Failed to create checkout session",
    };
  }
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string | null; error?: string }> {
  const stripe = getStripeClient();

  if (!stripe) {
    return { url: null, error: "Stripe is not configured" };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Failed to create Stripe portal session:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Failed to create portal session",
    };
  }
}
