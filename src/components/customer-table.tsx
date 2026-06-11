"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/rating-stars";
import { SegmentBadge } from "@/components/customers/segment-badge";
import { formatDate, formatBirthday } from "@/lib/utils";
import type { SegmentedCustomer } from "@/types";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface CustomerTableProps {
  customers: SegmentedCustomer[];
  onCustomerClick: (customer: SegmentedCustomer) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDeleteOne: (customer: SegmentedCustomer) => void;
  className?: string;
}

export function CustomerTable({
  customers,
  onCustomerClick,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteOne,
  className,
}: CustomerTableProps) {
  const allSelected =
    customers.length > 0 && customers.every((c) => selectedIds.has(c.id));
  const someSelected = customers.some((c) => selectedIds.has(c.id));

  return (
    <>
      {/* Desktop table */}
      <div
        className={cn(
          "hidden md:block rounded-2xl bg-card shadow-card overflow-hidden",
          className
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Select all customers"
                />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Phone</TableHead>
              <TableHead className="text-muted-foreground font-medium">Email</TableHead>
              <TableHead className="text-muted-foreground font-medium">Birthday</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Visits</TableHead>
              <TableHead className="text-muted-foreground font-medium">Avg Rating</TableHead>
              <TableHead className="text-muted-foreground font-medium">Segment</TableHead>
              <TableHead className="text-muted-foreground font-medium">Last Visit</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => {
              const selected = selectedIds.has(customer.id);
              return (
                <TableRow
                  key={customer.id}
                  onClick={() => onCustomerClick(customer)}
                  data-selected={selected}
                  className="cursor-pointer border-border hover:bg-muted data-[selected=true]:bg-muted/60"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => onToggleSelect(customer.id)}
                      aria-label={`Select ${customer.name}`}
                    />
                  </TableCell>
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
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${customer.name}`}
                      onClick={() => onDeleteOne(customer)}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {customers.map((customer) => {
          const selected = selectedIds.has(customer.id);
          return (
            <div
              key={customer.id}
              data-selected={selected}
              className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-card data-[selected=true]:ring-1 data-[selected=true]:ring-primary"
            >
              <Checkbox
                checked={selected}
                onCheckedChange={() => onToggleSelect(customer.id)}
                aria-label={`Select ${customer.name}`}
                className="mt-0.5"
              />
              <button
                type="button"
                onClick={() => onCustomerClick(customer)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
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
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${customer.name}`}
                onClick={() => onDeleteOne(customer)}
                className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
