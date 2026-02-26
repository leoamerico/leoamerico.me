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

// Get first-line commit messages for a repo
async function getCommitMessages(
  repo: string,
  since: string,
  until: string,
  token: string,
  maxMessages = 30
): Promise<string[]> {
  const data = await ghFetch(
    `/repos/${USERNAME}/${repo}/commits?since=${since}&until=${until}&per_page=${maxMessages}`,
    token
  );
  if (!data || !Array.isArray(data)) return [];
  return data.map(
    (c: { commit: { message: string } }) =>
      c.commit.message.split("\n")[0]
  );
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

// ============================================================================
// PUBLIC API — called from the API route
// ============================================================================

interface RawRepo {
  name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  pushed_at: string;
  fork: boolean;
}

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
  repos: RepoAuditData[];
  monthlyActivity: Record<string, number>;
  goveiaheatmap: Array<{ week: number; days: number[] }>;
}

export async function generateAuditReport(): Promise<AuditReport | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN not set — audit report unavailable");
    return null;
  }

  const { since, until, label } = getPeriod();

  // 1. List ALL repos (public + private) using authenticated /user/repos endpoint
  // Uses pagination to handle accounts with more than 100 repos
  const reposRaw: RawRepo[] = [];
  let page = 1;
  while (page <= 20) {
    const batch = await ghFetch(
      `/user/repos?per_page=100&sort=pushed&page=${page}&affiliation=owner`,
      token
    );
    if (!batch || !Array.isArray(batch) || batch.length === 0) break;
    reposRaw.push(...(batch as RawRepo[]));
    if (batch.length < 100) break;
    page++;
  }
  if (reposRaw.length === 0) return null;

  // Filter repos with activity in period (exclude forks)
  const allRepos = reposRaw.filter(
    (r) => !r.fork && new Date(r.pushed_at) >= new Date(since)
  );

  // 2. Audit each active repo — collect commits + monthly buckets in one pass
  const repos: RepoAuditData[] = [];
  let totalCommits = 0;
  let totalADRs = 0;
  let totalPolicies = 0;
  let totalTests = 0;
  let totalPortsAdapters = 0;
  let totalGuards = 0;

  // Pre-build 12-month keys so chart always has all months (even zeros)
  const monthlyActivity: Record<string, number> = {};
  const now2 = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyActivity[key] = 0;
  }

  for (const r of allRepos as RawRepo[]) {
    const branch = r.default_branch || "main";
    const { total: commits, monthly } = await countCommitsWithMonthly(r.name, since, until, token);
    if (commits === 0) continue;

    // Merge monthly counts into global chart
    for (const [k, v] of Object.entries(monthly)) {
      if (k in monthlyActivity) monthlyActivity[k] += v;
    }

    const [lastActivity, recentMessages, adrFiles, policyFiles, testCount, portAdapterCount, guardCount, totalFiles] =
      await Promise.all([
        getLastActivity(r.name, token),
        getCommitMessages(r.name, since, until, token, 15),
        getFilesByPattern(r.name, branch, /ADR-|adr-/i, token),
        getFilesByPattern(r.name, branch, /POLICY-|policy-/i, token),
        countFilesByPattern(r.name, branch, /test\.|spec\.|Test\.java/i, token),
        countFilesByPattern(r.name, branch, /\/port\/|Port\.java|\/adapter\//i, token),
        countFilesByPattern(r.name, branch, /Guard\.java|Guard\.ts/i, token),
        countFilesByPattern(r.name, branch, /./i, token),
      ]);

    const isPrivate = r.private as boolean;
    const repo: RepoAuditData = {
      name: r.name as string,
      // Never expose description or file paths of private repos
      description: isPrivate ? "" : ((r.description as string) || ""),
      isPrivate,
      commits,
      lastActivity,
      // Never expose commit messages of private repos (may contain sensitive info)
      recentMessages: isPrivate ? [] : recentMessages,
      adrCount: adrFiles.length,
      // Never expose internal file paths of private repos
      adrFiles: isPrivate ? [] : adrFiles.map((f: string) => f.split("/").pop() || f),
      policyCount: policyFiles.length,
      testCount,
      portAdapterCount,
      guardCount,
      totalFiles,
    };

    totalCommits += commits;
    totalADRs += repo.adrCount;
    totalPolicies += repo.policyCount;
    totalTests += testCount;
    totalPortsAdapters += portAdapterCount;
    totalGuards += guardCount;

    repos.push(repo);
  }

  // Sort repos by commits desc
  repos.sort((a, b) => b.commits - a.commits);

  // Fetch Govevia daily heatmap (52w × 7d) from GitHub stats API
  const goveiaheatmap = await getGoveiaHeatmap(token);

  return {
    generatedAt: new Date().toISOString(),
    period: label,
    author: "Leonardo Américo José Ribeiro",
    // CPF is NEVER returned in the API response — PII must not be exposed publicly
    totalRepos: reposRaw.length,
    activeRepos: repos.length,
    totalCommits,
    totalADRs,
    totalPolicies,
    totalTests,
    totalPortsAdapters,
    totalGuards,
    repos,
    monthlyActivity,
    goveiaheatmap,
  };
}
