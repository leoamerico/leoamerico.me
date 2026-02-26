// lib/seo/personas.ts
// ─────────────────────────────────────────────────────────────────────────────
// Dicionário canônico de personas — única fonte da verdade para V3.
// Importado tanto pelo static analyzer (buildV3Static.ts) como pela
// documentação. O live script consome canonical.mjs (espelho JS).
// ─────────────────────────────────────────────────────────────────────────────
import type { V3Persona } from "./types";

/**
 * Keywords em PT-BR que identificam cada persona a partir de H1/title.
 * Usadas como fallback quando o mapeamento por URL/âncora não bate.
 */
export const PERSONA_KEYWORDS: Record<V3Persona, string[]> = {
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
  geral:       [], // fallback — captura qualquer seção sem match específico
};

/**
 * Mapa âncora → personas primárias.
 * Deve estar em sincronia com RAW_UNITS em buildV3Static.ts.
 */
export const ANCHOR_PERSONA_MAP: Partial<Record<string, V3Persona[]>> = {
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
