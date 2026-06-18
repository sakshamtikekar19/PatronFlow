import { createAdminClient } from "@/lib/supabase/admin";
import { isInGracePeriod } from "./config";
import type { Subscription } from "@/types/database.types";

export function isSubscriptionActive(
  subscription: Subscription | null | undefined
): boolean {
  if (!subscription) return false;

  const now = new Date();

  if (subscription.status === "trialing" && subscription.trial_ends_at) {
    return now < new Date(subscription.trial_ends_at);
  }

  if (subscription.status === "active") {
    return true;
  }

  if (
    subscription.status === "past_due" &&
    subscription.current_period_end &&
    isInGracePeriod(new Date(subscription.current_period_end))
  ) {
    return true;
  }

  return false;
}

export async function getUserAppAccess(userId: string) {
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, onboarded, name, logo")
    .eq("owner_id", userId)
    .maybeSingle();

  if (!restaurant) {
    return {
      restaurant: null,
      isActive: false,
      needsOnboarding: true,
      isLocked: false,
    };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  const isActive = isSubscriptionActive(subscription);
  const needsOnboarding = !restaurant.onboarded;
  const isLocked = restaurant.onboarded && !isActive;

  return {
    restaurant,
    isActive,
    needsOnboarding,
    isLocked,
  };
}
