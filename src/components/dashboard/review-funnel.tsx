import { cn } from "@/lib/utils";
import type { ReviewFunnel as ReviewFunnelData } from "@/types";

interface FunnelStepProps {
  label: string;
  value: number;
  total: number;
  tone: "neutral" | "positive" | "accent";
}

function FunnelStep({ label, value, total, tone }: FunnelStepProps) {
  const width = total > 0 ? Math.max((value / total) * 100, value > 0 ? 8 : 0) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-9 w-full overflow-hidden rounded-xl bg-muted">
        <div
          className={cn(
            "flex h-full items-center rounded-xl transition-all",
            tone === "neutral" && "bg-foreground",
            tone === "positive" && "bg-emerald-500",
            tone === "accent" && "bg-orange-400"
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function ReviewFunnel({ funnel }: { funnel: ReviewFunnelData }) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">Review Funnel</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-semibold text-foreground">
            {funnel.conversionRate}%
          </span>
          <span className="text-sm text-muted-foreground">conversion</span>
        </div>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Google review clicks ÷ positive feedback
      </p>

      <div className="mt-5 space-y-4">
        <FunnelStep
          label="Feedback submitted"
          value={funnel.totalFeedback}
          total={funnel.totalFeedback}
          tone="neutral"
        />
        <FunnelStep
          label="Positive feedback"
          value={funnel.positiveFeedback}
          total={funnel.totalFeedback}
          tone="positive"
        />
        <FunnelStep
          label="Google review clicks"
          value={funnel.reviewClicks}
          total={funnel.totalFeedback}
          tone="accent"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div className="rounded-xl bg-emerald-50 px-4 py-3">
          <p className="text-xs font-medium text-emerald-700">Positive</p>
          <p className="text-lg font-semibold text-emerald-700">
            {funnel.positivePercent}%
          </p>
        </div>
        <div className="rounded-xl bg-red-50 px-4 py-3">
          <p className="text-xs font-medium text-red-600">Negative</p>
          <p className="text-lg font-semibold text-red-600">
            {funnel.negativePercent}%
          </p>
        </div>
      </div>
    </div>
  );
}
