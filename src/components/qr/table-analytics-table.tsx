import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RatingStars } from "@/components/rating-stars";
import type { TableQrAnalytics } from "@/types";

interface TableAnalyticsTableProps {
  data: TableQrAnalytics[];
}

export function TableAnalyticsTable({ data }: TableAnalyticsTableProps) {
  if (data.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-sm text-neutral-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        No feedback has been collected yet. Once guests scan your QR codes,
        per-table performance will appear here.
      </p>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-100 hover:bg-transparent">
              <TableHead className="font-medium text-neutral-500">Table</TableHead>
              <TableHead className="text-center font-medium text-neutral-500">
                Feedback
              </TableHead>
              <TableHead className="text-center font-medium text-neutral-500">
                Review Clicks
              </TableHead>
              <TableHead className="font-medium text-neutral-500">
                Avg Rating
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.tableName} className="border-neutral-100">
                <TableCell className="font-medium text-neutral-900">
                  {row.tableName}
                </TableCell>
                <TableCell className="text-center text-neutral-600">
                  {row.feedbackCount}
                </TableCell>
                <TableCell className="text-center text-neutral-600">
                  {row.reviewCount}
                </TableCell>
                <TableCell>
                  {row.feedbackCount > 0 ? (
                    <div className="flex items-center gap-2">
                      <RatingStars
                        rating={Math.round(row.averageRating)}
                        size="sm"
                      />
                      <span className="text-sm text-neutral-500">
                        {row.averageRating}
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">—</span>
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
            className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-900">
                {row.tableName}
              </span>
              {row.feedbackCount > 0 && (
                <RatingStars
                  rating={Math.round(row.averageRating)}
                  size="sm"
                />
              )}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-neutral-500">
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
