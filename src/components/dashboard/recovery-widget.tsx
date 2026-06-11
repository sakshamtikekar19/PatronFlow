import Link from "next/link";
import { HeartHandshake, ArrowRight } from "lucide-react";
import type { RecoveryAnalytics } from "@/types";

export function RecoveryWidget({
  analytics,
}: {
  analytics: RecoveryAnalytics;
}) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-foreground">
            Guest Recovery Performance
          </h3>
        </div>
        <Link
          href="/recovery"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {analytics.recoveryRate}%
        </span>
        <span className="mb-1 text-sm text-muted-foreground">recovery rate</span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-muted py-3">
          <p className="text-lg font-semibold text-foreground">
            {analytics.recovered}
          </p>
          <p className="text-xs text-muted-foreground">Recovered</p>
        </div>
        <div className="rounded-xl bg-muted py-3">
          <p className="text-lg font-semibold text-foreground">
            {analytics.openCases}
          </p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
        <div className="rounded-xl bg-muted py-3">
          <p className="text-lg font-semibold text-foreground">
            {analytics.totalNegative}
          </p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>
    </div>
  );
}
