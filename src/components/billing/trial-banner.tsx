"use client";

import Link from "next/link";
import { Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTrialDaysRemaining } from "@/lib/billing/trial";

interface TrialBannerProps {
  daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const isEndingSoon = daysRemaining <= 3;

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ${
        isEndingSoon
          ? "bg-orange-50 text-orange-800"
          : "bg-blue-50 text-blue-800"
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          {formatTrialDaysRemaining(daysRemaining)}
        </span>
        {isEndingSoon && (
          <span className="text-sm">
            — Upgrade now to keep using PatronFlow
          </span>
        )}
      </div>
      <Link href="/billing">
        <Button size="sm" variant={isEndingSoon ? "default" : "outline"}>
          <Zap className="mr-1.5 h-3.5 w-3.5" />
          Upgrade
        </Button>
      </Link>
    </div>
  );
}
