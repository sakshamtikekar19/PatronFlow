"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { buildReviewUrl } from "@/lib/review-url";
import type { TableQr } from "@/types";

export async function createTableQr(
  tableName: string
): Promise<{ error?: string; tableQr?: TableQr }> {
  const trimmed = tableName.trim();
  if (!trimmed) {
    return { error: "Table name is required" };
  }

  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    return { error: "Restaurant not found" };
  }

  const qrUrl = buildReviewUrl(restaurant.slug ?? restaurant.id, trimmed);

  const { data, error } = await supabase
    .from("table_qrs")
    .insert({
      restaurant_id: restaurant.id,
      table_name: trimmed,
      qr_url: qrUrl,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: `"${trimmed}" already exists` };
    }
    return { error: error.message };
  }

  revalidatePath("/qr");
  return { tableQr: data };
}

export async function deleteTableQr(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const { data, error } = await supabase
    .from("table_qrs")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .select("id");

  if (error) {
    return { error: error.message };
  }
  if (!data || data.length === 0) {
    return { error: "Could not delete this QR — it no longer exists." };
  }

  revalidatePath("/qr");
  return { success: true };
}
