// lib/seo/buildV3Static.ts — SERVER ONLY
// ─────────────────────────────────────────────────────────────────────────────
// Análise V3 (Cobertura de Conteúdo / Persona / Intent) derivada
// estaticamente de lib/constants.ts — sem necessidade de servidor ativo.
//
// Evidência: toda unidade aponta ao arquivo-fonte (lib/constants.ts → KEY).
// ─────────────────────────────────────────────────────────────────────────────
import type {
  ContentUnit, V3CoverageReport, V3Finding,
  V3PersonaCoverage, V3Persona, V3Intent,
} from "./types";
import { readFile } from "fs/promises";
import path from "path";

const ROOT   = process.cwd();
const SITE   = "https://leoamerico.me";

// ─── Commit SHA (melhor esforço) ──────────────────────────────────────────────
async function headSha(): Promise<string> {
  try {
    const ref = await readFile(path.join(ROOT, ".git/HEAD"), "utf-8");
    const resolved = ref.startsWith("ref:")
      ? await readFile(path.join(ROOT, ".git", ref.trim().slice(5)), "utf-8")
      : ref;
    return resolved.trim().slice(0, 7);
  } catch { return "unknown"; }
}

// ─── Hash simples para content signature ─────────────────────────────────────
function signature(...parts: string[]): string {
  const str = parts.join("|").toLowerCase().replace(/\s+/g, " ").trim();
  let h = 0;
  for (let i = 0; i < Math.min(str.length, 256); i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// ─── Contagem de palavras simples ─────────────────────────────────────────────
function wordCount(text: string): number {
  return text
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2).length;
}

// ─── Construção das unidades de conteúdo ─────────────────────────────────────
// Cada seção de lib/constants.ts vira uma ContentUnit com persona+intent mapeados.

type RawUnit = {
  id: string;
  anchor: string | null;
  label: string;
  sourceKey: string;
  persona: V3Persona[];
  intent: V3Intent;
  textFragments: string[];
  h1: string[];
  h2: string[];
  h3: string[];
};

const RAW_UNITS: RawUnit[] = [
  {
    id: "home#hero",
    anchor: null,
    label: "Hero — Leo Américo",
    sourceKey: "HERO",
    persona: ["geral", "empresario", "prefeito"],
    intent: "hero",
    textFragments: [
      "Leo Américo",
      "ERP · Env Neo — gestão empresarial",
      "GRP · Govevia — gestão pública",
      "Software de gestão que valida regras no fonte, se auto-documenta. Um núcleo modular onde o humano define as regras e a arquitetura as executa — a prova está no código ao vivo abaixo.",
      "2 domínios. Um núcleo.",
      "88 entidades JPA no kernel do Govevia",
      "178 casos de uso implementados",
    ],
    h1: ["Leo Américo"],
    h2: ["ERP · Env Neo — gestão empresarial", "GRP · Govevia — gestão pública"],
    h3: [],
  },
  {
    id: "home#sobre",
    anchor: "#sobre",
    label: "Sobre — A tese em dois domínios",
    sourceKey: "ABOUT",
    persona: ["geral", "empresario", "gestor"],
    intent: "sobre",
    textFragments: [
      "A tese em dois domínios",
      "16 anos operando sistemas de gestão no setor público produziram uma arquitetura: um núcleo modular com validação no fonte, que testa e documenta as regras que a pessoa decidiu. Essa experiência é a origem — não o serviço atual.",
      "Em 2024 fundei a Env Neo Ltda para materializar essa arquitetura em dois domínios: Env Neo (ERP) e Govevia (GRP). A IA como instrumento de quem opera — não como substituto do que já está rodando.",
      "Bacharel em Sistemas de Informação, membro ativo do PMI.",
      "Uberlândia, MG · Brasil",
    ],
    h1: [],
    h2: ["A tese em dois domínios"],
    h3: [],
  },
  {
    id: "home#capacidades",
    anchor: "#sobre",  // rendered dentro do bloco #sobre
    label: "Expertise — O que consigo recuperar antes que se perca",
    sourceKey: "EXPERTISE",
    persona: ["empresario", "gestor", "prefeito", "secretario"],
    intent: "capacidades",
    textFragments: [
      "O que consigo recuperar antes que se perca",
      "Lógica de negócio antes da migração",
      "Sistemas legados guardam regras que nenhum documento registrou. Quando a empresa troca de plataforma — ou adota IA — essa lógica desaparece junto. Estruturo e transponho antes da perda: processos, validações, políticas e dependências ocultas viram arquitetura verificável.",
      "Processo como contrato técnico",
      "O que hoje é um documento Word ou uma planilha de RH vira BPMN, ADR ou POLÍTICA no fonte. A regra deixa de viver na cabeça de quem sabe — e passa a ser testada, auditada e documentada automaticamente pelo próprio sistema.",
      "IA como parte da operação",
      "Não IA como feature colada em processo quebrado. IA que executa as regras que o humano definiu no fonte, gera documentação estruturada sob supervisão — não como camada adicional. O processo limpo é o ponto de partida.",
      "Digitalização orientada a resultado",
      "O mesmo ciclo aplicado na gestão pública municipal — rastreabilidade, controle por perfil, trilha de auditoria — agora disponível para empresas privadas que querem usar IA como aliada, não como experimento.",
    ],
    h1: [],
    h2: ["O que consigo recuperar antes que se perca"],
    h3: [
      "Lógica de negócio antes da migração",
      "Processo como contrato técnico",
      "IA como parte da operação",
      "Digitalização orientada a resultado",
    ],
  },
  {
    id: "home#stack",
    anchor: "#audit",
    label: "Stack — Como o núcleo é construído",
    sourceKey: "STACK",
    persona: ["tech"],
    intent: "stack",
    textFragments: [
      "Como o núcleo é construído",
      "Domínio: Java LTS, Arquitetura Hexagonal, DDD, CQRS",
      "Dados: PostgreSQL, Row-Level Security, Oracle DB",
      "Infra: AWS, GCP, Docker",
      "Frontends: Next.js, React, Node.js",
      "Qualidade: BPMN 2.0, ADR, POLICY, ArchUnit",
    ],
    h1: [],
    h2: ["Como o núcleo é construído"],
    h3: ["Domínio", "Dados", "Infra", "Frontends", "Qualidade"],
  },
  {
    id: "home#resultados-grp",
    anchor: "#resultados",
    label: "Produtos — Govevia (GRP)",
    sourceKey: "PROJECTS → Govevia",
    persona: ["prefeito", "secretario", "procurador", "auditor", "controlador", "fiscal"],
    intent: "produto-grp",
    textFragments: [
      "GRP · Gestão Pública · Em produção",
      "Govevia",
      "Obrigações normativas (TCE, LGPD, transparência) transformadas em controles técnicos verificáveis. Multi-tenant com Row-Level Security por município. Trilhas de auditoria com verificação criptográfica. Desenvolvida pela Env Neo Ltda.",
      "88 entidades JPA no kernel do Govevia",
      "178 casos de uso implementados",
      "Arquitetura hexagonal com ArchUnit",
      "ADRs e POLICYs como estrutura do código",
    ],
    h1: [],
    h2: ["Dois domínios. Um núcleo.", "Govevia"],
    h3: ["GRP · Gestão Pública · Em produção"],
  },
  {
    id: "home#resultados-erp",
    anchor: "#resultados",
    label: "Produtos — Env Neo (ERP)",
    sourceKey: "PROJECTS → Env Neo",
    persona: ["empresario", "gestor"],
    intent: "produto-erp",
    textFragments: [
      "ERP · Gestão Empresarial",
      "Env Neo",
      "Núcleo de gestão empresarial com a mesma base modular do GRP. Processos, contratos, documentos e fluxos financeiros com validação declarativa no fonte. Env Neo Ltda, CNPJ 36.207.211/0001-47.",
      "API com validação no fonte",
      "Controle de acesso por perfil e organização",
      "Documentação gerada como saída operacional",
      "Compartilha núcleo técnico com GRP",
    ],
    h1: [],
    h2: ["Env Neo"],
    h3: ["ERP · Gestão Empresarial"],
  },
  {
    id: "home#govevia-stats",
    anchor: "#audit",
    label: "Govevia em números — métricas de plataforma",
    sourceKey: "GOVEVIA_STATS",
    persona: ["prefeito", "secretario", "procurador", "auditor", "controlador"],
    intent: "compliance",
    textFragments: [
      "Govevia em números",
      "Capacidades da plataforma GRP verificáveis no repositório privado.",
      "LAI — Lei de Acesso à Informação — Lei 12.527 / 2011 — Controles de transparência pública implementados como regra técnica",
      "LGPD — Lei Geral de Proteção de Dados — Lei 13.709 / 2018 — Políticas de privacidade e consentimento no fonte, não em documentos",
      "7 Módulos integrados: Orçamento · Tributário · RH · Protocolo · Patrimônio · Contratos · Transparência",
      "12 Capacidades canônicas — Operações de domínio com regra declarativa, testada e auditável",
      "12 Personas atendidas: Prefeito · Secretário · Fiscal · Contador · Jurídico · Cidadão e mais",
      "100% Trilha auditável — Toda operação registrada com hash · timestamp · usuário responsável",
    ],
    h1: [],
    h2: ["Govevia em números"],
    h3: ["LAI", "LGPD", "Módulos", "Capacidades", "Personas", "Trilha auditável"],
  },
  {
    id: "home#audit",
    anchor: "#audit",
    label: "Control Plane — Governança executável",
    sourceKey: "CONTROL_PLANE",
    persona: ["tech", "auditor", "controlador"],
    intent: "governanca",
    textFragments: [
      "Control Plane em Números",
      "Governança executável: toda regra é um gate CI/DB/Runtime, não uma disciplina humana.",
      "Enforcements por Mecanismo: ArchUnit, DB Trigger, GitHub Actions, Runtime Guard, Script CI Gate, ADR + PR Review",
      "Maturidade dos ADRs: 171 Accepted/Active, 53 Archived, 4 Deprecated, 3 Draft",
      "Invariantes de migration ativos: INV-1 Row-Level Security, INV-3 Rollback declarado, INV-5 Classificação LGPD, INV-7 Append-Only",
      "Meta-Enforcements E-META-1 Singularidade de Autoridade, E-META-2 Gates CI-Verificáveis, E-META-3 DAG GRP → ERP → ESA",
      "19 enforcements, 231 ADRs, 27 migrations, 4 invariants, 2 CI gates",
    ],
    h1: [],
    h2: ["Control Plane em Números"],
    h3: ["Enforcements por Mecanismo", "Maturidade dos ADRs", "Invariantes", "Meta-Enforcements"],
  },
  {
    id: "home#certifications",
    anchor: null,
    label: "Certificações e Formação",
    sourceKey: "CERTIFICATIONS",
    persona: ["geral"],
    intent: "credibilidade",
    textFragments: [
      "Certificações e Formação",
      "Membro PMI — Project Management Institute",
      "PMI · Membro ativo verificável",
      "Membro ativo com experiência documentada em projetos de sistema — base para elegibilidade PMP",
      "Bacharel em Sistemas de Informação",
      "Faculdade CNEC Unaí · 2010",
      "Diploma digital com verificação MEC/ICP-Brasil",
    ],
    h1: [],
    h2: ["Certificações e Formação"],
    h3: ["Membro PMI", "Bacharel em Sistemas de Informação"],
  },
  {
    id: "home#diploma",
    anchor: "#diploma",
    label: "Diploma Digital",
    sourceKey: "DIPLOMA",
    persona: ["geral"],
    intent: "credibilidade",
    textFragments: [
      "Diploma Digital",
      "Bacharel em Sistemas de Informação",
      "Sistemas de Informação",
      "Bacharelado · Modalidade Presencial",
      "Faculdade CNEC Unaí, Unaí, MG · Código MEC: 1070",
      "Universidade Tuiuti do Paraná, Curitiba, PR · Código MEC: 355",
      "Conclusão: 18 de dezembro de 2010",
      "Código de validação: 1070.355.640eebc868a1",
    ],
    h1: [],
    h2: ["Diploma Digital"],
    h3: [],
  },
  {
    id: "home#contato",
    anchor: "#contato",
    label: "Contato",
    sourceKey: "CONTACT",
    persona: ["geral"],
    intent: "contato",
    textFragments: [
      "Contato",
      "Canais diretos.",
      "WhatsApp · E-mail · LinkedIn · Govevia · GitHub · Substack",
    ],
    h1: [],
    h2: ["Contato"],
    h3: [],
  },
];

// ─── build ContentUnit de uma RawUnit ─────────────────────────────────────────
function toUnit(r: RawUnit): ContentUnit {
  const text = r.textFragments.join(" ");
  const wc   = wordCount(text);
  return {
    id:               r.id,
    url:              SITE + "/" + (r.anchor ?? ""),
    path:             "/",
    anchor:           r.anchor,
    sourceFile:       `lib/constants.ts → ${r.sourceKey}`,
    label:            r.label,
    persona:          r.persona,
    intent:           r.intent,
    wordCount:        wc,
    h1:               r.h1,
    h2:               r.h2,
    h3:               r.h3,
    hasH1:            r.h1.length > 0,
    hasH2:            r.h2.length > 0,
    contentSignature: signature(...r.h1, ...r.h2, text.slice(0, 200)),
    textSample:       text.slice(0, 300) + (text.length > 300 ? "…" : ""),
  };
}

// ─── Thresholds ───────────────────────────────────────────────────────────────
// P0 — H1 ausente OU conteúdo crítico (< P0_WORD_THRESHOLD palavras)
// P1 — Thin moderado (P0 ≤ wc < P1_WORD_THRESHOLD)
// P2 — Aviso (P1 ≤ wc < P2_WORD_THRESHOLD, sem H2)
const P0_WORD_THRESHOLD = 60;  // fragmentos estáticos: crítico
const P1_WORD_THRESHOLD = 120; // thin moderado
const P2_WORD_THRESHOLD = 180; // aviso de comprimento

// ─── Detecção de thin content ─────────────────────────────────────────────────
function detectThin(units: ContentUnit[]): V3Finding[] {
  const findings: V3Finding[] = [];
  let i = 0;
  for (const u of units) {
    // P0: H1 ausente — sinal mais alto de thin estrutural
    if (!u.hasH1) {
      findings.push({
        id: `thin-noh1-${i++}`,
        type: "thin-content",
        severity: "P0",
        units: [u.id],
        evidence: `H1 ausente em "${u.label}" · word_count=${u.wordCount}`,
        recommendation: `Adicionar H1 único e descritivo à seção "${u.label}".`,
      });
    }
    // P0: conteúdo crítico
    if (u.wordCount < P0_WORD_THRESHOLD) {
      findings.push({
        id: `thin-p0-${i++}`,
        type: "thin-content",
        severity: "P0",
        units: [u.id],
        evidence: `word_count=${u.wordCount} < ${P0_WORD_THRESHOLD} · H1=${u.h1.length} · H2=${u.h2.length}`,
        recommendation:
          `Conteúdo crítico em "${u.label}": expandir para ≥${P1_WORD_THRESHOLD} palavras com 2+ H2 e parágrafos de substância.`,
      });
    } else if (u.wordCount < P1_WORD_THRESHOLD) {
      // P1: thin moderado
      findings.push({
        id: `thin-p1-${i++}`,
        type: "thin-content",
        severity: "P1",
        units: [u.id],
        evidence: `word_count=${u.wordCount} (${P0_WORD_THRESHOLD}–${P1_WORD_THRESHOLD}) · H2=${u.h2.length}`,
        recommendation:
          `Ampliar "${u.label}": adicionar 1–2 H2 com parágrafos de casos de uso ou prova para atingir ≥${P1_WORD_THRESHOLD} palavras.`,
      });
    } else if (u.wordCount < P2_WORD_THRESHOLD && !u.hasH2) {
      // P2: aviso de comprimento
      findings.push({
        id: `thin-p2-${i++}`,
        type: "thin-content",
        severity: "P2",
        units: [u.id],
        evidence: `word_count=${u.wordCount} · sem H2 (hierarquia de headings fraca)`,
        recommendation:
          `Adicionar pelo menos 1 H2 em "${u.label}" para estruturar o conteúdo e melhorar crawlability.`,
      });
    }
  }
  return findings;
}

// ─── Detecção de canibalização ────────────────────────────────────────────────
// Para SPA de página única, canibalização ocorre quando duas seções da mesma
// página competem pela mesma intenção+persona sem diferenciação clara.
function detectCannibalization(units: ContentUnit[]): V3Finding[] {
  const findings: V3Finding[] = [];
  let i = 0;

  // Agrupar por intent
  const byIntent = new Map<V3Intent, ContentUnit[]>();
  for (const u of units) {
    const existing = byIntent.get(u.intent) ?? [];
    existing.push(u);
    byIntent.set(u.intent, existing);
  }

  for (const [intent, group] of Array.from(byIntent.entries())) {
    if (group.length < 2) continue;

    // Verificar overlap de H1 (conflito alto)
    const h1Pool = group.flatMap(u => u.h1.map(h => h.toLowerCase()));
    const h1Dupes = h1Pool.filter((v, i, a) => a.indexOf(v) !== i);
    if (h1Dupes.length > 0) {
      findings.push({
        id: `cannibal-h1-${i++}`,
        type: "cannibalization",
        severity: "P0",
        units: group.map(u => u.id),
        evidence: `H1 duplicado "${h1Dupes[0]}" em ${group.length} seções com intent="${intent}"`,
        recommendation:
          `Diferenciar H1 de cada seção para evitar competição interna. Considerar consolidar em uma única seção ou diferenciar intent claramente.`,
      });
    }

    // Verificar signature idêntica (conteúdo duplicado)
    const sigs = group.map(u => u.contentSignature);
    const dupSigs = sigs.filter((v, idx) => sigs.indexOf(v) !== idx);
    if (dupSigs.length > 0) {
      findings.push({
        id: `cannibal-dup-${i++}`,
        type: "cannibalization",
        severity: "P0",
        units: group.map(u => u.id),
        evidence: `Signature idêntica "${dupSigs[0]}" — conteúdo duplicado detectado (intent="${intent}")`,
        recommendation: `Verificar se as seções "${group.map(u => u.label).join('" e "')}" têm conteúdo diferenciado. Consolidar ou diferenciar.`,
      });
    }

    // Verificar overlap alto de H2 (conflito médio)
    const h2Groups = group.map(u => new Set(u.h2.map(h => h.toLowerCase())));
    for (let a = 0; a < h2Groups.length - 1; a++) {
      for (let b = a + 1; b < h2Groups.length; b++) {
        const intersection = new Set(Array.from(h2Groups[a]).filter(h => h2Groups[b].has(h)));
        if (intersection.size >= 2) {
          findings.push({
            id: `cannibal-h2-${i++}`,
            type: "cannibalization",
            severity: "P1",
            units: [group[a].id, group[b].id],
            evidence: `H2 overlap alto (${intersection.size} headings compartilhados) entre "${group[a].label}" e "${group[b].label}" (intent="${intent}")`,
            recommendation: `Diferenciar H2 de "${group[a].label}" e "${group[b].label}". Cada seção deve ter headings únicos que reforçam sua intenção específica.`,
          });
        }
      }
    }
  }

  // Verificar heading drift (intent diverge da persona primária)
  // Para GPR personas: produto-erp e produto-grp não devem ter conteúdo igual
  const grp = units.find(u => u.intent === "produto-grp");
  const erp = units.find(u => u.intent === "produto-erp");
  if (grp && erp) {
    const grpH2 = new Set(grp.h2.map(h => h.toLowerCase()));
    const erpH2 = new Set(erp.h2.map(h => h.toLowerCase()));
    const shared = Array.from(grpH2).filter(h => erpH2.has(h));
    if (shared.length > 0) {
      findings.push({
        id: `cannibal-grp-erp-${i++}`,
        type: "heading-drift",
        severity: "P1",
        units: [grp.id, erp.id],
        evidence: `GRP e ERP compartilham H2: "${shared.join('", "')}" — risco de canibalização entre produtos`,
        recommendation: `Diferenciar headings de GRP (Govevia) e ERP (Env Neo) para evitar competição interna por queries de produto.`,
      });
    }
  }

  return findings;
}

// ─── Cobertura por persona ────────────────────────────────────────────────────
function buildPersonaCoverage(
  units: ContentUnit[],
  findings: V3Finding[],
): V3PersonaCoverage[] {
  const personaSet = new Set<V3Persona>();
  units.forEach(u => u.persona.forEach(p => personaSet.add(p)));

  return Array.from(personaSet).map(persona => {
    const myUnits = units.filter(u => u.persona.includes(persona));
    const myIds   = myUnits.map(u => u.id);
    const hasThin = findings.some(
      f => f.type === "thin-content" && f.units.some(id => myIds.includes(id)),
    );
    const hasConflict = findings.some(
      f => f.type === "cannibalization" && f.units.some(id => myIds.includes(id)),
    );
    return {
      persona,
      units:      myIds,
      intents:    Array.from(new Set(myUnits.map(u => u.intent))),
      hasThinContent: hasThin,
      hasConflict,
    };
  });
}

// ─── Entry point ─────────────────────────────────────────────────────────────
export async function buildV3Static(): Promise<V3CoverageReport> {
  const sha   = await headSha();
  const units = RAW_UNITS.map(toUnit);

  const thinFindings    = detectThin(units);
  const cannibalFindings = detectCannibalization(units);
  const allFindings     = [...thinFindings, ...cannibalFindings];
  const personaCoverage = buildPersonaCoverage(units, allFindings);

  const thinCount           = allFindings.filter(f => f.type === "thin-content").length;
  const cannibalizationCount = allFindings.filter(f => f.type === "cannibalization" || f.type === "heading-drift").length;

  return {
    generatedAt: new Date().toISOString(),
    sourceRef:   sha,
    strategy:    "static",
    units,
    findings:    allFindings,
    personaCoverage,
    summary: {
      totalUnits:          units.length,
      thinCount,
      cannibalizationCount,
      p0Count: allFindings.filter(f => f.severity === "P0").length,
      p1Count: allFindings.filter(f => f.severity === "P1").length,
      p2Count: allFindings.filter(f => f.severity === "P2").length,
    },
  };
}
