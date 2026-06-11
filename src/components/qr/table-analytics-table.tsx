import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RatingStars } from "@/components/rating-stars";
import { EmptyState } from "@/components/empty-state";
import type { TableQrAnalytics } from "@/types";
import { QrCode } from "lucide-react";

interface TableAnalyticsTableProps {
  data: TableQrAnalytics[];
}

export function TableAnalyticsTable({ data }: TableAnalyticsTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<QrCode className="h-6 w-6" />}
        title="No table analytics yet"
        description="Once guests scan your QR codes, per-table performance will appear here."
        className="py-12"
      />
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl bg-card shadow-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium text-muted-foreground">Table</TableHead>
              <TableHead className="text-center font-medium text-muted-foreground">
                Feedback
              </TableHead>
              <TableHead className="text-center font-medium text-muted-foreground">
                Review Clicks
              </TableHead>
              <TableHead className="font-medium text-muted-foreground">
                Avg Rating
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.tableName} className="border-border">
                <TableCell className="font-medium text-foreground">
                  {row.tableName}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {row.feedbackCount}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {row.reviewCount}
                </TableCell>
                <TableCell>
                  {row.feedbackCount > 0 ? (
                    <div className="flex items-center gap-2">
                      <RatingStars
                        rating={Math.round(row.averageRating)}
                        size="sm"
                      />
                      <span className="text-sm text-muted-foreground">
                        {row.averageRating}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div
            key={row.tableName}
            className="rounded-2xl bg-card p-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {row.tableName}
              </span>
              {row.feedbackCount > 0 && (
                <RatingStars
                  rating={Math.round(row.averageRating)}
                  size="sm"
                />
              )}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>{row.feedbackCount} feedback</span>
              <span>{row.reviewCount} review clicks</span>
              {row.feedbackCount > 0 && <span>{row.averageRating} avg</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
