"use client";

import { useState, useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { FeedbackCard } from "@/components/feedback-card";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { FEEDBACK_CATEGORIES, RATING_OPTIONS } from "@/types";
import type { FeedbackWithCustomer } from "@/types";

interface FeedbackPageClientProps {
  initialFeedback: FeedbackWithCustomer[];
}

export function FeedbackPageClient({
  initialFeedback,
}: FeedbackPageClientProps) {
  const PAGE_SIZE = 15;
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const filteredFeedback = useMemo(() => {
    let results = initialFeedback;

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      results = results.filter(
        (f) =>
          f.customer?.name?.toLowerCase().includes(term) ||
          f.customer?.phone?.includes(term) ||
          f.comment?.toLowerCase().includes(term)
      );
    }

    if (ratingFilter !== "all") {
      results = results.filter((f) => f.rating === Number(ratingFilter));
    }

    if (categoryFilter !== "all") {
      results = results.filter((f) => f.category === categoryFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const days = Number(dateFilter);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      results = results.filter(
        (f) => new Date(f.created_at) >= cutoff
      );
    }

    return results;
  }, [initialFeedback, debouncedSearch, ratingFilter, categoryFilter, dateFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredFeedback.length / PAGE_SIZE));
  // Clamp the page in case the result set shrank below the current page.
  const safePage = Math.min(page, pageCount);
  const paginatedFeedback = filteredFeedback.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleRating = (v: string) => {
    setRatingFilter(v);
    setPage(1);
  };
  const handleCategory = (v: string) => {
    setCategoryFilter(v);
    setPage(1);
  };
  const handleDate = (v: string) => {
    setDateFilter(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Search feedback by customer or comment"
      />

      <div className="flex flex-wrap gap-3">
        <Select value={ratingFilter} onValueChange={(v) => v && handleRating(v)}>
          <SelectTrigger className="w-36 rounded-full border-neutral-200 bg-white">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {RATING_OPTIONS.map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r} Star{r > 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => v && handleCategory(v)}>
          <SelectTrigger className="w-40 rounded-full border-neutral-200 bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {FEEDBACK_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={(v) => v && handleDate(v)}>
          <SelectTrigger className="w-40 rounded-full border-neutral-200 bg-white">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredFeedback.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="No feedback found"
          description="Feedback will appear here when customers submit reviews through your link."
        />
      ) : (
        <div className="space-y-3">
          {paginatedFeedback.map((item) => (
            <FeedbackCard key={item.id} feedback={item} />
          ))}
          <Pagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
            totalItems={filteredFeedback.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
}
