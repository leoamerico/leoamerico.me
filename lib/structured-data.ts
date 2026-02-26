// lib/structured-data.ts
import { SITE_URL } from "./site-url";

export const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Leonardo Américo José Ribeiro",
  alternateName: "Leo Américo",
  url: SITE_URL,
  sameAs: [
    "https://github.com/leoamerico",
    "https://www.linkedin.com/in/leoamericojr",
  ],
  jobTitle: "Arquiteto de Software",
} as const;
