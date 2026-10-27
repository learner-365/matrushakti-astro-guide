export const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
] as const;

export const RASHI_ENGLISH = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
  "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
  "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

export const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
] as const;

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

export type Planet = {
  name: string;
  symbol: string;
  longitude: number;
  rashiIndex: number;
  rashi: string;
  degreeInRashi: number;
  nakshatra: string;
  nakshatraNumber: number;
  pada: number;
  degreeInNakshatra: number;
  nakshatraLord: string;
  house: number;
  retrograde: boolean;
};

export type ChartResult = {
  birth: {
    name: string;
    birthDate: string;
    birthTime: string;
    timeAccuracy: "exact" | "approximate";
    locationName: string;
    country: string;
    state: string;
    district: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utc: string;
  };
  settings: {
    zodiac: "Sidereal";
    ayanamsha: "Lahiri / Chitrapaksha";
    houseModel: "Whole Sign Houses";
    nodeMode: "Mean Node" | "True Node";
    ephemeris: "Swiss Ephemeris Moshier";
    divisionalCharts: ["D1 — Rashi"];
  };
  ascendant: { longitude: number; rashiIndex: number; rashi: string };
  planets: Planet[];
  calculatedAt: string;
};

export function normalizeDegrees(value: number): number {
  const n = value % 360;
  return n < 0 ? n + 360 : n;
}

export function rashiIndex(longitude: number): number {
  return Math.floor(normalizeDegrees(longitude) / 30);
}

export function nakshatraDetails(longitude: number) {
  const normalized = normalizeDegrees(longitude);
  const span = 360 / 27;
  const padaSpan = span / 4;
  const nakshatraNumber = Math.floor(normalized / span);
  const within = normalized - nakshatraNumber * span;
  return {
    nakshatra: NAKSHATRAS[nakshatraNumber],
    nakshatraNumber: nakshatraNumber + 1,
    pada: Math.floor(within / padaSpan) + 1,
    degreeInNakshatra: within,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraNumber % 9],
  };
}

export function houseForRashi(planetRashiIndex: number, ascendantRashiIndex: number): number {
  return ((planetRashiIndex - ascendantRashiIndex + 12) % 12) + 1;
}

export function formatDMS(degrees: number): string {
  const totalSeconds = Math.round(degrees * 3600);
  const d = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${d}° ${String(m).padStart(2, "0")}′ ${String(s).padStart(2, "0")}″`;
}

