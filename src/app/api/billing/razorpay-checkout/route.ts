import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { createRazorpaySubscription } from "@/lib/razorpay/subscription";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const razorpayKey =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID;
  if (!razorpayKey) {
    return NextResponse.json(
      { error: "Razorpay is not configured" },
      { status: 500 }
    );
  }

  const result = await createRazorpaySubscription({
    restaurantId: restaurant.id,
    email: user.email,
    name: restaurant.name,
  });

  if (!result.subscriptionId) {
    return NextResponse.json(
      { error: result.error || "Failed to create subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    subscriptionId: result.subscriptionId,
    key: razorpayKey,
  });
}
