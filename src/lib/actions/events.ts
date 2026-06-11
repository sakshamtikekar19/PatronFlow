"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import type { Event, EventStatus } from "@/types";

interface EventInput {
  title: string;
  description?: string;
  eventDate?: string;
  coverImage?: string;
  status?: EventStatus;
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

  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Could not delete this event — it no longer exists." };
  }

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
