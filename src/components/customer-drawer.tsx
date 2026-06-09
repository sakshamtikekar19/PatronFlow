"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "@/components/rating-stars";
import { StatusBadge } from "@/components/status-badge";
import { SegmentBadge } from "@/components/customers/segment-badge";
import { ExternalLink, Gift } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import type {
  SegmentedCustomer,
  FeedbackWithCustomer,
  CustomerLoyaltySummary,
} from "@/types";

interface CustomerDrawerProps {
  customer: SegmentedCustomer | null;
  feedback: FeedbackWithCustomer[];
  loyalty?: CustomerLoyaltySummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDrawer({
  customer,
  feedback,
  loyalty,
  open,
  onOpenChange,
}: CustomerDrawerProps) {
  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-neutral-900">
            {customer.name}
            <SegmentBadge segment={customer.segment} />
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone</span>
                <span className="font-medium text-neutral-900">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Email</span>
                <span className="font-medium text-neutral-900">
                  {customer.email ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Member since</span>
                <span className="font-medium text-neutral-900">
                  {formatDate(customer.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
              <p className="text-2xl font-semibold text-neutral-900">
                {customer.visits}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Visits</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
              <p className="text-2xl font-semibold text-neutral-900">
                {customer.average_rating || "—"}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Avg Rating</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
              <p className="text-sm font-semibold text-neutral-900">
                {customer.last_visit ? formatDate(customer.last_visit) : "—"}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Last Visit</p>
            </div>
          </div>

          {loyalty && (
            <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Gift className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Loyalty
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-semibold text-neutral-900">
                    {loyalty.totalPoints}
                  </p>
                  <p className="text-xs text-neutral-500">Balance</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-neutral-900">
                    {loyalty.pointsEarned}
                  </p>
                  <p className="text-xs text-neutral-500">Earned</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-neutral-900">
                    {loyalty.pointsRedeemed}
                  </p>
                  <p className="text-xs text-neutral-500">Redeemed</p>
                </div>
              </div>
              {loyalty.eligibleRewards.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Eligible rewards
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {loyalty.eligibleRewards.map((r) => (
                      <span
                        key={r.id}
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                      >
                        {r.reward_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator className="bg-neutral-200" />

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Timeline
            </h3>
            {feedback.length === 0 ? (
              <p className="text-sm text-neutral-500">No feedback yet.</p>
            ) : (
              <div className="space-y-3">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <RatingStars rating={item.rating} size="sm" />
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-neutral-500 mb-1">
                      {item.category}
                      {item.table_name ? ` · ${item.table_name}` : ""} ·{" "}
                      {formatDateTime(item.created_at)}
                    </p>
                    {item.comment && (
                      <p className="text-sm text-neutral-700">{item.comment}</p>
                    )}
                    {item.review_clicked && (
                      <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <ExternalLink className="h-3 w-3" />
                        Left a Google review
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
