"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Users, Trash2, X } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { CustomerTable } from "@/components/customer-table";
import { CustomerDrawer } from "@/components/customer-drawer";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { SEGMENT_ORDER, SEGMENT_DESCRIPTIONS } from "@/lib/segments";
import { deleteCustomers } from "@/lib/actions/customers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  SegmentedCustomer,
  FeedbackWithCustomer,
  CustomerSegment,
  CustomerLoyaltySummary,
} from "@/types";

interface CustomersPageClientProps {
  initialCustomers: SegmentedCustomer[];
  restaurantId: string;
}

type SegmentFilter = CustomerSegment | "All";

export function CustomersPageClient({
  initialCustomers,
}: CustomersPageClientProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [activeSegment, setActiveSegment] = useState<SegmentFilter>("All");
  const [selectedCustomer, setSelectedCustomer] =
    useState<SegmentedCustomer | null>(null);
  const [customerFeedback, setCustomerFeedback] = useState<
    FeedbackWithCustomer[]
  >([]);
  const [customerLoyalty, setCustomerLoyalty] =
    useState<CustomerLoyaltySummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<SegmentedCustomer[] | null>(
    null
  );
  const [isDeleting, startDeleting] = useTransition();

  // Keep local state in sync if server data changes (e.g. after revalidation).
  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  const counts = SEGMENT_ORDER.reduce(
    (acc, seg) => {
      acc[seg] = customers.filter((c) => c.segment === seg).length;
      return acc;
    },
    {} as Record<CustomerSegment, number>
  );

  const bySegment =
    activeSegment === "All"
      ? customers
      : customers.filter((c) => c.segment === activeSegment);

  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch) return bySegment;
    const q = debouncedSearch.toLowerCase();
    return bySegment.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(debouncedSearch) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [bySegment, debouncedSearch]);

  const handleCustomerClick = async (customer: SegmentedCustomer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
    setCustomerFeedback([]);
    setCustomerLoyalty(null);
    const [feedback, loyalty] = await Promise.all([
      fetch(`/api/customers/${customer.id}/feedback`).then((res) => res.json()),
      fetch(`/api/customers/${customer.id}/loyalty`).then((res) => res.json()),
    ]);
    setCustomerFeedback(feedback);
    setCustomerLoyalty(loyalty);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allVisibleSelected = filteredCustomers.every((c) => prev.has(c.id));
      if (allVisibleSelected) {
        const next = new Set(prev);
        filteredCustomers.forEach((c) => next.delete(c.id));
        return next;
      }
      const next = new Set(prev);
      filteredCustomers.forEach((c) => next.add(c.id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedCustomers = useMemo(
    () => customers.filter((c) => selectedIds.has(c.id)),
    [customers, selectedIds]
  );

  const confirmDelete = () => {
    if (!pendingDelete || pendingDelete.length === 0) return;
    const ids = pendingDelete.map((c) => c.id);
    startDeleting(async () => {
      const res = await deleteCustomers(ids);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const idSet = new Set(ids);
      setCustomers((prev) => prev.filter((c) => !idSet.has(c.id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      toast.success(
        `Deleted ${res.deletedCount ?? ids.length} customer${
          (res.deletedCount ?? ids.length) === 1 ? "" : "s"
        }`
      );
      setPendingDelete(null);
    });
  };

  return (
    <div className="space-y-5">
      {/* Segment summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SEGMENT_ORDER.map((seg) => {
          const active = activeSegment === seg;
          return (
            <button
              key={seg}
              type="button"
              onClick={() => setActiveSegment(active ? "All" : seg)}
              className={cn(
                "rounded-2xl border bg-card p-4 text-left transition-all",
                active
                  ? "border-foreground shadow-card ring-1 ring-foreground/10"
                  : "border-transparent shadow-card hover:border-border"
              )}
            >
              <p className="text-2xl font-semibold text-foreground">
                {counts[seg]}
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {seg}
              </p>
              <p className="text-xs text-muted-foreground">
                {SEGMENT_DESCRIPTIONS[seg]}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search customers by name, phone, or email"
        />
        {activeSegment !== "All" && (
          <button
            type="button"
            onClick={() => setActiveSegment("All")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Clear filter ({activeSegment})
          </button>
        )}
      </div>

      {/* Bulk selection toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span>
              {selectedIds.size} customer{selectedIds.size === 1 ? "" : "s"}{" "}
              selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setPendingDelete(selectedCustomers)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selected
          </Button>
        </div>
      )}

      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={
            activeSegment === "All"
              ? "No customers yet"
              : `No ${activeSegment} customers`
          }
          description="Customers will appear here when they submit feedback through your review link."
        />
      ) : (
        <CustomerTable
          customers={filteredCustomers}
          onCustomerClick={handleCustomerClick}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onDeleteOne={(customer) => setPendingDelete([customer])}
        />
      )}

      <CustomerDrawer
        customer={selectedCustomer}
        feedback={customerFeedback}
        loyalty={customerLoyalty}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Delete confirmation */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && !isDeleting && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {pendingDelete && pendingDelete.length === 1
                ? pendingDelete[0].name
                : `${pendingDelete?.length ?? 0} customers`}
              ?
            </DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              {pendingDelete && pendingDelete.length === 1
                ? "this customer"
                : "these customers"}{" "}
              along with their feedback, visit history, and loyalty points. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
