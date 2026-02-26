// lib/site-url.ts
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://leoamerico.me").replace(/\/+$/, "");
