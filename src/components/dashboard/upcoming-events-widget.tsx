import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { EventWithStats } from "@/types";

export function UpcomingEventsWidget({
  events,
}: {
  events: EventWithStats[];
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CalendarDays className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-neutral-900">
            Upcoming Events
          </h3>
        </div>
        <Link
          href="/events"
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900"
        >
          Manage
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="mt-5 text-sm text-neutral-500">
          No upcoming events.{" "}
          <Link href="/events" className="font-medium text-neutral-900 underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {e.title}
                </p>
                <p className="text-xs text-neutral-500">
                  {e.event_date ? formatDate(e.event_date) : "Date TBD"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-700">
                {e.rsvpCount} RSVP{e.rsvpCount === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
