// scripts/audit/teardown-audit.mjs
// ════════════════════════════════════════════════════════════════════════════
// TEARDOWN GATE — Agent Cleanup Enforcement (F-series)
// ════════════════════════════════════════════════════════════════════════════
//
// PURPOSE:
//   Any autonomous agent (AI or human) that modifies this codebase MUST
//   run this gate as the final step of every delivery to prove that no
//   temporary implementation scaffolding was left behind.
//
//   This prevents "ghost code" — artifacts created to enable autonomous
//   implementation that have no place in the canonical codebase state.
//
// MANDATE (Constitutional layer — Env Neo, Fontanela principle):
//   The codebase state after a delivery MUST be identical to what a senior
//   human architect would have committed from scratch.
//   Temporary artifacts are a machine residue, not a human decision.
//   Homo gubernat — only what the human consciously approved ships.
//
// METHODOLOGY:
//   Based on Anthropic Constitutional AI (artifact purity principle),
//   OpenAI Operator post-task verification loop, and
//   Google DeepMind reversibility criterion (clean terminal state).
//
// F-series gates:
//
//   F1 MODERATE  No scratch/temp files
//                *.tmp · scratch.* · temp.* · *.debug.* · test-*.* in root,
//                scripts/, app/, lib/, components/, docs/ — not in node_modules
//                or .next. These are implementation scaffolding left by agents.
//
//   F2 MODERATE  No orphaned agent-marker comments
//                TODO: AI · FIXME: copilot · HACK: agent · XXX: temp ·
//                DELETEME · @agent-temp in committed source files.
//                These indicate incomplete decisions handed back to the repo.
//
//   F3 BLOCKER   reports/ excluded from git tracking
//                Generated audit artifacts must never enter git history.
//                Presence of reports/ in .gitignore is mandatory.
//
//   F4 BLOCKER   package-lock.json not in repo root
//                This project uses bun. package-lock.json is npm residue.
//                Its presence signals a foreign package manager ran and
//                may have modified the dependency tree silently.
//
//   F5 MODERATE  No debug/prototype console.log with agent fingerprints
//                console.log lines containing: "DEBUG:", "TEMP:", "AGENT:",
//                "TODO remove", "test only", "remove before" in .ts/.tsx/.mjs
//                outside of test files. Production code has no debug noise.
//
//   F6 MODERATE  No .env files committed (beyond .env*.local convention)
//                .env without suffix, .env.production, .env.staging committed
//                to repo history is a credential leak vector.
//
//   F7 INFO      Uncommitted changes check (warning only)
//                If git working directory is dirty after a delivery,
//                report the untracked/modified files. Does not block.
//                Clean commit state is the canonical delivery artifact.
//
// ════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

function exists(p) { return fs.existsSync(path.join(ROOT, p)); }
function read(p) {
  try { return fs.readFileSync(path.join(ROOT, p), "utf8"); } catch { return null; }
}

function globAll(dir, exts, excludeDirs = ["node_modules", ".next", ".vercel", "dist", "build", ".git", "coverage"]) {
  const out = [];
  const abs = path.isAbsolute(dir) ? dir : path.join(ROOT, dir);
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (excludeDirs.some((x) => entry.name === x || entry.name.startsWith("."))) continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (!exts || exts.some((e) => entry.name.endsWith(e))) out.push(full);
    }
  }
  walk(abs);
  return out;
}

function scanLines(filePath, re) {
  const raw = read(filePath);
  if (!raw) return [];
  return raw.split(/\r?\n/)
    .map((text, i) => ({ line: i + 1, text }))
    .filter(({ text }) => re.test(text));
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

const checks = [];

// ── F1: Scratch / temp files ──────────────────────────────────────────────────
{
  const SCRATCH_RE = /^(scratch\.|temp\.|tmp\.|debug\.)|(\.(tmp|debug|scratch|bak)$)|(^test-[a-z].*\.(ts|tsx|mjs|js)$)/i;
  const SCAN_DIRS = [".", "scripts", "app", "lib", "components", "docs", "public"];
  const hits = [];
  for (const dir of SCAN_DIRS) {
    const absDir = path.join(ROOT, dir);
    if (!fs.existsSync(absDir)) continue;
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (SCRATCH_RE.test(entry.name)) {
        hits.push({ dir, file: entry.name, fullPath: path.join(dir, entry.name) });
      }
    }
  }
  checks.push({
    id: "F1",
    severity: "MODERATE",
    title: "Nenhum arquivo scratch/temp/debug nas pastas de código",
    countermeasure: "Remover antes do commit: *.tmp, scratch.*, temp.*, *.debug.*",
    evidence: { scannedDirs: SCAN_DIRS, hits },
    pass: hits.length === 0,
  });
}

// ── F2: Orphaned agent-marker comments ───────────────────────────────────────
{
  const MARKER_RE = /\b(TODO:\s*AI|TODO:\s*agent|FIXME:\s*copilot|FIXME:\s*agent|HACK:\s*agent|HACK:\s*temp|DELETEME|@agent-temp|XXX:\s*temp|remove\s+before\s+(commit|deploy|prod)|temp(orary)?\s+only)/i;
  const sourceFiles = [
    ...globAll("app", [".ts", ".tsx"]),
    ...globAll("lib", [".ts", ".tsx"]),
    ...globAll("components", [".ts", ".tsx"]),
    ...globAll("scripts", [".mjs", ".js", ".ts"]),
  ];
  const hits = [];
  for (const f of sourceFiles) {
    const m = scanLines(f, MARKER_RE);
    if (m.length) hits.push({ file: path.relative(ROOT, f), matches: m.slice(0, 5) });
  }
  checks.push({
    id: "F2",
    severity: "MODERATE",
    title: "Nenhum marcador de agente órfão em código commitado (TODO:AI, FIXME:copilot, DELETEME...)",
    countermeasure: "Resolver ou remover todos os marcadores temporários antes da entrega.",
    evidence: { filesScanned: sourceFiles.length, hits },
    pass: hits.length === 0,
  });
}

// ── F3: reports/ in .gitignore ───────────────────────────────────────────────
{
  const gitignore = read(".gitignore") ?? "";
  const hasReports = /^\/reports\/|^reports\//m.test(gitignore);
  const hasPlaywright = /\/playwright-report\//m.test(gitignore);
  checks.push({
    id: "F3",
    severity: "BLOCKER",
    title: "reports/ e playwright-report/ excluídos do git (.gitignore)",
    countermeasure: "Adicionar /reports/ e /playwright-report/ ao .gitignore.",
    evidence: { hasReports, hasPlaywright, gitignoreSnippet: gitignore.split("\n").filter(l => l.includes("report")).join("\n") },
    pass: hasReports && hasPlaywright,
  });
}

// ── F4: package-lock.json not in repo ────────────────────────────────────────
{
  const lockExists = exists("package-lock.json");
  const inGitignore = (read(".gitignore") ?? "").includes("package-lock.json");
  checks.push({
    id: "F4",
    severity: "BLOCKER",
    title: "package-lock.json ausente do repo (projeto usa bun — lock canônico é bun.lock)",
    countermeasure: "Deletar package-lock.json e adicionar ao .gitignore.",
    evidence: { fileExists: lockExists, excludedInGitignore: inGitignore },
    pass: !lockExists || inGitignore,
  });
}

// ── F5: Debug console.log with agent fingerprints ────────────────────────────
{
  const DEBUG_RE = /console\.(log|warn|error)\s*\(\s*["'`]?(DEBUG:|TEMP:|AGENT:|TODO remove|test only|remove before)/i;
  const sourceFiles = [
    ...globAll("app", [".ts", ".tsx"]),
    ...globAll("lib", [".ts"]),
    ...globAll("components", [".ts", ".tsx"]),
  ];
  const hits = [];
  for (const f of sourceFiles) {
    const m = scanLines(f, DEBUG_RE);
    if (m.length) hits.push({ file: path.relative(ROOT, f), matches: m.slice(0, 5) });
  }
  checks.push({
    id: "F5",
    severity: "MODERATE",
    title: "Nenhum console.log com marcador de debug/agente em código de produção",
    countermeasure: "Remover linhas de debug antes do commit.",
    evidence: { filesScanned: sourceFiles.length, hits },
    pass: hits.length === 0,
  });
}

// ── F6: .env files not committed ─────────────────────────────────────────────
{
  const DANGEROUS_ENV = [".env", ".env.production", ".env.staging", ".env.local.example"];
  const committed = [];
  // Check if any dangerous .env is tracked by git
  for (const f of DANGEROUS_ENV) {
    if (!exists(f)) continue;
    try {
      const result = execSync(`git ls-files --error-unmatch "${f}" 2>/dev/null`, { cwd: ROOT, stdio: "pipe" }).toString().trim();
      if (result) committed.push(f);
    } catch { /* not tracked = good */ }
  }
  // Also check .gitignore covers them
  const gitignore = read(".gitignore") ?? "";
  const hasCoverage = gitignore.includes(".env*.local") || gitignore.includes(".env\n");
  checks.push({
    id: "F6",
    severity: "MODERATE",
    title: "Nenhum .env sensível commitado no repositório",
    countermeasure: "Garantir .env*.local no .gitignore e nunca commitar .env.production ou .env.staging.",
    evidence: { committedDangerousEnv: committed, gitignoreCoverage: hasCoverage },
    pass: committed.length === 0,
  });
}

// ── F7: Dirty working directory (INFO) ───────────────────────────────────────
{
  let dirty = [];
  try {
    const status = execSync("git status --porcelain", { cwd: ROOT, stdio: "pipe" }).toString().trim();
    if (status) dirty = status.split("\n").filter(Boolean).map(l => l.trim());
  } catch { /* not a git repo */ }
  checks.push({
    id: "F7",
    severity: "INFO",
    title: `Working directory ${dirty.length === 0 ? "limpo ✓" : `tem ${dirty.length} arquivo(s) não commitado(s)`}`,
    countermeasure: "Commitar ou descartar todas as mudanças antes de declarar a entrega concluída.",
    evidence: { dirty: dirty.slice(0, 20) },
    pass: true, // INFO only
    clean: dirty.length === 0,
  });
}

// ── Reporter ──────────────────────────────────────────────────────────────────
function toMarkdown(checks) {
  const lines = [];
  lines.push("# Teardown Audit — Agent Cleanup Gate (F-series)");
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push(`- Mandate: Machina custodit. Homo gubernat. — only clean artifacts ship.`);
  lines.push("");
  lines.push("| Gate | Severity | Status | Title |");
  lines.push("|------|----------|--------|-------|");
  for (const c of checks) {
    const s = c.severity === "INFO" ? "INFO" : (c.pass ? "✅ PASS" : "❌ FAIL");
    lines.push(`| ${c.id} | ${c.severity} | ${s} | ${c.title} |`);
  }
  lines.push("");
  for (const c of checks) {
    lines.push(`### ${c.id} — ${c.pass || c.severity === "INFO" ? "PASS" : "FAIL"}`);
    lines.push(`**${c.title}**`);
    if (c.countermeasure) lines.push(`> ${c.countermeasure}`);
    lines.push("```json");
    lines.push(JSON.stringify(c.evidence, null, 2));
    lines.push("```\n");
  }
  return lines.join("\n");
}

const stamp = nowStamp();
fs.mkdirSync(path.join(ROOT, "reports/teardown"), { recursive: true });
const jsonPath = `reports/teardown/${stamp}-teardown-audit.json`;
const mdPath = `reports/teardown/${stamp}-teardown-audit.md`;
fs.writeFileSync(path.join(ROOT, jsonPath), JSON.stringify({ meta: { generatedAt: new Date().toISOString() }, checks }, null, 2));
fs.writeFileSync(path.join(ROOT, mdPath), toMarkdown(checks));

const failing = checks.filter(c => !c.pass && c.severity !== "INFO");
const f7 = checks.find(c => c.id === "F7");

if (failing.length) {
  console.error("TEARDOWN FAILED — resíduo de agente detectado:");
  for (const f of failing) {
    console.error(`  [${f.id}][${f.severity}] ${f.title}`);
    console.error(`  → ${f.countermeasure}`);
  }
  process.exit(1);
}

console.log(`TEARDOWN OK — ${checks.filter(c => c.pass).length} gates passando`);
if (f7 && !f7.clean) {
  console.log(`  [F7][INFO] ${f7.title}`);
  for (const d of (f7.evidence.dirty ?? [])) console.log(`    ${d}`);
}
console.log(`Report: ${mdPath}`);
