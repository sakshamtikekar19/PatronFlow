"use server";

import { redirect } from "next/navigation";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { createClient } from "@/lib/supabase/server";
import { startCheckout, getPortalUrl, cancelSubscription } from "@/lib/billing";
import type { BillingProvider } from "@/lib/billing";
import { writeAuditLog } from "@/lib/admin/audit";

export async function createCheckout(
  provider: BillingProvider
): Promise<{
  error?: string;
  razorpaySubscriptionId?: string;
  razorpayKey?: string;
}> {
  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return { error: "Restaurant not found" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "User email not found" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await startCheckout({
    restaurantId: restaurant.id,
    email: user.email,
    provider,
    successUrl: `${appUrl}/billing?success=true`,
    cancelUrl: `${appUrl}/billing?cancelled=true`,
    name: restaurant.name,
  });

  if (provider === "razorpay" && result.subscriptionId) {
    const razorpayKey =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      return { error: "Razorpay publishable key is not configured" };
    }

    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "subscription.checkout_started",
      entityType: "restaurant",
      entityId: restaurant.id,
      metadata: { provider },
    });

    return {
      razorpaySubscriptionId: result.subscriptionId,
      razorpayKey,
    };
  }

  if (result.url) {
    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "subscription.checkout_started",
      entityType: "restaurant",
      entityId: restaurant.id,
      metadata: { provider },
    });
    redirect(result.url);
  }

  return { error: result.error || "Failed to start checkout" };
}

export async function openBillingPortal(): Promise<{ error?: string }> {
  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return { error: "Restaurant not found" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await getPortalUrl(restaurant.id, `${appUrl}/billing`);

  if (result.url) {
    redirect(result.url);
  }

  return { error: result.error || "Failed to open billing portal" };
}

export async function cancelCurrentSubscription(): Promise<{
  success?: boolean;
  error?: string;
}> {
  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return { error: "Restaurant not found" };
  }

  const result = await cancelSubscription(restaurant.id, true);

  if (result.success) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await writeAuditLog({
      actorId: user?.id,
      actorEmail: user?.email,
      action: "subscription.cancel_requested",
      entityType: "restaurant",
      entityId: restaurant.id,
    });

    return { success: true };
  }

  return { error: result.error || "Failed to cancel subscription" };
}
