"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Users,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/chart-card";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { EventGrowthChart } from "@/components/charts/event-growth-chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  setEventStatus,
  toggleRsvpAttendance,
} from "@/lib/actions/events";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type {
  EventWithStats,
  EventAnalytics,
  EventStatus,
  EventRsvp,
} from "@/types";
import { toast } from "sonner";

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  published: "bg-emerald-50 text-emerald-700",
  completed: "bg-blue-50 text-blue-700",
};

function toDateInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // datetime-local expects YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

interface EventsPageClientProps {
  events: EventWithStats[];
  analytics: EventAnalytics;
}

export function EventsPageClient({
  events,
  analytics,
}: EventsPageClientProps) {
  const [isPending, startTransition] = useTransition();

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // RSVP panel
  const [rsvpEvent, setRsvpEvent] = useState<EventWithStats | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setEventDate("");
    setCoverImage("");
    setFormOpen(true);
  };

  const openEdit = (e: EventWithStats) => {
    setEditingId(e.id);
    setTitle(e.title);
    setDescription(e.description ?? "");
    setEventDate(toDateInput(e.event_date));
    setCoverImage(e.cover_image ?? "");
    setFormOpen(true);
  };

  const submitForm = () => {
    startTransition(async () => {
      const payload = {
        title,
        description,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
        coverImage,
      };
      const res = editingId
        ? await updateEvent(editingId, payload)
        : await createEvent(payload);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(editingId ? "Event updated" : "Event created");
      setFormOpen(false);
    });
  };

  const changeStatus = (id: string, status: EventStatus) => {
    startTransition(async () => {
      const res = await setEventStatus(id, status);
      if (res.error) toast.error(res.error);
      else toast.success(`Event ${status}`);
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res.error) toast.error(res.error);
      else toast.success("Event deleted");
    });
  };

  const openRsvps = async (e: EventWithStats) => {
    setRsvpEvent(e);
    setRsvps([]);
    setRsvpLoading(true);
    try {
      const data = await fetch(`/api/events/${e.id}/rsvps`).then((r) =>
        r.json()
      );
      setRsvps(Array.isArray(data) ? data : []);
    } finally {
      setRsvpLoading(false);
    }
  };

  const toggleAttendance = (rsvp: EventRsvp) => {
    const next = !rsvp.attended;
    setRsvps((prev) =>
      prev.map((r) => (r.id === rsvp.id ? { ...r, attended: next } : r))
    );
    startTransition(async () => {
      const res = await toggleRsvpAttendance(rsvp.id, next);
      if (res.error) {
        toast.error(res.error);
        setRsvps((prev) =>
          prev.map((r) =>
            r.id === rsvp.id ? { ...r, attended: !next } : r
          )
        );
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={analytics.totalEvents} icon="📅" />
        <StatCard title="Total RSVPs" value={analytics.totalRsvps} icon="🙋" />
        <StatCard title="Upcoming" value={analytics.upcomingCount} icon="⏭️" />
        <StatCard
          title="Top Event"
          value={analytics.topEvent ? analytics.topEvent.rsvpCount : "—"}
          icon="🏆"
        />
      </div>

      <ChartCard title="Event Growth" description="RSVPs over the last 6 months">
        <EventGrowthChart data={analytics.growth} />
      </ChartCard>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">All Events</h2>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create event
          </Button>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="No events yet"
            description="Create your first event to start collecting RSVPs and filling tables."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Create event
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {events.map((e) => (
              <Card
                key={e.id}
                className="border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold text-neutral-900">
                          {e.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn("border-0 capitalize", STATUS_STYLES[e.status])}
                        >
                          {e.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">
                        {e.event_date
                          ? formatDate(e.event_date)
                          : "No date set"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(e)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {e.status === "draft" && (
                          <DropdownMenuItem
                            onClick={() => changeStatus(e.id, "published")}
                          >
                            Publish
                          </DropdownMenuItem>
                        )}
                        {e.status === "published" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => changeStatus(e.id, "draft")}
                            >
                              Unpublish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => changeStatus(e.id, "completed")}
                            >
                              Mark completed
                            </DropdownMenuItem>
                          </>
                        )}
                        {e.status === "completed" && (
                          <DropdownMenuItem
                            onClick={() => changeStatus(e.id, "published")}
                          >
                            Reopen
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => remove(e.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {e.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-neutral-600">
                      {e.description}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-neutral-50 py-2.5">
                      <p className="text-base font-semibold text-neutral-900">
                        {e.rsvpCount}
                      </p>
                      <p className="text-xs text-neutral-500">RSVPs</p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 py-2.5">
                      <p className="text-base font-semibold text-neutral-900">
                        {e.attendedCount}
                      </p>
                      <p className="text-xs text-neutral-500">Attended</p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 py-2.5">
                      <p className="text-base font-semibold text-neutral-900">
                        {e.conversionRate}%
                      </p>
                      <p className="text-xs text-neutral-500">Conversion</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRsvps(e)}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Manage RSVPs
                    </Button>
                    {e.status !== "draft" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        render={
                          <Link
                            href={`/events/${e.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View page
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit event" : "Create event"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this event."
                : "New events start as a draft. Publish when you're ready to take RSVPs."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Live Jazz Night"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-date">Date &amp; time</Label>
              <Input
                id="event-date"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-cover">Cover image URL (optional)</Label>
              <Input
                id="event-cover"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-desc">Description (optional)</Label>
              <Textarea
                id="event-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell guests what to expect."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={isPending}>
              {isPending ? "Saving..." : editingId ? "Save changes" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* RSVP management sheet */}
      <Sheet
        open={rsvpEvent !== null}
        onOpenChange={(open) => !open && setRsvpEvent(null)}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background">
          <SheetHeader>
            <SheetTitle>{rsvpEvent?.title}</SheetTitle>
            <SheetDescription>
              {rsvpEvent?.rsvpCount ?? 0} RSVPs · {rsvpEvent?.attendedCount ?? 0}{" "}
              attended
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-2 p-4">
            {rsvpLoading ? (
              <p className="text-sm text-neutral-500">Loading RSVPs…</p>
            ) : rsvps.length === 0 ? (
              <p className="text-sm text-neutral-500">No RSVPs yet.</p>
            ) : (
              rsvps.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900">
                      {r.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {r.phone}
                      {r.email ? ` · ${r.email}` : ""}
                    </p>
                  </div>
                  <Button
                    variant={r.attended ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAttendance(r)}
                  >
                    {r.attended ? "Attended" : "Mark attended"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
