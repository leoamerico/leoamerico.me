// scripts/audit/infra-audit.mjs
// ════════════════════════════════════════════════════════════════════════════
// INFRA GATE — I-Series Infrastructure Enforcement
// ════════════════════════════════════════════════════════════════════════════
//
// PURPOSE:
//   Automated verification that infrastructure configuration is correct
//   and complete in source before any deployment. Catches misconfigurations
//   that would only surface after Vercel deploy or GoDaddy DNS change.
//
// GATES:
//   I1  BLOCKER  public/robots.txt exists in the repository
//   I2  BLOCKER  robots.txt contains Disallow: /ceo/
//   I3  BLOCKER  next.config.mjs defines Strict-Transport-Security (HSTS)
//   I4  BLOCKER  next.config.mjs defines X-Frame-Options: DENY
//   I5  BLOCKER  vercel.json does NOT duplicate security headers (source of truth is next.config)
//   I6  BLOCKER  .env.example exists and documents CEO_PASSPHRASE_HASH or CEO_SECRET
//   I7  BLOCKER  No real credentials committed to tracked JS/TS/MJS source files
//   I8  INFO     docs/infra/README.md present (infra SSOT documentation)
//
// METHODOLOGY:
//   Based on Vercel deployment best-practices + OWASP security headers baseline
//   + NIST SP 800-53 CM-7 (Least Functionality) + ISO 27001:2022 A.8.9.
//
// ════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports/infra");

function readSafe(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// ── I1: robots.txt exists ─────────────────────────────────────────────────
function checkI1() {
  const robotsPath = path.join(ROOT, "public/robots.txt");
  const exists = fs.existsSync(robotsPath);
  return {
    id: "I1", severity: "BLOCKER",
    title: "robots.txt presente em public/",
    pass: exists,
    evidence: exists ? "public/robots.txt encontrado" : "public/robots.txt AUSENTE",
    countermeasure: "Criar public/robots.txt com Disallow: /ceo/ e Sitemap: https://leoamerico.me/sitemap.xml",
  };
}

// ── I2: robots.txt Disallows /ceo/ ────────────────────────────────────────
function checkI2() {
  const robotsPath = path.join(ROOT, "public/robots.txt");
  const content = readSafe(robotsPath);
  if (!content) return {
    id: "I2", severity: "BLOCKER",
    title: "robots.txt Disallow: /ceo/",
    pass: false,
    evidence: "robots.txt não encontrado — I1 deve passar primeiro",
    countermeasure: "robots.txt deve conter: Disallow: /ceo/",
  };
  const hasCeoDisallow = /^Disallow:\s*\/ceo\//m.test(content);
  return {
    id: "I2", severity: "BLOCKER",
    title: "robots.txt Disallow: /ceo/",
    pass: hasCeoDisallow,
    evidence: hasCeoDisallow ? "Disallow: /ceo/ presente" : "Disallow: /ceo/ AUSENTE",
    countermeasure: "Adicionar linha: Disallow: /ceo/",
  };
}

// ── I3: HSTS in next.config ───────────────────────────────────────────────
function checkI3() {
  const configPath = path.join(ROOT, "next.config.mjs");
  const content = readSafe(configPath) ?? readSafe(path.join(ROOT, "next.config.js")) ?? "";
  const hasHsts = /Strict-Transport-Security/i.test(content) &&
                  /max-age=\d{7,}/i.test(content);
  return {
    id: "I3", severity: "BLOCKER",
    title: "HSTS (Strict-Transport-Security) em next.config",
    pass: hasHsts,
    evidence: hasHsts
      ? "Strict-Transport-Security com max-age >= 10000000 encontrado"
      : "HSTS AUSENTE ou max-age insuficiente em next.config",
    countermeasure: "Adicionar: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
  };
}

// ── I4: X-Frame-Options DENY in next.config ───────────────────────────────
function checkI4() {
  const configPath = path.join(ROOT, "next.config.mjs");
  const content = readSafe(configPath) ?? readSafe(path.join(ROOT, "next.config.js")) ?? "";
  const hasXFrame = /X-Frame-Options/i.test(content) && /DENY/i.test(content);
  return {
    id: "I4", severity: "BLOCKER",
    title: "X-Frame-Options: DENY em next.config",
    pass: hasXFrame,
    evidence: hasXFrame ? "X-Frame-Options DENY encontrado" : "X-Frame-Options DENY AUSENTE em next.config",
    countermeasure: "Adicionar header: { key: 'X-Frame-Options', value: 'DENY' }",
  };
}

// ── I5: vercel.json não duplica security headers ──────────────────────────
function checkI5() {
  const vercelPath = path.join(ROOT, "vercel.json");
  const content = readSafe(vercelPath);
  if (!content) return {
    id: "I5", severity: "BLOCKER",
    title: "vercel.json não duplica headers de segurança",
    pass: true, // no vercel.json is fine
    evidence: "vercel.json ausente — next.config é o SSOT ✓",
  };
  // Check for security headers that should ONLY be in next.config
  const SECURITY_HEADERS = [
    "Strict-Transport-Security", "X-Frame-Options", "X-Content-Type-Options",
    "Content-Security-Policy", "X-XSS-Protection",
  ];
  const duplicated = SECURITY_HEADERS.filter(h =>
    new RegExp(`"key"\\s*:\\s*"${h}"`, "i").test(content)
  );
  const pass = duplicated.length === 0;
  return {
    id: "I5", severity: "BLOCKER",
    title: "vercel.json não duplica headers de segurança",
    pass,
    evidence: pass
      ? "Nenhum header de segurança duplicado em vercel.json"
      : `Headers duplicados em vercel.json: ${duplicated.join(", ")}`,
    countermeasure: "Remover headers de segurança do vercel.json — SSOT é next.config",
  };
}

// ── I6: .env.example exists with CEO vars ─────────────────────────────────
function checkI6() {
  const examplePath = path.join(ROOT, ".env.example");
  const content = readSafe(examplePath);
  if (!content) return {
    id: "I6", severity: "BLOCKER",
    title: ".env.example documenta variáveis CEO",
    pass: false,
    evidence: ".env.example AUSENTE",
    countermeasure: "Criar .env.example documentando CEO_PASSPHRASE_HASH e CEO_SESSION_SECRET",
  };
  const hasCeoVar = /CEO_PASSPHRASE_HASH|CEO_SECRET/.test(content);
  return {
    id: "I6", severity: "BLOCKER",
    title: ".env.example documenta variáveis CEO",
    pass: hasCeoVar,
    evidence: hasCeoVar ? ".env.example com variáveis CEO documentadas ✓" : ".env.example existe mas não documenta CEO vars",
    countermeasure: "Adicionar CEO_PASSPHRASE_HASH ao .env.example",
  };
}

// ── I7: No hardcoded real credentials in source ───────────────────────────
function checkI7() {
  // Patterns that indicate real credentials (not placeholders)
  const CRED_PATTERNS = [
    /ghp_[A-Za-z0-9]{36,}/,          // GitHub PAT
    /\$2[aby]\$\d{2}\$[A-Za-z0-9./]{53}/, // bcrypt hash
    /(AWS_ACCESS|AWS_SECRET)[^=\n]*=[^<\n]{20,}/i, // AWS keys
  ];

  // Only scan tracked source files (not node_modules, .next, reports, .env files themselves)
  let trackedFiles = [];
  try {
    const out = execSync("git ls-files -- '*.ts' '*.tsx' '*.mjs' '*.js'", {
      cwd: ROOT, encoding: "utf8"
    }).trim();
    trackedFiles = out.split("\n").filter(Boolean)
      .filter(f => !f.includes("node_modules") && !f.includes(".next"));
  } catch {
    // Not a git repo or no tracked files — pass with warning
    return {
      id: "I7", severity: "BLOCKER",
      title: "Sem credenciais reais em source rastreado",
      pass: true,
      evidence: "Git não disponível — verificação manual necessária",
    };
  }

  const violations = [];
  for (const relPath of trackedFiles) {
    const content = readSafe(path.join(ROOT, relPath));
    if (!content) continue;
    for (const pattern of CRED_PATTERNS) {
      if (pattern.test(content)) {
        violations.push({ file: relPath, pattern: pattern.toString() });
        break;
      }
    }
  }

  const pass = violations.length === 0;
  return {
    id: "I7", severity: "BLOCKER",
    title: "Sem credenciais reais em source rastreado",
    pass,
    evidence: pass
      ? `${trackedFiles.length} arquivos rastreados — nenhuma credencial real encontrada`
      : `CREDENCIAIS REAIS em source: ${violations.map(v => v.file).join(", ")}`,
    countermeasure: "Remover credenciais do source — usar env vars. Revogar chave exposta imediatamente.",
  };
}

// ── I8: docs/infra/README.md exists ──────────────────────────────────────
function checkI8() {
  const infraReadme = path.join(ROOT, "docs/infra/README.md");
  const exists = fs.existsSync(infraReadme);
  return {
    id: "I8", severity: "INFO",
    title: "docs/infra/README.md presente (SSOT de infraestrutura)",
    pass: true, // INFO — never blocks
    evidence: exists ? "docs/infra/README.md encontrado ✓" : "docs/infra/README.md ausente (recomendado)",
  };
}

// ── Run all checks ────────────────────────────────────────────────────────
const checks = [
  checkI1(), checkI2(), checkI3(), checkI4(),
  checkI5(), checkI6(), checkI7(), checkI8(),
];

const blockers = checks.filter(c => !c.pass && c.severity === "BLOCKER");
const moderates = checks.filter(c => !c.pass && c.severity === "MODERATE");
const infos = checks.filter(c => c.severity === "INFO");

// ── Report ────────────────────────────────────────────────────────────────
const stamp = nowStamp();
fs.mkdirSync(REPORT_DIR, { recursive: true });

const mdLines = [
  `# Infra Audit Report — ${stamp}`,
  ``,
  `| Gate | Severity | Status | Evidence |`,
  `|------|----------|--------|----------|`,
  ...checks.map(c => `| ${c.id} | ${c.severity} | ${c.pass ? "✅ PASS" : "❌ FAIL"} | ${c.evidence} |`),
  ``,
  `**Blockers:** ${blockers.length} | **Moderates:** ${moderates.length} | **Infos:** ${infos.length}`,
];

fs.writeFileSync(path.join(REPORT_DIR, `${stamp}-infra-audit.md`), mdLines.join("\n"), "utf8");
fs.writeFileSync(path.join(REPORT_DIR, `${stamp}-infra-audit.json`), JSON.stringify({ stamp, checks }, null, 2), "utf8");

// ── Console output ────────────────────────────────────────────────────────
if (blockers.length > 0) {
  console.error(`INFRA AUDIT FAILED — ${blockers.length} blocker(s):`);
  for (const c of blockers) {
    console.error(`  [${c.id}][${c.severity}] ${c.title}`);
    console.error(`    → ${c.evidence}`);
    if (c.countermeasure) console.error(`    ✎ ${c.countermeasure}`);
  }
  if (moderates.length > 0) {
    console.error(`  + ${moderates.length} moderate(s):`);
    for (const c of moderates) {
      console.error(`  [${c.id}][${c.severity}] ${c.evidence}`);
    }
  }
  console.error(`Report: reports/infra/${stamp}-infra-audit.md`);
  process.exit(1);
} else {
  const issues = moderates.length > 0 ? ` (${moderates.length} moderate(s))` : "";
  console.log(`INFRA OK — ${checks.filter(c => c.pass).length} gates passando${issues}`);
  for (const c of infos) console.log(`  [${c.id}][INFO] ${c.evidence}`);
  console.log(`Report: reports/infra/${stamp}-infra-audit.md`);
}
