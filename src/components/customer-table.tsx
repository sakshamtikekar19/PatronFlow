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
import { formatDate } from "@/lib/utils";
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
      <div className={cn("hidden md:block rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden", className)}>
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-100 hover:bg-transparent">
              <TableHead className="text-neutral-500 font-medium">Name</TableHead>
              <TableHead className="text-neutral-500 font-medium">Phone</TableHead>
              <TableHead className="text-neutral-500 font-medium">Email</TableHead>
              <TableHead className="text-neutral-500 font-medium text-center">Visits</TableHead>
              <TableHead className="text-neutral-500 font-medium">Avg Rating</TableHead>
              <TableHead className="text-neutral-500 font-medium">Segment</TableHead>
              <TableHead className="text-neutral-500 font-medium">Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                onClick={() => onCustomerClick(customer)}
                className="cursor-pointer border-neutral-100 hover:bg-neutral-50"
              >
                <TableCell className="font-medium text-neutral-900">
                  {customer.name}
                </TableCell>
                <TableCell className="text-neutral-600">{customer.phone}</TableCell>
                <TableCell className="text-neutral-600">
                  {customer.email ?? "—"}
                </TableCell>
                <TableCell className="text-center text-neutral-600">
                  {customer.visits}
                </TableCell>
                <TableCell>
                  {customer.visits > 0 ? (
                    <div className="flex items-center gap-2">
                      <RatingStars rating={Math.round(customer.average_rating)} size="sm" />
                      <span className="text-sm text-neutral-500">
                        {customer.average_rating}
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <SegmentBadge segment={customer.segment} />
                </TableCell>
                <TableCell className="text-neutral-600">
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
            className="w-full rounded-2xl bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-neutral-900">{customer.name}</p>
                <p className="text-sm text-neutral-500">{customer.phone}</p>
              </div>
              <SegmentBadge segment={customer.segment} />
            </div>
            <div className="mt-3 flex gap-4 text-xs text-neutral-500">
              <span>{customer.visits} visits</span>
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
