// lib/esa/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Schema canônico do ESA Snapshot.
// Toda tela do Atlas consome este tipo — nunca structs locais.
// Alterações aqui requerem atualização de buildSnapshot.ts e selectors.ts.
// ─────────────────────────────────────────────────────────────────────────────

/** Status de cobertura: provável origem de falha num pentest/auditoria */
export type CoverageStatus = "enforced" | "partial" | "declared" | "gap";

/** Mecanismo canônico de enforcement */
export type Mechanism =
  | "archunit"
  | "db_trigger"
  | "github_actions"
  | "runtime_guard"
  | "script_ci_gate"
  | "adr_pr_review";

/** Um dos 3 planos invariantes do ESA */
export type EsaPlane = "trust" | "decision" | "evidence";

export interface EsaCodeRef {
  path: string;
  exists: boolean; // verificado contra a árvore do repo
}

export interface EsaEnforcement {
  id: string;
  description: string;
  status: "active" | "proposed" | "deprecated";
  mechanism: Mechanism | string;
  mechanismLabel: string;
  adrs: string[];
  codeRefs: EsaCodeRef[];
  coverage: CoverageStatus;
  plane: EsaPlane;
  /** Gate CI que garante este enforcement (job name no workflow) */
  ciGateRef?: string;
}

export interface EsaInvariant {
  id: string;
  label: string;
  adr: string;
  plane: EsaPlane;
  coverage: CoverageStatus;
}

export interface EsaSnapshot {
  generatedAt: string;
  sourceRef: string; // commit SHA da branch main ou "fallback"
  enforcements: EsaEnforcement[];
  invariants: EsaInvariant[];
  ciGateNames: string[]; // job names ativos no workflow
  totals: {
    active: number;
    enforced: number;
    partial: number;
    declared: number;
    gap: number;
  };
}
