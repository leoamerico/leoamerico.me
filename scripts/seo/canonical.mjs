// scripts/seo/canonical.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Espelho JS de lib/seo/personas.ts + lib/seo/intents.ts.
// Mantido em sincronia manual — fonte da verdade é o par de arquivos .ts.
// ─────────────────────────────────────────────────────────────────────────────

export const PERSONA_KEYWORDS = {
  prefeito:    ["prefeito", "município", "gestão pública", "municipal"],
  secretario:  ["secretário", "secretaria", "pasta"],
  procurador:  ["procurador", "jurídico", "legal"],
  auditor:     ["auditor", "auditoria", "fiscalização", "controle interno"],
  controlador: ["controlador", "controladoria", "CGM"],
  fiscal:      ["fiscal", "tributário", "receita"],
  cidadao:     ["cidadão", "cidadã", "transparência pública"],
  empresario:  ["empresário", "empresa", "ERP", "Env Neo"],
  gestor:      ["gestor", "gestão empresarial"],
  tech:        ["arquitetura", "código", "ArchUnit", "API", "hexagonal"],
  geral:       [],
};

export const ANCHOR_PERSONA_MAP = {
  "hero":           ["geral", "empresario", "prefeito"],
  "sobre":          ["geral", "empresario", "gestor"],
  "capacidades":    ["empresario", "gestor", "prefeito", "secretario"],
  "stack":          ["tech"],
  "resultados":     ["prefeito", "secretario", "procurador", "auditor", "controlador", "fiscal"],
  "envneo":         ["empresario", "gestor"],
  "govevia":        ["prefeito", "secretario", "procurador", "auditor", "controlador"],
  "audit":          ["tech", "auditor", "controlador"],
  "certifications": ["geral"],
  "diploma":        ["geral"],
  "contato":        ["geral"],
};

export const ANCHOR_INTENT_MAP = {
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
 * Classifica url+h1+title → { personas, intent }
 * Mesma lógica do seo-v3-coverage.mjs, centralizada aqui.
 */
export function classify(url, h1Text, title) {
  // Âncoras inline: tenta mapa canônico primeiro
  const anchor = url.includes("#") ? url.split("#")[1] : null;
  if (anchor && ANCHOR_PERSONA_MAP[anchor]) {
    return {
      personas: ANCHOR_PERSONA_MAP[anchor],
      intent:   ANCHOR_INTENT_MAP[anchor] ?? "overview",
    };
  }

  // Padrões de URL path
  const URL_INTENT_PATTERNS = [
    { pattern: /\/plataforma\/prefeito/,    personas: ["prefeito"],             intent: "produto-grp"  },
    { pattern: /\/plataforma\/procurador/,  personas: ["procurador"],           intent: "compliance"   },
    { pattern: /\/plataforma\/auditor/,     personas: ["auditor"],              intent: "compliance"   },
    { pattern: /\/plataforma\/secretar/,    personas: ["secretario"],           intent: "produto-grp"  },
    { pattern: /\/plataforma\/controlador/, personas: ["controlador"],          intent: "compliance"   },
    { pattern: /\/plataforma\/fiscal/,      personas: ["fiscal"],               intent: "produto-grp"  },
    { pattern: /\/plataforma\/cidadao/,     personas: ["cidadao"],              intent: "overview"     },
    { pattern: /\/erp|\/envneo|\/env-neo/,  personas: ["empresario", "gestor"], intent: "produto-erp"  },
    { pattern: /\/sobre|\/about/,           personas: ["geral"],                intent: "sobre"        },
    { pattern: /\/seguranca|\/security/,    personas: ["tech"],                 intent: "stack"        },
    { pattern: /\/compliance|\/lgpd/,       personas: ["procurador", "auditor"],intent: "compliance"   },
    { pattern: /\/contato|\/contact/,       personas: ["geral"],                intent: "contato"      },
    { pattern: /\/preco|\/pricing/,         personas: ["empresario"],           intent: "overview"     },
  ];
  for (const { pattern, personas, intent } of URL_INTENT_PATTERNS) {
    if (pattern.test(url)) return { personas, intent };
  }

  // Fallback: keywords em H1/title
  const combined = (h1Text + " " + title).toLowerCase();
  const matched = [];
  for (const [persona, keywords] of Object.entries(PERSONA_KEYWORDS)) {
    if (keywords.some(kw => combined.includes(kw.toLowerCase()))) {
      matched.push(persona);
    }
  }
  return {
    personas: matched.length > 0 ? matched : ["geral"],
    intent:   anchor ? (ANCHOR_INTENT_MAP[anchor] ?? "overview") : "overview",
  };
}
