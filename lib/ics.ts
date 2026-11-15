import "server-only";

export interface IcsEventInput {
  uid: string;
  title: string;
  /** ISO date "YYYY-MM-DD" or datetime "YYYY-MM-DDTHH:MM[:SS]", no timezone offset. */
  date: string;
  location?: string | null;
  /** Minutes before the event to trigger the reminder. Defaults to 60. */
  reminderMinutesBefore?: number | null;
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

function formatUtcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}


function utcDay(year: number, month: number, day: number): Date {
  // Unlike Date.UTC, setUTCFullYear doesn't remap years 0-99 to 1900-1999.
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function parseFloatingDate(value: string): {
  year: number;
  month: number;
  day: number;
  time: { hour: number; minute: number; second: number } | null;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(value);
  if (!match || match[0] !== value) throw new Error("Invalid event date format");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error("Invalid event date");
  }
  const check = utcDay(year, month, day);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() + 1 !== month ||
    check.getUTCDate() !== day
  ) {
    throw new Error("Invalid event date");
  }
  if (match[4] === undefined) return { year, month, day, time: null };
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] === undefined ? 0 : Number(match[6]);
  if (hour > 23 || minute > 59 || second > 59) {
    throw new Error("Invalid event time");
  }
  return { year, month, day, time: { hour, minute, second } };
}

/**
 * Builds a minimal, valid iCalendar (RFC 5545) file for a single event.
 *
 * `date` is treated as "floating" local time (no timezone offset) rather
 * than UTC — we don't actually know the event's real timezone (a flight's
 * departure time is local to the airport, not to wherever the user is when
 * they upload the screenshot), so asserting UTC would risk showing the
 * wrong time. Floating time is imported by calendar apps as local time.
 */
export function buildIcsFile(event: IcsEventInput): string {
  const { year, month, day, time } = parseFloatingDate(event.date);
  // UID originates from the internal screenshot ID; never interpolate line breaks.
  if (!/^[A-Za-z0-9_-]+$/.test(event.uid) || /[\r\n]/.test(event.uid)) {
    throw new Error("Invalid event UID");
  }
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//pons//Screenshot Brain//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@pons.app`,
    `DTSTAMP:${formatUtcStamp(new Date())}`,
  ];

  if (time) {
    const { hour, minute, second } = time;
    const start =
      pad(year, 4) + pad(month) + pad(day) + "T" +
      pad(hour) + pad(minute) + pad(second);
    // Pure UTC calendar arithmetic; the event itself remains floating local time.
    const rollover = utcDay(year, month, day + (hour === 23 ? 1 : 0));
    const endHour = (hour + 1) % 24;
    const end =
      pad(rollover.getUTCFullYear(), 4) + pad(rollover.getUTCMonth() + 1) +
      pad(rollover.getUTCDate()) + "T" + pad(endHour) + pad(minute) + pad(second);
    lines.push("DTSTART:" + start, "DTEND:" + end);
  } else {
    const nextDay = utcDay(year, month, day + 1);
    const start = pad(year, 4) + pad(month) + pad(day);
    const end =
      pad(nextDay.getUTCFullYear(), 4) + pad(nextDay.getUTCMonth() + 1) +
      pad(nextDay.getUTCDate());
    lines.push("DTSTART;VALUE=DATE:" + start, "DTEND;VALUE=DATE:" + end);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  const reminder =
    event.reminderMinutesBefore && event.reminderMinutesBefore > 0
      ? event.reminderMinutesBefore
      : 60;

  lines.push(
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(event.title)}`,
    `TRIGGER:-PT${reminder}M`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  return lines.join("\r\n");
}
