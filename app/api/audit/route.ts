// ============================================================================
// app/api/audit/route.ts — API Route for GitHub audit data
// Server-side only. Token never reaches the client.
// ISR cached for 1 hour via Next.js revalidate.
// Security: no PII, no private repo content, rate-limited, cache private.
// ============================================================================

import { NextResponse } from "next/server";
import { generateAuditReport } from "@/lib/github-audit";

export const revalidate = 3600; // ISR: revalidate every 1 hour

// Simple in-memory rate limiter: max 10 req/min per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export async function GET(req: Request) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

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
        // private: prevents CDN from caching sensitive aggregated data
        "Cache-Control": "private, s-maxage=0, max-age=3600",
      },
    });
  } catch (error) {
    // Never expose internal error details to the client
    console.error("Audit generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate audit report" },
      { status: 500 }
    );
  }
}
