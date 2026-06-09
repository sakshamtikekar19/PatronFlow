import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card
      className={cn(
        "border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] rounded-2xl",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-neutral-900">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-neutral-500">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
