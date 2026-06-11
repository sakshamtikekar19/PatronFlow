import {
  AlertTriangle,
  Heart,
  TrendingUp,
  TrendingDown,
  Armchair,
  Crown,
} from "lucide-react";
import type { CustomerInsights } from "@/types";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
}

function InsightCard({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
}: InsightCardProps) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "positive" && "bg-emerald-50 text-emerald-600",
            tone === "negative" && "bg-red-50 text-red-600",
            tone === "neutral" && "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function CustomerInsightsSection({
  insights,
}: {
  insights: CustomerInsights;
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Customer Insights
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightCard
          icon={<Heart className="h-4 w-4" />}
          label="Most Loved Category"
          tone="positive"
          value={insights.mostLovedCategory?.category ?? "None yet"}
          hint={
            insights.mostLovedCategory
              ? `${insights.mostLovedCategory.count} happy guests`
              : "No positive feedback"
          }
        />
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
          icon={<Crown className="h-4 w-4" />}
          label="Most Active Customer"
          value={insights.mostActiveCustomer?.name ?? "None yet"}
          hint={
            insights.mostActiveCustomer
              ? `${insights.mostActiveCustomer.visits} visits`
              : "No visits recorded"
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
        <InsightCard
          icon={<Armchair className="h-4 w-4" />}
          label="Best / Worst Table"
          value={
            insights.bestPerformingTable
              ? insights.bestPerformingTable.tableName
              : "Not enough data"
          }
          hint={
            insights.bestPerformingTable && insights.worstPerformingTable
              ? `Best ${insights.bestPerformingTable.average}★ · Worst ${insights.worstPerformingTable.tableName} ${insights.worstPerformingTable.average}★`
              : "Add table QRs to compare"
          }
        />
      </div>
    </div>
  );
}
