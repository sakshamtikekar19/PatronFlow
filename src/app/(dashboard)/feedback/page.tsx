import { FeedbackPageClient } from "@/components/feedback/feedback-page-client";
import { ExportButton } from "@/components/export-button";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getAllFeedback } from "@/lib/queries/feedback";
import { redirect } from "next/navigation";

export default async function FeedbackPage() {
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  const feedback = await getAllFeedback(restaurant.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Feedback</h1>
          <p className="mt-1 text-neutral-500">
            Review and manage all customer feedback submissions.
          </p>
        </div>
        <ExportButton endpoint="/api/export/feedback" label="Export Feedback" />
      </div>
      <FeedbackPageClient initialFeedback={feedback} />
    </div>
  );
}
