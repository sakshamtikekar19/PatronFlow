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
import { ExternalLink } from "lucide-react";

interface ReviewFormProps {
  restaurantId: string;
  restaurantName: string;
  restaurantLogo?: string | null;
  tableName?: string;
  source?: string;
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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("Other");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<PublicFeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phone || rating === 0) {
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
          name,
          phone,
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
            {response.showGoogleReview ? "🎉" : "🙏"}
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-neutral-900">
            {response.message}
          </h2>
          {response.showGoogleReview ? (
            <p className="text-sm text-neutral-500">
              We&apos;d love if you could share your experience on Google too!
            </p>
          ) : (
            <p className="text-sm text-neutral-500">
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
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <h1 className="text-2xl font-semibold text-neutral-900">
          {restaurantName}
        </h1>
        <p className="text-sm text-neutral-500">
          We&apos;d love to hear about your experience
        </p>
        {tableName && (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            {tableName}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Your Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
          className="h-12 rounded-xl border-neutral-200 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          required
          className="h-12 rounded-xl border-neutral-200 bg-white"
        />
      </div>

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
          onValueChange={(val) => val && setCategory(val as FeedbackCategory)}
        >
          <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white">
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
          className="rounded-xl border-neutral-200 bg-white resize-none"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}
