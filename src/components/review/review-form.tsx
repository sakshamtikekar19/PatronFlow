"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/rating-stars";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FEEDBACK_CATEGORIES } from "@/types";
import type { FeedbackCategory, PublicFeedbackResponse } from "@/types";
import Image from "next/image";
import { ExternalLink, Gift } from "lucide-react";

interface ReviewFormProps {
  restaurantId: string;
  restaurantName: string;
  restaurantLogo?: string | null;
  tableName?: string;
  source?: string;
}

interface GuestLookupResponse {
  found: boolean;
  name?: string;
  message?: string;
}

export function ReviewForm({
  restaurantId,
  restaurantName,
  restaurantLogo,
  tableName,
  source,
}: ReviewFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [rating, setRating] = useState(0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("Other");
  const [hasLookedUpGuest, setHasLookedUpGuest] = useState(false);
  const [returningGuestName, setReturningGuestName] = useState<string | null>(
    null
  );
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<PublicFeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isReturningGuest = returningGuestName !== null;

  const lookupGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError("Please enter your phone number to continue.");
      return;
    }

    setIsLookingUp(true);

    try {
      const res = await fetch("/api/feedback/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, phone }),
      });
      const data: GuestLookupResponse = await res.json();

      if (!res.ok && data.message) {
        setError(data.message);
        return;
      }

      if (data.found && data.name) {
        setName(data.name);
        setReturningGuestName(data.name);
      } else {
        setReturningGuestName(null);
      }

      setHasLookedUpGuest(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const changePhone = () => {
    setHasLookedUpGuest(false);
    setReturningGuestName(null);
    setName("");
    setBirthday("");
    setRating(0);
    setComment("");
    setCategory("Other");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasLookedUpGuest) {
      setError("Please enter your phone number first.");
      return;
    }

    if (!phone || rating === 0 || (!isReturningGuest && (!name || !birthday))) {
      setError("Please fill in all required fields and select a rating.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          name: name || undefined,
          phone,
          birthday: birthday || undefined,
          rating,
          comment: comment || undefined,
          category,
          tableName: tableName || undefined,
          source: source || undefined,
        }),
      });

      const data: PublicFeedbackResponse = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setResponse(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewClick = () => {
    // Fire-and-forget: record that the guest clicked through to Google.
    if (response?.feedbackId) {
      fetch("/api/feedback/review-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: response.feedbackId }),
        keepalive: true,
      }).catch(() => {});
    }
  };

  if (response) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <span className="text-3xl">
            {response.showGoogleReview
              ? "🎉"
              : response.showLoyaltyNudge
              ? "🎁"
              : "🙏"}
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {response.message}
          </h2>
          {response.showGoogleReview ? (
            <p className="text-sm text-muted-foreground">
              We&apos;d love if you could share your experience on Google too!
            </p>
          ) : response.showLoyaltyNudge ? (
            <p className="text-sm text-muted-foreground">
              Every visit earns you rewards — keep coming back for exciting
              offers!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your feedback helps us serve you better.
            </p>
          )}
        </div>
        {response.showGoogleReview && response.googleReviewUrl && (
          <a
            href={response.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleReviewClick}
            className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-900 px-8 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Leave a Google Review
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        )}
        {response.showLoyaltyNudge && (
          <div className="mx-auto max-w-sm rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-left">
            <div className="flex items-center gap-2 text-amber-700">
              <Gift className="h-5 w-5" />
              <span className="text-sm font-semibold">Loyalty rewards</span>
            </div>
            {response.loyaltyReward ? (
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;re earning points with every visit! Reach{" "}
                <span className="font-semibold text-foreground">
                  {response.loyaltyReward.points} points
                </span>{" "}
                to unlock{" "}
                <span className="font-semibold text-foreground">
                  {response.loyaltyReward.name}
                </span>
                . Ask our staff to add your points today.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;re one of our regulars now! Ask our staff about loyalty
                points and exclusive offers on your next visit.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={hasLookedUpGuest ? handleSubmit : lookupGuest}
      className="space-y-6"
    >
      <div className="text-center space-y-3 mb-8">
        {restaurantLogo && (
          <Image
            src={restaurantLogo}
            alt={restaurantName}
            width={64}
            height={64}
            unoptimized
            className="mx-auto h-16 w-16 rounded-2xl object-cover"
          />
        )}
        <h1 className="text-2xl font-semibold text-foreground">
          {restaurantName}
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;d love to hear about your experience
        </p>
        {tableName && (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {tableName}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          required
          disabled={hasLookedUpGuest}
          className="h-12 rounded-xl border-border bg-card"
        />
        {hasLookedUpGuest && (
          <button
            type="button"
            onClick={changePhone}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Change phone number
          </button>
        )}
      </div>

      {hasLookedUpGuest && isReturningGuest && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Welcome back,{" "}
          <span className="font-semibold">{returningGuestName}</span>! Please
          rate today&apos;s visit.
        </div>
      )}

      {hasLookedUpGuest && !isReturningGuest && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Sharma"
              required
              className="h-12 rounded-xl border-border bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday *</Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={todayStr}
              required
              className="h-12 rounded-xl border-border bg-card"
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll surprise you with something special on your day.
            </p>
          </div>
        </>
      )}

      {hasLookedUpGuest && (
        <>
          <div className="space-y-3">
            <Label>Rating *</Label>
            <div className="flex justify-center">
              <RatingStars
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(val) =>
                val && setCategory(val as FeedbackCategory)
              }
            >
              <SelectTrigger className="h-12 rounded-xl border-border bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              className="rounded-xl border-border bg-card resize-none"
            />
          </div>
        </>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || isLookingUp}
        className="h-12 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
      >
        {!hasLookedUpGuest
          ? isLookingUp
            ? "Checking..."
            : "Continue"
          : isSubmitting
          ? "Submitting..."
          : "Submit Feedback"}
      </Button>
    </form>
  );
}
