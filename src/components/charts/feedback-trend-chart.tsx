"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getChartTheme, chartTooltipStyle } from "./chart-theme";
import type { FeedbackTrend } from "@/types";

interface FeedbackTrendChartProps {
  data: FeedbackTrend[];
}

export function FeedbackTrendChart({ data }: FeedbackTrendChartProps) {
  const theme = useMemo(() => getChartTheme(), []);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No feedback data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="feedbackGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.positive} stopOpacity={0.15} />
            <stop offset="95%" stopColor={theme.positive} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={theme.grid}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: theme.tick }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        >
          <Label
            value="Date"
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
            value="Feedback"
            angle={-90}
            position="insideLeft"
            style={{ fontSize: 11, fill: theme.tick }}
          />
        </YAxis>
        <Tooltip contentStyle={chartTooltipStyle()} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={theme.positive}
          strokeWidth={2}
          fill="url(#feedbackGradient)"
          name="Feedback"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
