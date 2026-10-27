import { NextRequest, NextResponse } from "next/server";
import { searchBirthPlaces } from "@/lib/geocoder";
import { allowRequest, requestKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 100) return NextResponse.json({ places: [] });
  if (!allowRequest(requestKey(request, "geocode"), 30, 60_000)) {
    return NextResponse.json({ error: "Too many place searches. Wait a moment and retry." }, { status: 429 });
  }
  try {
    const places = await searchBirthPlaces(query);
    return NextResponse.json({ places }, { headers: { "Cache-Control": "private, max-age=0, must-revalidate" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Place search failed." }, { status: 502 });
  }
}

