export type BirthPlace = {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  timezone: string;
  featureCode: string;
};

type OpenMeteoPlace = {
  id: number;
  name: string;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  feature_code?: string;
};

function parsePlace(item: OpenMeteoPlace): BirthPlace {
  if (!Number.isInteger(item.id) || !item.name || !item.country || !item.timezone ||
      !Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) {
    throw new Error("The location provider returned an incomplete location.");
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: item.timezone });
  } catch {
    throw new Error("The selected location did not resolve to a valid IANA time zone.");
  }
  return {
    id: item.id,
    name: item.name,
    country: item.country,
    countryCode: item.country_code,
    state: item.admin1 ?? "",
    district: item.admin2 ?? "",
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
    featureCode: item.feature_code ?? "",
  };
}

export async function searchBirthPlaces(query: string, language = "en", signal?: AbortSignal): Promise<BirthPlace[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query.trim());
  url.searchParams.set("count", "100");
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("The place search service is temporarily unavailable. Please retry.");
  const body = await response.json() as { results?: OpenMeteoPlace[]; error?: boolean };
  return (body.results ?? []).map(parsePlace);
}
