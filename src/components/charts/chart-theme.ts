/** Read a CSS custom property from :root (client-only). */
function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export interface ChartTheme {
  primary: string;
  positive: string;
  accent: string;
  grid: string;
  tick: string;
  tooltipBg: string;
  tooltipFg: string;
  tooltipBorder: string;
  cursor: string;
}

/** Theme-aware chart palette sourced from design tokens. */
export function getChartTheme(): ChartTheme {
  return {
    primary: cssVar("--chart-1", "#171717"),
    positive: cssVar("--chart-2", "#10b981"),
    accent: cssVar("--chart-3", "#f97316"),
    grid: cssVar("--chart-grid", "#f0f0f0"),
    tick: cssVar("--chart-tick", "#a3a3a3"),
    tooltipBg: cssVar("--card", "#ffffff"),
    tooltipFg: cssVar("--card-foreground", "#0a0a0a"),
    tooltipBorder: cssVar("--border", "#e5e5e5"),
    cursor: cssVar("--chart-grid", "rgba(0,0,0,0.04)"),
  };
}

export const chartTickStyle = { fontSize: 12, fill: "var(--chart-tick)" };

export function chartTooltipStyle() {
  const theme = getChartTheme();
  return {
    borderRadius: "12px",
    border: `1px solid ${theme.tooltipBorder}`,
    backgroundColor: theme.tooltipBg,
    color: theme.tooltipFg,
    boxShadow: "var(--card-shadow)",
    fontSize: "13px",
  };
}
