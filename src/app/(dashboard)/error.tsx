"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold text-neutral-900">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-neutral-500">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button
        onClick={reset}
        className="mt-6 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
      >
        Try again
      </Button>
    </div>
  );
}
