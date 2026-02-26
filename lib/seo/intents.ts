// lib/seo/intents.ts
// ─────────────────────────────────────────────────────────────────────────────
// Dicionário canônico de intents — única fonte da verdade para V3.
// ─────────────────────────────────────────────────────────────────────────────
import type { V3Intent } from "./types";

/**
 * Mapa âncora → intent semântico.
 * Deve estar em sincronia com RAW_UNITS em buildV3Static.ts.
 */
export const ANCHOR_INTENT_MAP: Partial<Record<string, V3Intent>> = {
  "hero":           "hero",
  "sobre":          "sobre",
  "capacidades":    "capacidades",
  "stack":          "stack",
  "resultados":     "produto-grp",
  "envneo":         "produto-erp",
  "govevia":        "compliance",
  "audit":          "governanca",
  "certifications": "credibilidade",
  "diploma":        "credibilidade",
  "contato":        "contato",
};

/**
 * Padrões de URL → intent (para live classifier).
 * Ordem importa: primeiro match vence.
 */
export const URL_INTENT_PATTERNS: { pattern: RegExp; intent: V3Intent }[] = [
  { pattern: /\/plataforma\/prefeito/,    intent: "produto-grp"  },
  { pattern: /\/plataforma\/procurador/,  intent: "compliance"   },
  { pattern: /\/plataforma\/auditor/,     intent: "compliance"   },
  { pattern: /\/plataforma\/secretar/,    intent: "produto-grp"  },
  { pattern: /\/plataforma\/controlador/, intent: "compliance"   },
  { pattern: /\/plataforma\/fiscal/,      intent: "produto-grp"  },
  { pattern: /\/plataforma\/cidadao/,     intent: "overview"     },
  { pattern: /\/erp|\/envneo|\/env-neo/,  intent: "produto-erp"  },
  { pattern: /\/sobre|\/about/,           intent: "sobre"        },
  { pattern: /\/seguranca|\/security/,    intent: "stack"        },
  { pattern: /\/compliance|\/lgpd/,       intent: "compliance"   },
  { pattern: /\/contato|\/contact/,       intent: "contato"      },
  { pattern: /\/preco|\/pricing/,         intent: "overview"     },
  { pattern: /\/#sobre$/,                 intent: "sobre"        },
  { pattern: /\/#resultados/,             intent: "overview"     },
  { pattern: /\/#audit/,                  intent: "governanca"   },
  { pattern: /\/#contato/,                intent: "contato"      },
];
