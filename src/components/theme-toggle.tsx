"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) setMounted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = mounted ? theme : undefined;
  const systemLabel =
    mounted && resolvedTheme
      ? `System (${resolvedTheme === "dark" ? "Dark" : "Light"})`
      : "System";

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-xl border border-border bg-card p-1"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={current === value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            current === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {value === "system" ? systemLabel : label}
        </button>
      ))}
    </div>
  );
}
