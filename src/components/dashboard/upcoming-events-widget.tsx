import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { EventWithStats } from "@/types";

export function UpcomingEventsWidget({
  events,
}: {
  events: EventWithStats[];
}) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <CalendarDays className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming Events
          </h3>
        </div>
        <Link
          href="/events"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Manage
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="No upcoming events"
          description="Create an event to start collecting RSVPs from your guests."
          className="mt-4 border-0 bg-transparent py-8 shadow-none"
          action={
            <Button size="sm" render={<Link href="/events" />}>
              Create event
            </Button>
          }
        />
      ) : (
        <ul className="mt-4 space-y-2">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {e.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {e.event_date ? formatDate(e.event_date) : "Date TBD"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                {e.rsvpCount} RSVP{e.rsvpCount === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
