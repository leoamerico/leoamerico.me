// lib/esa/buildSnapshot.ts  — SERVER ONLY
// ─────────────────────────────────────────────────────────────────────────────
// Agrega enforcement-registry.yaml + árvore do repo Govevia em EsaSnapshot.
// Chamado pelo API route /api/esa-snapshot (ISR 1h).
// Não importar em componentes client-side.
// ─────────────────────────────────────────────────────────────────────────────
import type {
  CoverageStatus,
  EsaCodeRef,
  EsaEnforcement,
  EsaInvariant,
  EsaPlane,
  EsaSnapshot,
  Mechanism,
} from "./types";

const GITHUB_API = "https://api.github.com";
const USERNAME   = "leoamerico";
const REPO       = "govevia";
const BRANCH     = "main";

async function ghFetch(path: string, token: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) { console.error(`GH ${res.status}: ${path}`); return null; }
  return res.json();
}

async function getRawFile(path: string, token: string): Promise<string | null> {
  const data = await ghFetch(
    `/repos/${USERNAME}/${REPO}/contents/${path}?ref=${BRANCH}`,
    token,
  );
  if (!data?.content) return null;
  return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
}

function extractListField(block: string, field: string): string[] {
  // Matches indented list items under a key, e.g. "  adrs:\n    - ADR-001"
  const re = new RegExp(`\\n\\s*${field}:\\s*\\n((?:\\s+- .+\\n?)+)`, "m");
  const m = block.match(re);
  if (!m) return [];
  return m[1]
    .split("\n")
    .map(l => l.replace(/^\s*- /, "").trim())
    .filter(Boolean);
}

// ─── Mecanismo normalizado ────────────────────────────────────────────────
const MECHANISM_NORM: Record<string, { key: Mechanism; label: string }> = {
  archunit:          { key: "archunit",        label: "ArchUnit"       },
  "db trigger":      { key: "db_trigger",      label: "DB Trigger"     },
  "db_trigger":      { key: "db_trigger",      label: "DB Trigger"     },
  "github actions":  { key: "github_actions",  label: "GitHub Actions" },
  "github_actions":  { key: "github_actions",  label: "GitHub Actions" },
  "runtime guard":   { key: "runtime_guard",   label: "Runtime Guard"  },
  "runtime_guard":   { key: "runtime_guard",   label: "Runtime Guard"  },
  "script ci gate":  { key: "script_ci_gate",  label: "Script CI Gate" },
  "script_ci_gate":  { key: "script_ci_gate",  label: "Script CI Gate" },
  "adr + pr review": { key: "adr_pr_review",   label: "ADR + PR Review"},
  "adr+pr review":   { key: "adr_pr_review",   label: "ADR + PR Review"},
};

function normalizeMechanism(raw: string): { key: Mechanism | string; label: string } {
  const k = raw.toLowerCase().trim();
  return MECHANISM_NORM[k] ?? { key: k, label: raw };
}

// ─── Plano ESA por ID ─────────────────────────────────────────────────────
function derivePlane(id: string, mechanism: string, desc: string): EsaPlane {
  const u = id.toUpperCase();
  const d = desc.toLowerCase();
  const m = mechanism.toLowerCase();
  if (/auth|identity|mTLS|spiffe|jwt|token|credential|boundary/i.test(d)) return "trust";
  if (/audit|append.only|lgpd|pii|hash|imutab|evidence|log/i.test(d)) return "evidence";
  if (m.includes("db_trigger")) return "evidence";
  if (u.startsWith("INV-")) return "evidence";
  if (u.startsWith("E-META-4") || u.startsWith("E-META-5")) return "evidence";
  return "decision";
}

// ─── Coverage derivada ────────────────────────────────────────────────────
function deriveCoverage(
  status: string,
  codeRefs: EsaCodeRef[],
): CoverageStatus {
  if (status !== "active") return "declared";
  if (!codeRefs.length) return "partial";          // active mas sem refs → parcial
  const allExist = codeRefs.every(r => r.exists);
  if (allExist) return "enforced";
  return "partial";                                 // alguma ref não encontrada
}

// ─── Parse enforcement-registry.yaml ─────────────────────────────────────
function parseRegistry(
  yaml: string,
  treeSet: Set<string>,
): EsaEnforcement[] {
  const blocks = yaml.split(/^  - id:/m).slice(1);

  return blocks.map(block => {
    const full = "  - id:" + block;
    // Extrair campos escalares
    const get = (key: string) =>
      (full.match(new RegExp(`\\n\\s*${key}:\\s*(.+)`, "m")))?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "";

    const id          = get("id");
    const description = get("description");
    const status      = get("status") as EsaEnforcement["status"];
    const mechanismRaw= get("mechanism");
    const { key: mechKey, label: mechLabel } = normalizeMechanism(mechanismRaw || "adr + pr review");

    const adrs     = extractListField(full, "adrs");
    const rawRefs  = extractListField(full, "code_refs");
    const codeRefs: EsaCodeRef[] = rawRefs.map(p => ({ path: p, exists: treeSet.has(p) }));

    const plane    = derivePlane(id, mechanismRaw, description);
    const coverage = deriveCoverage(status, codeRefs);

    return { id, description, status, mechanism: mechKey, mechanismLabel: mechLabel, adrs, codeRefs, coverage, plane };
  }).filter(e => e.id);
}

// ─── CI gate names from governance-gates.yml ─────────────────────────────
function parseCiGateNames(yaml: string): string[] {
  const jobNames: string[] = [];
  const lines = yaml.split("\n");
  let inJobs = false;
  for (const line of lines) {
    if (/^jobs:/.test(line)) { inJobs = true; continue; }
    if (!inJobs) continue;
    const m = line.match(/^  ([a-z][\w-]+):\s*$/);
    if (m && !m[1].startsWith("governance-summary")) jobNames.push(m[1]);
  }
  return jobNames;
}

// ─── Invariants (stable set) ──────────────────────────────────────────────
const INVARIANTS_BASE: Omit<EsaInvariant, "coverage">[] = [
  { id: "INV-1", label: "Row-Level Security (RLS)",      adr: "ADR-021", plane: "evidence" },
  { id: "INV-3", label: "Rollback declarado",            adr: "ADR-015", plane: "decision" },
  { id: "INV-5", label: "Classificação LGPD / CPF hash", adr: "ADR-014", plane: "evidence" },
  { id: "INV-7", label: "Append-Only (evidence tables)", adr: "ADR-036", plane: "evidence" },
];

// ─── PUBLIC API ───────────────────────────────────────────────────────────
export async function buildSnapshot(): Promise<EsaSnapshot | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) { console.error("GITHUB_TOKEN not set"); return null; }

  const [treeData, registryYaml, gatesYaml, headData] = await Promise.all([
    ghFetch(`/repos/${USERNAME}/${REPO}/git/trees/${BRANCH}?recursive=1`, token),
    getRawFile("apps/govevia-kernel/src/main/resources/enforcement-registry.yaml", token),
    getRawFile(".github/workflows/governance-gates.yml", token),
    ghFetch(`/repos/${USERNAME}/${REPO}/commits/${BRANCH}`, token),
  ]);

  const treePaths: string[] = (treeData?.tree ?? [])
    .filter((f: { type: string }) => f.type === "blob")
    .map((f: { path: string }) => f.path);
  const treeSet = new Set(treePaths);
  const sourceRef: string = headData?.sha?.slice(0, 8) ?? "unknown";

  const enforcements = registryYaml ? parseRegistry(registryYaml, treeSet) : [];
  const ciGateNames  = gatesYaml    ? parseCiGateNames(gatesYaml)           : [];

  // Attach ciGateRef to enforcement (by mechanism match)
  for (const e of enforcements) {
    if (e.mechanism === "github_actions" || e.mechanism === "script_ci_gate") {
      const gateId = e.id.toLowerCase().replace(/-/g, "");
      const match = ciGateNames.find(g => g.toLowerCase().replace(/-/g, "").includes(gateId));
      if (match) e.ciGateRef = match;
    }
  }

  // Invariants: coverage = enforced if a migration-append-only gate exists
  const hasAppendGate = ciGateNames.some(g => g.includes("migration") || g.includes("append"));
  const invariants: EsaInvariant[] = INVARIANTS_BASE.map(inv => ({
    ...inv,
    coverage: (inv.id === "INV-7" && hasAppendGate) ? "enforced"
            : (inv.id === "INV-5" && enforcements.find(e => e.id === "E15")?.coverage === "enforced") ? "enforced"
            : "partial",
  }));

  const active    = enforcements.filter(e => e.status === "active").length;
  const enforced  = enforcements.filter(e => e.coverage === "enforced").length;
  const partial   = enforcements.filter(e => e.coverage === "partial").length;
  const declared  = enforcements.filter(e => e.coverage === "declared").length;
  const gap       = enforcements.filter(e => e.coverage === "gap").length;

  return {
    generatedAt: new Date().toISOString(),
    sourceRef,
    enforcements,
    invariants,
    ciGateNames,
    totals: { active, enforced, partial, declared, gap },
  };
}
