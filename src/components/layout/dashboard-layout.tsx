"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
        <footer className="flex flex-col items-center gap-2 border-t border-border px-4 py-6 text-center lg:px-8">
          <Image
            src="/patronflowlogo.png"
            alt={BRAND.name}
            width={1297}
            height={375}
            className="h-6 w-auto"
          />
          <p className="text-xs text-muted-foreground">{BRAND.tagline}</p>
          <nav className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
