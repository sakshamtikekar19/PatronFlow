import { redirect } from "next/navigation";
import { EventsPageClient } from "@/components/events/events-page-client";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getEvents, getEventAnalytics } from "@/lib/queries/events";

export default async function EventsPage() {
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  const [events, analytics] = await Promise.all([
    getEvents(restaurant.id),
    getEventAnalytics(restaurant.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Events</h1>
        <p className="mt-1 text-neutral-500">
          Create events, share a public RSVP page, and track attendance.
        </p>
      </div>
      <EventsPageClient events={events} analytics={analytics} />
    </div>
  );
}
