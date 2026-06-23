import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { RestaurantAdminActions } from "@/components/admin/restaurant-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminRestaurantDetail } from "@/lib/queries/admin";
import { Button } from "@/components/ui/button";

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN");
}

export default async function AdminRestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { id } = await params;
  const restaurant = await getAdminRestaurantDetail(id);

  if (!restaurant) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={restaurant.name}
        description="Restaurant details, owner information, and admin actions."
        actions={
          <Button variant="outline" render={<Link href="/admin/restaurants" />}>
            Back to list
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 shadow-card">
          <CardHeader>
            <CardTitle>Restaurant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Slug</span>
              <span>{restaurant.slug ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cuisine</span>
              <span>{restaurant.cuisineType ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Onboarded</span>
              <span>{restaurant.onboarded ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subscription</span>
              <Badge variant="outline">
                {restaurant.subscriptionStatus ?? "none"}
              </Badge>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Health score</span>
              <Badge>{restaurant.healthScore}</Badge>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Last active</span>
              <span>{formatDateTime(restaurant.lastActiveAt)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDateTime(restaurant.createdAt)}</span>
            </div>
            {restaurant.isSuspended && (
              <div className="rounded-xl bg-destructive/10 p-3 text-destructive">
                Suspended {formatDateTime(restaurant.suspendedAt)}
                {restaurant.suspendedReason
                  ? ` — ${restaurant.suspendedReason}`
                  : ""}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-card">
          <CardHeader>
            <CardTitle>Owner & usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Owner email</span>
              <span>{restaurant.ownerEmail ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Owner ID</span>
              <span className="truncate font-mono text-xs">
                {restaurant.ownerId}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Customers</span>
              <span>{restaurant.customerCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Feedback</span>
              <span>{restaurant.feedbackCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Review clicks</span>
              <span>{restaurant.reviewClickCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Events</span>
              <span>{restaurant.eventCount}</span>
            </div>
            {restaurant.trialEndsAt && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Trial ends</span>
                <span>{formatDateTime(restaurant.trialEndsAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 shadow-card">
        <CardHeader>
          <CardTitle>Admin actions</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantAdminActions restaurant={restaurant} />
        </CardContent>
      </Card>
    </div>
  );
}
