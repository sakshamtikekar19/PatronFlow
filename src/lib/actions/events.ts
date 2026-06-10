"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import type { Event, EventStatus } from "@/types";

interface EventInput {
  title: string;
  description?: string;
  eventDate?: string;
  coverImage?: string;
  status?: EventStatus;
}

// Event cover images are stored in the same public bucket as logos, namespaced
// under an events/ prefix so uploads are performed server-side with the
// service-role key (no extra storage RLS needed).
const COVER_BUCKET = "logos";
const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_COVER_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function uploadEventCover(
  formData: FormData
): Promise<{ error?: string; coverUrl?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const file = formData.get("cover");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided" };
  }
  if (!ALLOWED_COVER_TYPES.includes(file.type)) {
    return { error: "Image must be a PNG, JPG, or WEBP" };
  }
  if (file.size > MAX_COVER_BYTES) {
    return { error: "Image must be smaller than 5MB" };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `events/${restaurant.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from(COVER_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(COVER_BUCKET).getPublicUrl(path);

  return { coverUrl: publicUrl };
}

export async function createEvent(
  input: EventInput
): Promise<{ error?: string; event?: Event }> {
  const title = input.title.trim();
  if (!title) return { error: "Event title is required" };

  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const { data, error } = await supabase
    .from("events")
    .insert({
      restaurant_id: restaurant.id,
      title,
      description: input.description?.trim() || null,
      event_date: input.eventDate || null,
      cover_image: input.coverImage?.trim() || null,
      status: input.status ?? "draft",
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { event: data };
}

export async function updateEvent(
  id: string,
  input: EventInput
): Promise<{ error?: string; success?: boolean }> {
  const title = input.title.trim();
  if (!title) return { error: "Event title is required" };

  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description: input.description?.trim() || null,
      event_date: input.eventDate || null,
      cover_image: input.coverImage?.trim() || null,
      ...(input.status ? { status: input.status } : {}),
    })
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  if (error) return { error: error.message };

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setEventStatus(
  id: string,
  status: EventStatus
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  if (error) return { error: error.message };

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEvent(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  if (error) return { error: error.message };

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleRsvpAttendance(
  rsvpId: string,
  attended: boolean
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("event_rsvps")
    .update({ attended })
    .eq("id", rsvpId);

  if (error) return { error: error.message };

  revalidatePath("/events");
  return { success: true };
}
