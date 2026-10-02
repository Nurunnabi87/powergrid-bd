/**
 * Chart data helpers. Missing months are filled with zeros so a trend line
 * never draws a straight segment across months that had no activity.
 */

/** The last `count` months as "YYYY-MM", oldest first. */
export const lastMonths = (count: number, now = new Date()): string[] =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - index), 1));
    return date.toISOString().slice(0, 7);
  });

export function fillMonths<T extends { month: string }>(
  rows: T[],
  count: number,
  empty: (month: string) => T
): T[] {
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  return lastMonths(count).map((month) => byMonth.get(month) ?? empty(month));
}

/** Short month label for axes: "2026-08" → "Aug". */
export const monthTick = (period: string): string => {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return period;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
};

/** Full month label for tooltips and tables: "2026-08" → "Aug 2026". */
export const monthLabel = (period: string): string => {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return period;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
};
