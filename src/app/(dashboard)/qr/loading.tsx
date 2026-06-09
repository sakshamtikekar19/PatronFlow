import { Skeleton } from "@/components/ui/skeleton";

export default function QrLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
