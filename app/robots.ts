import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // ENFORCEMENT gate I2: área soberana /ceo/ nunca indexada.
        // Qualquer alteração aqui requer confirmação de que /ceo/ permanece no Disallow.
        // Gate automatizado: bun run audit:infra → I2.
        disallow: ["/ceo/", "/api/ceo/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
