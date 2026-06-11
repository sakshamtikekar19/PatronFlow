import Image from "next/image";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review/review-form";
import { getRestaurantBySlugOrId } from "@/lib/queries/restaurant";
import { BRAND } from "@/config/branding";

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string; source?: string }>;
}

export default async function ReviewPage({
  params,
  searchParams,
}: ReviewPageProps) {
  const { slug } = await params;
  const { table, source } = await searchParams;

  const restaurant = await getRestaurantBySlugOrId(slug);
  if (!restaurant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8">
        <ReviewForm
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          restaurantLogo={restaurant.logo}
          tableName={table}
          source={source}
        />
      </div>
      <div className="mt-6 flex flex-col items-center gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-400">
          Powered by
        </span>
        <Image
          src="/patronflowlogo.png"
          alt={BRAND.name}
          width={1297}
          height={375}
          className="h-6 w-auto opacity-80"
        />
      </div>
    </div>
  );
}
