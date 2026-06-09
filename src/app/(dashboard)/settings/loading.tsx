import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex gap-2 md:w-48 md:flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-xl md:w-full" />
          ))}
        </div>
        <Skeleton className="h-72 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}
