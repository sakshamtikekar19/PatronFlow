"use client";

import { Search, User, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SearchSuggestion } from "@/lib/queries/search";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  isOpen?: boolean;
  onSelect?: (suggestion: SearchSuggestion) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search for a customer or feedback",
  className,
  suggestions = [],
  isLoading = false,
  isOpen = false,
  onSelect,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const showDropdown = isOpen && value.trim().length > 0;

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="h-12 rounded-full border-border bg-card pl-5 pr-14 text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-neutral-300"
        autoComplete="off"
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors hover:bg-emerald-200"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No results for &ldquo;{value}&rdquo;
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((suggestion) => (
                <li key={`${suggestion.type}-${suggestion.id}`}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelect?.(suggestion);
                    }}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {suggestion.type === "customer" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {suggestion.label}
                      </span>
                      {suggestion.sublabel && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {suggestion.sublabel}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {suggestion.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
