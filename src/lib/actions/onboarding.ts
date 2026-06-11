"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueRestaurantSlug } from "@/lib/slug";

export interface OnboardingData {
  name: string;
  cuisineType?: string;
  googleReviewUrl?: string;
}

/** Save restaurant basics during the onboarding wizard (steps 1-2). */
export async function saveOnboardingDetails(
  data: OnboardingData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const name = data.name.trim();
  if (!name) return { error: "Restaurant name is required" };

  // Fetch the current row so we only mint a slug once (slugs are permanent so
  // public review URLs never change, even if the name is edited later).
  const { data: existing } = await supabase
    .from("restaurants")
    .select("id, slug")
    .eq("owner_id", user.id)
    .single();

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

  revalidatePath("/", "layout");
  return { success: true };
}
