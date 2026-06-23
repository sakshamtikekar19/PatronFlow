"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminRestaurantSearchProps {
  initialSearch?: string;
}

export function AdminRestaurantSearch({
  initialSearch = "",
}: AdminRestaurantSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialSearch);
  const [, startTransition] = useTransition();

  function submit(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) {
      params.set("search", next.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`/admin/restaurants?${params.toString()}`);
    });
  }

  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          submit(e.target.value);
        }}
        placeholder="Search restaurants..."
        className="rounded-full pl-9"
      />
    </div>
  );
}
