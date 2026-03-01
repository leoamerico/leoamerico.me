// ============================================================================
// lib/brand-context.ts — Domain-aware brand & persona context
//
// Visitors arriving from leoamerico.me see the personal brand experience.
// Visitors arriving from Env Neo ecosystem domains (envneo.com, govevia.com.br,
// etc.) see a product-focused experience with persona awareness.
// ============================================================================

/** Known ecosystem domains and their brand key */
export const ECOSYSTEM_DOMAINS: Record<string, BrandKey> = {
  "leoamerico.me":     "personal",
  "www.leoamerico.me": "personal",
  "envneo.com":        "envneo",
  "www.envneo.com":    "envneo",
  "envneo.com.br":     "envneo",
  "www.envneo.com.br": "envneo",
  "govevia.com.br":    "govevia",
  "www.govevia.com.br":"govevia",
};

export type BrandKey = "personal" | "envneo" | "govevia";

/** Govevia personas — each cargo/function has its own cockpit view */
export type GoveviaPersona =
  | "prefeito"
  | "secretario"
  | "fiscal"
  | "contador"
  | "juridico"
  | "cidadao"
  | "protocolo"
  | "transparencia"
  | "contratos"
  | "rh"
  | "patrimonio"
  | "auditor";

export interface PersonaMeta {
  key: GoveviaPersona;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
}

export const GOVEVIA_PERSONAS: PersonaMeta[] = [
  { key: "prefeito",      label: "Prefeito(a)",               shortLabel: "PF", description: "Painel executivo com visão consolidada de todas as secretarias",         color: "amber"   },
  { key: "secretario",    label: "Secretário(a)",             shortLabel: "SC", description: "Gestão da secretaria com controle orçamentário e metas",               color: "cyan"    },
  { key: "fiscal",        label: "Fiscal de Contratos",       shortLabel: "FC", description: "Acompanhamento de contratos, medições e conformidade",                 color: "emerald" },
  { key: "contador",      label: "Contador(a)",               shortLabel: "CT", description: "Balancetes, prestação de contas e compliance TCE",                     color: "violet"  },
  { key: "juridico",      label: "Jurídico",                  shortLabel: "JR", description: "Pareceres, processos administrativos e conformidade legal",             color: "blue"    },
  { key: "cidadao",       label: "Cidadão",                   shortLabel: "CI", description: "Portal de transparência e acompanhamento de serviços",                 color: "emerald" },
  { key: "protocolo",     label: "Protocolo",                 shortLabel: "PL", description: "Gestão de documentos, tramitação e prazos",                            color: "cyan"    },
  { key: "transparencia", label: "Transparência e Controle",  shortLabel: "TC", description: "LAI, portal de transparência e dados abertos",                        color: "emerald" },
  { key: "contratos",     label: "Gestor de Contratos",       shortLabel: "GC", description: "Ciclo de vida de contratos, aditivos e vigências",                     color: "amber"   },
  { key: "rh",            label: "Recursos Humanos",          shortLabel: "RH", description: "Folha, lotação, férias e controle funcional",                          color: "violet"  },
  { key: "patrimonio",    label: "Patrimônio",                shortLabel: "PT", description: "Inventário, tombamento e movimentação de bens",                        color: "cyan"    },
  { key: "auditor",       label: "Auditor",                   shortLabel: "AU", description: "Trilhas de auditoria, evidências e rastreabilidade",                   color: "amber"   },
];

/** Brand-specific hero content overrides */
export const BRAND_HERO: Record<BrandKey, { badge: string; heading: string; paragraph: string }> = {
  personal: {
    badge: "Uberlândia, MG · Brasil",
    heading: "Leo Américo",
    paragraph:
      "Software de gestão que valida regras no fonte, se auto-documenta. Um núcleo modular onde o humano define as regras e a arquitetura as executa — a prova está no código ao vivo abaixo.",
  },
  envneo: {
    badge: "Ecossistema Env Neo",
    heading: "Leo Américo",
    paragraph:
      "Criador da Env Neo — arquitetura modular para gestão empresarial e pública. Núcleo compartilhado, validação no fonte, documentação gerada como saída operacional.",
  },
  govevia: {
    badge: "Govevia · GRP",
    heading: "Leo Américo",
    paragraph:
      "Arquiteto da Govevia — plataforma GRP com obrigações normativas transformadas em controles técnicos. Multi-tenant, trilha auditável, regras no fonte.",
  },
};

/** Cookie name for persisted persona selection */
export const PERSONA_COOKIE = "gv-persona";
/** Cookie name for brand key */
export const BRAND_COOKIE = "brand-key";

/**
 * Resolve brand key from hostname.
 * Falls back to "personal" for unknown hosts (localhost, preview URLs, etc.)
 */
export function resolveBrand(hostname: string): BrandKey {
  return ECOSYSTEM_DOMAINS[hostname] ?? "personal";
}
