"use client";

import { Reveal } from "@/components/motion/reveal";
import { StatCard } from "@/components/stat-card";

interface StatItem {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function DashboardStatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, i) => (
        <Reveal key={stat.title} delay={i * 0.05}>
          <StatCard {...stat} />
        </Reveal>
      ))}
    </div>
  );
}

export function DashboardVisitStatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, i) => (
        <Reveal key={stat.title} delay={i * 0.05}>
          <StatCard {...stat} />
        </Reveal>
      ))}
    </div>
  );
}
