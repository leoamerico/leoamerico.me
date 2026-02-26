#!/usr/bin/env node
// scripts/seo/seo-v3-coverage.mjs — V3 Content Coverage (Persona/Intent)
import { classify as canonicalClassify } from "./canonical.mjs";
// ─────────────────────────────────────────────────────────────────────────────
// Análise ao vivo contra servidor local ou URL remota.
// Faz fetch do HTML real — detecta thin content, canibalização, heading drift.
//
// Uso:
//   bun run build && bun run start -p 3000
//   node scripts/seo/seo-v3-coverage.mjs                    (localhost:3000)
//   node scripts/seo/seo-v3-coverage.mjs --url http://...
//   node scripts/seo/seo-v3-coverage.mjs --json             (output JSON)
//   node scripts/seo/seo-v3-coverage.mjs --md               (output Markdown)
//
// Outputs (se writereports=true, padrão):
//   reports/seo/seo-v3-coverage.json
//   reports/seo/seo-v3-coverage.md
// ─────────────────────────────────────────────────────────────────────────────

import { writeFile, mkdir } from "fs/promises";
import { existsSync }       from "fs";
import { parseArgs }        from "node:util";
import path                 from "path";

const { values: args } = parseArgs({
  options: {
    url:          { type: "string",  default: "http://localhost:3000" },
    json:         { type: "boolean", default: false },
    md:           { type: "boolean", default: false },
    noreports:    { type: "boolean", default: false },
    threshold:    { type: "string",  default: "250" },
  },
  strict: false,
});

const BASE           = args.url.replace(/\/$/, "");
const THIN_THRESHOLD = parseInt(args.threshold, 10) || 250;
const JSON_MODE      = args.json;
const MD_MODE        = args.md;
const WRITE_REPORTS  = !args.noreports;

// ─── Colours ─────────────────────────────────────────────────────────────────
const NO_COLOR = JSON_MODE || MD_MODE;
const c = NO_COLOR
  ? { r: s => s, g: s => s, y: s => s, d: s => s, b: s => s, m: s => s }
  : {
    r: s => `\x1b[31m${s}\x1b[0m`,
    g: s => `\x1b[32m${s}\x1b[0m`,
    y: s => `\x1b[33m${s}\x1b[0m`,
    d: s => `\x1b[90m${s}\x1b[0m`,
    b: s => `\x1b[1m${s}\x1b[0m`,
    m: s => `\x1b[35m${s}\x1b[0m`,
  };

if (!JSON_MODE && !MD_MODE) {
  process.stderr.write(`\n${c.b("SEO V3 — Content Coverage")} · ${c.d(BASE)}\n\n`);
}

// ─── HTTP fetch ───────────────────────────────────────────────────────────────
async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "SEO-V3-Coverage/1.0", Accept: "text/html" },
  });
  return { ok: res.ok, status: res.status, text: await res.text() };
}

// ─── HTML parsers ─────────────────────────────────────────────────────────────
function getTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}
function getMeta(html, name) {
  const m = html.match(new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i",
  )) ?? html.match(new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i",
  ));
  return m ? m[1] : null;
}
function getRobotsMeta(html) { return getMeta(html, "robots"); }
function getTagText(html, tag) {
  const re  = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "gi");
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = m[1].replace(/&amp;/g, "&").replace(/&ldquo;|&rdquo;/g, '"')
      .replace(/&[a-z]+;/g, " ").trim();
    if (t && t.length > 1) out.push(t);
  }
  return out;
}
function extractBodyText(html) {
  // Prefer data-seo-root node (stable, avoids nav/footer noise)
  const rootMatch = /<main[^>]*data-seo-root="true"[^>]*>([\s\S]*)<\/main>/i.exec(html);
  const source = rootMatch ? rootMatch[1] : html;
  return source
    .replace(/<(nav|header|footer|script|style|noscript|aside)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function wordCount(text) {
  return text.split(/\s+/).filter(w => w.length > 2).length;
}
function signature(...parts) {
  const str = parts.join("|").toLowerCase().replace(/\s+/g, " ").slice(0, 256);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// ─── Persona/intent classifier — via canonical.mjs ───────────────────────────
function classify(url, h1Text, title) {
  return canonicalClassify(url, h1Text, title);
}

// ─── Sitemap parsing ──────────────────────────────────────────────────────────
async function getPages() {
  const sm = await fetchText(`${BASE}/sitemap.xml`);
  const locs = sm.ok
    ? Array.from(sm.text.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g), m => m[1].trim())
    : [`${BASE}/`];
  if (!sm.ok) {
    if (!JSON_MODE && !MD_MODE) process.stderr.write(c.y(`⚠ Sitemap não acessível (${sm.status}), usando /\n`));
  }

  // Normalise host to BASE
  const pages = locs
    .map(u => u.replace(/^https?:\/\/[^/]+/, BASE))
    .filter(u => !u.includes("/__visual") && !u.includes("/api/") && !u.includes("/ceo/"));

  // Dedup by path (ignore anchors for fetching, but keep for classification)
  const realPaths = new Map(); // path → first url with anchor
  for (const u of pages) {
    const noAnchor = u.split("#")[0];
    if (!realPaths.has(noAnchor)) realPaths.set(noAnchor, u);
  }
  return { pages: Array.from(realPaths.values()), allUrls: pages };
}

// ─── Per-page analysis ────────────────────────────────────────────────────────
async function analysePage(url) {
  const noAnchor = url.split("#")[0];
  const res = await fetchText(noAnchor);
  if (!res.ok) return null;

  const robots = getRobotsMeta(res.html ?? res.text) ?? "";
  if (robots.includes("noindex")) return null;

  const html   = res.text;
  const title  = getTitle(html) ?? "";
  const desc   = getMeta(html, "description") ?? "";
  const h1s    = getTagText(html, "h1");
  const h2s    = getTagText(html, "h2");
  const h3s    = getTagText(html, "h3");
  const body   = extractBodyText(html);
  const wc     = wordCount(body);

  const anchor = url.includes("#") ? "#" + url.split("#")[1] : null;
  const { personas, intent } = classify(url, h1s.join(" "), title);
  const path  = noAnchor.replace(BASE, "") || "/";

  return {
    id:               `${path}${anchor ?? ""}`,
    url,
    path,
    anchor,
    sourceFile:       `HTTP ${noAnchor.replace(BASE, "") || "/"}`,
    label:            h1s[0] ?? title ?? path,
    persona:          personas,
    intent,
    wordCount:        wc,
    h1:               h1s,
    h2:               h2s,
    h3:               h3s,
    hasH1:            h1s.length > 0,
    hasH2:            h2s.length > 0,
    contentSignature: signature(...h1s, ...h2s, body.slice(0, 200)),
    textSample:       body.slice(0, 300) + (body.length > 300 ? "…" : ""),
    title,
    desc,
  };
}

// ─── Findings ────────────────────────────────────────────────────────────────
// P0: H1 ausente OU wc < 120 OU múltiplo H1
// P1: 120 ≤ wc < THIN_THRESHOLD (250)
// P2: wc ≥ THIN_THRESHOLD E sem H2 (hierarquia fraca)
function detectThin(units) {
  const out = [];
  let i = 0;
  for (const u of units) {
    // P0: H1 ausente
    if (!u.hasH1) {
      out.push({
        id: `thin-noh1-${i++}`, type: "thin-content", severity: "P0",
        units: [u.id],
        evidence: `H1 ausente em "${u.path}${u.anchor ?? ""}" · word_count=${u.wordCount}`,
        recommendation: "Adicionar H1 único e descritivo à seção.",
      });
    }
    // P0: múltiplos H1
    if (u.h1.length > 1) {
      out.push({
        id: `thin-multih1-${i++}`, type: "thin-content", severity: "P0",
        units: [u.id],
        evidence: `Múltiplos H1 (${u.h1.length}) em "${u.path}" — ${u.h1.map(h => `"${h}"`).join(", ")}`,
        recommendation: "Cada página deve ter exatamente 1 H1. Rebaixar os demais para H2/H3.",
      });
    }
    // P0: conteúdo crítico (< 120 palavras full HTML)
    if (u.wordCount < 120) {
      out.push({
        id: `thin-wc-p0-${i++}`, type: "thin-content", severity: "P0",
        units: [u.id],
        evidence: `word_count=${u.wordCount} < 120 (crítico) · title="${u.title}"`,
        recommendation: `Conteúdo muito escasso. Adicionar no mínimo 3 seções H2 com 2–3 parágrafos cada.`,
      });
    } else if (u.wordCount < THIN_THRESHOLD) {
      // P1: thin moderado
      out.push({
        id: `thin-wc-p1-${i++}`, type: "thin-content", severity: "P1",
        units: [u.id],
        evidence: `word_count=${u.wordCount} (120–${THIN_THRESHOLD}) · title="${u.title}"`,
        recommendation: `Ampliar conteúdo com casos de uso, prova (links internos/externos) ou FAQ estruturado.`,
      });
    } else if (!u.hasH2) {
      // P2: words ok mas sem hierarquia de headings
      out.push({
        id: `thin-noh2-${i++}`, type: "thin-content", severity: "P2",
        units: [u.id],
        evidence: `word_count=${u.wordCount} (ok) · sem H2 em "${u.path}"`,
        recommendation: "Adicionar pelo menos 1 H2 para estruturar o conteúdo e melhorar crawlability.",
      });
    }
  }
  return out;
}

function detectCannibalization(units) {
  const out = [];
  let i = 0;
  // Group by intent
  const byIntent = {};
  for (const u of units) {
    byIntent[u.intent] = byIntent[u.intent] ?? [];
    byIntent[u.intent].push(u);
  }
  for (const [intent, group] of Object.entries(byIntent)) {
    if (group.length < 2) continue;
    // Same H1
    const h1lower = group.flatMap(u => u.h1.map(h => h.toLowerCase()));
    const dupeH1  = h1lower.filter((v, idx) => h1lower.indexOf(v) !== idx);
    if (dupeH1.length) {
      out.push({
        id: `cannibal-h1-${i++}`, type: "cannibalization", severity: "P0",
        units: group.map(u => u.id),
        evidence: `H1 duplicado "${dupeH1[0]}" em ${group.length} páginas com intent="${intent}"`,
        recommendation: "Diferenciar H1 de cada página ou consolidar em uma única rota canônica.",
      });
    }
    // Same signature
    const sigs   = group.map(u => u.contentSignature);
    const dupSig = sigs.filter((v, idx) => sigs.indexOf(v) !== idx);
    if (dupSig.length) {
      out.push({
        id: `cannibal-sig-${i++}`, type: "cannibalization", severity: "P0",
        units: group.map(u => u.id),
        evidence: `Content signature idêntica — possível duplicata (intent="${intent}")`,
        recommendation: "Consolidar páginas via redirect 301 ou diferenciar conteúdo completamente.",
      });
    }
    // Title similarity (edit distance heuristic)
    for (let a = 0; a < group.length - 1; a++) {
      for (let b = a + 1; b < group.length; b++) {
        const tA = group[a].title.toLowerCase();
        const tB = group[b].title.toLowerCase();
        if (tA === tB) {
          out.push({
            id: `cannibal-title-${i++}`, type: "cannibalization", severity: "P0",
            units: [group[a].id, group[b].id],
            evidence: `Title idêntico "${group[a].title}" em "${group[a].path}" e "${group[b].path}"`,
            recommendation: "Diferenciar titles para evitar competição direta por queries.",
          });
        }
        // Simple prefix-based similarity
        const shorter = tA.length < tB.length ? tA : tB;
        const longer  = tA.length < tB.length ? tB : tA;
        if (shorter.length > 10 && longer.startsWith(shorter.slice(0, shorter.length * 0.7))) {
          out.push({
            id: `cannibal-title-sim-${i++}`, type: "cannibalization", severity: "P1",
            units: [group[a].id, group[b].id],
            evidence: `Titles muito similares: "${group[a].title}" vs "${group[b].title}" (intent="${intent}")`,
            recommendation: "Diferenciar titles para que cada página capture uma query distinta.",
          });
        }
      }
    }
  }
  return out;
}

// ─── Persona coverage ─────────────────────────────────────────────────────────
function buildPersonaCoverage(units, findings) {
  const personaSet = new Set(units.flatMap(u => u.persona));
  return Array.from(personaSet).map(persona => {
    const myUnits = units.filter(u => u.persona.includes(persona));
    const myIds   = myUnits.map(u => u.id);
    return {
      persona,
      units:      myIds,
      intents:    [...new Set(myUnits.map(u => u.intent))],
      hasThinContent: findings.some(f => f.type === "thin-content"  && f.units.some(id => myIds.includes(id))),
      hasConflict:    findings.some(f => f.type === "cannibalization"&& f.units.some(id => myIds.includes(id))),
    };
  });
}

// ─── Markdown report ──────────────────────────────────────────────────────────
function buildMarkdown(report, baseUrl) {
  const { units, findings, personaCoverage, summary } = report;
  const p0 = findings.filter(f => f.severity === "P0");
  const p1 = findings.filter(f => f.severity === "P1");
  const p2 = findings.filter(f => f.severity === "P2");
  const thin   = findings.filter(f => f.type === "thin-content");
  const cannibal = findings.filter(f => f.type === "cannibalization" || f.type === "heading-drift");

  const lines = [
    "# SEO Atlas — V3 Content Coverage Report",
    "",
    `> Gerado em ${new Date(report.generatedAt).toLocaleString("pt-BR")} · ${report.strategy} · ${baseUrl}`,
    "",
    "## Sumário Executivo",
    "",
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Total de unidades analisadas | ${summary.totalUnits} |`,
    `| Thin content detectado | ${summary.thinCount} |`,
    `| Canibalização detectada | ${summary.cannibalizationCount} |`,
    `| P0 (crítico) | ${summary.p0Count} |`,
    `| P1 (importante) | ${summary.p1Count} |`,
    `| P2 (atenção) | ${summary.p2Count} |`,
    "",
    "---",
    "",
  ];

  if (thin.length > 0) {
    lines.push("## Thin Content", "");
    lines.push("| Severidade | Unidade | word_count | Evidência | Recomendação |");
    lines.push("|-----------|---------|-----------|-----------|--------------|");
    for (const f of thin) {
      const u = units.find(u => u.id === f.units[0]);
      lines.push(`| ${f.severity} | \`${f.units[0]}\` | ${u?.wordCount ?? "?"} | ${f.evidence.replace(/\|/g, "\\|")} | ${f.recommendation.replace(/\|/g, "\\|")} |`);
    }
    lines.push("");
  }

  if (cannibal.length > 0) {
    lines.push("## Canibalização", "");
    lines.push("| Severidade | Tipo | Unidades | Evidência | Recomendação |");
    lines.push("|-----------|------|---------|-----------|--------------|");
    for (const f of cannibal) {
      lines.push(`| ${f.severity} | ${f.type} | ${f.units.map(id => `\`${id}\``).join(", ")} | ${f.evidence.replace(/\|/g, "\\|")} | ${f.recommendation.replace(/\|/g, "\\|")} |`);
    }
    lines.push("");
  }

  if (p2.length > 0) {
    lines.push("## Atenção (P2)", "");
    for (const f of p2) {
      lines.push(`- **${f.type}** \`${f.units.join(", ")}\`: ${f.evidence}`);
      lines.push(`  → ${f.recommendation}`);
    }
    lines.push("");
  }

  lines.push("## Cobertura por Persona", "");
  lines.push("| Persona | Unidades | Intents | Thin? | Conflito? |");
  lines.push("|---------|---------|--------|-------|----------|");
  for (const pc of personaCoverage) {
    lines.push(`| ${pc.persona} | ${pc.units.length} | ${pc.intents.join(", ")} | ${pc.hasThinContent ? "⚠️" : "✅"} | ${pc.hasConflict ? "⚠️" : "✅"} |`);
  }
  lines.push("");

  lines.push("## Todas as unidades analisadas", "");
  lines.push("| Unidade | Persona | Intent | word_count | H1 | H2 |");
  lines.push("|---------|--------|--------|-----------|-----|-----|");
  for (const u of units) {
    lines.push(`| \`${u.id}\` | ${u.persona.join("+")} | ${u.intent} | ${u.wordCount} | ${u.h1[0] ?? "—"} | ${u.h2.length} H2s |`);
  }

  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const { pages } = await getPages();

  if (!JSON_MODE && !MD_MODE) {
    process.stderr.write(`Analisando ${pages.length} página(s)…\n\n`);
  }

  const units = [];
  for (const url of pages) {
    const unit = await analysePage(url);
    if (!unit) {
      if (!JSON_MODE && !MD_MODE) {
        process.stderr.write(`  ${c.d("skip")} ${url}\n`);
      }
      continue;
    }
    units.push(unit);
    if (!JSON_MODE && !MD_MODE) {
      process.stderr.write(`  ${c.g("✓")} ${unit.path}${unit.anchor ?? ""} · ${unit.wordCount}w · persona=${unit.persona.join("+")} · intent=${unit.intent}\n`);
    }
  }

  const thin     = detectThin(units);
  const cannibal = detectCannibalization(units);
  const findings = [...thin, ...cannibal];
  const personaCoverage = buildPersonaCoverage(units, findings);

  const report = {
    generatedAt:  new Date().toISOString(),
    sourceRef:    "live",
    strategy:     "live",
    baseUrl:      BASE,
    thinThreshold: THIN_THRESHOLD,
    units,
    findings,
    personaCoverage,
    summary: {
      totalUnits:           units.length,
      thinCount:            thin.filter(f => f.type === "thin-content").length,
      cannibalizationCount: cannibal.filter(f => f.type === "cannibalization").length,
      p0Count: findings.filter(f => f.severity === "P0").length,
      p1Count: findings.filter(f => f.severity === "P1").length,
      p2Count: findings.filter(f => f.severity === "P2").length,
    },
  };

  if (WRITE_REPORTS) {
    const dir  = path.resolve("reports/seo");
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "seo-v3-coverage.json"), JSON.stringify(report, null, 2));
    await writeFile(path.join(dir, "seo-v3-coverage.md"),   buildMarkdown(report, BASE));
    if (!JSON_MODE && !MD_MODE) {
      process.stderr.write(`\n${c.g("✓")} reports/seo/seo-v3-coverage.json\n`);
      process.stderr.write(`${c.g("✓")} reports/seo/seo-v3-coverage.md\n`);
    }
  }

  if (JSON_MODE) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else if (MD_MODE) {
    process.stdout.write(buildMarkdown(report, BASE) + "\n");
  } else {
    // Summary to terminal
    const { summary: s } = report;
    process.stderr.write(`\n${c.b("Resumo")}\n`);
    process.stderr.write(`  Unidades: ${s.totalUnits} · Thin: ${s.thinCount} · Canibalização: ${s.cannibalizationCount}\n`);
    process.stderr.write(`  P0: ${c.r(s.p0Count)} · P1: ${c.y(s.p1Count)} · P2: ${c.d(s.p2Count)}\n`);
    if (findings.length > 0) {
      process.stderr.write(`\n${c.b("Achados")}:\n`);
      for (const f of findings) {
        const icon = f.severity === "P0" ? c.r("P0") : f.severity === "P1" ? c.y("P1") : c.d("P2");
        process.stderr.write(`  [${icon}] ${f.type}: ${f.evidence}\n`);
        process.stderr.write(`      → ${f.recommendation}\n`);
      }
    }
  }
}

run().catch(e => { console.error(e); process.exit(1); });
