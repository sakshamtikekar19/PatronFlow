import { NextResponse } from "next/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getEventForOwner, getEventRsvps } from "@/lib/queries/events";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await getEventForOwner(restaurant.id, eventId);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rsvps = await getEventRsvps(eventId);
  return NextResponse.json(rsvps);
}
