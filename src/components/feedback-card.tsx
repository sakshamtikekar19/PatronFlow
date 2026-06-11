"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/rating-stars";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/utils";
import { markFeedbackResolved } from "@/lib/actions/feedback";
import type { FeedbackWithCustomer } from "@/types";
import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeedbackCardProps {
  feedback: FeedbackWithCustomer;
  showActions?: boolean;
  className?: string;
}

export function FeedbackCard({
  feedback,
  showActions = true,
  className,
}: FeedbackCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleResolve = () => {
    startTransition(async () => {
      await markFeedbackResolved(feedback.id);
      toast.success("Feedback marked as resolved");
    });
  };

  return (
    <Card
      className={cn(
        "border-0 bg-card shadow-card rounded-2xl",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {feedback.customer?.name ?? "Unknown"}
              </span>
              <RatingStars rating={feedback.rating} size="sm" />
              <StatusBadge status={feedback.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {feedback.category}
              </span>
              <span>{formatDateTime(feedback.created_at)}</span>
            </div>
            {feedback.comment && (
              <p className="text-sm text-foreground leading-relaxed">
                {feedback.comment}
              </p>
            )}
          </div>
          {showActions && feedback.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResolve}
              disabled={isPending}
              className="shrink-0 rounded-full border-border"
            >
              {isPending ? "Resolving..." : "Mark Resolved"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
