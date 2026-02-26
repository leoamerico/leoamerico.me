// ============================================================================
// lib/github-audit.ts — Server-side GitHub API fetcher
// Runs ONLY on the server. The GITHUB_TOKEN never reaches the client.
// Exposes aggregated metadata (counts, dates, ADR titles) — never source code.
// ============================================================================

const GITHUB_API = "https://api.github.com";
const USERNAME = "leoamerico";

// 12-month window ending today
function getPeriod(): { since: string; until: string; label: string } {
  const now = new Date();
  const until = now.toISOString();
  const since = new Date(now);
  since.setMonth(since.getMonth() - 12);
  return {
    since: since.toISOString(),
    until,
    label: `${since.toISOString().split("T")[0]} → ${now.toISOString().split("T")[0]}`,
  };
}

async function ghFetch(path: string, token: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 3600 }, // ISR: 1 hour
  });
  if (!res.ok) {
    console.error(`GitHub API ${res.status}: ${path}`);
    return null;
  }
  return res.json();
}

// Count commits AND collect monthly buckets in a single pass
async function countCommitsWithMonthly(
  repo: string,
  since: string,
  until: string,
  token: string
): Promise<{ total: number; monthly: Record<string, number> }> {
  const monthly: Record<string, number> = {};
  let total = 0;
  let page = 1;
  while (page <= 20) {
    const data = await ghFetch(
      `/repos/${USERNAME}/${repo}/commits?since=${since}&until=${until}&per_page=100&page=${page}`,
      token
    );
    if (!data || !Array.isArray(data) || data.length === 0) break;
    for (const c of data) {
      const date: string = c?.commit?.author?.date || c?.commit?.committer?.date || "";
      if (date) {
        const key = date.slice(0, 7); // "YYYY-MM"
        monthly[key] = (monthly[key] || 0) + 1;
      }
      total++;
    }
    if (data.length < 100) break;
    page++;
  }
  return { total, monthly };
}

// Get commit activity heatmap for the govevia repo (52 weeks × 7 days)
// GitHub returns 202 while computing — retry up to 3 times
async function getGoveiaHeatmap(
  token: string
): Promise<Array<{ week: number; days: number[] }>> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(
      `${GITHUB_API}/repos/${USERNAME}/govevia/stats/commit_activity`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 3600 },
      }
    );
    if (res.status === 202) {
      if (attempt < 2) await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      // Slice to last 13 weeks (~91 days / 90-day window)
      const last13 = (data as { week: number; days: number[] }[]).slice(-13);
      return last13.map((w) => ({ week: w.week, days: w.days }));
    }
  }
  return [];
}

// Get latest commit date for a repo
async function getLastActivity(
  repo: string,
  token: string
): Promise<string | null> {
  const data = await ghFetch(
    `/repos/${USERNAME}/${repo}/commits?per_page=1`,
    token
  );
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  return data[0].commit.author.date;
}

// Count files matching a pattern in the repo tree
async function countFilesByPattern(
  repo: string,
  branch: string,
  pattern: RegExp,
  token: string
): Promise<number> {
  const data = await ghFetch(
    `/repos/${USERNAME}/${repo}/git/trees/${branch}?recursive=1`,
    token
  );
  if (!data || !data.tree) return 0;
  return data.tree.filter((f: { path: string }) => pattern.test(f.path)).length;
}

// Get file paths matching a pattern (for listing ADR titles etc)
async function getFilesByPattern(
  repo: string,
  branch: string,
  pattern: RegExp,
  token: string
): Promise<string[]> {
  const data = await ghFetch(
    `/repos/${USERNAME}/${repo}/git/trees/${branch}?recursive=1`,
    token
  );
  if (!data || !data.tree) return [];
  return data.tree
    .filter((f: { path: string }) => pattern.test(f.path))
    .map((f: { path: string }) => f.path);
}

// Classify a file path into an architectural layer
function classifyLayer(path: string): string {
  const p = path.toLowerCase();
  if (/\/test\/|\.test\.|spec\.|test\.java/i.test(p)) return "Testes";
  if (/\/domain\/|\/entity\/|\/valueobject\/|\/aggregate\/|\/event\//i.test(p)) return "Domínio";
  if (/\/application\/|\/usecase\/|\/service\//i.test(p)) return "Aplicação";
  if (/\/infrastructure\/|\/repository\/|\/persistence\//i.test(p)) return "Infraestrutura";
  if (/\/adapter\/|\/port\/|\/interface\/|\/rest\/|\/controller\/|\/dto\/|\/web\//i.test(p)) return "Adapters";
  if (/policy-|adr-|\/governance\//i.test(p)) return "Governança";
  return "Outros";
}

export interface ModuleStat {
  name: string;       // module / top-level directory name
  layer: string;      // architectural layer
  files: number;      // number of source files
  bytes: number;      // total size in bytes
  lines: number;      // estimated lines (bytes / 40)
}

// Fetch the full tree and aggregate per top-level module
async function getGoveiaModules(
  repo: string,
  branch: string,
  token: string
): Promise<ModuleStat[]> {
  const data = await ghFetch(
    `/repos/${USERNAME}/${repo}/git/trees/${branch}?recursive=1`,
    token
  );
  if (!data || !data.tree) return [];

  const map = new Map<string, { files: number; bytes: number; layers: Record<string, number> }>();

  for (const entry of data.tree as { path: string; type: string; size?: number }[]) {
    if (entry.type !== "blob") continue;
    // Only count Java and TypeScript/JavaScript source files
    if (!/\.(java|ts|tsx|js|jsx)$/i.test(entry.path)) continue;

    const topDir = entry.path.split("/")[0] ?? "root";
    const existing = map.get(topDir) ?? { files: 0, bytes: 0, layers: {} };
    existing.files++;
    existing.bytes += entry.size ?? 0;
    const layer = classifyLayer(entry.path);
    existing.layers[layer] = (existing.layers[layer] ?? 0) + 1;
    map.set(topDir, existing);
  }

  // Determine dominant layer for each module
  return Array.from(map.entries())
    .filter(([, v]) => v.files >= 2) // skip trivial single-file dirs
    .map(([name, v]) => {
      const dominant = Object.entries(v.layers).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Outros";
      return {
        name,
        layer: dominant,
        files: v.files,
        bytes: v.bytes,
        lines: Math.round(v.bytes / 40),
      };
    })
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20); // top 20 modules
}

// ============================================================================
// PUBLIC API — called from the API route
// ============================================================================


export interface RepoAuditData {
  name: string;
  // description and adrFiles only exposed for public repos
  description: string;
  isPrivate: boolean;
  commits: number;
  lastActivity: string | null;
  // recentMessages only for public repos — never expose private repo commit messages
  recentMessages: string[];
  adrCount: number;
  // adrFiles only for public repos — never expose private repo file paths
  adrFiles: string[];
  policyCount: number;
  testCount: number;
  portAdapterCount: number;
  guardCount: number;
  totalFiles: number;
}

export interface AuditReport {
  generatedAt: string;
  period: string;
  author: string;
  // cpf intentionally removed — PII must never be in a public API response
  totalRepos: number;
  activeRepos: number;
  totalCommits: number;
  totalADRs: number;
  totalPolicies: number;
  totalTests: number;
  totalPortsAdapters: number;
  totalGuards: number;
  /** Arquivos *Entity.java — contagem ao vivo via GitHub tree API */
  entityCount: number;
  /** Arquivos *UseCase.java — contagem ao vivo via GitHub tree API */
  useCaseCount: number;
  repos: RepoAuditData[];
  monthlyActivity: Record<string, number>;
  goveiaheatmap: Array<{ week: number; days: number[] }>;
  modules: ModuleStat[];
}

export async function generateAuditReport(): Promise<AuditReport | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN not set — audit report unavailable");
    return null;
  }

  const { since, until, label } = getPeriod();
  const REPO = "govevia";
  const branch = "main";

  // Fetch all govevia metrics in parallel
  const [
    { total: commits, monthly },
    lastActivity,
    adrFiles,
    policyFiles,
    testCount,
    portAdapterCount,
    guardCount,
    totalFiles,
    goveiaheatmap,
    modules,
    entityCount,
    useCaseCount,
  ] = await Promise.all([
    countCommitsWithMonthly(REPO, since, until, token),
    getLastActivity(REPO, token),
    getFilesByPattern(REPO, branch, /ADR-|adr-/i, token),
    getFilesByPattern(REPO, branch, /POLICY-|policy-/i, token),
    countFilesByPattern(REPO, branch, /test\.|spec\.|Test\.java/i, token),
    countFilesByPattern(REPO, branch, /\/port\/|Port\.java|\/adapter\//i, token),
    countFilesByPattern(REPO, branch, /Guard\.java|Guard\.ts/i, token),
    countFilesByPattern(REPO, branch, /./i, token),
    getGoveiaHeatmap(token),
    getGoveiaModules(REPO, branch, token),
    // Entidades JPA: arquivos *Entity.java no tree
    countFilesByPattern(REPO, branch, /Entity\.java$/i, token),
    // Casos de uso: arquivos *UseCase.java no tree
    countFilesByPattern(REPO, branch, /UseCase\.java$/i, token),
  ]);

  // Pre-build 12-month keys so chart always has all months (even zeros)
  const monthlyActivity: Record<string, number> = {};
  const now2 = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyActivity[key] = 0;
  }
  for (const [k, v] of Object.entries(monthly)) {
    if (k in monthlyActivity) monthlyActivity[k] += v;
  }

  const repo: RepoAuditData = {
    name: REPO,
    description: "",  // private repo — never expose description
    isPrivate: true,
    commits,
    lastActivity,
    recentMessages: [],  // private repo — never expose commit messages
    adrCount: adrFiles.length,
    adrFiles: [],        // private repo — never expose file paths
    policyCount: policyFiles.length,
    testCount,
    portAdapterCount,
    guardCount,
    totalFiles,
  };

  return {
    generatedAt: new Date().toISOString(),
    period: label,
    author: "Leo Américo",
    totalRepos: 1,
    activeRepos: 1,
    totalCommits: commits,
    totalADRs: adrFiles.length,
    totalPolicies: policyFiles.length,
    totalTests: testCount,
    totalPortsAdapters: portAdapterCount,
    totalGuards: guardCount,
    entityCount,
    useCaseCount,
    repos: [repo],
    monthlyActivity,
    goveiaheatmap,
    modules,
  };
}
