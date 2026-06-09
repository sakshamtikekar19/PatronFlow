import { NextResponse } from "next/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getCustomerLoyaltySummary } from "@/lib/queries/loyalty";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getCustomerLoyaltySummary(restaurant.id, customerId);
  return NextResponse.json(summary);
}
