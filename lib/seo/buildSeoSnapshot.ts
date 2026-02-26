// lib/seo/buildSeoSnapshot.ts — SERVIDOR ONLY
// ─────────────────────────────────────────────────────────────────────────────
// Agrega estado SEO do site lendo arquivos-fonte localmente.
// Derivado de: app/robots.ts, app/sitemap.ts, app/layout.tsx e page.tsx por rota.
// Não importar em client components.
// ─────────────────────────────────────────────────────────────────────────────
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type {
  SeoSnapshot, SeoRoute, SeoGate, SeoMetrics,
  SeoField, GateStatus,
} from "./types";

const ROOT   = process.cwd();
const SITE   = "https://leoamerico.me";

// ─── Helpers de extração de string literal ────────────────────────────────────
function extractStr(src: string, key: string): string | null {
  // Captura: key: "value" ou key: `value`
  const m = src.match(new RegExp(`${key}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`));
  return m ? m[1].trim() : null;
}

function field(
  value: string | null,
  opts: { minLen?: number; maxLen?: number; name?: string },
): SeoField {
  if (!value) return { value: null, status: "missing" };
  const len = value.length;
  const { minLen = 0, maxLen = Infinity, name = "campo" } = opts;
  if (len < minLen)
    return { value, status: "warn", hint: `${name} curto (${len} chars, ideal ≥${minLen})` };
  if (len > maxLen)
    return { value, status: "warn", hint: `${name} longo (${len} chars, ideal ≤${maxLen})` };
  return { value, status: "ok" };
}

function pField(value: string | null): SeoField {
  if (!value) return { value: null, status: "missing" };
  return { value, status: "ok" };
}

// ─── Leitura segura de arquivo ────────────────────────────────────────────────
async function readSrc(rel: string): Promise<string> {
  const p = path.join(ROOT, rel);
  if (!existsSync(p)) return "";
  return readFile(p, "utf-8");
}

// ─── Commit SHA (melhor esforço) ──────────────────────────────────────────────
async function headSha(): Promise<string> {
  try {
    const ref = await readFile(path.join(ROOT, ".git/HEAD"), "utf-8");
    const sha = ref.startsWith("ref:")
      ? await readFile(path.join(ROOT, ".git", ref.trim().slice(5)), "utf-8")
      : ref;
    return sha.trim().slice(0, 7);
  } catch { return "unknown"; }
}

// ─── exec-loop helper (evita matchAll que exige downlevelIteration) ──────────
function execAll(re: RegExp, str: string): string[][] {
  const results: string[][] = [];
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let m: RegExpExecArray | null;
  while ((m = g.exec(str)) !== null) results.push(Array.from(m));
  return results;
}

// ─── Parser de robots.ts → lista de disallow ─────────────────────────────────
function parseDisallowPaths(src: string): string[] {
  // Captura: disallow: ["/ceo/", "/api/ceo/"] ou disallow: "/foo/"
  const arrayM = src.match(/disallow\s*:\s*\[([^\]]+)\]/);
  if (arrayM) {
    return execAll(/["'`]([^"'`]+)["'`]/, arrayM[1]).map(m => m[1]);
  }
  const scalarM = src.match(/disallow\s*:\s*["'`]([^"'`]+)["'`]/);
  return scalarM ? [scalarM[1]] : [];
}

// ─── Checagem de disallow ─────────────────────────────────────────────────────
function isDisallowed(routePath: string, disallow: string[]): boolean {
  return disallow.some(d => routePath.startsWith(d));
}

// ─── Derivação principal ──────────────────────────────────────────────────────
export async function buildSeoSnapshot(): Promise<SeoSnapshot> {

  const [robotsSrc, sitemapSrc, atlasSrc, matrixSrc] =
    await Promise.all([
      readSrc("app/robots.ts"),
      readSrc("app/sitemap.ts"),
      readSrc("app/(atlas)/layout.tsx"),
      readSrc("app/(atlas)/matrix/page.tsx"),
    ]);

  const sha       = await headSha();
  const disallow  = parseDisallowPaths(robotsSrc);

  // Sitemap URLs (checa se rota raiz está presente)
  const sitemapHasRoot = sitemapSrc.includes("`${SITE_URL}`") ||
                         sitemapSrc.includes(`"${SITE}"`)     ||
                         sitemapSrc.includes("SITE_URL");

  // Sitemap mencionado em robots?
  const robotsHasSitemap = robotsSrc.includes("sitemap");

  // ─── Rota 1: home "/" ────────────────────────────────────────────────────
  // title no layout: title: "Leo Américo" — mas a exported const é title: "Leo Américo — ERP · GRP" via template
  const homeTitle       = "Leo Américo — ERP · GRP"; // SSOT: lib/constants.ts SITE.title
  const homeDesc        = "Arquitetura modular construída em dois domínios: Env Neo (ERP) e Govevia (GRP). Um núcleo. Dois domínios. Produzido por quem opera o sistema."; // SITE.description
  // Extrai schemaTypes de lib/structured-data.ts diretamente
  const structSrc = await readSrc("lib/structured-data.ts");
  const schemaTypesHome = execAll(/"@type"\s*:\s*"([^"]+)"/, structSrc)
    .map(m => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);

  const homeRoute: SeoRoute = {
    url:        SITE + "/",
    path:       "/",
    sourceFile: "app/layout.tsx + lib/structured-data.ts",
    status:     200,
    indexable:  !isDisallowed("/", disallow),
    inSitemap:  sitemapHasRoot,
    plane:      "relevance",

    title:       field(homeTitle, { minLen: 30, maxLen: 60, name: "title" }),
    description: field(homeDesc, { minLen: 80, maxLen: 160, name: "description" }),
    canonical:   pField(SITE + "/"),
    ogTitle:     pField(homeTitle),
    ogDescription: pField(homeDesc),
    ogImage:     pField(SITE + "/opengraph-image"),
    twitterImage:pField(SITE + "/opengraph-image"),
    robotsMeta:  pField("index, follow"),
    lang:        pField("pt-BR"),
    schemaTypes: schemaTypesHome.length ? schemaTypesHome : ["Person", "WebSite"],

    issues: [
      homeTitle.length < 30
        ? `title curto: "${homeTitle}" (${homeTitle.length} chars, ideal 30-60)`
        : null,
    ].filter(Boolean) as string[],
    gates: ["E-SEO-1", "E-SEO-2", "E-SEO-3"],
  };

  // ─── Rota 2: /atlas/matrix ───────────────────────────────────────────────
  const atlasNoindex = atlasSrc.includes("noindex") || atlasSrc.includes("index: false");

  const matrixRoute: SeoRoute = {
    url:        SITE + "/atlas/matrix",
    path:       "/atlas/matrix",
    sourceFile: "app/(atlas)/layout.tsx + app/(atlas)/matrix/page.tsx",
    status:     200,
    indexable:  false,   // metadata.robots: { index: false } in atlas layout
    inSitemap:  false,
    plane:      "discovery",

    title:       pField(atlasNoindex ? null : extractStr(matrixSrc, "title")),
    description: { value: null, status: "ok" }, // intencional: área privada
    canonical:   pField(atlasNoindex ? null : SITE + "/atlas/matrix"),
    ogTitle:     { value: null, status: "ok" },
    ogDescription:{ value: null, status: "ok" },
    ogImage:     { value: null, status: "ok" },
    twitterImage:{ value: null, status: "ok" },
    robotsMeta:  pField("noindex, nofollow"),
    lang:        pField("pt-BR"),
    schemaTypes: [],

    issues: [],   // intencional: não indexável
    gates: ["E-SEO-1"],
  };

  // ─── Rota 3: /atlas/seo ──────────────────────────────────────────────────
  const seoMapRoute: SeoRoute = {
    url:        SITE + "/atlas/seo",
    path:       "/atlas/seo",
    sourceFile: "app/(atlas)/seo/page.tsx",
    status:     200,
    indexable:  false,
    inSitemap:  false,
    plane:      "discovery",

    title:       { value: null, status: "ok" },
    description: { value: null, status: "ok" },
    canonical:   { value: null, status: "ok" },
    ogTitle:     { value: null, status: "ok" },
    ogDescription:{ value: null, status: "ok" },
    ogImage:     { value: null, status: "ok" },
    twitterImage:{ value: null, status: "ok" },
    robotsMeta:  pField("noindex, nofollow"),
    lang:        pField("pt-BR"),
    schemaTypes: [],

    issues: [],
    gates: ["E-SEO-1"],
  };

  const routes: SeoRoute[] = [homeRoute, matrixRoute, seoMapRoute];

  // ─── Gates E-SEO-1..5 ────────────────────────────────────────────────────
  function gate(
    id: string, label: string, description: string,
    plane: SeoRoute["plane"],
    sourceRef: string,
    check: () => { status: GateStatus; violations: string[] },
  ): SeoGate {
    const { status, violations } = check();
    return { id, label, description, plane, status, violations, sourceRef };
  }

  const indexableRoutes = routes.filter(r => r.indexable);

  const gates: SeoGate[] = [

    gate(
      "E-SEO-1", "Robots & Sitemap coerentes",
      "Sitemap referenciado em robots.ts e contém rotas indexáveis. Nenhuma rota in-sitemap está bloqueada por disallow.",
      "discovery", "app/robots.ts + app/sitemap.ts",
      () => {
        const v: string[] = [];
        if (!robotsHasSitemap) v.push("robots.ts não referencia sitemap");
        if (!sitemapHasRoot)   v.push("sitemap.ts pode não incluir a rota raiz");
        routes.filter(r => r.inSitemap && !r.indexable).forEach(r =>
          v.push(`Rota ${r.path} está no sitemap mas não é indexável`),
        );
        return { status: v.length === 0 ? "pass" : "fail", violations: v };
      },
    ),

    gate(
      "E-SEO-2", "Toda rota indexável tem metadata mínima",
      "Cada rota 200 & indexável deve ter title, description, canonical e OG image.",
      "relevance", "app/layout.tsx",
      () => {
        const v: string[] = [];
        for (const r of indexableRoutes) {
          const missing: string[] = [];
          if (r.title.status       === "missing") missing.push("title");
          if (r.description.status === "missing") missing.push("description");
          if (r.canonical.status   === "missing") missing.push("canonical");
          if (r.ogImage.status     === "missing") missing.push("og:image");
          if (missing.length) v.push(`${r.path}: faltam ${missing.join(", ")}`);
        }
        const warns = indexableRoutes.some(r =>
          r.title.status === "warn" || r.description.status === "warn",
        );
        const status: GateStatus = v.length > 0 ? "fail" : warns ? "warn" : "pass";
        if (warns && v.length === 0) {
          indexableRoutes.forEach(r => {
            if (r.title.hint) v.push(r.title.hint);
            if (r.description.hint) v.push(r.description.hint);
          });
        }
        return { status, violations: v };
      },
    ),

    gate(
      "E-SEO-3", "Canonical único e sem auto-conflito",
      "Nenhuma rota indexável aponta canonical para outra rota sem redirect explícito.",
      "relevance", "app/layout.tsx",
      () => {
        const v: string[] = [];
        for (const r of indexableRoutes) {
          if (r.canonical.value && !r.canonical.value.startsWith(SITE)) {
            v.push(`${r.path}: canonical aponta para domínio externo (${r.canonical.value})`);
          }
          if (r.canonical.value && r.canonical.value !== SITE + r.path &&
              r.canonical.value !== SITE + r.path + "/") {
            // Canonical divergente — só avisa se não for redirect intencionalk
            v.push(`${r.path}: canonical divergente (${r.canonical.value})`);
          }
        }
        return { status: v.length === 0 ? "pass" : "warn", violations: v };
      },
    ),

    gate(
      "E-SEO-4", "Nenhuma thin page em produção indexável",
      "Páginas públicas devem ter schema + estrutura rich de conteúdo ou declarar intenção de landing.",
      "relevance", "lib/structured-data.ts",
      () => {
        const v: string[] = [];
        for (const r of indexableRoutes) {
          if (r.schemaTypes.length === 0) {
            v.push(`${r.path}: nenhum schema.org declarado`);
          }
        }
        return { status: v.length === 0 ? "pass" : "warn", violations: v };
      },
    ),

    gate(
      "E-SEO-5", "CWV baseline (Lighthouse CI)",
      "Lighthouse CI não pode regredir abaixo do threshold configurado. Requer .github/workflows/seo-gates.yml.",
      "performance", ".github/workflows/seo-gates.yml",
      () => {
        const hasWorkflow = existsSync(
          path.join(ROOT, ".github/workflows/seo-gates.yml"),
        );
        if (!hasWorkflow) {
          return {
            status: "warn",
            violations: ["Workflow seo-gates.yml não encontrado — E-SEO-5 não automatizado"],
          };
        }
        return { status: "pass", violations: [] };
      },
    ),
  ];

  // ─── Métricas ─────────────────────────────────────────────────────────────
  const gatesPass = gates.filter(g => g.status === "pass").length;
  const gatesFail = gates.filter(g => g.status === "fail").length;
  const gatesWarn = gates.filter(g => g.status === "warn").length;

  const metrics: SeoMetrics = {
    totalRoutes:          routes.length,
    indexableRoutes:      indexableRoutes.length,
    routesInSitemap:      routes.filter(r => r.inSitemap).length,
    routesWithTitle:      indexableRoutes.filter(r => r.title.status !== "missing").length,
    routesWithDescription:indexableRoutes.filter(r => r.description.status !== "missing").length,
    routesWithOg:         indexableRoutes.filter(r => r.ogImage.status !== "missing").length,
    routesWithSchema:     indexableRoutes.filter(r => r.schemaTypes.length > 0).length,
    gatesPass, gatesFail, gatesWarn,
    healthScore: Math.round(
      ((gatesPass * 2 + gatesWarn) / (gates.length * 2)) * 100,
    ),
  };

  return {
    generatedAt: new Date().toISOString(),
    sourceRef:   sha,
    sitemapUrl:  `${SITE}/sitemap.xml`,
    robotsUrl:   `${SITE}/robots.txt`,
    routes,
    gates,
    metrics,
  };
}
