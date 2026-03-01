#!/usr/bin/env node
// scripts/seo/seo-gates.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Gates E-SEO-1..5 — checks executáveis contra servidor local ou URL remota.
//
// Uso:
//   bun run seo:gates                         (usa http://localhost:3000)
//   bun run seo:gates --url https://leoamerico.me
//   bun run seo:gates --json                  (saída JSON, sem ANSI)
//
// Exit code: 0 = pass/warn, 1 = fail
// ─────────────────────────────────────────────────────────────────────────────

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    url:  { type: "string",  default: "http://localhost:3000" },
    json: { type: "boolean", default: false },
  },
  strict: false,
});

const BASE = args.url.replace(/\/$/, "");
const JSON_MODE = args.json;

// ─── Colours ─────────────────────────────────────────────────────────────────
const c = JSON_MODE ? { r: s => s, g: s => s, y: s => s, d: s => s, b: s => s }
  : {
    r: s => `\x1b[31m${s}\x1b[0m`,
    g: s => `\x1b[32m${s}\x1b[0m`,
    y: s => `\x1b[33m${s}\x1b[0m`,
    d: s => `\x1b[90m${s}\x1b[0m`,
    b: s => `\x1b[1m${s}\x1b[0m`,
  };

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "SEO-Gates/1.0" } });
  return { ok: res.ok, status: res.status, text: await res.text(), headers: res.headers };
}

async function fetchHtml(path) {
  return fetchText(`${BASE}${path}`);
}

// ─── HTML parsers ─────────────────────────────────────────────────────────────
function getMeta(html, name) {
  const m = html.match(new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i",
  )) ?? html.match(new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i",
  ));
  return m ? m[1] : null;
}

function getOg(html, prop) {
  const m = html.match(new RegExp(
    `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i",
  )) ?? html.match(new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, "i",
  ));
  return m ? m[1] : null;
}

function getTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function getRobotsMeta(html) {
  return getMeta(html, "robots");
}

function getCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1] : null;
}

function hasSchema(html) {
  return html.includes('"@context"') && html.includes('"@type"');
}

// ─── Sitemap parser ───────────────────────────────────────────────────────────
function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m => m[1].trim());
}

// ─── Gate runner ─────────────────────────────────────────────────────────────
const results = [];

function gate(id, label) {
  return {
    pass(detail) {
      results.push({ id, label, status: "pass", violations: [], detail });
      return true;
    },
    fail(...violations) {
      results.push({ id, label, status: "fail", violations: violations.flat(), detail: null });
      return false;
    },
    warn(detail, ...hints) {
      results.push({ id, label, status: "warn", violations: hints.flat(), detail });
      return true;
    },
  };
}

// ─── E-SEO-1: Robots & Sitemap coerentes ─────────────────────────────────────
async function checkE1() {
  const G = gate("E-SEO-1", "Robots & Sitemap coerentes");
  const violations = [];

  const robots = await fetchHtml("/robots.txt");
  if (!robots.ok) {
    return G.fail("robots.txt retornou HTTP " + robots.status);
  }

  const hasSitemapRef = robots.text.toLowerCase().includes("sitemap:");
  if (!hasSitemapRef) violations.push("robots.txt não referencia Sitemap");

  // Extract sitemap URL from robots.txt, rewriting domain to BASE for local testing
  const sitemapM = robots.text.match(/Sitemap:\s*(\S+)/i);
  const sitemapUrl = sitemapM
    ? `${BASE}${(() => { try { return new URL(sitemapM[1]).pathname; } catch { return sitemapM[1]; } })()}`
    : `${BASE}/sitemap.xml`;

  const sitemap = await fetchText(sitemapUrl);
  if (!sitemap.ok) {
    violations.push(`Sitemap inacessível: ${sitemapUrl} (HTTP ${sitemap.status})`);
  } else {
    const urls = parseSitemapUrls(sitemap.text);
    if (urls.length === 0) {
      violations.push("Sitemap sem URLs <loc>");
    } else {
      // Check no sitemap URL is blocked by disallow rules
      const disallowLines = [...robots.text.matchAll(/Disallow:\s*(\S+)/gi)].map(m => m[1]);
      for (const url of urls) {
        const path = url.replace(/^https?:\/\/[^/]+/, "");
        const blocked = disallowLines.some(d => path.startsWith(d));
        if (blocked) violations.push(`Rota no sitemap bloqueada pelo robots: ${path}`);
      }
    }
  }

  return violations.length === 0
    ? G.pass(`robots.txt → sitemap → ${parseSitemapUrls(sitemap.ok ? sitemap.text : "").length} URL(s)`)
    : G.fail(violations);
}

// ─── E-SEO-2 + E-SEO-3: Metadata e Canonical ─────────────────────────────────
async function checkE2E3() {
  const G2 = gate("E-SEO-2", "Toda rota indexável tem metadata mínima");
  const G3 = gate("E-SEO-3", "Canonical único e sem auto-conflito");

  // Discover indexable routes from sitemap
  const sitemapRes = await fetchHtml("/sitemap.xml");
  const urls = sitemapRes.ok ? parseSitemapUrls(sitemapRes.text) : [`${BASE}/`];
  const paths = urls.map(u => { try { return new URL(u).pathname; } catch { return u; } });
  // Only check real pages (not anchors)
  const pages = paths.filter(p => !p.includes("#") && !p.includes("/api/"));

  const v2 = [], v3 = [];

  for (const p of pages) {
    const res = await fetchHtml(p);
    if (!res.ok) { v2.push(`${p}: HTTP ${res.status}`); continue; }

    const robotsMeta = getRobotsMeta(res.text) ?? "";
    if (robotsMeta.includes("noindex")) continue; // intentionally excluded

    const title       = getTitle(res.text);
    const desc        = getMeta(res.text, "description");
    const canonical   = getCanonical(res.text);
    const ogImage     = getOg(res.text, "og:image");

    const missing = [];
    if (!title) missing.push("title");
    if (!desc)  missing.push("description");
    if (!canonical) missing.push("canonical");
    if (!ogImage) missing.push("og:image");
    if (missing.length) v2.push(`${p}: faltam ${missing.join(", ")}`);

    // Title length
    if (title && title.length < 30) v2.push(`${p}: title curto (${title.length} chars, ideal 30-60)`);
    if (title && title.length > 60) v2.push(`${p}: title longo (${title.length} chars, ideal ≤60)`);

    // Canonical E-SEO-3: compare only the path, since canonical uses the production domain
    if (canonical) {
      const canonicalPath = (() => { try { return new URL(canonical).pathname; } catch { return canonical; } })();
      const normalised = p === "/" ? "/" : p.replace(/\/$/, "");
      const canonicalNorm = canonicalPath === "/" ? "/" : canonicalPath.replace(/\/$/, "");
      if (canonicalNorm !== normalised) {
        v3.push(`${p}: canonical path (${canonicalPath}) ≠ expected (${p})`);
      }
    }
  }

  const s2 = v2.length === 0 ? "pass" : v2.every(v => !v.includes("faltam")) ? "warn" : "fail";
  results.push({ id: "E-SEO-2", label: "Toda rota indexável tem metadata mínima", status: s2, violations: v2, detail: null });

  return v3.length === 0
    ? G3.pass(`${pages.length} rota(s) sem conflito de canonical`)
    : G3.warn(`${pages.length - v3.length}/${pages.length} rotas ok`, ...v3);
}

// ─── E-SEO-4: Thin pages ─────────────────────────────────────────────────────
async function checkE4() {
  const G = gate("E-SEO-4", "Nenhuma thin page em produção indexável");
  const sitemapRes = await fetchHtml("/sitemap.xml");
  const urls = sitemapRes.ok ? parseSitemapUrls(sitemapRes.text) : [`${BASE}/`];
  const paths = urls.map(u => { try { return new URL(u).pathname; } catch { return u; } });
  const pages = paths.filter(p => !p.includes("#") && !p.includes("/api/"));

  const violations = [];
  for (const p of pages) {
    const res = await fetchHtml(p);
    if (!res.ok) continue;
    const robotsMeta = getRobotsMeta(res.text) ?? "";
    if (robotsMeta.includes("noindex")) continue;

    // Thin content check: no schema.org AND body text looks small
    const bodyText = res.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = bodyText.split(" ").filter(w => w.length > 2).length;
    const schema = hasSchema(res.text);

    if (!schema && wordCount < 200) {
      violations.push(`${p}: possível thin page (${wordCount} palavras, sem schema.org)`);
    }
  }

  return violations.length === 0
    ? G.pass("Todas as páginas indexáveis têm schema.org ou conteúdo suficiente")
    : G.warn("Thin pages detectadas — revisar ou declarar schema.org", ...violations);
}

// ─── E-SEO-5: Lighthouse CI ──────────────────────────────────────────────────
async function checkE5() {
  const G = gate("E-SEO-5", "CWV baseline (Lighthouse CI)");
  if (!existsSync(".github/workflows/seo-gates.yml")) {
    return G.warn("Workflow seo-gates.yml não encontrado — Lighthouse CI não automatizado",
      "Adicione .github/workflows/seo-gates.yml com job lighthouse-ci");
  }
  // If running in CI, check for lighthouse report
  const reportPath = "reports/seo/lighthouse.json";
  if (existsSync(reportPath)) {
    const report = JSON.parse(await readFile(reportPath, "utf-8"));
    const seo  = report?.categories?.seo?.score  ?? 0;
    const perf = report?.categories?.performance?.score ?? 0;
    const a11y = report?.categories?.accessibility?.score ?? 0;
    const violations = [];
    if (seo  < 0.9) violations.push(`SEO score: ${Math.round(seo  * 100)} (threshold: 90)`);
    if (perf < 0.7) violations.push(`Performance score: ${Math.round(perf * 100)} (threshold: 70)`);
    if (a11y < 0.9) violations.push(`Accessibility score: ${Math.round(a11y * 100)} (threshold: 90)`);
    return violations.length === 0
      ? G.pass(`LH scores — SEO:${Math.round(seo*100)} Perf:${Math.round(perf*100)} A11y:${Math.round(a11y*100)}`)
      : G.fail(violations);
  }
  return G.warn("Workflow presente mas sem relatório Lighthouse em reports/seo/lighthouse.json");
}

// ─── Runner ───────────────────────────────────────────────────────────────────
async function run() {
  console.error(!JSON_MODE ? `\n${c.b("SEO Gates")} · ${c.d(BASE)}\n` : "");

  await checkE1();
  await checkE2E3();
  await checkE4();
  await checkE5();

  if (JSON_MODE) {
    process.stdout.write(JSON.stringify({ results, timestamp: new Date().toISOString() }, null, 2));
    process.stdout.write("\n");
  } else {
    for (const r of results) {
      const icon = r.status === "pass" ? c.g("✅ PASS") : r.status === "warn" ? c.y("⚠️ WARN") : c.r("❌ FAIL");
      console.log(`${icon}  ${c.b(r.id)}  ${c.d(r.label)}`);
      if (r.detail) console.log(`     ${c.d(r.detail)}`);
      for (const v of (r.violations ?? [])) console.log(`     ${c.r("✗")} ${v}`);
    }
    const fail = results.filter(r => r.status === "fail").length;
    const warn = results.filter(r => r.status === "warn").length;
    const pass = results.filter(r => r.status === "pass").length;
    console.log(`\n${c.d(`${pass} pass · ${warn} warn · ${fail} fail`)}\n`);
  }

  const hasFail = results.some(r => r.status === "fail");
  process.exit(hasFail ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
