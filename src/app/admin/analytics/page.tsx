import { PageHeader } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { AdminGrowthChart } from "@/components/charts/admin-growth-chart";
import { getAdminAnalytics } from "@/lib/queries/admin";

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Platform Analytics"
        description="Growth trends across restaurants, feedback, customers, and review clicks."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Restaurant Growth" description="Last 30 days (cumulative)">
          <AdminGrowthChart
            data={analytics.restaurantGrowth}
            label="Restaurants"
            cumulative
          />
        </ChartCard>
        <ChartCard title="Feedback Growth" description="Last 30 days">
          <AdminGrowthChart
            data={analytics.feedbackGrowth}
            label="Feedback"
          />
        </ChartCard>
        <ChartCard title="Customer Growth" description="Last 30 days (cumulative)">
          <AdminGrowthChart
            data={analytics.customerGrowth}
            label="Customers"
            cumulative
          />
        </ChartCard>
        <ChartCard title="Review Click Growth" description="Last 30 days">
          <AdminGrowthChart
            data={analytics.reviewClickGrowth}
            label="Review clicks"
          />
        </ChartCard>
      </div>
    </div>
  );
}
