"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminRestaurantListItem } from "@/lib/queries/admin";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function healthBadge(score: number) {
  if (score >= 75) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

interface AdminRestaurantTableProps {
  restaurants: AdminRestaurantListItem[];
}

export function AdminRestaurantTable({ restaurants }: AdminRestaurantTableProps) {
  if (restaurants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-card">
        No restaurants found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border-0 bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Last active</TableHead>
            <TableHead className="text-right">Customers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((restaurant) => (
            <TableRow key={restaurant.id}>
              <TableCell>
                <Link
                  href={`/admin/restaurants/${restaurant.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {restaurant.name}
                </Link>
                {restaurant.slug && (
                  <p className="text-xs text-muted-foreground">
                    /r/{restaurant.slug}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {restaurant.ownerEmail ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {restaurant.isSuspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge variant="outline">
                      {restaurant.subscriptionStatus ?? "none"}
                    </Badge>
                  )}
                  {!restaurant.onboarded && (
                    <Badge variant="secondary">Onboarding</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={healthBadge(restaurant.healthScore)}>
                  {restaurant.healthScore}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(restaurant.lastActiveAt)}
              </TableCell>
              <TableCell className="text-right">
                {restaurant.customerCount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
