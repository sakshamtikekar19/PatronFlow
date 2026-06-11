"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-center"
        theme="system"
        toastOptions={{
          classNames: {
            toast: "rounded-xl border border-border bg-card text-card-foreground shadow-card",
          },
        }}
      />
    </ThemeProvider>
  );
}
