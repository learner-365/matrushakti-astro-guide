import { describe, expect, it } from "vitest";
import { calculateChart } from "@/lib/calculate";
import { BirthPlace } from "@/lib/geocoder";

describe("Swiss Ephemeris chart calculation", () => {
  it("calculates D1 positions from local time, coordinates, historical zone and node mode", async () => {
    // The sample time and place are from the JHora reverse-engineering README;
    // this is a runtime smoke test, not an independent numerical validation.
    const place: BirthPlace = { id: 1, name: "Bengaluru", country: "India", countryCode: "IN", state: "Karnataka", district: "Bengaluru Urban", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata", featureCode: "PPLC" };
    const result = await calculateChart({ name: "Calculation test", birthDate: "1918-10-16", birthTime: "14:20", timeAccuracy: "exact", placeId: 1, nodeMode: "mean" }, place);

    expect(result.planets).toHaveLength(9);
    expect(result.planets.every((planet) => Number.isFinite(planet.longitude) && planet.longitude >= 0 && planet.longitude < 360)).toBe(true);
    expect(result.ascendant.rashi).toBeTruthy();
    expect(result.planets.every((planet) => planet.house >= 1 && planet.house <= 12)).toBe(true);
    const rahu = result.planets.find((planet) => planet.name === "Rahu")!;
    const ketu = result.planets.find((planet) => planet.name === "Ketu")!;
    expect((ketu.longitude - rahu.longitude + 360) % 360).toBeCloseTo(180, 10);
    expect(result.birth.utc).toBe("1918-10-16T08:50:00Z");
  });
});

