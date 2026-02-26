// ============================================================================
// app/api/control-plane/route.ts — Live Control Plane metrics from Govevia
// Reads enforcement-registry.yaml + repo tree via GitHub API.
// Server-side only. GITHUB_TOKEN never reaches the client.
// ISR cached 1 hour — same policy as /api/audit.
// ============================================================================

import { NextResponse } from "next/server";

export const revalidate = 3600;

const GITHUB_API  = "https://api.github.com";
const USERNAME    = "leoamerico";
const REPO        = "govevia";
const BRANCH      = "main";

async function ghFetch(path: string, token: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) { console.error(`GH API ${res.status}: ${path}`); return null; }
  return res.json();
}

async function getRawFile(path: string, token: string): Promise<string | null> {
  const data = await ghFetch(
    `/repos/${USERNAME}/${REPO}/contents/${path}?ref=${BRANCH}`,
    token,
  );
  if (!data?.content) return null;
  // GitHub returns base64 with newlines
  return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
}

// ─── Parse enforcement-registry.yaml (no external YAML lib) ─────────────────

interface MechanismCount { label: string; count: number; color: string }

const MECHANISM_LABELS: Record<string, { label: string; color: string }> = {
  archunit:        { label: "ArchUnit (build)",      color: "cyan"    },
  "db trigger":    { label: "DB Trigger (runtime)",  color: "emerald" },
  "github actions":{ label: "GitHub Actions",        color: "violet"  },
  "runtime guard": { label: "Runtime Guard",         color: "amber"   },
  "script ci gate":{ label: "Script CI Gate",        color: "cyan"    },
  "adr + pr review":{ label: "ADR + PR Review",      color: "emerald" },
};

function parseEnforcementRegistry(yaml: string): {
  activeCount: number;
  byMechanism: MechanismCount[];
} {
  // Split into per-enforcement blocks (each starts with "  - id:")
  const blocks = yaml.split(/^  - id:/m).slice(1);

  let activeCount = 0;
  const mechanismTally: Record<string, number> = {};

  for (const block of blocks) {
    const statusMatch = block.match(/^\s*status:\s*(.+)/m);
    const status = statusMatch?.[1]?.trim().toLowerCase();
    if (status !== "active") continue;

    activeCount++;

    const mechMatch = block.match(/^\s*mechanism:\s*(.+)/m);
    const mech = mechMatch?.[1]?.trim().toLowerCase() ?? "adr + pr review";
    mechanismTally[mech] = (mechanismTally[mech] ?? 0) + 1;
  }

  // Build ordered list (preserving canonical order from MECHANISM_LABELS)
  const byMechanism: MechanismCount[] = Object.entries(MECHANISM_LABELS)
    .map(([key, meta]) => ({ ...meta, count: mechanismTally[key] ?? 0 }))
    .filter(e => e.count > 0);

  // Any mechanism not in our label map goes to ADR + PR Review bucket
  for (const [key, count] of Object.entries(mechanismTally)) {
    if (!MECHANISM_LABELS[key]) {
      const bucket = byMechanism.find(b => b.label === "ADR + PR Review");
      if (bucket) bucket.count += count;
      else byMechanism.push({ label: key, count, color: "slate" });
    }
  }

  return { activeCount, byMechanism };
}

// ─── Count CI gates in governance-gates.yml ─────────────────────────────────
function countCiGates(yaml: string): number {
  // Each real gate job has a "runs-on:" line; exclude governance-summary itself
  const jobBlocks = yaml.split(/^  [a-z][\w-]+:/m).slice(1);
  return jobBlocks.filter(b => /runs-on:/.test(b) && !/governance-summary/.test(b)).length;
}

// ─── ADR status breakdown from file-path suffixes ───────────────────────────
function classifyAdrStatus(paths: string[]): {
  label: string; count: number; color: string
}[] {
  const tally = { accepted: 0, archived: 0, deprecated: 0, draft: 0 };
  for (const p of paths) {
    const name = p.toLowerCase();
    if (name.includes("deprecated")) tally.deprecated++;
    else if (name.includes("archived") || name.includes("archive")) tally.archived++;
    else if (name.includes("draft"))  tally.draft++;
    else                              tally.accepted++;
  }
  return [
    { label: "Accepted/Active", count: tally.accepted,   color: "emerald" },
    { label: "Archived",        count: tally.archived,   color: "slate"   },
    { label: "Deprecated",      count: tally.deprecated, color: "amber"   },
    { label: "Draft",           count: tally.draft,      color: "violet"  },
  ].filter(s => s.count > 0);
}

// ─── Invariants (stable set — updated manually when INV list changes) ────────
const INVARIANTS = [
  { id: "INV-1", label: "Row-Level Security (RLS)",       adr: "ADR-021" },
  { id: "INV-3", label: "Rollback declarado",             adr: "ADR-015" },
  { id: "INV-5", label: "Classificação LGPD",             adr: "ADR-014" },
  { id: "INV-7", label: "Append-Only (evidence tables)",  adr: "ADR-036" },
];

// ─── Meta-enforcements (stable — added only via ADR-036 ammendment) ──────────
const META_ENFORCEMENTS = [
  { id: "E-META-1", label: "Singularidade de Autoridade"  },
  { id: "E-META-2", label: "Gates CI-Verificáveis"        },
  { id: "E-META-3", label: "DAG GRP → ERP → ESA"         },
  { id: "E-META-4", label: "truth_source obrigatório"     },
  { id: "E-META-5", label: "Append-Only por Default"      },
  { id: "E-META-6", label: "Rastreabilidade ADR ↔ Código" },
];

// ─── Public response shape ────────────────────────────────────────────────────
export interface ControlPlaneData {
  generatedAt: string;
  totals: {
    enforcements: number;
    adrs: number;
    migrations: number;
    invariants: number;
    ciGates: number;
    worlds: number;
  };
  byMechanism: MechanismCount[];
  adrStatus: { label: string; count: number; color: string }[];
  invariants: { id: string; label: string; adr: string }[];
  metaEnforcements: { id: string; label: string }[];
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured" },
      { status: 503 },
    );
  }

  try {
    // Fetch repo tree + key files in parallel
    const [treeData, registryYaml, gatesYaml] = await Promise.all([
      ghFetch(`/repos/${USERNAME}/${REPO}/git/trees/${BRANCH}?recursive=1`, token),
      getRawFile(
        "apps/govevia-kernel/src/main/resources/enforcement-registry.yaml",
        token,
      ),
      getRawFile(".github/workflows/governance-gates.yml", token),
    ]);

    const tree: { path: string; type: string }[] = treeData?.tree ?? [];

    // Count ADR files
    const adrPaths = tree
      .filter(f => f.type === "blob" && /ADR-|adr-/i.test(f.path))
      .map(f => f.path);

    // Count Flyway migration SQL files
    const migrationCount = tree.filter(
      f => f.type === "blob" && /V\d+[_\d]*__.*\.sql$/i.test(f.path),
    ).length;

    // Parse enforcement registry
    const { activeCount, byMechanism } = registryYaml
      ? parseEnforcementRegistry(registryYaml)
      : { activeCount: 0, byMechanism: [] };

    // Count CI gates
    const ciGates = gatesYaml ? countCiGates(gatesYaml) : 0;

    const data: ControlPlaneData = {
      generatedAt: new Date().toISOString(),
      totals: {
        enforcements: activeCount,
        adrs:         adrPaths.length,
        migrations:   migrationCount,
        invariants:   INVARIANTS.length,
        ciGates,
        worlds:       3,
      },
      byMechanism,
      adrStatus: classifyAdrStatus(adrPaths),
      invariants:       INVARIANTS,
      metaEnforcements: META_ENFORCEMENTS,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error("Control Plane API failed:", err);
    return NextResponse.json({ error: "Failed to generate Control Plane data" }, { status: 500 });
  }
}
