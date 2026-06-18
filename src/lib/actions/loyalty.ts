"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { requireActiveSubscription } from "@/lib/billing/guards";
import type { LoyaltyRule, LoyaltyTransactionType } from "@/types";

export async function createLoyaltyRule(input: {
  rewardName: string;
  pointsRequired: number;
  rewardDescription?: string;
}): Promise<{ error?: string; rule?: LoyaltyRule }> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const rewardName = input.rewardName.trim();
  if (!rewardName) return { error: "Reward name is required" };
  if (!Number.isFinite(input.pointsRequired) || input.pointsRequired < 0) {
    return { error: "Points required must be 0 or more" };
  }

  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const { data, error } = await supabase
    .from("loyalty_rules")
    .insert({
      restaurant_id: restaurant.id,
      reward_name: rewardName,
      points_required: Math.round(input.pointsRequired),
      reward_description: input.rewardDescription?.trim() || null,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/loyalty");
  return { rule: data };
}

export async function deleteLoyaltyRule(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const { data, error } = await supabase
    .from("loyalty_rules")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Could not delete this reward — it no longer exists." };
  }

  revalidatePath("/loyalty");
  return { success: true };
}

export async function addLoyaltyTransaction(input: {
  customerId: string;
  points: number;
  type: LoyaltyTransactionType;
  notes?: string;
}): Promise<{ error?: string; success?: boolean }> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  if (!Number.isFinite(input.points) || input.points === 0) {
    return { error: "Enter a non-zero point amount" };
  }

  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  // Ensure the customer belongs to this restaurant before mutating points.
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("id", input.customerId)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (!customer) return { error: "Customer not found" };

  const { error } = await supabase.from("loyalty_transactions").insert({
    restaurant_id: restaurant.id,
    customer_id: input.customerId,
    points: Math.abs(Math.round(input.points)),
    transaction_type: input.type,
    notes: input.notes?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/loyalty");
  revalidatePath("/customers");
  return { success: true };
}
