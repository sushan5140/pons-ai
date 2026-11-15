import test from "node:test";
import assert from "node:assert/strict";
import { buildIcsFile } from "../lib/ics.ts";

const base = { uid: "abc-123", title: "Meeting", date: "2026-11-15" };

function lines(ics) {
  return ics.split("\r\n");
}

test("all-day events use an exclusive next-day end", () => {
  const event = lines(buildIcsFile(base));
  assert.ok(event.includes("DTSTART;VALUE=DATE:20261115"));
  assert.ok(event.includes("DTEND;VALUE=DATE:20261116"));
  assert.ok(event.includes("TRIGGER:-PT60M"));
});

test("timed events preserve seconds across midnight and year rollover", () => {
  const event = lines(buildIcsFile({ ...base, date: "2026-12-31T23:45:29" }));
  assert.ok(event.includes("DTSTART:20261231T234529"));
  assert.ok(event.includes("DTEND:20270101T004529"));
});

test("valid leap days are supported", () => {
  const event = lines(buildIcsFile({ ...base, date: "2028-02-29" }));
  assert.ok(event.includes("DTEND;VALUE=DATE:20280301"));
});

test("rejects malformed dates and invalid clock times", () => {
  for (const date of [
    "", "not-a-date", "2026-02-29", "2026-04-31", "2026-13-01",
    "2026-00-10", "2026-11-15T24:00", "2026-11-15T12:60",
    "2026-11-15T12:00:60", "2026-11-15T11:00Z",
    "2026-11-15T11:00\r\nBEGIN:VEVENT", "2026-11-15\n",
  ]) {
    assert.throws(() => buildIcsFile({ ...base, date }), /Invalid event/);
  }
});

test("escapes CR, LF and CRLF in event text", () => {
  const ics = buildIcsFile({
    ...base,
    title: "Line1\rLine2\nLine3\r\nLine4",
    location: "A,B;C\\D",
  });
  assert.ok(lines(ics).includes("SUMMARY:Line1\\nLine2\\nLine3\\nLine4"));
  assert.ok(lines(ics).includes("LOCATION:A\\,B\\;C\\\\D"));
  assert.ok(!ics.includes("SUMMARY:Line1\rLine2"));
});

test("refuses UID header injection", () => {
  assert.throws(
    () => buildIcsFile({ ...base, uid: "safe\r\nBEGIN:VEVENT" }),
    /Invalid event UID/
  );
  assert.throws(() => buildIcsFile({ ...base, uid: "safe\n" }), /Invalid event UID/);
});
