// scripts/audit/repo-audit.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}
function read(p) {
  return fs.readFileSync(path.join(ROOT, p), "utf8");
}
function linesWith(p, re) {
  const content = read(p);
  const lines = content.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) out.push({ line: i + 1, text: lines[i] });
  }
  return out;
}
function listPublic() {
  const dir = path.join(ROOT, "public");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}
function ensureDir(p) {
  fs.mkdirSync(path.join(ROOT, p), { recursive: true });
}
function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const checks = [];

// A. Arquivos "prometidos"/sensíveis (anti-alucinação)
checks.push({
  id: "A1",
  severity: "MODERATE",
  title: "Foto real publicada (photo.jpg/png/webp) — não placeholder SVG",
  evidence: (() => {
    const files = listPublic().filter((f) => /^photo\./i.test(f));
    const hasReal = files.some((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    const hasSvg = files.some((f) => /\.svg$/i.test(f));
    return { files, hasReal, hasSvg };
  })(),
  pass: (() => {
    const files = listPublic().filter((f) => /^photo\./i.test(f));
    return files.some((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  })(),
});

checks.push({
  id: "A2",
  severity: "MODERATE",
  title: "robots.ts existe (SEO básico)",
  evidence: { exists: exists("app/robots.ts") },
  pass: exists("app/robots.ts"),
});

checks.push({
  id: "A3",
  severity: "MODERATE",
  title: "sitemap.ts existe (SEO básico)",
  evidence: { exists: exists("app/sitemap.ts") },
  pass: exists("app/sitemap.ts"),
});

checks.push({
  id: "A4",
  severity: "MODERATE",
  title: "JSON-LD (application/ld+json) existe no layout",
  evidence: (() => {
    const p = "app/layout.tsx";
    if (!exists(p)) return { file: p, exists: false };
    const hits = linesWith(p, /application\/ld\+json|ld\+json|JSON-LD|json-ld/i);
    return { file: p, exists: true, hits: hits.slice(0, 12) };
  })(),
  pass: (() => {
    const p = "app/layout.tsx";
    if (!exists(p)) return false;
    return linesWith(p, /application\/ld\+json|ld\+json/i).length > 0;
  })(),
});

checks.push({
  id: "A5",
  severity: "MODERATE",
  title: "apple-touch-icon referenciado E arquivo existe",
  evidence: (() => {
    const layout = "app/layout.tsx";
    const hasRef =
      exists(layout) &&
      linesWith(layout, /apple-touch-icon|icons\s*:\s*{[^}]*apple/i).length > 0;
    const hasFile = exists("public/apple-touch-icon.png");
    const hits = exists(layout) ? linesWith(layout, /apple-touch-icon|icons\s*:/i).slice(0, 12) : [];
    return { referencedInLayout: hasRef, layoutHits: hits, fileExists: hasFile };
  })(),
  pass: (() => {
    const layout = "app/layout.tsx";
    const hasRef =
      exists(layout) &&
      linesWith(layout, /apple-touch-icon|icons\s*:\s*{[^}]*apple/i).length > 0;
    const hasFile = exists("public/apple-touch-icon.png");
    // Passa se (não referencia) OU (referencia e o arquivo existe).
    return !hasRef || (hasRef && hasFile);
  })(),
});

// B. Conteúdo controverso / claims sem evidência pública — GATES REAIS (exit 1 se encontrar)
checks.push({
  id: "B1",
  severity: "MODERATE",
  title: "Referências a Amparo/Sonner ausentes (risco reputacional/atribuição)",
  evidence: (() => {
    const p = "lib/constants.ts";
    if (!exists(p)) return { file: p, exists: false };
    const hits = linesWith(p, /Amparo|Sonner/i);
    return { file: p, exists: true, matches: hits.slice(0, 20), total: hits.length };
  })(),
  pass: (() => {
    const p = "lib/constants.ts";
    if (!exists(p)) return true;
    return linesWith(p, /Amparo|Sonner/i).length === 0;
  })(),
});

checks.push({
  id: "B2",
  severity: "MODERATE",
  title: 'Frase "PowerPoint" ausente (ruído de tom)',
  evidence: (() => {
    const p = "lib/constants.ts";
    if (!exists(p)) return { file: p, exists: false };
    const hits = linesWith(p, /PowerPoint/i);
    return { file: p, exists: true, matches: hits.slice(0, 20), total: hits.length };
  })(),
  pass: (() => {
    const p = "lib/constants.ts";
    if (!exists(p)) return true;
    return linesWith(p, /PowerPoint/i).length === 0;
  })(),
});

// B3: detecta claims numéricos sobre ENTIDADES EXTERNAS (municípios, cidades, clientes,
// empresas, projetos externos) — padrão: dígitos seguidos de + em contexto de terceiros.
// NÃO flagra métricas internas de código (entidades JPA, casos de uso, etc.).
checks.push({
  id: "B3",
  severity: "MODERATE",
  title: "Claims numéricos sobre entidades externas ausentes — exige remoção ou evidência pública verificável",
  evidence: (() => {
    const p = "lib/constants.ts";
    if (!exists(p)) return { file: p, exists: false };
    const hits = linesWith(p, /\d+\+\s*(munic[íi]p|cidade|cliente|empresa|projeto|organiza|contrato|organ)/i);
    return { file: p, exists: true, matches: hits.slice(0, 30), total: hits.length };
  })(),
  pass: (() => {
    const p = "lib/constants.ts";
    if (!exists(p)) return true;
    return linesWith(p, /\d+\+\s*(munic[íi]p|cidade|cliente|empresa|projeto|organiza|contrato|organ)/i).length === 0;
  })(),
});

// C. Segurança/privacidade (falha se achar PII óbvia)
// C1: CPF — detecta:
//   (a) CPF formatado: 000.000.000-00
//   (b) Sequência de 11 dígitos em arquivos ts/tsx/md/json (possível CPF bruto)
//   (c) Campo cpf com valor atribuído
// Linhas de comentário (// ou *) são excluídas para evitar falso positivo
// em comentários que documentam a remoção intencional do dado.
function cpfLines(p) {
  const content = read(p);
  const lines = content.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    const isCpfData =
      /\d{3}\.\d{3}\.\d{3}-\d{2}/.test(lines[i]) ||       // formatado
      /["']?cpf["']?\s*[:=]\s*["'`]/.test(lines[i]) ||     // campo com valor
      /(?<![\d])\d{11}(?![\d])/.test(lines[i]);             // 11 dígitos seguidos
    if (isCpfData) out.push({ line: i + 1, text: lines[i] });
  }
  return out;
}

checks.push({
  id: "C1",
  severity: "BLOCKER",
  title: "Nenhum dado de CPF (valor/campo) no repositório — comentários de remoção são ignorados",
  evidence: (() => {
    const candidates = ["lib/github-audit.ts", "lib/constants.ts", "app/layout.tsx", "app/api/audit/route.ts"];
    const hits = [];
    for (const p of candidates) {
      if (!exists(p)) continue;
      const m = cpfLines(p);
      if (m.length) hits.push({ file: p, matches: m.slice(0, 20), total: m.length });
    }
    return { scanned: candidates, hits };
  })(),
  pass: (() => {
    const candidates = ["lib/github-audit.ts", "lib/constants.ts", "app/layout.tsx", "app/api/audit/route.ts"];
    for (const p of candidates) {
      if (!exists(p)) continue;
      if (cpfLines(p).length) return false;
    }
    return true;
  })(),
});

// D. Brand enforcement — tokens e nome canônico
checks.push({
  id: "D1",
  severity: "MODERATE",
  title: "Token --en-void (Rembrandt, invariante da holding) declarado em globals.css",
  evidence: (() => {
    const p = "app/globals.css";
    if (!exists(p)) return { file: p, exists: false };
    const hits = linesWith(p, /--en-void/);
    return { file: p, exists: true, hits: hits.slice(0, 5) };
  })(),
  pass: (() => {
    const p = "app/globals.css";
    if (!exists(p)) return false;
    return linesWith(p, /--en-void/).length > 0;
  })(),
});

checks.push({
  id: "D2",
  severity: "MODERATE",
  title: "Token --en-arc (Rembrandt, arco elétrico, invariante da holding) declarado em globals.css",
  evidence: (() => {
    const p = "app/globals.css";
    if (!exists(p)) return { file: p, exists: false };
    const hits = linesWith(p, /--en-arc[^-]/);
    return { file: p, exists: true, hits: hits.slice(0, 5) };
  })(),
  pass: (() => {
    const p = "app/globals.css";
    if (!exists(p)) return false;
    return linesWith(p, /--en-arc[^-]/).length > 0;
  })(),
});

checks.push({
  id: "D3",
  severity: "MODERATE",
  title: 'Nome canônico R8 — nenhum display name isolado "Leonardo" em constants.ts (usar sempre "Leo Américo")',
  evidence: (() => {
    const p = "lib/constants.ts";
    if (!exists(p)) return { file: p, exists: false };
    // Detecta "Leonardo" isolado em string de texto visível — exclui linhas de comentário
    const hits = linesWith(p, /["'`]\s*Leonardo\s*["'`]|:\s*"Leonardo[^\s]/)
      .filter(({ text }) => !text.trimStart().startsWith("//") && !text.trimStart().startsWith("*"));
    return { file: p, exists: true, hits: hits.slice(0, 10), total: hits.length };
  })(),
  pass: (() => {
    const p = "lib/constants.ts";
    if (!exists(p)) return true;
    return linesWith(p, /["'`]\s*Leonardo\s*["'`]|:\s*"Leonardo[^\s]/)
      .filter(({ text }) => !text.trimStart().startsWith("//") && !text.trimStart().startsWith("*"))
      .length === 0;
  })(),
});

function toMarkdown(report) {
  const lines = [];
  lines.push(`# Repo Audit — ${report.meta.repo}`);
  lines.push(`- Branch: ${report.meta.branch ?? "N/A"}`);
  lines.push(`- Commit: ${report.meta.commit ?? "N/A"}`);
  lines.push(`- Generated: ${report.meta.generatedAt}`);
  lines.push("");
  lines.push("## Results");
  for (const c of report.checks) {
    const status = c.pass ? "PASS" : "FAIL";
    lines.push(`### ${c.id} — ${status} — ${c.severity}`);
    lines.push(`**${c.title}**`);
    lines.push("");
    lines.push("```json");
    lines.push(JSON.stringify(c.evidence, null, 2));
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}

function getGitMeta() {
  // sem depender de libs: tenta ler .git/HEAD e refs
  const gitDir = path.join(ROOT, ".git");
  if (!fs.existsSync(gitDir)) return {};
  const head = fs.readFileSync(path.join(gitDir, "HEAD"), "utf8").trim();
  let branch = null;
  let commit = null;
  if (head.startsWith("ref:")) {
    const ref = head.replace("ref:", "").trim();
    branch = ref.replace("refs/heads/", "");
    const refPath = path.join(gitDir, ref);
    if (fs.existsSync(refPath)) commit = fs.readFileSync(refPath, "utf8").trim();
  } else {
    commit = head;
  }
  return { branch, commit };
}

const stamp = nowStamp();
ensureDir("reports/audit");

const git = getGitMeta();
const report = {
  meta: {
    repo: path.basename(ROOT),
    branch: git.branch,
    commit: git.commit,
    generatedAt: new Date().toISOString(),
  },
  checks,
};

const jsonPath = `reports/audit/${stamp}-repo-audit.json`;
const mdPath = `reports/audit/${stamp}-repo-audit.md`;
fs.writeFileSync(path.join(ROOT, jsonPath), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(ROOT, mdPath), toMarkdown(report), "utf8");

// Gate estrito: falha se qualquer BLOCKER ou MODERATE "pass:false"
const failing = report.checks.filter((c) => !c.pass && (c.severity === "BLOCKER" || c.severity === "MODERATE"));
if (failing.length) {
  console.error("AUDIT FAILED:");
  for (const f of failing) console.error(`- ${f.id} (${f.severity}): ${f.title}`);
  process.exit(1);
}

console.log(`AUDIT OK: ${jsonPath} + ${mdPath}`);
