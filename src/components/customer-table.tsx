"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RatingStars } from "@/components/rating-stars";
import { SegmentBadge } from "@/components/customers/segment-badge";
import { formatDate, formatBirthday } from "@/lib/utils";
import type { SegmentedCustomer } from "@/types";
import { cn } from "@/lib/utils";

interface CustomerTableProps {
  customers: SegmentedCustomer[];
  onCustomerClick: (customer: SegmentedCustomer) => void;
  className?: string;
}

export function CustomerTable({
  customers,
  onCustomerClick,
  className,
}: CustomerTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className={cn("hidden md:block rounded-2xl bg-card shadow-card overflow-hidden", className)}>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Phone</TableHead>
              <TableHead className="text-muted-foreground font-medium">Email</TableHead>
              <TableHead className="text-muted-foreground font-medium">Birthday</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Visits</TableHead>
              <TableHead className="text-muted-foreground font-medium">Avg Rating</TableHead>
              <TableHead className="text-muted-foreground font-medium">Segment</TableHead>
              <TableHead className="text-muted-foreground font-medium">Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                onClick={() => onCustomerClick(customer)}
                className="cursor-pointer border-border hover:bg-muted"
              >
                <TableCell className="font-medium text-foreground">
                  {customer.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.email ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatBirthday(customer.birthday)}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {customer.visits}
                </TableCell>
                <TableCell>
                  {customer.visits > 0 ? (
                    <div className="flex items-center gap-2">
                      <RatingStars rating={Math.round(customer.average_rating)} size="sm" />
                      <span className="text-sm text-muted-foreground">
                        {customer.average_rating}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <SegmentBadge segment={customer.segment} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.last_visit ? formatDate(customer.last_visit) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {customers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => onCustomerClick(customer)}
            className="w-full rounded-2xl bg-card p-4 text-left shadow-card transition-colors hover:bg-muted"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              </div>
              <SegmentBadge segment={customer.segment} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{customer.visits} visits</span>
              {customer.birthday && (
                <span>🎂 {formatBirthday(customer.birthday)}</span>
              )}
              {customer.last_visit && (
                <span>Last: {formatDate(customer.last_visit)}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
