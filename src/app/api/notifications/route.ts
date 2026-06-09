import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getNotifications } from "@/lib/queries/notifications";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return NextResponse.json([]);
  }

  const notifications = await getNotifications(restaurant.id);
  return NextResponse.json(notifications);
}
