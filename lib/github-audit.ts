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

// Count commits across all pages for a repo in the period
async function countCommits(
  repo: string,
  since: string,
  until: string,
  token: string
): Promise<number> {
  let total = 0;
  let page = 1;
  while (page <= 20) {
    const data = await ghFetch(
      `/repos/${USERNAME}/${repo}/commits?since=${since}&until=${until}&per_page=100&page=${page}`,
      token
    );
    if (!data || !Array.isArray(data) || data.length === 0) break;
    total += data.length;
    if (data.length < 100) break;
    page++;
  }
  return total;
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

export interface RepoAuditData {
  name: string;
  description: string;
  isPrivate: boolean;
  commits: number;
  lastActivity: string | null;
  recentMessages: string[];
  adrCount: number;
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
  cpf: string;
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
}

export async function generateAuditReport(): Promise<AuditReport | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN not set — audit report unavailable");
    return null;
  }

  const { since, until, label } = getPeriod();

  // 1. List repos
  const reposRaw = await ghFetch(
    `/users/${USERNAME}/repos?per_page=100&sort=pushed&type=all`,
    token
  );
  if (!reposRaw) return null;

  // Filter repos with activity in period
  const allRepos = reposRaw.filter(
    (r: { pushed_at: string }) =>
      new Date(r.pushed_at) >= new Date(since)
  );

  // 2. Audit each active repo
  const repos: RepoAuditData[] = [];
  let totalCommits = 0;
  let totalADRs = 0;
  let totalPolicies = 0;
  let totalTests = 0;
  let totalPortsAdapters = 0;
  let totalGuards = 0;

  for (const r of allRepos) {
    const branch = r.default_branch || "main";
    const commits = await countCommits(r.name, since, until, token);
    if (commits === 0) continue; // skip truly inactive

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

    const repo: RepoAuditData = {
      name: r.name,
      description: r.description || "",
      isPrivate: r.private,
      commits,
      lastActivity,
      recentMessages,
      adrCount: adrFiles.length,
      adrFiles: adrFiles.map((f: string) => f.split("/").pop() || f),
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

  // 3. Monthly activity for the primary repo (govevia)
  const monthlyActivity: Record<string, number> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

    let monthTotal = 0;
    for (const repo of repos) {
      const data = await ghFetch(
        `/repos/${USERNAME}/${repo.name}/commits?since=${mStart}&until=${mEnd}&per_page=1`,
        token
      );
      // Quick count: just check if page 1 has data, then count
      if (data && Array.isArray(data) && data.length > 0) {
        const fullData = await ghFetch(
          `/repos/${USERNAME}/${repo.name}/commits?since=${mStart}&until=${mEnd}&per_page=100`,
          token
        );
        monthTotal += fullData?.length || 0;
      }
    }
    monthlyActivity[monthKey] = monthTotal;
  }

  // Sort repos by commits desc
  repos.sort((a, b) => b.commits - a.commits);

  return {
    generatedAt: new Date().toISOString(),
    period: label,
    author: "Leonardo Américo José Ribeiro",
    cpf: "703.380.511-04",
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
  };
}
