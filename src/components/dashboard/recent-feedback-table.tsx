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
import { formatDateTime } from "@/lib/utils";
import type { FeedbackWithCustomer } from "@/types";

interface RecentFeedbackTableProps {
  feedback: FeedbackWithCustomer[];
}

export function RecentFeedbackTable({ feedback }: RecentFeedbackTableProps) {
  if (feedback.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-500">
        No feedback yet. Share your review link to start collecting feedback.
      </p>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-100 hover:bg-transparent">
              <TableHead className="text-neutral-500 font-medium">Customer</TableHead>
              <TableHead className="text-neutral-500 font-medium">Rating</TableHead>
              <TableHead className="text-neutral-500 font-medium">Category</TableHead>
              <TableHead className="text-neutral-500 font-medium">Comment</TableHead>
              <TableHead className="text-neutral-500 font-medium">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item.id} className="border-neutral-100">
                <TableCell className="font-medium text-neutral-900">
                  {item.customer?.name ?? "Unknown"}
                </TableCell>
                <TableCell>
                  <RatingStars rating={item.rating} size="sm" />
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    {item.category}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs truncate text-neutral-600">
                  {item.comment ?? "—"}
                </TableCell>
                <TableCell className="text-neutral-500 text-sm">
                  {formatDateTime(item.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-neutral-900">
                {item.customer?.name ?? "Unknown"}
              </span>
              <RatingStars rating={item.rating} size="sm" />
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600">
                {item.category}
              </span>
              <span>{formatDateTime(item.created_at)}</span>
            </div>
            {item.comment && (
              <p className="text-sm text-neutral-600 line-clamp-2">{item.comment}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
