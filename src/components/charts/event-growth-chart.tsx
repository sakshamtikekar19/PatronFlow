"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getChartTheme, chartTooltipStyle } from "./chart-theme";

interface EventGrowthChartProps {
  data: { month: string; rsvps: number }[];
}

export function EventGrowthChart({ data }: EventGrowthChartProps) {
  const theme = useMemo(() => getChartTheme(), []);
  const hasData = data.some((d) => d.rsvps > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No RSVPs yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={theme.grid}
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: theme.tick }}
          tickLine={false}
          axisLine={false}
        >
          <Label
            value="Month"
            offset={-4}
            position="insideBottom"
            style={{ fontSize: 11, fill: theme.tick }}
          />
        </XAxis>
        <YAxis
          tick={{ fontSize: 12, fill: theme.tick }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        >
          <Label
            value="RSVPs"
            angle={-90}
            position="insideLeft"
            style={{ fontSize: 11, fill: theme.tick }}
          />
        </YAxis>
        <Tooltip
          cursor={{ fill: theme.cursor }}
          contentStyle={chartTooltipStyle()}
        />
        <Bar
          dataKey="rsvps"
          fill={theme.primary}
          radius={[6, 6, 0, 0]}
          name="RSVPs"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
