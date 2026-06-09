"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { SearchSuggestion } from "@/lib/queries/search";

interface DashboardSearchProps {
  initialSearch?: string;
}

export function DashboardSearch({ initialSearch = "" }: DashboardSearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  // Update URL and table when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }
    const query = params.toString();
    router.replace(`/dashboard${query ? `?${query}` : ""}`, { scroll: false });
  }, [debouncedSearch, router]);

  // Fetch dropdown suggestions as user types. The async work runs inside an
  // IIFE so state updates happen in callbacks, not synchronously in the effect.
  useEffect(() => {
    const term = debouncedSearch.trim();
    let cancelled = false;

    (async () => {
      if (!term) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = (await res.json()) as SearchSuggestion[];
        if (!cancelled) setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const handleSelect = useCallback((suggestion: SearchSuggestion) => {
    setSearch(suggestion.searchValue);
    setIsOpen(false);
  }, []);

  return (
    <SearchBar
      value={search}
      onChange={(value) => {
        setSearch(value);
        setIsOpen(true);
      }}
      placeholder="Search for a customer, phone, or feedback"
      suggestions={suggestions}
      isLoading={isLoading}
      isOpen={isOpen}
      onSelect={handleSelect}
      onFocus={() => setIsOpen(true)}
      onBlur={() => {
        // Delay so click on suggestion registers before dropdown closes
        setTimeout(() => setIsOpen(false), 150);
      }}
    />
  );
}
