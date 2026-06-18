import { getRazorpayClient } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

interface CreateRazorpaySubscriptionParams {
  restaurantId: string;
  email: string;
  phone?: string;
  name?: string;
}

interface RazorpaySubscriptionResult {
  subscriptionId: string | null;
  customerId: string | null;
  shortUrl: string | null;
  error?: string;
}

/**
 * Create a Razorpay subscription
 */
export async function createRazorpaySubscription({
  restaurantId,
  email,
  phone,
  name,
}: CreateRazorpaySubscriptionParams): Promise<RazorpaySubscriptionResult> {
  const razorpay = getRazorpayClient();

  if (!razorpay) {
    return {
      subscriptionId: null,
      customerId: null,
      shortUrl: null,
      error: "Razorpay is not configured",
    };
  }

  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) {
    return {
      subscriptionId: null,
      customerId: null,
      shortUrl: null,
      error: "Razorpay plan ID is not configured",
    };
  }

  const supabase = createAdminClient();

  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("provider_customer_id, provider_subscription_id, status")
    .eq("restaurant_id", restaurantId)
    .single();

  let customerId = existingSub?.provider_customer_id ?? null;

  try {
    if (!customerId) {
      const customer = await razorpay.customers.create({
        email,
        contact: phone || undefined,
        name: name || email.split("@")[0],
        notes: { restaurant_id: restaurantId },
      });
      customerId = customer.id;

      await supabase
        .from("subscriptions")
        .update({
          provider_customer_id: customerId,
          provider: "razorpay",
        })
        .eq("restaurant_id", restaurantId);
    }

    // Reuse a pending subscription only if checkout is still valid
    if (existingSub?.provider_subscription_id) {
      const existing = await razorpay.subscriptions.fetch(
        existingSub.provider_subscription_id
      );
      const now = Math.floor(Date.now() / 1000);
      const expireBy = (existing as { expire_by?: number }).expire_by;
      const isExpired = typeof expireBy === "number" && expireBy < now;
      const isPending = existing.status === "created" && !isExpired;

      if (isPending) {
        return {
          subscriptionId: existing.id,
          customerId,
          shortUrl: existing.short_url ?? null,
        };
      }

      // Cancel expired checkout attempts before creating a new subscription
      if (isExpired && existing.status === "created") {
        try {
          await razorpay.subscriptions.cancel(existing.id, false);
        } catch {
          // Continue and create a new subscription
        }
      }
    }

    const expireBy = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: 12,
      customer_notify: 1,
      expire_by: expireBy,
      notify_info: {
        notify_email: email,
        notify_phone: phone || undefined,
      },
      notes: { restaurant_id: restaurantId },
    } as Parameters<typeof razorpay.subscriptions.create>[0]);

    await supabase
      .from("subscriptions")
      .update({
        provider_subscription_id: razorpaySubscription.id,
        provider: "razorpay",
      })
      .eq("restaurant_id", restaurantId);

    return {
      subscriptionId: razorpaySubscription.id,
      customerId,
      shortUrl: razorpaySubscription.short_url ?? null,
    };
  } catch (error) {
    console.error("Failed to create Razorpay subscription:", error);
    return {
      subscriptionId: null,
      customerId: null,
      shortUrl: null,
      error: error instanceof Error ? error.message : "Failed to create subscription",
    };
  }
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyRazorpayWebhook(
  body: string,
  signature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Razorpay webhook secret is not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Cancel a Razorpay subscription
 */
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<{ success: boolean; error?: string }> {
  const razorpay = getRazorpayClient();

  if (!razorpay) {
    return { success: false, error: "Razorpay is not configured" };
  }

  try {
    await razorpay.subscriptions.cancel(subscriptionId, cancelAtPeriodEnd);
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel Razorpay subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel subscription",
    };
  }
}
