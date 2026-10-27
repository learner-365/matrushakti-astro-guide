import { Temporal } from "@js-temporal/polyfill";

export function localBirthTimeToUtc(date: string, time: string, timeZone: string): Temporal.Instant {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Enter a valid birth date and local birth time.");
  }
  let local: Temporal.PlainDateTime;
  try {
    local = Temporal.PlainDateTime.from(`${date}T${time}:00`);
    return local.toZonedDateTime(timeZone, { disambiguation: "reject" }).toInstant();
  } catch {
    throw new Error("That local time is invalid or ambiguous in the selected time zone. Check the time or choose a more precise location.");
  }
}

export function instantToUtcParts(instant: Temporal.Instant) {
  const utc = instant.toZonedDateTimeISO("UTC");
  return {
    year: utc.year,
    month: utc.month,
    day: utc.day,
    hour: utc.hour,
    minute: utc.minute,
    second: utc.second + utc.millisecond / 1000,
    iso: instant.toString(),
  };
}

