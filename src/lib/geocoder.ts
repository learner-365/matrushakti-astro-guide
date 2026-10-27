
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

export async function searchBirthPlaces(query: string, language = "en"): Promise<BirthPlace[]> {
  const apiKey = process.env.OPEN_METEO_API_KEY;
  const host = apiKey ? "customer-geocoding-api.open-meteo.com" : "geocoding-api.open-meteo.com";
  const url = new URL(`https://${host}/v1/search`);
  url.searchParams.set("name", query.trim());
  // Retrieve enough same-country matches for the optional state/district
  // filters in the client to find the user's location.
  url.searchParams.set("count", "100");
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");
  if (apiKey) url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, { next: { revalidate: 86_400 } });
  if (!response.ok) throw new Error("The place search service is temporarily unavailable. Please retry.");
  const body = await response.json() as { results?: OpenMeteoPlace[]; error?: boolean };
  return (body.results ?? []).map(parsePlace);
}

export async function resolveBirthPlace(id: number): Promise<BirthPlace> {
  const apiKey = process.env.OPEN_METEO_API_KEY;
  const host = apiKey ? "customer-geocoding-api.open-meteo.com" : "geocoding-api.open-meteo.com";
  const url = new URL(`https://${host}/v1/get`);
  url.searchParams.set("id", String(id));
  if (apiKey) url.searchParams.set("apikey", apiKey);
  const response = await fetch(url, { next: { revalidate: 86_400 } });
  if (!response.ok) throw new Error("The selected place could not be verified. Search again and choose another result.");
  const item = await response.json() as OpenMeteoPlace;
  if (item.id !== id) throw new Error("The selected place could not be verified. Choose a result from the list.");
  return parsePlace(item);
}

