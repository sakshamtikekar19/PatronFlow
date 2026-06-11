import Image from "next/image";
import { notFound } from "next/navigation";
import { RsvpForm } from "@/components/events/rsvp-form";
import { getPublicEvent } from "@/lib/queries/events";
import { BRAND } from "@/config/branding";

interface PublicEventPageProps {
  params: Promise<{ eventSlug: string }>;
}

export default async function PublicEventPage({
  params,
}: PublicEventPageProps) {
  const { eventSlug } = await params;

  const event = await getPublicEvent(eventSlug);
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8">
        <RsvpForm
          eventId={event.id}
          title={event.title}
          description={event.description}
          eventDate={event.event_date}
          coverImage={event.cover_image}
          restaurantName={event.restaurant.name}
          restaurantLogo={event.restaurant.logo}
        />
      </div>
      <div className="mt-6 flex flex-col items-center gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-400">
          Powered by
        </span>
        <Image
          src="/patronflowlogo.png"
          alt={BRAND.name}
          width={1297}
          height={375}
          className="h-6 w-auto opacity-80"
        />
      </div>
    </div>
  );
}
