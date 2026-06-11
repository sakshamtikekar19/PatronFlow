"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";

/**
 * Delete one or more customers belonging to the current owner's restaurant.
 * Related feedback, visits, and loyalty transactions are removed automatically
 * via `on delete cascade` in the database schema.
 */
export async function deleteCustomers(
  ids: string[]
): Promise<{ error?: string; deletedCount?: number }> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return { error: "No customers selected" };
  }

  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { error: "Restaurant not found" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("restaurant_id", restaurant.id)
    .in("id", uniqueIds)
    .select("id");

  if (error) return { error: error.message };

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  revalidatePath("/loyalty");
  revalidatePath("/recovery");

  return { deletedCount: data?.length ?? 0 };
}
