import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveBrand, BRAND_COOKIE } from "@/lib/brand-context";

/**
 * Middleware — detects the incoming domain and sets a brand cookie.
 * This allows client components to adapt the experience based on
 * whether the visitor arrived via leoamerico.me, envneo.com, govevia.com.br, etc.
 *
 * Also checks for referrer-based brand detection:
 * if a visitor clicks through from govevia.com.br to leoamerico.me,
 * the referrer brand is set so the site can acknowledge the context.
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";
  const brand = resolveBrand(hostname);

  // Check referrer for ecosystem cross-linking
  const referer = request.headers.get("referer") ?? "";
  let refBrand = "";
  try {
    if (referer) {
      const refHost = new URL(referer).hostname;
      const resolved = resolveBrand(refHost);
      if (resolved !== "personal") refBrand = resolved;
    }
  } catch {
    // invalid referer — ignore
  }

  const response = NextResponse.next();

  // Set brand cookie (httpOnly: false so client JS can read it)
  response.cookies.set(BRAND_COOKIE, brand, {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
    httpOnly: false,
  });

  // If visitor came from another ecosystem domain, note the referrer brand
  if (refBrand) {
    response.cookies.set("ref-brand", refBrand, {
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files and api routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
