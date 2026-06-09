"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  if (!data.name.trim()) return { error: "Restaurant name is required" };

  const { error } = await supabase
    .from("restaurants")
    .update({
      name: data.name.trim(),
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
