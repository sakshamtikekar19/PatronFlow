"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { CustomerTable } from "@/components/customer-table";
import { CustomerDrawer } from "@/components/customer-drawer";
import { EmptyState } from "@/components/empty-state";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { SEGMENT_ORDER, SEGMENT_DESCRIPTIONS } from "@/lib/segments";
import { cn } from "@/lib/utils";
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

  const counts = SEGMENT_ORDER.reduce(
    (acc, seg) => {
      acc[seg] = initialCustomers.filter((c) => c.segment === seg).length;
      return acc;
    },
    {} as Record<CustomerSegment, number>
  );

  const bySegment =
    activeSegment === "All"
      ? initialCustomers
      : initialCustomers.filter((c) => c.segment === activeSegment);

  const filteredCustomers = debouncedSearch
    ? bySegment.filter(
        (c) =>
          c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.phone.includes(debouncedSearch) ||
          c.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : bySegment;

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
                "rounded-2xl border bg-white p-4 text-left transition-all",
                active
                  ? "border-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  : "border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-neutral-200"
              )}
            >
              <p className="text-2xl font-semibold text-neutral-900">
                {counts[seg]}
              </p>
              <p className="mt-0.5 text-sm font-medium text-neutral-700">
                {seg}
              </p>
              <p className="text-xs text-neutral-400">
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
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            Clear filter ({activeSegment})
          </button>
        )}
      </div>

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
        />
      )}

      <CustomerDrawer
        customer={selectedCustomer}
        feedback={customerFeedback}
        loyalty={customerLoyalty}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
