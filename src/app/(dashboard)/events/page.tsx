import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
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
      <PageHeader
        title="Events"
        description="Create events, share a public RSVP page, and track attendance."
      />
      <EventsPageClient events={events} analytics={analytics} />
    </div>
  );
}
