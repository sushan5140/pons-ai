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
    .replace(/\r?\n/g, "\\n");
}

function formatUtcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
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
  const hasTime = /T\d{2}:\d{2}/.test(event.date);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//pons//Screenshot Brain//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@pons.app`,
    `DTSTAMP:${formatUtcStamp(new Date())}`,
  ];

  if (hasTime) {
    const [datePart, timePart] = event.date.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    const start = `${pad(year, 4)}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;

    // One-hour default duration. Computed with pure calendar-day math
    // (Date.UTC used only to roll the day over correctly) rather than
    // constructing a Date from the floating string, to avoid any risk of
    // the server's local timezone leaking into the calculation.
    let endHour = hour + 1;
    let endYear = year;
    let endMonth = month;
    let endDay = day;
    if (endHour >= 24) {
      endHour -= 24;
      const rolled = new Date(Date.UTC(year, month - 1, day + 1));
      endYear = rolled.getUTCFullYear();
      endMonth = rolled.getUTCMonth() + 1;
      endDay = rolled.getUTCDate();
    }
    const end = `${pad(endYear, 4)}${pad(endMonth)}${pad(endDay)}T${pad(endHour)}${pad(minute)}00`;

    lines.push(`DTSTART:${start}`, `DTEND:${end}`);
  } else {
    const [year, month, day] = event.date.split("-").map(Number);
    const start = `${pad(year, 4)}${pad(month)}${pad(day)}`;
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
    const end = `${pad(nextDay.getUTCFullYear(), 4)}${pad(nextDay.getUTCMonth() + 1)}${pad(nextDay.getUTCDate())}`;

    lines.push(`DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`);
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
