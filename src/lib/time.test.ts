import { describe, expect, it } from "vitest";
import { localBirthTimeToUtc } from "@/lib/time";

describe("local civil time conversion", () => {
  it("converts Indian local time to UTC and handles the prior UTC date", () => {
    expect(localBirthTimeToUtc("2000-01-01", "00:00", "Asia/Kolkata").toString()).toBe("1999-12-31T18:30:00Z");
  });

  it("uses historical IANA offsets for older dates", () => {
    expect(localBirthTimeToUtc("1900-01-01", "00:00", "Asia/Kolkata").toString()).toBe("1899-12-31T18:38:50Z");
  });

  it("rejects daylight-saving gaps and repeated local times", () => {
    expect(() => localBirthTimeToUtc("2024-03-31", "02:30", "Europe/Berlin")).toThrow(/invalid or ambiguous/i);
    expect(() => localBirthTimeToUtc("2024-10-27", "02:30", "Europe/Berlin")).toThrow(/invalid or ambiguous/i);
  });

  it("rejects invalid time zones rather than treating local time as UTC", () => {
    expect(() => localBirthTimeToUtc("2000-01-01", "12:00", "Unknown/Place")).toThrow(/invalid or ambiguous/i);
  });
});

