import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeedbackStatus } from "@/types";

interface StatusBadgeProps {
  status: FeedbackStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "resolved"
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
          : "bg-amber-50 text-amber-700 hover:bg-amber-50",
        className
      )}
    >
      {status === "resolved" ? "Resolved" : "Pending"}
    </Badge>
  );
}
