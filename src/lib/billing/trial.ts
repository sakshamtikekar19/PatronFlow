/**
 * Trial status utilities
 */

import { differenceInCalendarDays, startOfDay } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { BILLING_CONFIG } from "./config";

export interface TrialStatus {
  isOnTrial: boolean;
  trialDaysRemaining: number;
  trialEndsAt: Date | null;
  hasExpired: boolean;
}

/**
 * Calendar days until trial ends (matches Supabase subscription_overview).
 * Counts the end date; shows 1 on the last active calendar day.
 */
export function getTrialDaysRemaining(
  trialEndsAt: Date | string,
  now: Date = new Date()
): number {
  const end = new Date(trialEndsAt);
  if (now >= end) return 0;

  const calendarDays = differenceInCalendarDays(startOfDay(end), startOfDay(now));
  return calendarDays === 0 ? 1 : calendarDays;
}

/**
 * Get trial status for a restaurant
 */
export async function getTrialStatus(restaurantId: string): Promise<TrialStatus> {
  const supabase = createAdminClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at")
    .eq("restaurant_id", restaurantId)
    .single();

  if (!subscription) {
    return {
      isOnTrial: false,
      trialDaysRemaining: 0,
      trialEndsAt: null,
      hasExpired: true,
    };
  }

  if (subscription.status !== "trialing" || !subscription.trial_ends_at) {
    return {
      isOnTrial: false,
      trialDaysRemaining: 0,
      trialEndsAt: null,
      hasExpired: subscription.status === "expired",
    };
  }

  const trialEndsAt = new Date(subscription.trial_ends_at);
  const now = new Date();
  const daysRemaining = getTrialDaysRemaining(trialEndsAt, now);

  return {
    isOnTrial: now < trialEndsAt,
    trialDaysRemaining: daysRemaining,
    trialEndsAt,
    hasExpired: now >= trialEndsAt,
  };
}

/**
 * Check if trial is ending soon (within 3 days)
 */
export function isTrialEndingSoon(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;

  const daysUntilEnd = getTrialDaysRemaining(trialEndsAt);
  return daysUntilEnd > 0 && daysUntilEnd <= 3;
}

/**
 * Calculate trial end date from signup
 */
export function calculateTrialEndDate(signupDate: Date = new Date()): Date {
  const trialEnd = new Date(signupDate);
  trialEnd.setDate(trialEnd.getDate() + BILLING_CONFIG.trialDays);
  return trialEnd;
}

/**
 * Format trial days remaining for display
 */
export function formatTrialDaysRemaining(days: number): string {
  if (days <= 0) return "Trial expired";
  if (days === 1) return "1 day left in trial";
  return `${days} days left in trial`;
}

/**
 * Get restaurants with trials ending soon (for notification cron)
 */
export async function getTrialsEndingSoon(withinDays: number = 3): Promise<
  Array<{
    restaurantId: string;
    ownerId: string;
    trialEndsAt: string;
    daysRemaining: number;
  }>
> {
  const supabase = createAdminClient();

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + withinDays);

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(`
      restaurant_id,
      trial_ends_at,
      restaurants:restaurant_id (owner_id)
    `)
    .eq("status", "trialing")
    .gte("trial_ends_at", now.toISOString())
    .lte("trial_ends_at", futureDate.toISOString());

  if (!subscriptions) return [];

  return subscriptions.map((sub) => {
    const restaurants = sub.restaurants as unknown as { owner_id: string } | null;
    return {
      restaurantId: sub.restaurant_id,
      ownerId: restaurants?.owner_id ?? "",
      trialEndsAt: sub.trial_ends_at!,
      daysRemaining: getTrialDaysRemaining(sub.trial_ends_at!),
    };
  });
}
