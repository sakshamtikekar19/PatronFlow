import {
  AlertTriangle,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import type { RestaurantInsights, TrendComparison } from "@/types";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
}

function InsightCard({ icon, label, value, hint, tone = "neutral" }: InsightCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 text-neutral-400">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "positive" && "bg-emerald-50 text-emerald-600",
            tone === "negative" && "bg-red-50 text-red-600",
            tone === "neutral" && "bg-neutral-100 text-neutral-500"
          )}
        >
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold text-neutral-900">{value}</p>
      {hint && <p className="mt-0.5 text-sm text-neutral-500">{hint}</p>}
    </div>
  );
}

function TrendCard({
  icon,
  label,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  trend: TrendComparison;
}) {
  const up = trend.changePercent >= 0;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 text-neutral-400">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {label}
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-2xl font-semibold text-neutral-900">{trend.current}</p>
        <span
          className={cn(
            "mb-1 flex items-center gap-0.5 text-xs font-medium",
            up ? "text-emerald-600" : "text-red-600"
          )}
        >
          {up ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {Math.abs(trend.changePercent)}%
        </span>
      </div>
      <p className="mt-0.5 text-sm text-neutral-500">
        vs {trend.previous} in the prior period
      </p>
    </div>
  );
}

export function InsightsSection({ insights }: { insights: RestaurantInsights }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">
        Restaurant Insights
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Most Common Complaint"
          tone="negative"
          value={insights.mostCommonComplaint?.category ?? "None yet"}
          hint={
            insights.mostCommonComplaint
              ? `${insights.mostCommonComplaint.count} low ratings`
              : "No negative feedback"
          }
        />
        <InsightCard
          icon={<ThumbsUp className="h-4 w-4" />}
          label="Top Positive Topic"
          tone="positive"
          value={insights.mostMentionedPositive?.category ?? "None yet"}
          hint={
            insights.mostMentionedPositive
              ? `${insights.mostMentionedPositive.count} happy guests`
              : "No positive feedback"
          }
        />
        <InsightCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Highest Rated Category"
          tone="positive"
          value={insights.highestRatedCategory?.category ?? "None yet"}
          hint={
            insights.highestRatedCategory
              ? `${insights.highestRatedCategory.average} avg rating`
              : undefined
          }
        />
        <InsightCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Lowest Rated Category"
          tone="negative"
          value={insights.lowestRatedCategory?.category ?? "None yet"}
          hint={
            insights.lowestRatedCategory
              ? `${insights.lowestRatedCategory.average} avg rating`
              : undefined
          }
        />
        <TrendCard
          icon={<CalendarDays className="h-4 w-4" />}
          label="Weekly Feedback"
          trend={insights.weeklyFeedback}
        />
        <TrendCard
          icon={<CalendarRange className="h-4 w-4" />}
          label="Monthly Feedback"
          trend={insights.monthlyFeedback}
        />
      </div>
    </div>
  );
}
