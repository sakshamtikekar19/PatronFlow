"use client";

import { Reveal } from "@/components/motion/reveal";
import { AdminStatCard } from "@/components/admin/admin-stat-card";

interface AdminStatItem {
  title: string;
  value: string | number;
  growth?: number;
  icon?: React.ReactNode;
}

export function AdminStatGrid({ stats }: { stats: AdminStatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, i) => (
        <Reveal key={stat.title} delay={i * 0.05}>
          <AdminStatCard {...stat} />
        </Reveal>
      ))}
    </div>
  );
}
