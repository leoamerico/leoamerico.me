import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Decisão: página única (SPA com âncoras) representada pela home com
  // priority 1.0. Seções listadas como referência para crawlers,
  // embora sejam âncoras na mesma página.
  // /ceo/** NUNCA incluMdo — gate I2.
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/#sobre`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#resultados`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#audit`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/#contato`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
