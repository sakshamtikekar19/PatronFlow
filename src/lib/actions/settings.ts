"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelSubscriptionForAccountDeletion } from "@/lib/billing";
import { requireActiveSubscription } from "@/lib/billing/guards";
import { getRestaurantForUser } from "@/lib/queries/restaurant";

export interface SettingsFormData {
  name: string;
  google_review_url?: string;
  cuisine_type?: string;
}

const LOGO_BUCKET = "logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

export async function updateRestaurantSettings(
  data: SettingsFormData
): Promise<{ error?: string; success?: boolean }> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Note: logo is handled separately via uploadRestaurantLogo so it is not
  // overwritten when saving text fields.
  const { error } = await supabase
    .from("restaurants")
    .update({
      name: data.name,
      google_review_url: data.google_review_url || null,
      cuisine_type: data.cuisine_type || null,
    })
    .eq("owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadRestaurantLogo(
  formData: FormData
): Promise<{ error?: string; logoUrl?: string }> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided" };
  }

  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return { error: "Logo must be a PNG, JPG, WEBP, or SVG image" };
  }

  if (file.size > MAX_LOGO_BYTES) {
    return { error: "Logo must be smaller than 2MB" };
  }

  // Find the restaurant owned by this user
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return { error: "Restaurant not found" };
  }

  // Use the admin client for storage so we don't depend on storage RLS policies.
  const admin = createAdminClient();

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${restaurant.id}/logo-${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from(LOGO_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(LOGO_BUCKET).getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("restaurants")
    .update({ logo: publicUrl })
    .eq("owner_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { logoUrl: publicUrl };
}

/**
 * Danger zone: permanently delete the owner's account and all data.
 * Deleting the auth user cascades to restaurants -> customers -> feedback.
 */
export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const restaurant = await getRestaurantForUser();
  if (restaurant) {
    const cancelResult = await cancelSubscriptionForAccountDeletion(
      restaurant.id
    );
    if (!cancelResult.success) {
      return {
        error:
          cancelResult.error ||
          "Could not cancel your subscription. Cancel billing first or contact support.",
      };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  redirect("/login");
}

export async function removeRestaurantLogo(): Promise<{
  error?: string;
  success?: boolean;
}> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("restaurants")
    .update({ logo: null })
    .eq("owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
