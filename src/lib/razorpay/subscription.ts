import { getRazorpayClient } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getRazorpayPlanId,
  type SubscriptionCurrency,
} from "@/lib/billing/subscription-currency";
import crypto from "crypto";

interface CreateRazorpaySubscriptionParams {
  restaurantId: string;
  email: string;
  phone?: string;
  name?: string;
  /** Defaults to INR for backward compatibility with existing callers */
  currency?: SubscriptionCurrency;
}

interface RazorpaySubscriptionResult {
  subscriptionId: string | null;
  customerId: string | null;
  shortUrl: string | null;
  error?: string;
}

function getRazorpayErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "error" in error) {
    const razorpayError = (error as { error?: { description?: string; reason?: string } })
      .error;
    if (razorpayError?.description) return razorpayError.description;
    if (razorpayError?.reason) return razorpayError.reason;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Failed to create subscription";
}

function isDuplicateRazorpayCustomerError(error: unknown): boolean {
  return getRazorpayErrorMessage(error)
    .toLowerCase()
    .includes("customer already exists");
}

async function findRazorpayCustomerByEmail(
  razorpay: NonNullable<ReturnType<typeof getRazorpayClient>>,
  email: string
): Promise<{ id: string } | null> {
  const normalizedEmail = email.trim().toLowerCase();
  let skip = 0;
  const pageSize = 100;

  for (let page = 0; page < 5; page++) {
    const list = await razorpay.customers.all({
      count: pageSize,
      skip,
    } as { count: number; skip: number });

    const items = list.items ?? [];
    const match = items.find(
      (customer: { id?: string; email?: string | null }) =>
        customer.email?.trim().toLowerCase() === normalizedEmail
    );
    if (match?.id) return { id: match.id };

    if (items.length < pageSize) break;
    skip += pageSize;
  }

  return null;
}

async function getOrCreateRazorpayCustomer(
  razorpay: NonNullable<ReturnType<typeof getRazorpayClient>>,
  params: {
    restaurantId: string;
    email: string;
    phone?: string;
    name?: string;
  }
): Promise<string> {
  const existing = await findRazorpayCustomerByEmail(razorpay, params.email);
  if (existing) return existing.id;

  try {
    const customer = await razorpay.customers.create({
      email: params.email,
      contact: params.phone || undefined,
      name: params.name || params.email.split("@")[0],
      notes: { restaurant_id: params.restaurantId },
    });
    return customer.id;
  } catch (error) {
    if (isDuplicateRazorpayCustomerError(error)) {
      const duplicate = await findRazorpayCustomerByEmail(razorpay, params.email);
      if (duplicate) return duplicate.id;
    }
    throw error;
  }
}

/**
 * Create a Razorpay subscription
 */
export async function createRazorpaySubscription({
  restaurantId,
  email,
  phone,
  name,
  currency = "INR",
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

  const planId = getRazorpayPlanId(currency);
  if (!planId) {
    const message =
      currency === "INR"
        ? "INR subscription plan is not configured. Set RAZORPAY_PLAN_INR or RAZORPAY_PLAN_ID."
        : "USD subscription plan is not configured. Set RAZORPAY_PLAN_USD.";
    console.error("Razorpay plan missing:", { currency, restaurantId });
    return {
      subscriptionId: null,
      customerId: null,
      shortUrl: null,
      error: message,
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
    if (customerId) {
      try {
        await razorpay.customers.fetch(customerId);
      } catch {
        console.warn("Stale Razorpay customer id, creating a new customer:", {
          restaurantId,
          customerId,
        });
        customerId = null;
        await supabase
          .from("subscriptions")
          .update({ provider_customer_id: null })
          .eq("restaurant_id", restaurantId);
      }
    }

    if (!customerId) {
      customerId = await getOrCreateRazorpayCustomer(razorpay, {
        restaurantId,
        email,
        phone,
        name,
      });

      await supabase
        .from("subscriptions")
        .update({
          provider_customer_id: customerId,
          provider: "razorpay",
        })
        .eq("restaurant_id", restaurantId);
    }

    // Reuse a pending subscription only if checkout is still valid and plan matches
    if (existingSub?.provider_subscription_id) {
      try {
        const existing = await razorpay.subscriptions.fetch(
          existingSub.provider_subscription_id
        );
        const existingPlanId = (existing as { plan_id?: string }).plan_id;
        const now = Math.floor(Date.now() / 1000);
        const expireBy = (existing as { expire_by?: number }).expire_by;
        const isExpired = typeof expireBy === "number" && expireBy < now;
        const isPending =
          existing.status === "created" && !isExpired && existingPlanId === planId;

        if (isPending) {
          return {
            subscriptionId: existing.id,
            customerId,
            shortUrl: existing.short_url ?? null,
          };
        }

        // Cancel stale checkout attempts before creating a new subscription
        if (existing.status === "created") {
          try {
            await razorpay.subscriptions.cancel(existing.id, false);
          } catch {
            // Continue and create a new subscription
          }
        }
      } catch {
        console.warn("Stale Razorpay subscription id, creating a new one:", {
          restaurantId,
          providerSubscriptionId: existingSub.provider_subscription_id,
        });
        await supabase
          .from("subscriptions")
          .update({ provider_subscription_id: null })
          .eq("restaurant_id", restaurantId);
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
      notes: { restaurant_id: restaurantId, currency },
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
    const message = getRazorpayErrorMessage(error);
    console.error("Failed to create Razorpay subscription:", {
      currency,
      restaurantId,
      planId,
      error,
      message,
    });
    return {
      subscriptionId: null,
      customerId: null,
      shortUrl: null,
      error: message,
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
