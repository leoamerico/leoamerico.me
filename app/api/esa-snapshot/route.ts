// app/api/esa-snapshot/route.ts
// ISR 1h — fonte única para todas as telas do ESA Atlas.
import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/esa/buildSnapshot";

export const revalidate = 3600;

export async function GET() {
  const snapshot = await buildSnapshot();
  if (!snapshot) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured or fetch failed" }, { status: 503 });
  }
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
