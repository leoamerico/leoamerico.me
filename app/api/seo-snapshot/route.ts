// app/api/seo-snapshot/route.ts — ISR 1h
import { buildSeoSnapshot } from "@/lib/seo/buildSeoSnapshot";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const snapshot = await buildSeoSnapshot();
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error("[seo-snapshot] build failed:", err);
    return NextResponse.json({ error: "snapshot build failed" }, { status: 503 });
  }
}
