import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "h-full rounded-2xl border-0 bg-card shadow-card transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
