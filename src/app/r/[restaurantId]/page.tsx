import { ReviewForm } from "@/components/review/review-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

interface ReviewPageProps {
  params: Promise<{ restaurantId: string }>;
  searchParams: Promise<{ table?: string; source?: string }>;
}

export default async function ReviewPage({
  params,
  searchParams,
}: ReviewPageProps) {
  const { restaurantId } = await params;
  const { table, source } = await searchParams;

  let restaurant;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name, logo")
      .eq("id", restaurantId)
      .single();

    if (error || !data) {
      notFound();
    }
    restaurant = data;
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8">
        <ReviewForm
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          restaurantLogo={restaurant.logo}
          tableName={table}
          source={source}
        />
      </div>
    </div>
  );
}
