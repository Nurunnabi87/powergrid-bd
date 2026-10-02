import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

/**
 * Display formatting. Dates from the API are ISO UTC strings; clock times
 * are shown in Bangladesh time (see TIME_ZONE below).
 */

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
};

const bdtFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatBDT = (amount: number | null | undefined): string =>
  amount === null || amount === undefined ? "—" : bdtFormatter.format(amount);

export const formatNumber = (value: number | null | undefined, digits = 0): string =>
  value === null || value === undefined
    ? "—"
    : value.toLocaleString("en-US", { maximumFractionDigits: digits });

/**
 * Times are always shown in Bangladesh time, whatever zone the server
 * (UTC on Vercel) or the viewer's browser is in. This also keeps server and
 * client renders identical, avoiding hydration mismatches.
 */
export const TIME_ZONE = "Asia/Dhaka";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

export const formatDate = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : "—";
};

export const formatTime = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? timeFormatter.format(date) : "—";
};

export const formatDateTime = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? `${dateFormatter.format(date)}, ${timeFormatter.format(date)}` : "—";
};

/**
 * Schedule `date` columns are stored at UTC midnight; formatting them in
 * local time could shift the day, so the calendar date is read directly.
 */
export const formatCalendarDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return format(new Date(year, month - 1, day), "EEE, d MMM yyyy");
};

export const formatRelative = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  return date ? formatDistanceToNowStrict(date, { addSuffix: true }) : "—";
};

/** 275 → "4h 35m" */
export const formatMinutes = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

/** "2026-08" → "Aug 2026" */
export const formatMonth = (period: string): string => {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return period;
  return format(new Date(year, month - 1, 1), "MMM yyyy");
};

/** "IN_PROGRESS" → "In progress" */
export const humanize = (value: string): string => {
  const text = value.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/** Today as YYYY-MM-DD in UTC, matching how the API stores schedule dates. */
export const todayUtc = (): string => new Date().toISOString().slice(0, 10);

/** Today's calendar date in Bangladesh, as YYYY-MM-DD (for date inputs). */
export const todayInDhaka = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());

/**
 * A wall-clock time in Dhaka (UTC+6, no DST) as an ISO UTC string, which is
 * the format the API's schedule endpoints require.
 */
export const dhakaToIso = (date: string, time: string): string =>
  new Date(`${date}T${time}:00+06:00`).toISOString();

/** The Dhaka wall-clock "HH:mm" of an ISO timestamp (for editing forms). */
export const isoToDhakaTime = (iso: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(parseISO(iso));
