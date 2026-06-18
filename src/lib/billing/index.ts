/**
 * Unified Billing Service
 * Abstracts payment provider selection and common billing operations.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { isStripeConfigured } from "@/lib/stripe/client";
import { isRazorpayConfigured } from "@/lib/razorpay/client";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe/checkout";
import { createRazorpaySubscription, cancelRazorpaySubscription } from "@/lib/razorpay/subscription";
import type { Subscription, SubscriptionStatus, PaymentProvider } from "@/types/database.types";
import { BILLING_CONFIG, isInGracePeriod } from "./config";

export type BillingProvider = "stripe" | "razorpay" | "paypal";

/**
 * Detect the best payment provider based on region
 */
export function detectProvider(countryCode?: string): BillingProvider {
  // India uses Razorpay for UPI support
  if (countryCode === "IN" && isRazorpayConfigured()) {
    return "razorpay";
  }

  // International uses Stripe
  if (isStripeConfigured()) {
    return "stripe";
  }

  // Fallback to Razorpay if Stripe not configured
  if (isRazorpayConfigured()) {
    return "razorpay";
  }

  throw new Error("No payment provider configured");
}

/**
 * Get available payment providers
 */
export function getAvailableProviders(): BillingProvider[] {
  const providers: BillingProvider[] = [];
  if (isStripeConfigured()) providers.push("stripe");
  if (isRazorpayConfigured()) providers.push("razorpay");
  // PayPal to be added when configured
  return providers;
}

/**
 * Get subscription status for a restaurant
 */
export async function getSubscriptionStatus(
  restaurantId: string
): Promise<{
  status: SubscriptionStatus;
  isActive: boolean;
  trialDaysRemaining: number | null;
  subscription: Subscription | null;
}> {
  const supabase = createAdminClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .single();

  if (error || !subscription) {
    return {
      status: "expired",
      isActive: false,
      trialDaysRemaining: null,
      subscription: null,
    };
  }

  const now = new Date();

  // Check trial status
  if (subscription.status === "trialing" && subscription.trial_ends_at) {
    const trialEnd = new Date(subscription.trial_ends_at);
    if (now < trialEnd) {
      const daysRemaining = Math.ceil(
        (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        status: "trialing",
        isActive: true,
        trialDaysRemaining: daysRemaining,
        subscription,
      };
    }
    // Trial expired
    return {
      status: "expired",
      isActive: false,
      trialDaysRemaining: 0,
      subscription,
    };
  }

  // Active subscription
  if (subscription.status === "active") {
    return {
      status: "active",
      isActive: true,
      trialDaysRemaining: null,
      subscription,
    };
  }

  // Past due - check grace period
  if (
    subscription.status === "past_due" &&
    subscription.current_period_end &&
    isInGracePeriod(new Date(subscription.current_period_end))
  ) {
    return {
      status: "past_due",
      isActive: true, // Still allow access during grace period
      trialDaysRemaining: null,
      subscription,
    };
  }

  return {
    status: subscription.status,
    isActive: false,
    trialDaysRemaining: null,
    subscription,
  };
}

/**
 * Check if a restaurant has an active subscription (trial or paid)
 */
export async function hasActiveSubscription(restaurantId: string): Promise<boolean> {
  const { isActive } = await getSubscriptionStatus(restaurantId);
  return isActive;
}

/**
 * Start checkout flow for the appropriate provider
 */
export async function startCheckout(params: {
  restaurantId: string;
  email: string;
  provider: BillingProvider;
  successUrl: string;
  cancelUrl: string;
  phone?: string;
  name?: string;
}): Promise<{ url: string | null; subscriptionId?: string; error?: string }> {
  if (params.provider === "stripe") {
    return createCheckoutSession({
      restaurantId: params.restaurantId,
      email: params.email,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    });
  }

  if (params.provider === "razorpay") {
    const result = await createRazorpaySubscription({
      restaurantId: params.restaurantId,
      email: params.email,
      phone: params.phone,
      name: params.name,
    });

    if (result.subscriptionId) {
      return {
        url: result.shortUrl,
        subscriptionId: result.subscriptionId,
        error: result.error,
      };
    }

    return {
      url: null,
      error: result.error || "Failed to start Razorpay checkout",
    };
  }

  return { url: null, error: `Provider ${params.provider} not supported` };
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  restaurantId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("provider, provider_subscription_id")
    .eq("restaurant_id", restaurantId)
    .single();

  if (error || !subscription?.provider_subscription_id) {
    return { success: false, error: "No active subscription found" };
  }

  if (subscription.provider === "stripe") {
    // Stripe cancellation is handled via the customer portal
    // or we can cancel via API if needed
    return { success: true };
  }

  if (subscription.provider === "razorpay") {
    return cancelRazorpaySubscription(
      subscription.provider_subscription_id,
      cancelAtPeriodEnd
    );
  }

  return { success: false, error: "Unknown provider" };
}

/**
 * Get portal URL for managing subscription (Stripe only)
 */
export async function getPortalUrl(
  restaurantId: string,
  returnUrl: string
): Promise<{ url: string | null; error?: string }> {
  const supabase = createAdminClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("provider, provider_customer_id")
    .eq("restaurant_id", restaurantId)
    .single();

  if (error || !subscription?.provider_customer_id) {
    return { url: null, error: "No subscription found" };
  }

  if (subscription.provider === "stripe") {
    return createPortalSession(subscription.provider_customer_id, returnUrl);
  }

  return { url: null, error: "Portal not available for this provider" };
}

/**
 * Update subscription status in database
 */
export async function updateSubscriptionStatus(
  restaurantId: string,
  status: SubscriptionStatus,
  metadata?: Partial<Subscription>
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from("subscriptions")
    .update({
      status,
      ...metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("restaurant_id", restaurantId);
}

/**
 * Record a payment in the database
 */
export async function recordPayment(params: {
  subscriptionId: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  providerInvoiceId?: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  failureReason?: string;
}): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from("payments").insert({
    subscription_id: params.subscriptionId,
    provider: params.provider,
    provider_payment_id: params.providerPaymentId,
    provider_invoice_id: params.providerInvoiceId,
    amount: params.amount,
    currency: params.currency,
    status: params.status,
    invoice_url: params.invoiceUrl,
    receipt_url: params.receiptUrl,
    failure_reason: params.failureReason,
  });
}
