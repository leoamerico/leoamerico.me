// scripts/audit/lexicon-audit.mjs
// ════════════════════════════════════════════════════════════════════════════
// LEXICON GATE — Vocabulary Enforcement (V-series)
// ════════════════════════════════════════════════════════════════════════════
//
// PURPOSE:
//   Prevent terminology drift across the three Env Neo sites.
//   Enforcement is automatic: forbidden terms in display text → build fails.
//
// SCOPE:
//   Display layer only: constants.ts, page.tsx, layout.tsx, registry/*.yml,
//   content/terms/*.yml (envneo only), content/manifesto.
//   NOT: code comments, technical implementation files, import paths.
//
// METHODOLOGY:
//   Inspired by Google's Model Spec term consistency enforcement and
//   Anthropic's Constitutional AI (output must conform to a declared
//   constitution of principles — here, the lexicon is the constitution).
//
// SOURCE OF TRUTH:
//   docs/brand/lexicon.yml in leoamerico.me repo.
//   This file is the SSOT — edit there, gates update automatically.
//
// ════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import yaml from "node:module";

const ROOT = process.cwd();

// ── Minimal YAML parser (no deps) ────────────────────────────────────────────
// We only need: list of {term, severity, forbidden[]} from a subset of YAML.
function parseLexicon(raw) {
  const terms = [];
  const lines = raw.split(/\r?\n/);
  let current = null;
  let inForbidden = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty
    if (!trimmed || trimmed.startsWith("#")) { inForbidden = false; continue; }

    // New term entry
    if (trimmed.startsWith("- term:")) {
      if (current) terms.push(current);
      current = { term: trimmed.replace(/^- term:\s*["']?/, "").replace(/["']?\s*$/, ""), severity: "MODERATE", forbidden: [] };
      inForbidden = false;
      continue;
    }

    if (!current) continue;

    if (trimmed.startsWith("severity:")) {
      current.severity = trimmed.replace("severity:", "").trim();
      inForbidden = false;
      continue;
    }

    if (trimmed.startsWith("forbidden:")) {
      inForbidden = true;
      continue;
    }

    if (inForbidden && trimmed.startsWith("-")) {
      // "- \"AI-first\"  # comment" → extract just the value
      const val = trimmed.replace(/^-\s*["']?/, "").replace(/["']?\s*(#.*)?$/, "").trim();
      if (val) current.forbidden.push(val);
      continue;
    }

    // Any non-forbidden, non-blank line resets forbidden state
    if (!trimmed.startsWith("-") && inForbidden) inForbidden = false;
  }
  if (current) terms.push(current);
  return terms;
}

// ── Repo discovery ────────────────────────────────────────────────────────────
const SIBLING_CANDIDATES = [
  path.resolve(ROOT, "../../envneo"),
  path.resolve(ROOT, "../../govevia-site"),
  path.resolve(ROOT, "../envneo"),
  path.resolve(ROOT, "../govevia-site"),
  "D:/envneo",
  "D:/govevia-site",
];

function findSibling(keyword) {
  return SIBLING_CANDIDATES.find((p) => p.includes(keyword) && fs.existsSync(p)) ?? null;
}

const REPOS = {
  "leoamerico.me": ROOT,
  "envneo": findSibling("envneo"),
  "govevia-site": findSibling("govevia"),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function readSafe(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}

function globFiles(dir, exts, excludeDirs = ["node_modules", ".next", ".vercel", "dist", "build", ".git"]) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (excludeDirs.some(x => entry.name === x || entry.name.startsWith("."))) continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (exts.some(e => entry.name.endsWith(e))) out.push(full);
    }
  }
  walk(dir);
  return out;
}

function getDisplayFiles(repoRoot) {
  // Only display-layer files — not implementation code
  // Explicitly exclude denylist/blocklist files (they contain forbidden terms by definition)
  const EXCLUDE_NAMES = ["claims-denylist", "denylist", "blocklist", "deny-list", "block-list"];
  function isExcludedByName(p) {
    const base = path.basename(p, path.extname(p)).toLowerCase();
    return EXCLUDE_NAMES.some(n => base.includes(n));
  }
  return [
    path.join(repoRoot, "lib/constants.ts"),
    path.join(repoRoot, "lib/constants.tsx"),
    path.join(repoRoot, "app/page.tsx"),
    path.join(repoRoot, "app/page.ts"),
    path.join(repoRoot, "app/layout.tsx"),
    ...globFiles(path.join(repoRoot, "registry"), [".yml", ".yaml"]).filter(f => !isExcludedByName(f)),
    ...globFiles(path.join(repoRoot, "content/manifesto"), [".md", ".mdx", ".yml"]),
    // content/terms intentionally excluded — that's the lexicon source, not the gate target
  ].filter(fs.existsSync);
}

function findForbiddenInFile(filePath, canonicalTerm, forbiddenTerms) {
  const raw = readSafe(filePath);
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const hits = [];

  // Pre-escape canonical for removal
  const canonicalEsc = canonicalTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const canonicalRe = new RegExp(canonicalEsc, "g");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // ── Skip structural / non-display lines ─────────────────────────────
    // Pure comment lines
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("#")) continue;
    // Import statements
    if (trimmed.startsWith("import ")) continue;
    // TypeScript/JS export-const identifier declarations (variable names are not display text)
    if (/^(export\s+)?(const|let|var)\s+[A-Z_][A-Z0-9_]*\s*[=:{]/.test(trimmed)) continue;

    // ── Sanitize line before matching ────────────────────────────────────
    // Remove URL patterns (https://... or relative hrefs) — handles are code, not display
    let sanitized = line
      .replace(/https?:\/\/\S+/g, " ")                                 // full URLs
      .replace(/href:\s*["'][^"']*["']/g, " ")                          // href="..." attributes
      .replace(/["'][a-z][a-z0-9-]*["']\s*:/g, " ")                     // quoted YAML/TS key names
      .replace(/^\s*[a-z][a-zA-Z0-9_]*\s*:/gm, " ")                    // unquoted TS/JS/YAML property keys
      .replace(/@[A-Za-z0-9._-]+/g, " ")                               // @handles in email/username form
      .replace(/<[A-Z][A-Za-z]+(\s*\/>|\s+[^>]*>?)/g, " ")             // JSX component tags <MyComponent />
      .replace(/["'][a-z][a-z0-9-]*\.(com|org|net|me|br|gov|io)([./"'\s]|$)/g, " ")  // domain names inside strings
      .replace(/\/[a-z][a-z0-9-]*\/[a-z0-9._/-]+/g, " ")              // file paths like /brand/govevia-mark.png
      .replace(/`[^`]*`/g, " ");                                        // template literals (often path/URL)

    // Remove the canonical term itself so it doesn't match its own forbidden variants
    // (e.g., "Govevia" contains "govevia" case-insensitively — must not self-flag)
    sanitized = sanitized.replace(canonicalRe, " ");

    // Skip lines whose remaining content is a single quoted lowercase word — technical identifier
    // (slug, id, code token) rather than display text. Display text would have spaces or capitals.
    if (/^\s*["'][a-z][a-z0-9-]*["']\s*,?\s*$/.test(sanitized)) continue;

    for (const ft of forbiddenTerms) {
      const escaped = ft.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Case-only variants (same letters, different capitalisation) → case-sensitive match
      // to avoid "Govevia" being flagged by the forbidden entry "govevia"
      const isCaseVariant = ft.normalize("NFC").toLowerCase() === canonicalTerm.normalize("NFC").toLowerCase();
      const flags = isCaseVariant ? "" : "i";

      if (new RegExp(escaped, flags).test(sanitized)) {
        hits.push({ line: i + 1, text: line.trim(), forbidden: ft });
      }
    }
  }
  return hits;
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// ── Load lexicon ──────────────────────────────────────────────────────────────
const LEXICON_PATH = path.join(ROOT, "docs/brand/lexicon.yml");
if (!fs.existsSync(LEXICON_PATH)) {
  console.error("LEXICON AUDIT FAILED: docs/brand/lexicon.yml not found.");
  process.exit(1);
}
const lexiconTerms = parseLexicon(readSafe(LEXICON_PATH));

// ── Run checks ────────────────────────────────────────────────────────────────
const checks = [];

for (const [repoName, repoRoot] of Object.entries(REPOS)) {
  if (!repoRoot) {
    checks.push({
      id: "V0",
      repo: repoName,
      severity: "INFO",
      title: `[${repoName}] Repo não encontrado — pulando`,
      evidence: {},
      pass: true,
    });
    continue;
  }

  const displayFiles = getDisplayFiles(repoRoot);

  for (const entry of lexiconTerms) {
    if (!entry.forbidden || entry.forbidden.length === 0) continue;

    const allHits = [];
    for (const f of displayFiles) {
      const hits = findForbiddenInFile(f, entry.term, entry.forbidden);
      if (hits.length) allHits.push({ file: path.relative(repoRoot, f), hits: hits.slice(0, 8) });
    }

    checks.push({
      id: "V",
      repo: repoName,
      severity: entry.severity,
      term: entry.term,
      title: `[${repoName}] Termo canônico "${entry.term}" — sinônimos proibidos ausentes`,
      countermeasure: `Substituir forma proibida pelo canônico: "${entry.term}"`,
      evidence: {
        canonical: entry.term,
        forbidden: entry.forbidden,
        filesScanned: displayFiles.map(f => path.relative(repoRoot, f)),
        violations: allHits,
      },
      pass: allHits.length === 0,
    });
  }
}

// ── Reporter ──────────────────────────────────────────────────────────────────
function toMarkdown(checks) {
  const lines = [];
  lines.push("# Lexicon Audit — Vocabulary Enforcement (V-series)");
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push(`- Source of truth: docs/brand/lexicon.yml`);
  lines.push(`- Principle: terminologia consistente = autoridade reconhecível`);
  lines.push("");

  const failing = checks.filter(c => !c.pass && c.severity !== "INFO");
  const passing = checks.filter(c => c.pass && c.severity !== "INFO");

  lines.push(`## Summary`);
  lines.push(`- ✅ ${passing.length} terms clean`);
  lines.push(`- ❌ ${failing.length} violations found`);
  lines.push("");

  if (failing.length) {
    lines.push("## Violations");
    for (const c of failing) {
      lines.push(`### ❌ [${c.repo}] "${c.term}"`);
      lines.push(`> ${c.countermeasure}`);
      lines.push("```json");
      lines.push(JSON.stringify(c.evidence.violations, null, 2));
      lines.push("```\n");
    }
  }
  return lines.join("\n");
}

const stamp = nowStamp();
fs.mkdirSync(path.join(ROOT, "reports/lexicon"), { recursive: true });
const jsonPath = `reports/lexicon/${stamp}-lexicon-audit.json`;
const mdPath = `reports/lexicon/${stamp}-lexicon-audit.md`;
fs.writeFileSync(path.join(ROOT, jsonPath), JSON.stringify({ meta: { generatedAt: new Date().toISOString(), lexiconTerms: lexiconTerms.length }, checks }, null, 2));
fs.writeFileSync(path.join(ROOT, mdPath), toMarkdown(checks));

const failing = checks.filter(c => !c.pass && c.severity !== "INFO");
if (failing.length) {
  console.error(`LEXICON AUDIT FAILED — ${failing.length} violation(s):`);
  for (const f of failing) {
    console.error(`  [${f.severity}][${f.repo}] "${f.term}"`);
    for (const v of f.evidence.violations) {
      console.error(`    ${v.file}:`);
      for (const h of v.hits.slice(0, 3)) {
        console.error(`      L${h.line}: "${h.forbidden}" → use "${f.term}"`);
      }
    }
  }
  process.exit(1);
}

console.log(`LEXICON OK — ${checks.filter(c => c.pass && c.severity !== "INFO").length} term checks clean across ${Object.values(REPOS).filter(Boolean).length} repos`);
console.log(`Report: ${mdPath}`);
