import { notFound } from "next/navigation";
import { RsvpForm } from "@/components/events/rsvp-form";
import { getPublicEvent } from "@/lib/queries/events";

interface PublicEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function PublicEventPage({
  params,
}: PublicEventPageProps) {
  const { eventId } = await params;

  const event = await getPublicEvent(eventId);
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8">
        <RsvpForm
          eventId={event.id}
          title={event.title}
          description={event.description}
          eventDate={event.event_date}
          restaurantName={event.restaurant.name}
          restaurantLogo={event.restaurant.logo}
        />
      </div>
    </div>
  );
}
