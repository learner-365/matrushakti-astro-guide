import * as sweph from "sweph";
import { ChartResult, PLANET_SYMBOLS, RASHIS, houseForRashi, nakshatraDetails, normalizeDegrees, rashiIndex } from "@/lib/astro";
import { BirthPlace } from "@/lib/geocoder";
import { instantToUtcParts, localBirthTimeToUtc } from "@/lib/time";
import { ChartInput } from "@/lib/validation";

const c = sweph.constants;
const moshierFlags = c.SEFLG_MOSEPH | c.SEFLG_SPEED | c.SEFLG_SIDEREAL;
let initialized = false;

function initializeEngine(nodeMode: "mean" | "true") {
  // Moshier is part of the Swiss Ephemeris source and needs no external data files.
  // The package keeps sidereal mode in native process state, so set it for each
  // synchronous calculation before using the engine.
  if (!initialized) {
    sweph.set_ephe_path(process.env.SWISSEPH_EPHE_PATH || process.cwd());
    initialized = true;
  }
  sweph.set_sid_mode(c.SE_SIDM_LAHIRI, 0, 0);
  const node = nodeMode === "mean" ? c.SE_MEAN_NODE : c.SE_TRUE_NODE;
  return node;
}

function getLongitude(jdUt: number, body: number, flags: number) {
  const result = sweph.calc_ut(jdUt, body, flags);
  if (result.flag < 0 || !Number.isFinite(result.data[0])) {
    throw new Error(result.error || "The ephemeris could not calculate this chart.");
  }
  return { longitude: normalizeDegrees(result.data[0]), speed: result.data[3] };
}

const bodies = [
  ["Sun", c.SE_SUN], ["Moon", c.SE_MOON], ["Mars", c.SE_MARS],
  ["Mercury", c.SE_MERCURY], ["Jupiter", c.SE_JUPITER], ["Venus", c.SE_VENUS],
  ["Saturn", c.SE_SATURN],
] as const;

export function calculateChart(input: ChartInput, place: BirthPlace): ChartResult {
  const instant = localBirthTimeToUtc(input.birthDate, input.birthTime, place.timezone);
  const utc = instantToUtcParts(instant);
  const date = new Date(Date.UTC(utc.year, utc.month - 1, utc.day));
  if (date.getTime() > Date.now()) throw new Error("Birth date cannot be in the future.");

  const jdResult = sweph.utc_to_jd(utc.year, utc.month, utc.day, utc.hour, utc.minute, utc.second, c.SE_GREG_CAL);
  if (jdResult.flag !== c.OK) throw new Error(jdResult.error || "Could not convert the birth time to Julian Day.");
  const jdUt = jdResult.data[1];

  const nodeBody = initializeEngine(input.nodeMode);
  const houses = sweph.houses_ex(jdUt, c.SEFLG_SIDEREAL, place.latitude, place.longitude, "W");
  if (houses.flag !== c.OK || !houses.data.points || !Number.isFinite(houses.data.points[0])) {
    throw new Error("The Ascendant could not be calculated for this place and time.");
  }
  const ascendantLongitude = normalizeDegrees(houses.data.points[0]);
  const ascendantSign = rashiIndex(ascendantLongitude);
  const planets: { name: string; longitude: number; speed: number }[] = bodies.map(([name, body]) => {
    const calculated = getLongitude(jdUt, body, moshierFlags);
    return { name, ...calculated };
  });
  const rahu = getLongitude(jdUt, nodeBody, moshierFlags);
  planets.push({ name: "Rahu", ...rahu });
  planets.push({ name: "Ketu", longitude: normalizeDegrees(rahu.longitude + 180), speed: rahu.speed });

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

