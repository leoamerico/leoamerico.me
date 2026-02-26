// lib/seo/types.ts — Schema canônico do SEO Atlas
// ─────────────────────────────────────────────────────────────────────────────
// Três planos invariantes (espelho do ESA):
//   Discovery  — crawlers encontram  (robots/sitemap/status/canonical)
//   Relevance  — crawlers entendem   (title/description/OG/schema.org)
//   Performance— crawlers confiam    (CWV/payload/headers/a11y)
// ─────────────────────────────────────────────────────────────────────────────

export type GateStatus    = "pass" | "fail" | "warn";
export type RouteStatus   = 200 | 301 | 302 | 404 | "unknown";
export type SeoPlane      = "discovery" | "relevance" | "performance";

// ─── Resultado por campo de metadata ─────────────────────────────────────────
export type FieldStatus = "ok" | "warn" | "missing";

export interface SeoField {
  value: string | null;
  status: FieldStatus;
  hint?: string;       // ex.: "title muito curto (24 chars, ideal 30-60)"
}

// ─── Rota individual ─────────────────────────────────────────────────────────
export interface SeoRoute {
  url: string;                 // URL completa
  path: string;                // caminho da rota, ex.: "/"
  sourceFile: string;          // arquivo de origem, ex.: "app/layout.tsx"
  status: RouteStatus;
  indexable: boolean;          // não em disallow + não noindex
  inSitemap: boolean;
  plane: SeoPlane;             // plano primário

  title:        SeoField;
  description:  SeoField;
  canonical:    SeoField;
  ogTitle:      SeoField;
  ogDescription:SeoField;
  ogImage:      SeoField;
  twitterImage: SeoField;
  robotsMeta:   SeoField;
  lang:         SeoField;
  schemaTypes:  string[];      // JSON-LD @type values presentes

  issues: string[];            // problemas derivados
  /** E-SEO gate ao qual esse route está sujeito */
  gates: string[];
}

// ─── Gate binário E-SEO-n ────────────────────────────────────────────────────
export interface SeoGate {
  id: string;               // "E-SEO-1"
  label: string;
  description: string;
  plane: SeoPlane;
  status: GateStatus;
  violations: string[];     // mensagens de falha
  sourceRef: string;        // arquivo de evidência
}

// ─── Totais agregados ─────────────────────────────────────────────────────────
export interface SeoMetrics {
  totalRoutes: number;
  indexableRoutes: number;
  routesInSitemap: number;
  routesWithTitle: number;
  routesWithDescription: number;
  routesWithOg: number;
  routesWithSchema: number;
  gatesPass: number;
  gatesFail: number;
  gatesWarn: number;
  /** 0–100 pontuação de saúde SEO */
  healthScore: number;
}

// ─── Snapshot completo ────────────────────────────────────────────────────────
export interface SeoSnapshot {
  generatedAt: string;     // ISO-8601
  sourceRef: string;       // git commit SHA ou "unknown"
  sitemapUrl: string;
  robotsUrl: string;
  routes: SeoRoute[];
  gates: SeoGate[];
  metrics: SeoMetrics;
}
