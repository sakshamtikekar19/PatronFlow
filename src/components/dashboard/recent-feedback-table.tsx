"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RatingStars } from "@/components/rating-stars";
import { EmptyState } from "@/components/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { FeedbackWithCustomer } from "@/types";
import { MessageSquare } from "lucide-react";

interface RecentFeedbackTableProps {
  feedback: FeedbackWithCustomer[];
}

export function RecentFeedbackTable({ feedback }: RecentFeedbackTableProps) {
  if (feedback.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-6 w-6" />}
        title="No feedback yet"
        description="Share your review link to start collecting feedback from guests."
        className="py-12"
      />
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl bg-card shadow-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium text-muted-foreground">Customer</TableHead>
              <TableHead className="font-medium text-muted-foreground">Rating</TableHead>
              <TableHead className="font-medium text-muted-foreground">Category</TableHead>
              <TableHead className="font-medium text-muted-foreground">Comment</TableHead>
              <TableHead className="font-medium text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item.id} className="border-border">
                <TableCell className="font-medium text-foreground">
                  {item.customer?.name ?? "Unknown"}
                </TableCell>
                <TableCell>
                  <RatingStars rating={item.rating} size="sm" />
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {item.category}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {item.comment ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(item.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-card p-4 shadow-card"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-foreground">
                {item.customer?.name ?? "Unknown"}
              </span>
              <RatingStars rating={item.rating} size="sm" />
            </div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                {item.category}
              </span>
              <span>{formatDateTime(item.created_at)}</span>
            </div>
            {item.comment && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{item.comment}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
