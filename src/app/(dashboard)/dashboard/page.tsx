import { Suspense } from "react";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { RecentFeedbackTable } from "@/components/dashboard/recent-feedback-table";
import { InsightsSection } from "@/components/dashboard/insights-section";
import { CustomerInsightsSection } from "@/components/dashboard/customer-insights-section";
import { ReviewFunnel } from "@/components/dashboard/review-funnel";
import { RecoveryWidget } from "@/components/dashboard/recovery-widget";
import { UpcomingEventsWidget } from "@/components/dashboard/upcoming-events-widget";
import { FeedbackTrendChart } from "@/components/charts/feedback-trend-chart";
import { RatingDistributionChart } from "@/components/charts/rating-distribution-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import {
  getDashboardStats,
  getRecentFeedback,
  getFeedbackTrend,
  getRatingDistribution,
} from "@/lib/queries/dashboard";
import { getRestaurantInsights, getReviewFunnel } from "@/lib/queries/insights";
import { getCustomerInsights } from "@/lib/queries/customer-insights";
import { getVisitMetrics } from "@/lib/queries/visits";
import { getRecoveryAnalytics } from "@/lib/queries/recovery";
import { getUpcomingEvents } from "@/lib/queries/events";
import { BRAND } from "@/config/branding";
import { redirect } from "next/navigation";

interface DashboardPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { search } = await searchParams;
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  const [
    stats,
    recentFeedback,
    trend,
    distribution,
    insights,
    funnel,
    customerInsights,
    visitMetrics,
    recoveryAnalytics,
    upcomingEvents,
  ] = await Promise.all([
    getDashboardStats(restaurant.id),
    getRecentFeedback(restaurant.id, search),
    getFeedbackTrend(restaurant.id),
    getRatingDistribution(restaurant.id),
    getRestaurantInsights(restaurant.id),
    getReviewFunnel(restaurant.id),
    getCustomerInsights(restaurant.id),
    getVisitMetrics(restaurant.id),
    getRecoveryAnalytics(restaurant.id),
    getUpcomingEvents(restaurant.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Welcome back to {BRAND.name}, {restaurant.name}
        </h1>
        <p className="text-neutral-500">
          Track feedback, build customer relationships, and grow repeat
          business.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-12 w-full max-w-2xl mx-auto rounded-full" />}>
        <DashboardSearch initialSearch={search} />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Average Rating" value={stats.averageRating || "—"} icon="⭐" />
        <StatCard title="Total Feedback" value={stats.totalFeedback} icon="📝" />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon="👥" />
        <StatCard
          title="Positive Feedback %"
          value={`${stats.positiveFeedbackPercent}%`}
          icon="📈"
        />
        <StatCard
          title="Review Conversion"
          value={`${funnel.conversionRate}%`}
          icon="🔗"
        />
      </div>

      <InsightsSection insights={insights} />

      <CustomerInsightsSection insights={customerInsights} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Repeat Customers"
          value={visitMetrics.repeatCustomers}
          icon="🔁"
        />
        <StatCard
          title="Repeat Rate"
          value={`${visitMetrics.repeatRate}%`}
          icon="📊"
        />
        <StatCard
          title="Avg Visits / Customer"
          value={visitMetrics.averageVisitsPerCustomer || "—"}
          icon="👣"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecoveryWidget analytics={recoveryAnalytics} />
        <UpcomingEventsWidget events={upcomingEvents} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReviewFunnel funnel={funnel} />
        <ChartCard title="Rating Distribution" description="All time">
          <RatingDistributionChart data={distribution} />
        </ChartCard>
      </div>

      <ChartCard title="Feedback Trend" description="Last 30 days">
        <FeedbackTrendChart data={trend} />
      </ChartCard>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          Recent Feedback
        </h2>
        <RecentFeedbackTable feedback={recentFeedback} />
      </div>
    </div>
  );
}
