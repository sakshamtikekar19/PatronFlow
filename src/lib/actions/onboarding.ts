"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRestaurantForUser } from "@/lib/queries/restaurant";
import { generateUniqueRestaurantSlug } from "@/lib/slug";
import { requireActiveSubscription } from "@/lib/billing/guards";
import { writeAuditLog } from "@/lib/admin/audit";

export interface OnboardingData {
  name: string;
  cuisineType?: string;
  googleReviewUrl?: string;
}

/** Save restaurant basics during the onboarding wizard (steps 1-2). */
export async function saveOnboardingDetails(
  data: OnboardingData
): Promise<{ error?: string; success?: boolean }> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const name = data.name.trim();
  if (!name) return { error: "Restaurant name is required" };

  const restaurant = await ensureRestaurantForUser();
  if (!restaurant) {
    return { error: "Could not set up your restaurant. Please try again." };
  }

  // Fetch the current row so we only mint a slug once (slugs are permanent so
  // public review URLs never change, even if the name is edited later).
  const existing = { id: restaurant.id, slug: restaurant.slug };

  let slug = existing?.slug ?? undefined;
  if (!slug) {
    const admin = createAdminClient();
    slug = await generateUniqueRestaurantSlug(admin, name, existing?.id);
  }

  const { error } = await supabase
    .from("restaurants")
    .update({
      name,
      slug,
      cuisine_type: data.cuisineType?.trim() || null,
      google_review_url: data.googleReviewUrl?.trim() || null,
    })
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/onboarding");
  return { success: true };
}

/** Mark onboarding complete (final step). */
export async function completeOnboarding(): Promise<{
  error?: string;
  success?: boolean;
}> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("restaurants")
    .update({ onboarded: true })
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    action: "restaurant.onboarding_complete",
    entityType: "restaurant",
    entityId: restaurant?.id,
  });

  revalidatePath("/", "layout");
  return { success: true };
}
