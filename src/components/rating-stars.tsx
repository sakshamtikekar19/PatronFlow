import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function RatingStars({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= rating;

        const star = (
          <Star
            className={cn(
              sizeMap[size],
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-200 text-neutral-200"
            )}
          />
        );

        // Render a button only when interactive so the component can be safely
        // nested inside other clickable elements (e.g. customer card buttons).
        if (!interactive) {
          return (
            <span key={starValue} className="cursor-default">
              {star}
            </span>
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue)}
            className="cursor-pointer transition-transform hover:scale-110"
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
