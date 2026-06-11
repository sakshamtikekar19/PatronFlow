import { FeedbackPageClient } from "@/components/feedback/feedback-page-client";
import { ExportButton } from "@/components/export-button";
import { PageHeader } from "@/components/page-header";
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
      <PageHeader
        title="Feedback"
        description="Review and manage all customer feedback submissions."
        actions={
          <ExportButton endpoint="/api/export/feedback" label="Export Feedback" />
        }
      />
      <FeedbackPageClient initialFeedback={feedback} />
    </div>
  );
}
