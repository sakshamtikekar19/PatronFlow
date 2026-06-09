/** Escape a single CSV cell value. */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Convert an array of objects into a CSV string given ordered columns. */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(",");
  const dataLines = rows.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

/** Build standard headers for a downloadable CSV response. */
export function csvResponseHeaders(filename: string): HeadersInit {
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
  };
}
