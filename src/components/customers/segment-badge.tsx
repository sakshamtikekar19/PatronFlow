import { cn } from "@/lib/utils";
import type { CustomerSegment } from "@/types";

const STYLES: Record<CustomerSegment, string> = {
  VIP: "bg-amber-50 text-amber-700",
  Regular: "bg-blue-50 text-blue-700",
  New: "bg-emerald-50 text-emerald-700",
  "At Risk": "bg-red-50 text-red-600",
};

export function SegmentBadge({
  segment,
  className,
}: {
  segment: CustomerSegment;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[segment],
        className
      )}
    >
      {segment}
    </span>
  );
}
