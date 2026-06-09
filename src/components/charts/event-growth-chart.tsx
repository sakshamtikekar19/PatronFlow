"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EventGrowthChartProps {
  data: { month: string; rsvps: number }[];
}

export function EventGrowthChart({ data }: EventGrowthChartProps) {
  const hasData = data.some((d) => d.rsvps > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
        No RSVPs yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#a3a3a3" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#a3a3a3" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="rsvps" fill="#0f172a" radius={[6, 6, 0, 0]} name="RSVPs" />
      </BarChart>
    </ResponsiveContainer>
  );
}
