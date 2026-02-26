// ============================================================================
// app/api/audit/route.ts — API Route for GitHub audit data
// Server-side only. Token never reaches the client.
// ISR cached for 1 hour via Next.js revalidate.
// ============================================================================

import { NextResponse } from "next/server";
import { generateAuditReport } from "@/lib/github-audit";

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function GET() {
  try {
    const report = await generateAuditReport();

    if (!report) {
      return NextResponse.json(
        { error: "Audit unavailable — GITHUB_TOKEN not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Audit generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate audit report" },
      { status: 500 }
    );
  }
}
