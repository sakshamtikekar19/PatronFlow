import { createClient } from "@/lib/supabase/server";
import type { Subscription, Payment, Plan } from "@/types/database.types";

export interface BillingData {
  subscription: Subscription | null;
  plan: Plan | null;
  payments: Payment[];
}

/**
 * Get billing data for the current user's restaurant
 */
export async function getBillingData(restaurantId: string): Promise<BillingData> {
  const supabase = await createClient();

  // Get subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .single();

  // Get plan if subscription exists
  let plan: Plan | null = null;
  if (subscription?.plan_id) {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .eq("id", subscription.plan_id)
      .single();
    plan = data;
  }

  // Get payment history
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("subscription_id", subscription?.id || "")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    subscription,
    plan,
    payments: payments || [],
  };
}

/**
 * Get all active plans
 */
export async function getActivePlans(): Promise<Plan[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price_monthly_usd", { ascending: true });

  return data || [];
}
