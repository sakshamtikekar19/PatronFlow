"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRestaurantForUser } from "@/lib/queries/restaurant";

export interface DataExportResult {
  success?: boolean;
  error?: string;
  data?: string;
  filename?: string;
}

/**
 * Export all user data in JSON format (GDPR/DPDP compliant)
 */
export async function exportUserData(): Promise<DataExportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return { error: "Restaurant not found" };
  }

  // Gather all user data
  const [
    { data: customers },
    { data: feedback },
    { data: events },
    { data: eventRsvps },
    { data: loyaltyTransactions },
    { data: loyaltyRules },
    { data: customerVisits },
    { data: tableQrs },
    { data: subscription },
    { data: payments },
  ] = await Promise.all([
    supabase.from("customers").select("*").eq("restaurant_id", restaurant.id),
    supabase.from("feedback").select("*").eq("restaurant_id", restaurant.id),
    supabase.from("events").select("*").eq("restaurant_id", restaurant.id),
    supabase
      .from("event_rsvps")
      .select("*, events!inner(restaurant_id)")
      .eq("events.restaurant_id", restaurant.id),
    supabase
      .from("loyalty_transactions")
      .select("*")
      .eq("restaurant_id", restaurant.id),
    supabase.from("loyalty_rules").select("*").eq("restaurant_id", restaurant.id),
    supabase
      .from("customer_visits")
      .select("*")
      .eq("restaurant_id", restaurant.id),
    supabase.from("table_qrs").select("*").eq("restaurant_id", restaurant.id),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .single(),
    supabase
      .from("payments")
      .select("*, subscriptions!inner(restaurant_id)")
      .eq("subscriptions.restaurant_id", restaurant.id),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      createdAt: user.created_at,
    },
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      cuisineType: restaurant.cuisine_type,
      googleReviewUrl: restaurant.google_review_url,
      createdAt: restaurant.created_at,
    },
    subscription: subscription
      ? {
          status: subscription.status,
          trialEndsAt: subscription.trial_ends_at,
          currentPeriodEnd: subscription.current_period_end,
          createdAt: subscription.created_at,
        }
      : null,
    customers: customers || [],
    feedback: feedback || [],
    events: events || [],
    eventRsvps:
      eventRsvps?.map((r) => ({
        id: r.id,
        eventId: r.event_id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        attended: r.attended,
        createdAt: r.created_at,
      })) || [],
    loyaltyTransactions: loyaltyTransactions || [],
    loyaltyRules: loyaltyRules || [],
    customerVisits: customerVisits || [],
    tableQrs: tableQrs || [],
    payments:
      payments?.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        createdAt: p.created_at,
      })) || [],
  };

  const filename = `patronflow-export-${restaurant.slug || restaurant.id}-${
    new Date().toISOString().split("T")[0]
  }.json`;

  return {
    success: true,
    data: JSON.stringify(exportData, null, 2),
    filename,
  };
}

/**
 * Delete user account and all associated data (GDPR/DPDP compliant)
 */
export async function deleteUserData(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return { error: "Restaurant not found" };
  }

  // Use admin client to delete the user (this cascades to restaurant and all related data)
  const adminSupabase = createAdminClient();

  // Delete the auth user - this will cascade delete the restaurant and all related data
  // due to the ON DELETE CASCADE foreign key constraints
  const { error } = await adminSupabase.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete account. Please contact support." };
  }

  // Sign out the current session
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Record consent given by user (for GDPR/DPDP compliance)
 */
export async function recordConsent(
  consentType: "terms" | "privacy" | "marketing",
  granted: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Store consent in user metadata
  const currentMetadata = user.user_metadata || {};
  const consents = currentMetadata.consents || {};

  const { error } = await supabase.auth.updateUser({
    data: {
      ...currentMetadata,
      consents: {
        ...consents,
        [consentType]: {
          granted,
          timestamp: new Date().toISOString(),
          ipAddress: "redacted", // We don't store IP for privacy
        },
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}
