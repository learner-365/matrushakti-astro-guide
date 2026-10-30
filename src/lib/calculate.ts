import { ChartResult, PLANET_SYMBOLS, RASHIS, houseForRashi, nakshatraDetails, normalizeDegrees, rashiIndex } from "@/lib/astro";
import { BirthPlace } from "@/lib/geocoder";
import { instantToUtcParts, localBirthTimeToUtc } from "@/lib/time";
import { ChartInput } from "@/lib/validation";

async function getEngine() {
  const api = await import("@swisseph/browser");
  const swe = new api.SwissEphemeris();
  await swe.init();
  swe.setSiderealMode(api.SiderealMode.Lahiri);
  return { api, swe };
}

let enginePromise: ReturnType<typeof getEngine> | undefined;

export async function calculateChart(input: ChartInput, place: BirthPlace): Promise<ChartResult> {
  const instant = localBirthTimeToUtc(input.birthDate, input.birthTime, place.timezone);
  const utc = instantToUtcParts(instant);
  const utcDate = new Date(instant.toString());
  if (utcDate.getTime() > Date.now()) throw new Error("Birth date cannot be in the future.");

  enginePromise ??= getEngine();
  const { api, swe } = await enginePromise;
  const jdUt = swe.dateToJulianDay(utcDate, api.CalendarType.Gregorian);
  const ayanamsa = swe.getAyanamsa(jdUt);
  const sidereal = (longitude: number) => normalizeDegrees(longitude - ayanamsa);
  const flags = api.CalculationFlag.MoshierEphemeris | api.CalculationFlag.Speed;

  // calculateHouses exposes a tropical Ascendant, so convert it to Lahiri sidereal.
  const houseData = swe.calculateHouses(jdUt, place.latitude, place.longitude, api.HouseSystem.WholeSign);
  if (!Number.isFinite(houseData.ascendant)) {
    throw new Error("The Ascendant could not be calculated for this place and time.");
  }
  const ascendantLongitude = sidereal(houseData.ascendant);
  const ascendantSign = rashiIndex(ascendantLongitude);

  const bodies = [
    ["Sun", api.Planet.Sun], ["Moon", api.Planet.Moon], ["Mars", api.Planet.Mars],
    ["Mercury", api.Planet.Mercury], ["Jupiter", api.Planet.Jupiter], ["Venus", api.Planet.Venus],
    ["Saturn", api.Planet.Saturn],
  ] as const;
  const planets = bodies.map(([name, body]) => {
    const result = swe.calculatePosition(jdUt, body, flags);
    return { name, longitude: sidereal(result.longitude), speed: result.longitudeSpeed };
  });
  const node = swe.calculatePosition(
    jdUt,
    input.nodeMode === "mean" ? api.LunarPoint.MeanNode : api.LunarPoint.TrueNode,
    flags
  );
  const rahu = sidereal(node.longitude);
  planets.push({ name: "Rahu", longitude: rahu, speed: node.longitudeSpeed });
  planets.push({ name: "Ketu", longitude: normalizeDegrees(rahu + 180), speed: node.longitudeSpeed });

  return {
    birth: {
      name: input.name,
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      timeAccuracy: input.timeAccuracy,
      locationName: place.name,
      country: place.country,
      state: place.state,
      district: place.district,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
      utc: utc.iso,
    },
    settings: {
      zodiac: "Sidereal",
      ayanamsha: "Lahiri / Chitrapaksha",
      houseModel: "Whole Sign Houses",
      nodeMode: input.nodeMode === "mean" ? "Mean Node" : "True Node",
      ephemeris: "Swiss Ephemeris Moshier",
      divisionalCharts: ["D1 — Rashi"],
    },
    ascendant: {
      longitude: ascendantLongitude,
      rashiIndex: ascendantSign,
      rashi: RASHIS[ascendantSign],
    },
    planets: planets.map(({ name, longitude, speed }) => {
      const sign = rashiIndex(longitude);
      const nakshatra = nakshatraDetails(longitude);
      return {
        name,
        symbol: PLANET_SYMBOLS[name],
        longitude,
        rashiIndex: sign,
        rashi: RASHIS[sign],
        degreeInRashi: longitude - sign * 30,
        ...nakshatra,
        house: houseForRashi(sign, ascendantSign),
        retrograde: speed < 0,
      };
    }),
    calculatedAt: new Date().toISOString(),
  };
}
