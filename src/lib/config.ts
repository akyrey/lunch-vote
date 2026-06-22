export const OFFICE_TIMEZONE = process.env.OFFICE_TIMEZONE ?? "Europe/Rome";
export const POLL_OPEN_TIME = process.env.POLL_OPEN_TIME ?? "11:30";
export const POLL_CLOSE_TIME = process.env.POLL_CLOSE_TIME ?? "12:30";
export const CURRENCY = process.env.CURRENCY ?? "EUR";
export const ALLOWED_EMAIL_DOMAIN =
  process.env.ALLOWED_EMAIL_DOMAIN ?? "example.com";
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
export const SLACK_ENABLED = process.env.SLACK_ENABLED === "true";
export const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL ?? "";

// Gamification point config — easy to tune
export const POINTS = {
  CHECK_IN: 5,
  VOTE: 10,
  TOP_PICK_WON: 15,
} as const;

/** Parse "HH:MM" into { hours, minutes } */
function parseTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return { hours: h, minutes: m };
}

/**
 * Given the current date (UTC) and the poll time config, return the UTC
 * timestamp for the poll open/close event on that date.
 */
export function pollTimestampUTC(dateStr: string, hhmm: string): Date {
  const { hours, minutes } = parseTime(hhmm);
  // Build a date-time string in the office timezone
  const localDT = new Date(
    `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  );
  // Use Intl to find the offset of the office timezone on that date
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: OFFICE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(localDT);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";
  const officeMs = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second"))
  );

  // The local->UTC conversion: we want the UTC time that corresponds to
  // hhmm in the office timezone. Build it by interpreting the date string
  // directly in the target timezone.
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: OFFICE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Binary search is overkill — use the timezone offset we can derive
  // by comparing a reference UTC time to its office-tz representation.
  const ref = new Date(`${dateStr}T12:00:00Z`);
  const refParts = formatter.formatToParts(ref);
  const rGet = (t: string) =>
    refParts.find((p) => p.type === t)?.value ?? "0";

  const refOfficeHour = Number(rGet("hour"));
  const refUTCHour = 12; // we used T12:00:00Z
  const offsetHours = refOfficeHour - refUTCHour;

  const targetUTC = new Date(
    `${dateStr}T${String(hours - offsetHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`
  );
  return targetUTC;
}

/** Returns today's date string in YYYY-MM-DD format (office timezone) */
export function todayDateStr(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: OFFICE_TIMEZONE,
  });
}

/** Returns true if the given date is a weekday (Mon–Fri) in office timezone */
export function isWeekday(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.toLocaleDateString("en-US", {
    timeZone: OFFICE_TIMEZONE,
    weekday: "long",
  });
  return !["Saturday", "Sunday"].includes(day);
}

/** Format a UTC timestamp for display in the office timezone */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    timeZone: OFFICE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format a date for human display in the office timezone */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    timeZone: OFFICE_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
