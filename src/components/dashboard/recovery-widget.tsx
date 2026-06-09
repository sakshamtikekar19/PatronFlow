import Link from "next/link";
import { HeartHandshake, ArrowRight } from "lucide-react";
import type { RecoveryAnalytics } from "@/types";

export function RecoveryWidget({
  analytics,
}: {
  analytics: RecoveryAnalytics;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-neutral-900">
            Guest Recovery Performance
          </h3>
        </div>
        <Link
          href="/recovery"
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900"
        >
          View
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight text-neutral-900">
          {analytics.recoveryRate}%
        </span>
        <span className="mb-1 text-sm text-neutral-500">recovery rate</span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-neutral-50 py-3">
          <p className="text-lg font-semibold text-neutral-900">
            {analytics.recovered}
          </p>
          <p className="text-xs text-neutral-500">Recovered</p>
        </div>
        <div className="rounded-xl bg-neutral-50 py-3">
          <p className="text-lg font-semibold text-neutral-900">
            {analytics.openCases}
          </p>
          <p className="text-xs text-neutral-500">Open</p>
        </div>
        <div className="rounded-xl bg-neutral-50 py-3">
          <p className="text-lg font-semibold text-neutral-900">
            {analytics.totalNegative}
          </p>
          <p className="text-xs text-neutral-500">Total</p>
        </div>
      </div>
    </div>
  );
}
