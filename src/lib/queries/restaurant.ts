import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "@/types";

export async function getRestaurantForUser(): Promise<Restaurant | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getRestaurantById(
  id: string
): Promise<Restaurant | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}
