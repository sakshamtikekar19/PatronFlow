"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/utils";

interface RsvpFormProps {
  eventId: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  restaurantName: string;
  restaurantLogo?: string | null;
}

export function RsvpForm({
  eventId,
  title,
  description,
  eventDate,
  restaurantName,
  restaurantLogo,
}: RsvpFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phone) {
      setError("Please enter your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email: email || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      setSuccess(data.message);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <span className="text-3xl">🎉</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-neutral-900">{success}</h2>
          <p className="text-sm text-neutral-500">
            We&apos;ve saved your spot for {title}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        {restaurantLogo ? (
          <Image
            src={restaurantLogo}
            alt={restaurantName}
            width={56}
            height={56}
            className="mx-auto h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl font-semibold text-neutral-700">
            {restaurantName.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm text-neutral-500">{restaurantName}</p>
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        </div>
        {eventDate && (
          <p className="flex items-center justify-center gap-1.5 text-sm text-neutral-600">
            <CalendarDays className="h-4 w-4" />
            {formatDateTime(eventDate)}
          </p>
        )}
        <p className="flex items-center justify-center gap-1.5 text-sm text-neutral-500">
          <MapPin className="h-4 w-4" />
          {restaurantName}
        </p>
      </div>

      {description && (
        <p className="rounded-2xl bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700">
          {description}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rsvp-name">Name</Label>
          <Input
            id="rsvp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rsvp-phone">Phone</Label>
          <Input
            id="rsvp-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rsvp-email">Email (optional)</Label>
          <Input
            id="rsvp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Reserving..." : "RSVP"}
        </Button>
      </form>
    </div>
  );
}
