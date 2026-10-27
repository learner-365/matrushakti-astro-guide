import { describe, expect, it } from "vitest";
import { ChartResult, PLANET_SYMBOLS, RASHIS } from "@/lib/astro";
import { chartGroups, ChartStyle, EAST_RASHI_CELLS, NORTH_HOUSES, SOUTH_RASHI_CELLS } from "@/lib/chart-layout";

// Synthetic geometry-only fixture. It is never used by the application or shown to users.
const chart: ChartResult = {
  birth: { name: "Layout test", birthDate: "2000-01-01", birthTime: "12:00", timeAccuracy: "exact", locationName: "Test location", country: "Test", state: "", district: "", latitude: 0, longitude: 0, timezone: "Etc/UTC", utc: "2000-01-01T12:00:00Z" },
  settings: { zodiac: "Sidereal", ayanamsha: "Lahiri / Chitrapaksha", houseModel: "Whole Sign Houses", nodeMode: "Mean Node", ephemeris: "Swiss Ephemeris Moshier", divisionalCharts: ["D1 — Rashi"] },
  ascendant: { longitude: 95, rashiIndex: 3, rashi: RASHIS[3] },
  planets: Object.entries(PLANET_SYMBOLS).map(([name, symbol], index) => {
    const rashiIndex = index;
    return { name, symbol, longitude: rashiIndex * 30 + 2, rashiIndex, rashi: RASHIS[rashiIndex], degreeInRashi: 2, nakshatra: "Test", nakshatraNumber: 1, pada: 1, degreeInNakshatra: 2, nakshatraLord: "Ketu", house: ((rashiIndex - 3 + 12) % 12) + 1, retrograde: false };
  }),
  calculatedAt: "2000-01-01T12:00:00Z",
};

describe("traditional chart style mappings", () => {
  it("defines twelve distinct regions in each chart template", () => {
    expect(NORTH_HOUSES).toHaveLength(12);
    expect(new Set(NORTH_HOUSES.map((cell) => cell.house)).size).toBe(12);
    expect(SOUTH_RASHI_CELLS).toHaveLength(12);
    expect(new Set(SOUTH_RASHI_CELLS.map((cell) => cell.rashi)).size).toBe(12);
    expect(EAST_RASHI_CELLS).toHaveLength(12);
    expect(new Set(EAST_RASHI_CELLS.map((cell) => cell.rashi)).size).toBe(12);
  });

  it("preserves every planet's position facts when switching layouts", () => {
    const original = JSON.stringify(chart.planets.map(({ name, longitude, rashiIndex, nakshatra, pada }) => ({ name, longitude, rashiIndex, nakshatra, pada })));
    for (const style of ["north", "east", "south"] as ChartStyle[]) {
      const groups = chartGroups(chart.planets, chart.ascendant.rashiIndex, style);
      expect(groups.flatMap((group) => group.planets).map((planet) => planet.name).sort()).toEqual(Object.keys(PLANET_SYMBOLS).sort());
      expect(JSON.stringify(chart.planets.map(({ name, longitude, rashiIndex, nakshatra, pada }) => ({ name, longitude, rashiIndex, nakshatra, pada })))).toBe(original);
    }
  });

  it("keeps North houses fixed while Rashis shift with the Ascendant", () => {
    const groups = chartGroups(chart.planets, 3, "north");
    expect(groups.map((group) => group.house)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
    expect(groups.map((group) => group.rashiIndex)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]);
    expect(groups[0].rashiIndex).toBe(3);
    expect(groups[0].planets.every((planet) => planet.house === 1 && planet.rashiIndex === 3)).toBe(true);
  });

  it("keeps East and South Rashi positions fixed and assigns houses from the Ascendant", () => {
    for (const style of ["east", "south"] as const) {
      const groups = chartGroups(chart.planets, 3, style);
      expect(groups.map((group) => group.rashiIndex)).toEqual(Array.from({ length: 12 }, (_, index) => index));
      expect(groups[3].house).toBe(1);
      expect(groups[9].house).toBe(7);
    }
  });
});

