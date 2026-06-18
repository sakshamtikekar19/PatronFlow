"use client";

import { AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTrialDaysRemaining } from "@/lib/billing/trial";
import type { SubscriptionStatus as SubscriptionStatusType } from "@/types/database.types";

interface SubscriptionStatusProps {
  status: SubscriptionStatusType;
  trialDaysRemaining: number | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function SubscriptionStatus({
  status,
  trialDaysRemaining,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: SubscriptionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "trialing":
        return {
          icon: Clock,
          label: trialDaysRemaining
            ? formatTrialDaysRemaining(trialDaysRemaining)
            : "Trial",
          color: "text-blue-600 bg-blue-50 border-blue-200",
          iconColor: "text-blue-500",
        };
      case "active":
        return {
          icon: CheckCircle,
          label: cancelAtPeriodEnd ? "Cancels at period end" : "Active",
          color: cancelAtPeriodEnd
            ? "text-yellow-600 bg-yellow-50 border-yellow-200"
            : "text-green-600 bg-green-50 border-green-200",
          iconColor: cancelAtPeriodEnd ? "text-yellow-500" : "text-green-500",
        };
      case "past_due":
        return {
          icon: AlertCircle,
          label: "Payment past due",
          color: "text-orange-600 bg-orange-50 border-orange-200",
          iconColor: "text-orange-500",
        };
      case "cancelled":
      case "expired":
        return {
          icon: CreditCard,
          label: status === "cancelled" ? "Cancelled" : "Expired",
          color: "text-red-600 bg-red-50 border-red-200",
          iconColor: "text-red-500",
        };
      default:
        return {
          icon: CreditCard,
          label: "Unknown",
          color: "text-muted-foreground bg-muted border-border",
          iconColor: "text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium",
        config.color
      )}
    >
      <Icon className={cn("h-4 w-4", config.iconColor)} />
      <span>{config.label}</span>
    </div>
  );
}
