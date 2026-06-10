"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { BRAND } from "@/config/branding";

interface DashboardLayoutProps {
  children: React.ReactNode;
  restaurantName?: string;
  restaurantLogo?: string | null;
  userEmail?: string;
}

export function DashboardLayout({
  children,
  restaurantName,
  restaurantLogo,
  userEmail,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <Navbar
          restaurantName={restaurantName}
          restaurantLogo={restaurantLogo}
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-neutral-100 px-4 py-6 text-center lg:px-8">
          <p className="text-sm font-semibold italic text-neutral-700">
            {BRAND.name}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">{BRAND.tagline}</p>
        </footer>
      </div>
    </div>
  );
}
