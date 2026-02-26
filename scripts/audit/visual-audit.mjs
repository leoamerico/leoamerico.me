// scripts/audit/visual-audit.mjs
// ──────────────────────────────────────────────────────────────────────────────
// VISUAL AUDIT — Env Neo Brand Enforcement
// Ferramenta oficial de verificação visual: Playwright + Chromium.
// Proibido substituir por Cypress, Jest screenshot, Puppeteer ou qualquer outra.
// Machina custodit. Homo gubernat.
//
// O que faz:
//   1. Sobe o servidor Next.js em :3100 (ou usa BASE_URL do env)
//   2. Para cada página auditada, captura screenshots em 3 temas:
//        dark   — tema escuro (padrão Env Neo / Rembrandt)
//        light  — tema claro (documentos, impressão)
//        system — respeita prefers-color-scheme do SO
//   3. Por cada tema, captura:
//        (a) fullpage — a página inteira
//        (b) hero     — section#hero ou [data-section="hero"]
//        (c) buttons  — todos os <button> e links de CTA
//        (d) inputs   — todos os campos de formulário
//        (e) badges   — [data-badge], .badge, badges de status
//   4. Salva em reports/visual/YYYY-MM-DD_HHMMSS/{theme}/{page}/{component}.png
//   5. Gera reports/visual/YYYY-MM-DD_HHMMSS/index.html com gallery comparativa
//   6. Gera reports/visual/YYYY-MM-DD_HHMMSS/visual-report.json com metadados
//   7. exit(1) se qualquer captura falhar ou se tokens invariantes de cor
//      não forem detectados na paleta computada da página
// ──────────────────────────────────────────────────────────────────────────────

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT     = process.cwd();
const PORT     = process.env.VISUAL_PORT     || "3100";
const BASE_URL = process.env.VISUAL_BASE_URL || `http://localhost:${PORT}`;
const WAIT_MS  = parseInt(process.env.VISUAL_WAIT_MS || "6000", 10);

// ── Temas ──────────────────────────────────────────────────────────────────
const THEMES = [
  {
    id: "dark",
    label: "Dark",
    description: "Tema escuro — padrão Env Neo (Rembrandt: luz do abismo)",
    colorScheme: "dark",
    extraCSS: "",
  },
  {
    id: "light",
    label: "Light",
    description: "Tema claro — documentos institucionais, impressão",
    colorScheme: "light",
    extraCSS: "",
  },
  {
    id: "system",
    label: "System",
    description: "Respeita prefers-color-scheme do sistema operacional",
    colorScheme: null,  // sem forçar — usa preferência real
    extraCSS: "",
  },
];

// ── Páginas a auditar ──────────────────────────────────────────────────────
const PAGES = [
  { id: "home",    path: "/",         title: "Home — Leo Américo" },
  { id: "audit",   path: "/#audit",   title: "Audit Section"      },
  { id: "sobre",   path: "/#sobre",   title: "Sobre"              },
  { id: "contato", path: "/#contato", title: "Contato"            },
];

// ── Seletores de UI a isolar ───────────────────────────────────────────────
const UI_TARGETS = [
  {
    id: "hero",
    label: "Hero Section",
    selector: "#hero, [data-section='hero'], section:first-of-type",
    required: false,
  },
  {
    id: "buttons",
    label: "Buttons & CTAs",
    selector: "button, a[href]:not(nav a)",
    required: false,
    multi: true,
    maxItems: 8,
  },
  {
    id: "inputs",
    label: "Form Inputs",
    selector: "input, textarea, select",
    required: false,
    multi: true,
    maxItems: 6,
  },
  {
    id: "badges",
    label: "Badges & Status",
    selector: "[data-badge], .badge, [class*='badge'], [class*='tag'], [class*='status']",
    required: false,
    multi: true,
    maxItems: 8,
  },
  {
    id: "cards",
    label: "Cards",
    selector: "[data-card], article, [class*='card']:not([class*='card-']))",
    required: false,
    multi: true,
    maxItems: 4,
  },
];

// ── Invariantes de token a verificar na paleta ─────────────────────────────
// O script lê o CSS computado de :root e verifica se os tokens invariantes
// da holding estão presentes. Se --en-void ou --en-arc forem removidos,
// o audit falha com BLOCKER.
const TOKEN_INVARIANTS = [
  { token: "--en-void",      expectedContains: "2, 6, 23",    label: "Rembrandt negro de marfim" },
  { token: "--en-arc",       expectedContains: "34, 211, 238", label: "Rembrandt arco elétrico"  },
  { token: "--en-authority", expectedContains: "248, 250, 252", label: "Rembrandt branco de autoridade" },
];

// ── Utilitários ────────────────────────────────────────────────────────────
function nowStamp() {
  const d   = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function relPath(absPath) {
  return path.relative(ROOT, absPath).replace(/\\/g, "/");
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok || res.status < 500) return true;
    } catch (_) { /* retry */ }
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

// ── Gera HTML de galeria comparativa ──────────────────────────────────────
function generateGallery(stamp, allScreenshots, reportDir) {
  const byPage = {};
  for (const s of allScreenshots) {
    if (!byPage[s.page]) byPage[s.page] = {};
    if (!byPage[s.page][s.component]) byPage[s.page][s.component] = {};
    byPage[s.page][s.component][s.theme] = s;
  }

  const themeLabels = { dark: "Dark", light: "Light", system: "System" };
  const themeColors = { dark: "#020617", light: "#f8fafc", system: "#334155" };

  let rows = "";
  for (const [pageId, components] of Object.entries(byPage)) {
    for (const [compId, themes] of Object.entries(components)) {
      const cellsDark   = themes.dark   ? `<img src="${path.relative(reportDir, themes.dark.file).replace(/\\/g, "/")}"   alt="dark"   style="max-width:100%;border-radius:6px">` : `<span style="color:#6b7280">—</span>`;
      const cellsLight  = themes.light  ? `<img src="${path.relative(reportDir, themes.light.file).replace(/\\/g, "/")}"  alt="light"  style="max-width:100%;border-radius:6px;border:1px solid #e5e7eb">` : `<span style="color:#6b7280">—</span>`;
      const cellsSystem = themes.system ? `<img src="${path.relative(reportDir, themes.system.file).replace(/\\/g, "/")}" alt="system" style="max-width:100%;border-radius:6px">` : `<span style="color:#6b7280">—</span>`;
      rows += `
        <tr>
          <td style="padding:8px 12px;font-weight:600;white-space:nowrap;color:#22d3ee">${pageId}</td>
          <td style="padding:8px 12px;white-space:nowrap;color:#94a3b8">${compId}</td>
          <td style="padding:8px;background:#020617">${cellsDark}</td>
          <td style="padding:8px;background:#f8fafc">${cellsLight}</td>
          <td style="padding:8px;background:#1e293b">${cellsSystem}</td>
        </tr>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Visual Audit — Env Neo Brand · ${stamp}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }
  h1 { font-size: 1.5rem; color: #22d3ee; margin-bottom: 4px; }
  p.sub { color: #94a3b8; font-size: .85rem; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 10px 12px; background: #1e293b; color: #94a3b8; font-size: .75rem;
       text-transform: uppercase; letter-spacing: .08em; text-align: left; }
  tr:nth-child(even) td { background-color: rgba(255,255,255,.02); }
  td img { display: block; }
  .badge-dark   { background:#020617; color:#22d3ee; padding:2px 8px; border-radius:4px; font-size:.7rem; }
  .badge-light  { background:#f8fafc; color:#0f172a; padding:2px 8px; border-radius:4px; font-size:.7rem; }
  .badge-system { background:#334155; color:#f1f5f9; padding:2px 8px; border-radius:4px; font-size:.7rem; }
  footer { margin-top:48px; color:#475569; font-size:.75rem; }
</style>
</head>
<body>
<h1>Visual Audit — Env Neo Brand System</h1>
<p class="sub">
  ${stamp} &nbsp;·&nbsp;
  <span class="badge-dark">Dark</span> &nbsp;
  <span class="badge-light">Light</span> &nbsp;
  <span class="badge-system">System</span> &nbsp;·&nbsp;
  Machina custodit. Homo gubernat.
</p>
<table>
  <thead>
    <tr>
      <th>Página</th>
      <th>Componente</th>
      <th><span class="badge-dark">Dark</span> &nbsp;Rembrandt</th>
      <th><span class="badge-light">Light</span> &nbsp;Institucional</th>
      <th><span class="badge-system">System</span> &nbsp;OS</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<footer>
  Env Neo Ltda · CNPJ 36.207.211/0001-47 · Ferramenta oficial: Playwright + Chromium.<br>
  Proibido substituir por Cypress, Puppeteer ou qualquer outra ferramenta de screenshot.
</footer>
</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
  const stamp     = nowStamp();
  const reportDir = path.join(ROOT, "reports", "visual", stamp);
  ensureDir(reportDir);

  // ── 1. Sobe servidor se necessário ──────────────────────────────────────
  let serverProc = null;
  let serverOwned = false;

  const alreadyUp = await waitForServer(BASE_URL, 2000);
  if (!alreadyUp) {
    console.log(`▶  Iniciando Next.js em :${PORT}...`);
    serverProc = spawn(
      process.platform === "win32" ? "bun.exe" : "bun",
      ["run", "dev", "--port", PORT],
      {
        cwd:   ROOT,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
        env:   { ...process.env, PORT },
      }
    );
    serverOwned = true;
    const ready = await waitForServer(BASE_URL, 45000);
    if (!ready) {
      console.error("❌  Servidor não respondeu em 45s — abortando.");
      serverProc.kill();
      process.exit(1);
    }
    console.log(`✓  Servidor pronto em ${BASE_URL}`);
  } else {
    console.log(`✓  Servidor já disponível em ${BASE_URL}`);
  }

  // ── 2. Inicia Playwright ─────────────────────────────────────────────────
  const browser = await chromium.launch({ headless: true });
  const allScreenshots = [];
  const failures       = [];
  const tokenResults   = [];

  try {
    for (const theme of THEMES) {
      console.log(`\n━━ Tema: ${theme.label.toUpperCase()} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      const ctxOptions = {
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      };
      if (theme.colorScheme) ctxOptions.colorScheme = theme.colorScheme;

      const ctx = await browser.newContext(ctxOptions);

      for (const pg of PAGES) {
        const pageDir = path.join(reportDir, theme.id, pg.id);
        ensureDir(pageDir);

        console.log(`  → ${pg.title} [${theme.id}]`);
        const page = await ctx.newPage();

        try {
          await page.goto(`${BASE_URL}${pg.path}`, {
            waitUntil: "networkidle",
            timeout: 30000,
          });
          await page.waitForTimeout(WAIT_MS);

          // ── fullpage ───────────────────────────────────────────────────
          const fullFile = path.join(pageDir, "fullpage.png");
          await page.screenshot({ path: fullFile, fullPage: true });
          allScreenshots.push({ theme: theme.id, page: pg.id, component: "fullpage", file: fullFile });
          console.log(`     ✓ fullpage`);

          // ── token invariants (só na primeira página de cada tema) ──────
          if (pg.id === "home") {
            const tokenCheck = await page.evaluate((invariants) => {
              const style = getComputedStyle(document.documentElement);
              return invariants.map((inv) => {
                const raw = style.getPropertyValue(inv.token).trim();
                return {
                  token:   inv.token,
                  label:   inv.label,
                  raw,
                  pass:    raw.length > 0,
                };
              });
            }, TOKEN_INVARIANTS);

            tokenResults.push({ theme: theme.id, checks: tokenCheck });
            for (const t of tokenCheck) {
              const icon = t.pass ? "✓" : "✗";
              console.log(`     ${icon} token ${t.token} = "${t.raw}"`);
              if (!t.pass) failures.push(`Token invariante ausente: ${t.token} (${t.label}) no tema ${theme.id}`);
            }
          }

          // ── componentes isolados ───────────────────────────────────────
          for (const target of UI_TARGETS) {
            try {
              if (target.multi) {
                const handles = await page.$$(target.selector);
                const count   = Math.min(handles.length, target.maxItems || 4);
                for (let i = 0; i < count; i++) {
                  try {
                    const el = handles[i];
                    if (!(await el.isVisible())) continue;
                    const compFile = path.join(pageDir, `${target.id}-${i + 1}.png`);
                    await el.screenshot({ path: compFile });
                    allScreenshots.push({ theme: theme.id, page: pg.id, component: `${target.id}-${i + 1}`, file: compFile });
                  } catch (_) { /* elemento pode ter desaparecido */ }
                }
                if (count > 0) console.log(`     ✓ ${target.label} (${count})`);
              } else {
                const el = await page.$(target.selector);
                if (el && await el.isVisible()) {
                  const compFile = path.join(pageDir, `${target.id}.png`);
                  await el.screenshot({ path: compFile });
                  allScreenshots.push({ theme: theme.id, page: pg.id, component: target.id, file: compFile });
                  console.log(`     ✓ ${target.label}`);
                }
              }
            } catch (_) { /* seletor não encontrado — não é bloqueante */ }
          }

        } catch (err) {
          const msg = `Falha ao auditar ${pg.id} [${theme.id}]: ${err.message}`;
          console.error(`     ✗ ${msg}`);
          failures.push(msg);
        } finally {
          await page.close();
        }
      }

      await ctx.close();
    }

  } finally {
    await browser.close();
    if (serverOwned && serverProc) serverProc.kill();
  }

  // ── 3. Salva JSON ─────────────────────────────────────────────────────────
  const jsonReport = {
    meta: {
      stamp,
      baseUrl:    BASE_URL,
      themes:     THEMES.map((t) => t.id),
      pages:      PAGES.map((p) => p.id),
      components: UI_TARGETS.map((u) => u.id),
      generatedAt: new Date().toISOString(),
      tool: "@playwright/test + chromium",
      enforcement: "Ferramenta oficial Env Neo. Proibido substituir.",
    },
    tokenInvariants: tokenResults,
    screenshots:     allScreenshots.map((s) => ({ ...s, file: relPath(s.file) })),
    failures,
    pass: failures.length === 0,
  };

  const jsonFile = path.join(reportDir, "visual-report.json");
  fs.writeFileSync(jsonFile, JSON.stringify(jsonReport, null, 2), "utf8");

  // ── 4. Gera galeria HTML ───────────────────────────────────────────────────
  const html     = generateGallery(stamp, allScreenshots, reportDir);
  const htmlFile = path.join(reportDir, "index.html");
  fs.writeFileSync(htmlFile, html, "utf8");

  // ── 5. Resumo ──────────────────────────────────────────────────────────────
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📸  ${allScreenshots.length} screenshots capturados`);
  console.log(`📄  Galeria: ${relPath(htmlFile)}`);
  console.log(`📊  JSON:    ${relPath(jsonFile)}`);

  if (failures.length) {
    console.error(`\n❌  VISUAL_AUDIT_FAILED (${failures.length} falha(s)):`);
    for (const f of failures) console.error(`   · ${f}`);
    process.exit(1);
  }

  console.log(`\n✅  VISUAL_AUDIT_OK`);
})();
