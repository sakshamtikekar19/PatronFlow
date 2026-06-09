import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { searchDashboard } from "@/lib/queries/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const suggestions = await searchDashboard(restaurant.id, q);
  return NextResponse.json(suggestions);
}
