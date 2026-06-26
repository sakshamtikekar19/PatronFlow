import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { createRazorpaySubscription } from "@/lib/razorpay/subscription";
import {
  getCountryFromHeaders,
  resolveSubscriptionCurrency,
} from "@/lib/billing/subscription-currency";

export async function POST(request: Request) {
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

  const countryCode = getCountryFromHeaders(request.headers);
  const currency = resolveSubscriptionCurrency(countryCode);

  const result = await createRazorpaySubscription({
    restaurantId: restaurant.id,
    email: user.email,
    name: restaurant.name,
    currency,
  });

  if (!result.subscriptionId) {
    const message =
      result.error ||
      "We couldn't start your subscription. Please try again or contact support.";
    console.error("Razorpay checkout failed:", {
      currency,
      countryCode,
      restaurantId: restaurant.id,
      error: result.error,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    subscriptionId: result.subscriptionId,
    key: razorpayKey,
    currency,
  });
}
