import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-12 w-full max-w-2xl rounded-full" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}
