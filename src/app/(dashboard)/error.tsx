"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-neutral-900">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-neutral-500">
        We hit an unexpected error loading this page. You can try again, or head
        back to your dashboard.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-neutral-400">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={reset}
          className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
        >
          Try again
        </Button>
        <Button
          variant="outline"
          render={<Link href="/dashboard" />}
          className="rounded-xl border-neutral-200"
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
