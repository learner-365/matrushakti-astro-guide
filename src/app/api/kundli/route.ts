import { NextRequest, NextResponse } from "next/server";
import { resolveBirthPlace } from "@/lib/geocoder";
import { calculateChart } from "@/lib/calculate";
import { allowRequest, requestKey } from "@/lib/rate-limit";
import { chartInputSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!allowRequest(requestKey(request, "kundli"), 12, 60_000)) {
    return NextResponse.json({ error: "Too many chart requests. Wait a moment and retry." }, { status: 429 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = chartInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the submitted birth details." }, { status: 400 });
  }
  try {
    const place = await resolveBirthPlace(parsed.data.placeId);
    const chart = calculateChart(parsed.data, place);
    return NextResponse.json({ chart }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Chart calculation failed." }, { status: 422 });
  }
}

