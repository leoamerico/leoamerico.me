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
  v3?: V3CoverageReport;   // opcional: injetado por buildV3Static
}

// ═══════════════════════════════════════════════════════════════════════════════
// V3 — Content Coverage (Persona/Intent)
// ═══════════════════════════════════════════════════════════════════════════════

/** Persona institucional alvo do conteúdo */
export type V3Persona =
  | "prefeito" | "secretario" | "procurador" | "auditor"
  | "controlador" | "fiscal" | "cidadao"
  | "empresario" | "gestor"
  | "tech" | "geral";

/** Objetivo/intenção da unidade de conteúdo */
export type V3Intent =
  | "hero" | "sobre" | "credibilidade" | "produto-grp" | "produto-erp"
  | "compliance" | "governanca" | "stack" | "capacidades"
  | "contato" | "overview";

export type V3Severity = "P0" | "P1" | "P2";
export type V3FindingType = "thin-content" | "cannibalization" | "heading-drift" | "promise-drift";

/** Unidade de conteúdo — seção da página ou rota completa */
export interface ContentUnit {
  id: string;              // ex.: "home#sobre"
  url: string;             // URL com âncora se aplicável
  path: string;            // caminho sem âncora
  anchor: string | null;   // ex.: "#sobre"
  sourceFile: string;      // "lib/constants.ts → ABOUT"
  label: string;           // nome da seção
  persona: V3Persona[];
  intent: V3Intent;
  wordCount: number;
  h1: string[];
  h2: string[];
  h3: string[];
  hasH1: boolean;
  hasH2: boolean;
  contentSignature: string;  // hash simples: h1+h2+firstWords
  /** evidências textuais brutas usadas no cálculo */
  textSample: string;
}

/** Achado de cobertura (thin, canibalização, etc.) */
export interface V3Finding {
  id: string;
  type: V3FindingType;
  severity: V3Severity;
  units: string[];         // ids das ContentUnits envolvidas
  evidence: string;        // explicação objetiva com métricas
  recommendation: string;
}

/** Cobertura por persona — quantas unidades atendem cada persona */
export interface V3PersonaCoverage {
  persona: V3Persona;
  units: string[];         // ids
  intents: V3Intent[];
  hasThinContent: boolean;
  hasConflict: boolean;
}

/** Relatório V3 completo */
export interface V3CoverageReport {
  generatedAt: string;
  sourceRef: string;
  strategy: "static" | "live";  // "static" = análise da fonte; "live" = HTML fetch
  units: ContentUnit[];
  findings: V3Finding[];
  personaCoverage: V3PersonaCoverage[];
  summary: {
    totalUnits: number;
    thinCount: number;
    cannibalizationCount: number;
    p0Count: number;
    p1Count: number;
    p2Count: number;
  };
}
