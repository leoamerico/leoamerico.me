// scripts/audit/opsec-audit.mjs
// ════════════════════════════════════════════════════════════════════════════
// OPSEC Commercial Risk & Industrial Espionage Gate
// ════════════════════════════════════════════════════════════════════════════
//
// Methodology (standards with unquestionable track record):
//
//   OPSEC        US DoD NSDD-298 / Army FM 3-13.3 — 5-step process
//                (Identify CI → Analyze Threat → Analyze Vulnerability
//                 → Assess Risk → Apply Countermeasures)
//
//   MITRE ATT&CK Reconnaissance phase — public source collection
//                T1591   Gather Victim Organization Information
//                T1591.002  Business Relationships (infra enumeration)
//                T1592   Gather Victim Host Information
//                T1592.002  Software (version fingerprinting → CVE targeting)
//                T1593   Search Public Websites / Technical Databases
//
//   ISO 27001:2022
//                A.5.12  Classification of information
//                A.5.33  Protection of records
//                A.8.7   Protection against malware (attack surface reduction)
//
//   NIST SP 800-53 Rev5
//                RA-3    Risk Assessment
//                PL-8    Security and Privacy Architectures
//                SA-8    Security and Privacy Engineering Principles
//
// ════════════════════════════════════════════════════════════════════════════
//
// Gates (E-series — OPSEC layer):
//
//   E1 MODERATE  Version Fingerprinting
//                Specific version numbers in public content enable targeted
//                CVE lookup. "Java 21" → attacker queries CVE-XXXX for Java 21.
//                Reference: MITRE T1592.002
//
//   E2 MODERATE  Internal Artifact Disclosure
//                Internal repo/module names (e.g., *-kernel, shared-kernel)
//                reveal internal architecture map. A competitor can reconstruct
//                the bounded-context structure from public display text.
//                Reference: MITRE T1591
//
//   E3 MODERATE  Infrastructure Enumeration
//                Listing 3+ cloud providers by name creates a spear-phishing
//                map. Attacker knows which providers to impersonate, which
//                accounts to target, and which support channels to socially
//                engineer. Reference: MITRE T1591.002
//
//   E4 MODERATE  Implementation Blueprint Disclosure
//                Describing the internal mechanism (not just the capability)
//                of security-critical features (audit trail, crypto, storage)
//                gives a competitor a free architectural spec.
//                Reference: MITRE T1593
//
//   E5 INFO      Methodology IP Exposure
//                Core methodology (terms, invariants, affective profiles) is
//                fully public in content/terms/. This is a business decision
//                (open methodology vs. trade secret). Flagged as INFO only —
//                does not block. Requires conscious owner sign-off per cycle.
//                Reference: ISO 27001 A.5.12
//
// ════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";

// ── Repo discovery ───────────────────────────────────────────────────────────
// Primary repo is always cwd. Sibling repos are discovered by convention.
const PRIMARY = process.cwd();
const SIBLING_CANDIDATES = [
  path.resolve(PRIMARY, "../../envneo"),
  path.resolve(PRIMARY, "../../govevia-site"),
  path.resolve(PRIMARY, "../envneo"),
  path.resolve(PRIMARY, "../govevia-site"),
  "D:/envneo",
  "D:/govevia-site",
];

function findRepo(candidates) {
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) return c;
  }
  return null;
}

const REPOS = {
  "leoamerico.me": PRIMARY,
  "envneo": findRepo(SIBLING_CANDIDATES.filter((p) => p.includes("envneo"))),
  "govevia-site": findRepo(SIBLING_CANDIDATES.filter((p) => p.includes("govevia"))),
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function readSafe(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}

function scanLines(filePath, re) {
  const raw = readSafe(filePath);
  if (!raw) return [];
  return raw.split(/\r?\n/)
    .map((text, i) => ({ line: i + 1, text }))
    .filter(({ text }) => {
      const t = text.trimStart();
      // Exclude pure comment lines — avoid false positives on documentation
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("#")) return false;
      return re.test(text);
    });
}

function globFiles(dir, exts, excludes = ["node_modules", ".next", ".vercel", "dist", "build"]) {
  const out = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (excludes.some((x) => entry.name === x || entry.name.startsWith("."))) continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (exts.some((e) => entry.name.endsWith(e))) out.push(full);
    }
  }
  walk(dir);
  return out;
}

function countCloudProviders(text) {
  const PROVIDERS = ["AWS", "GCP", "Azure", "Oracle Cloud", "Heroku", "DigitalOcean", "Cloudflare", "Linode", "Vultr"];
  return PROVIDERS.filter((p) => text.includes(p)).length;
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// ── Check engine ─────────────────────────────────────────────────────────────
const checks = [];

// ── E1: Version Fingerprinting ───────────────────────────────────────────────
// Pattern: tech name + space + version number in a display string (not a comment).
// Correct: "Java LTS", "Java (LTS)", "Java 21+" — no exact version.
// Blocked: "Java 21", "Spring Boot 3.2", "Next.js 14.2", "PostgreSQL 15".
const VERSION_RE = /\b(Java|Spring|Hibernate|JPA|Node\.js|Next\.js|React|PostgreSQL|MySQL|MongoDB|Redis|Angular|Vue|Python|Django|FastAPI|Rust|Go)\s+\d+[\d.]*/i;

for (const [repoName, repoRoot] of Object.entries(REPOS)) {
  if (!repoRoot) continue;
  const pubFiles = [
    path.join(repoRoot, "lib/constants.ts"),
    path.join(repoRoot, "lib/constants.tsx"),
    path.join(repoRoot, "app/page.tsx"),
    path.join(repoRoot, "app/page.ts"),
    ...globFiles(path.join(repoRoot, "content"), [".yml", ".yaml", ".md", ".mdx"]),
    ...globFiles(path.join(repoRoot, "registry"), [".yml", ".yaml"]),
  ];
  const hits = [];
  for (const f of pubFiles) {
    if (!fs.existsSync(f)) continue;
    const m = scanLines(f, VERSION_RE);
    if (m.length) hits.push({ file: path.relative(repoRoot, f), matches: m.slice(0, 10) });
  }
  checks.push({
    id: "E1",
    repo: repoName,
    severity: "MODERATE",
    mitre: "T1592.002",
    title: `[${repoName}] Version Fingerprinting — versões específicas em texto público habilitam CVE targeting`,
    countermeasure: 'Substituir versão exata por família: "Java LTS", "Java 21+" — não "Java 21".',
    evidence: { scanned: pubFiles.filter(fs.existsSync).map((f) => path.relative(repoRoot, f)), hits },
    pass: hits.length === 0,
  });
}

// ── E2: Internal Artifact Names ───────────────────────────────────────────────
// Internal module/repo names (*-kernel, *-shared-kernel, *-core proprietary) in
// public-facing display strings reveal the internal bounded-context map.
// Exception: "-kernel" inside code import paths (not display strings) is OK.
const ARTIFACT_RE = /["'`][^"'`]*(govevia-kernel|shared-kernel|envneo-kernel|env-neo-core|-core\b)[^"'`]*["'`]/i;

for (const [repoName, repoRoot] of Object.entries(REPOS)) {
  if (!repoRoot) continue;
  const pubFiles = [
    path.join(repoRoot, "lib/constants.ts"),
    path.join(repoRoot, "lib/constants.tsx"),
    path.join(repoRoot, "app/page.tsx"),
    ...globFiles(path.join(repoRoot, "content"), [".yml", ".yaml", ".md"]),
  ];
  const hits = [];
  for (const f of pubFiles) {
    if (!fs.existsSync(f)) continue;
    const m = scanLines(f, ARTIFACT_RE);
    if (m.length) hits.push({ file: path.relative(repoRoot, f), matches: m.slice(0, 10) });
  }
  checks.push({
    id: "E2",
    repo: repoName,
    severity: "MODERATE",
    mitre: "T1591",
    title: `[${repoName}] Internal Artifact Disclosure — nomes internos de módulo/repo em texto público`,
    countermeasure: 'Substituir por nome funcional: "kernel do Govevia" em vez de "govevia-kernel".',
    evidence: { hits },
    pass: hits.length === 0,
  });
}

// ── E3: Infrastructure Enumeration ───────────────────────────────────────────
// Listing 3+ cloud providers by name in the same public object is a
// spear-phishing intelligence gift. Count per-repo, not per-file.
for (const [repoName, repoRoot] of Object.entries(REPOS)) {
  if (!repoRoot) continue;
  const pubFiles = [
    path.join(repoRoot, "lib/constants.ts"),
    path.join(repoRoot, "app/page.tsx"),
    ...globFiles(path.join(repoRoot, "registry"), [".yml"]),
    ...globFiles(path.join(repoRoot, "content"), [".yml", ".md"]),
  ];
  const allText = pubFiles
    .filter(fs.existsSync)
    .map((f) => readSafe(f) ?? "")
    .join("\n");
  const providerCount = countCloudProviders(allText);
  const namedProviders = ["AWS", "GCP", "Azure", "Oracle Cloud", "Heroku", "DigitalOcean"]
    .filter((p) => allText.includes(p));
  checks.push({
    id: "E3",
    repo: repoName,
    severity: "MODERATE",
    mitre: "T1591.002",
    title: `[${repoName}] Infrastructure Enumeration — ${providerCount} cloud providers nomeados publicamente`,
    countermeasure: 'Máximo 2 providers nomeados. Demais: "multi-cloud" ou categoria.',
    evidence: { providerCount, namedProviders },
    pass: providerCount <= 2,
  });
}

// ── E4: Implementation Blueprint Disclosure ───────────────────────────────────
// Describing internal cryptographic or storage mechanism gives competitors
// a free architectural specification of security-critical systems.
// SCOPE: Public display strings only (constants.ts, app/page.tsx, app/layout.tsx,
//        registry). NOT content/ or docs/ — those are technical IP documentation,
//        detailed descriptions there are expected and correct.
// Signal: crypto/storage mechanism words in marketing/display content.
const BLUEPRINT_RE = /(hash chain|append-only|Object Lock|event store\b|replication.*storage|storage.*replication|criptograf.*armazenam|armazenam.*criptograf|merkle|write-ahead log|WAL\b)/i;

for (const [repoName, repoRoot] of Object.entries(REPOS)) {
  if (!repoRoot) continue;
  // Narrow scope: only the public-facing display layer
  const pubFiles = [
    path.join(repoRoot, "app/page.tsx"),
    path.join(repoRoot, "app/page.ts"),
    path.join(repoRoot, "app/layout.tsx"),
    path.join(repoRoot, "lib/constants.ts"),
    path.join(repoRoot, "lib/constants.tsx"),
    ...globFiles(path.join(repoRoot, "registry"), [".yml", ".yaml"]),
  ];
  const hits = [];
  for (const f of pubFiles) {
    if (!fs.existsSync(f)) continue;
    const m = scanLines(f, BLUEPRINT_RE);
    if (m.length) hits.push({ file: path.relative(repoRoot, f), matches: m.slice(0, 10) });
  }
  checks.push({
    id: "E4",
    repo: repoName,
    severity: "MODERATE",
    mitre: "T1593",
    title: `[${repoName}] Implementation Blueprint — mecanismo interno de feature de segurança em display público`,
    countermeasure: 'Descrever capacidade (O QUÊ), nunca mecanismo (COMO). "Trilha criptográfica imutável" — não "PostgreSQL + hash chain + Object Lock".',
    evidence: { scannedScope: "display-layer only: constants.ts, page.tsx, layout.tsx, registry/", hits },
    pass: hits.length === 0,
  });
}

// ── E5: Methodology IP Exposure (INFO — não bloqueia) ────────────────────────
// content/terms/*.yml exposes the complete Env Neo methodology publicly.
// This is a business decision, not a technical vulnerability.
// Requires annual conscious owner sign-off via OPSEC_IP_ACCEPTED marker.
for (const [repoName, repoRoot] of Object.entries(REPOS)) {
  if (!repoRoot) continue;
  const termsDir = path.join(repoRoot, "content/terms");
  if (!fs.existsSync(termsDir)) continue;
  const termFiles = globFiles(termsDir, [".yml", ".yaml"]);
  const hasSignoff = fs.existsSync(path.join(repoRoot, "content/terms/.opsec-ip-accepted"));
  checks.push({
    id: "E5",
    repo: repoName,
    severity: "INFO",
    mitre: "ISO-27001-A.5.12",
    title: `[${repoName}] Methodology IP — ${termFiles.length} term files públicos sem sign-off formal`,
    countermeasure: 'Decisão consciente: criar "content/terms/.opsec-ip-accepted" com data + justificativa para silenciar.',
    evidence: { termFiles: termFiles.map((f) => path.relative(repoRoot, f)), hasSignoff },
    pass: true, // INFO only — never blocks
  });
}

// ── Reporter ──────────────────────────────────────────────────────────────────
function toMarkdown(checks, meta) {
  const lines = [];
  lines.push("# OPSEC Audit — Commercial Risk & Industrial Espionage");
  lines.push(`- Repos: ${Object.keys(REPOS).filter((k) => REPOS[k]).join(", ")}`);
  lines.push(`- Generated: ${meta.generatedAt}`);
  lines.push(`- Methodology: OPSEC 5-step · MITRE ATT&CK T1591/T1592/T1593 · ISO 27001 A.5.12 · NIST SP 800-53 RA-3`);
  lines.push("");
  lines.push("## Risk Classification");
  lines.push("| Gate | Severity | MITRE | Status | Title |");
  lines.push("|------|----------|-------|--------|-------|");
  for (const c of checks) {
    const status = c.severity === "INFO" ? "INFO" : (c.pass ? "✅ PASS" : "❌ FAIL");
    lines.push(`| ${c.id} | ${c.severity} | ${c.mitre} | ${status} | ${c.title} |`);
  }
  lines.push("");
  lines.push("## Detail");
  for (const c of checks) {
    lines.push(`### ${c.id} [${c.repo}] — ${c.pass || c.severity === "INFO" ? "PASS" : "FAIL"}`);
    lines.push(`**${c.title}**`);
    lines.push(`> Countermeasure: ${c.countermeasure}`);
    lines.push("");
    lines.push("```json");
    lines.push(JSON.stringify(c.evidence, null, 2));
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}

const stamp = nowStamp();
const reportsDir = path.join(PRIMARY, "reports/opsec");
fs.mkdirSync(reportsDir, { recursive: true });

const report = {
  meta: { generatedAt: new Date().toISOString(), methodology: "OPSEC+MITRE+ISO27001+NIST" },
  repos: Object.fromEntries(Object.entries(REPOS).map(([k, v]) => [k, v ?? "not found"])),
  checks,
};

const jsonPath = path.join("reports/opsec", `${stamp}-opsec-audit.json`);
const mdPath = path.join("reports/opsec", `${stamp}-opsec-audit.md`);
fs.writeFileSync(path.join(PRIMARY, jsonPath), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(PRIMARY, mdPath), toMarkdown(checks, report.meta));

const failing = checks.filter((c) => !c.pass && c.severity !== "INFO");
const infos = checks.filter((c) => c.severity === "INFO");

if (failing.length) {
  console.error("OPSEC AUDIT FAILED:");
  for (const f of failing) {
    console.error(`  [${f.id}][${f.repo}] ${f.mitre} — ${f.title}`);
    console.error(`  → ${f.countermeasure}`);
  }
  console.error(`\nReport: ${jsonPath}`);
  process.exit(1);
}

console.log(`OPSEC OK — ${checks.filter((c) => c.pass).length} checks passed, ${infos.length} info items`);
if (infos.length) {
  for (const i of infos) console.log(`  [INFO][${i.repo}] ${i.title}`);
}
console.log(`Report: ${jsonPath} + ${mdPath}`);
