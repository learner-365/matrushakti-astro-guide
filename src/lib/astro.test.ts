import { describe, expect, it } from "vitest";
import { houseForRashi, nakshatraDetails, normalizeDegrees, rashiIndex } from "@/lib/astro";

describe("sidereal sign and nakshatra boundaries", () => {
  it("normalizes angular values into [0, 360)", () => {
    expect(normalizeDegrees(360)).toBe(0);
    expect(normalizeDegrees(-1)).toBe(359);
    expect(normalizeDegrees(721)).toBe(1);
  });

  it("assigns exact 30-degree boundaries to the following Rashi", () => {
    expect(rashiIndex(30 - 1e-8)).toBe(0);
    expect(rashiIndex(30)).toBe(1);
    expect(rashiIndex(360)).toBe(0);
  });

  it("assigns each exact Nakshatra boundary to the next Nakshatra", () => {
    const span = 360 / 27;
    expect(nakshatraDetails(span - 1e-8).nakshatra).toBe("Ashwini");
    expect(nakshatraDetails(span).nakshatra).toBe("Bharani");
    expect(nakshatraDetails(360).nakshatra).toBe("Ashwini");
  });

  it("assigns exact Pada boundaries consistently", () => {
    const padaSpan = 360 / 27 / 4;
    expect(nakshatraDetails(padaSpan - 1e-8).pada).toBe(1);
    expect(nakshatraDetails(padaSpan).pada).toBe(2);
  });

  it("assigns Whole Sign houses from the Ascendant sign", () => {
    expect(houseForRashi(4, 4)).toBe(1);
    expect(houseForRashi(10, 4)).toBe(7);
    expect(houseForRashi(1, 4)).toBe(10);
  });
});

