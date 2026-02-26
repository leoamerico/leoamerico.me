"use client";
// components/atlas/SeoAtlas.tsx
// ─────────────────────────────────────────────────────────────────────────────
// SEO Atlas — três visões integradas:
//   V1  Mapa de Rotas Indexáveis   (Discovery plane)
//   V2  Matriz de Metadados        (Relevance plane)
//   V5  Story Mode                 (Executivo / Editor / Engenheiro)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import type { SeoSnapshot, SeoRoute, SeoGate, SeoField, GateStatus, V3CoverageReport } from "@/lib/seo/types";

// ─── Paleta por plano ─────────────────────────────────────────────────────────
const PLANE_COLOR: Record<string, string> = {
  discovery:   "text-sky-400   border-sky-800",
  relevance:   "text-violet-400 border-violet-800",
  performance: "text-amber-400  border-amber-800",
};
const PLANE_DOT: Record<string, string> = {
  discovery:   "bg-sky-500",
  relevance:   "bg-violet-500",
  performance: "bg-amber-500",
};
const PLANE_LABEL: Record<string, string> = {
  discovery:   "Discovery",
  relevance:   "Relevance",
  performance: "Performance",
};

// ─── Status → ícone ──────────────────────────────────────────────────────────
function FieldCell({ f, na = false }: { f: SeoField; na?: boolean }) {
  if (na) return <span className="text-slate-700">—</span>;
  const icons: Record<string, string> = { ok: "✅", warn: "⚠️", missing: "❌" };
  return (
    <span title={f.hint ?? f.value ?? "n/a"} className="cursor-default">
      {icons[f.status]}
    </span>
  );
}

function GateBadge({ status }: { status: GateStatus }) {
  const map: Record<GateStatus, string> = {
    pass: "bg-emerald-900/50 text-emerald-400 border-emerald-700",
    warn: "bg-amber-900/50  text-amber-400  border-amber-700",
    fail: "bg-red-900/50    text-red-400    border-red-700",
  };
  const labels: Record<GateStatus, string> = { pass: "PASS", warn: "WARN", fail: "FAIL" };
  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

// ─── Macro bar de saúde SEO ───────────────────────────────────────────────────
function HealthBar({ metrics }: { metrics: SeoSnapshot["metrics"] }) {
  const { gatesPass, gatesFail, gatesWarn, healthScore } = metrics;
  const total = gatesPass + gatesFail + gatesWarn;
  const pctPass = total ? (gatesPass / total) * 100 : 0;
  const pctWarn = total ? (gatesWarn / total) * 100 : 0;
  const pctFail = total ? (gatesFail / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 p-4 bg-slate-900 rounded-lg border border-slate-800">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-slate-500">SEO Health Score</span>
        <span className={`text-2xl font-black ${healthScore >= 80 ? "text-emerald-400" : healthScore >= 60 ? "text-amber-400" : "text-red-400"}`}>
          {healthScore}
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {pctPass > 0 && <div style={{ width: `${pctPass}%` }} className="bg-emerald-500" />}
        {pctWarn > 0 && <div style={{ width: `${pctWarn}%` }} className="bg-amber-500" />}
        {pctFail > 0 && <div style={{ width: `${pctFail}%` }} className="bg-red-500" />}
      </div>
      <div className="flex gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{gatesPass} pass</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{gatesWarn} warn</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{gatesFail} fail</span>
      </div>
      <div className="grid grid-cols-4 gap-2 pt-1">
        {[
          { label: "Indexáveis",    v: metrics.indexableRoutes },
          { label: "Com title",     v: metrics.routesWithTitle },
          { label: "Com OG",        v: metrics.routesWithOg },
          { label: "Com schema",    v: metrics.routesWithSchema },
        ].map(({ label, v }) => (
          <div key={label} className="text-center">
            <div className="text-lg font-black text-white">{v}</div>
            <div className="text-[10px] text-slate-600">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── V1: Mapa de Rotas Indexáveis ────────────────────────────────────────────
function V1IndexMap({ routes }: { routes: SeoRoute[] }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">
        Pergunta: <span className="italic">&ldquo;o que o Google pode indexar?&rdquo;</span>
      </p>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-500">
            <th className="text-left pb-2 pr-4 font-normal">Rota</th>
            <th className="text-left pb-2 pr-4 font-normal">Plano</th>
            <th className="pb-2 pr-4 font-normal">Status</th>
            <th className="pb-2 pr-4 font-normal">Indexável</th>
            <th className="pb-2 pr-4 font-normal">Sitemap</th>
            <th className="text-left pb-2 pr-4 font-normal">Canonical</th>
          </tr>
        </thead>
        <tbody>
          {routes.map(r => (
            <tr key={r.path} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td className="py-2 pr-4">
                <div className="font-mono text-slate-300">{r.path}</div>
                <div className="text-[10px] text-slate-600">{r.sourceFile}</div>
              </td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${PLANE_DOT[r.plane]}`} />
                  <span className={`text-[11px] ${PLANE_COLOR[r.plane]}`}>{PLANE_LABEL[r.plane]}</span>
                </div>
              </td>
              <td className="py-2 pr-4 text-center">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  r.status === 200 ? "bg-emerald-900/40 text-emerald-400" : "bg-slate-800 text-slate-500"
                }`}>{r.status}</span>
              </td>
              <td className="py-2 pr-4 text-center">
                {r.indexable ? "✅" : <span className="text-slate-600">✗</span>}
              </td>
              <td className="py-2 pr-4 text-center">
                {r.inSitemap ? "✅" : <span className="text-slate-600">✗</span>}
              </td>
              <td className="py-2 text-slate-500 font-mono text-[10px] max-w-[240px] truncate">
                {r.canonical.value ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── V2: Matriz de Metadados ──────────────────────────────────────────────────
const COLS = [
  { key: "title",        label: "title",      f: (r: SeoRoute) => r.title },
  { key: "description",  label: "desc",       f: (r: SeoRoute) => r.description },
  { key: "canonical",    label: "canonical",  f: (r: SeoRoute) => r.canonical },
  { key: "ogTitle",      label: "og:title",   f: (r: SeoRoute) => r.ogTitle },
  { key: "ogDescription",label: "og:desc",    f: (r: SeoRoute) => r.ogDescription },
  { key: "ogImage",      label: "og:img",     f: (r: SeoRoute) => r.ogImage },
  { key: "twitterImage", label: "tw:img",     f: (r: SeoRoute) => r.twitterImage },
  { key: "robotsMeta",   label: "robots",     f: (r: SeoRoute) => r.robotsMeta },
  { key: "lang",         label: "lang",       f: (r: SeoRoute) => r.lang },
];

function V2MetadataMatrix({ routes }: { routes: SeoRoute[] }) {
  const [drill, setDrill] = useState<SeoRoute | null>(null);

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <p className="text-xs text-slate-500 mb-3">
          Pergunta: <span className="italic">&ldquo;toda rota tem o mínimo correto?&rdquo;</span>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="text-left py-2 pr-4 font-normal sticky left-0 bg-slate-950">Rota</th>
                {COLS.map(c => (
                  <th key={c.key} className="pb-2 px-2 font-normal whitespace-nowrap">{c.label}</th>
                ))}
                <th className="pb-2 px-2 font-normal">schema</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(r => {
                const isSelected = drill?.path === r.path;
                return (
                  <tr
                    key={r.path}
                    onClick={() => setDrill(isSelected ? null : r)}
                    className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                      isSelected ? "bg-slate-800" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className={`py-2 pr-4 sticky left-0 ${isSelected ? "bg-slate-800" : "bg-slate-950"}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PLANE_DOT[r.plane]}`} />
                        <div>
                          <div className="font-mono text-slate-300">{r.path}</div>
                          {r.indexable
                            ? <span className="text-[9px] text-emerald-600">indexável</span>
                            : <span className="text-[9px] text-slate-700">noindex</span>}
                        </div>
                      </div>
                    </td>
                    {COLS.map(c => (
                      <td key={c.key} className="py-2 px-2 text-center">
                        <FieldCell f={c.f(r)} na={!r.indexable && c.key !== "robotsMeta"} />
                      </td>
                    ))}
                    <td className="py-2 px-2 text-center">
                      {r.schemaTypes.length > 0
                        ? <span title={r.schemaTypes.join(", ")}>✅</span>
                        : r.indexable ? <span>❌</span> : <span className="text-slate-700">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DrillPanel */}
      {drill && (
        <div className="w-72 shrink-0 bg-slate-900 border border-slate-700 rounded-lg p-4 self-start">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-sm text-white">{drill.path}</span>
            <button onClick={() => setDrill(null)} className="text-slate-500 hover:text-white text-lg leading-none">×</button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className={`w-2 h-2 rounded-full ${PLANE_DOT[drill.plane]}`} />
            <span className={`text-xs ${PLANE_COLOR[drill.plane]}`}>{PLANE_LABEL[drill.plane]} Plane</span>
            <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${drill.indexable ? "bg-emerald-900/40 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
              {drill.indexable ? "indexável" : "noindex"}
            </span>
          </div>
          <div className="space-y-3 text-xs">
            {COLS.map(c => {
              const f = c.f(drill);
              return (
                <div key={c.key}>
                  <div className="text-slate-600 mb-0.5">{c.label}</div>
                  <div className="flex items-start gap-2">
                    <span>{f.status === "ok" ? "✅" : f.status === "warn" ? "⚠️" : "❌"}</span>
                    <div>
                      <span className="text-slate-300 font-mono break-all">{f.value ?? "—"}</span>
                      {f.hint && <div className="text-amber-500 text-[10px] mt-0.5">{f.hint}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
            {drill.schemaTypes.length > 0 && (
              <div>
                <div className="text-slate-600 mb-0.5">schema.org</div>
                <div className="flex flex-wrap gap-1">
                  {drill.schemaTypes.map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-violet-900/40 text-violet-300 rounded text-[10px]">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {drill.issues.length > 0 && (
              <div className="border-t border-slate-800 pt-2 mt-2">
                <div className="text-amber-500 text-[10px] mb-1">Issues</div>
                {drill.issues.map((issue, i) => (
                  <div key={i} className="text-amber-400 text-[10px]">⚠ {issue}</div>
                ))}
              </div>
            )}
            <div className="border-t border-slate-800 pt-2 mt-2 text-[10px] text-slate-600">
              ← {drill.sourceFile}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Gates Panel ──────────────────────────────────────────────────────────────
function GatesPanel({ gates }: { gates: SeoGate[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {gates.map(g => (
        <div key={g.id} className={`rounded-lg border overflow-hidden ${
          g.status === "pass" ? "border-emerald-900" :
          g.status === "warn" ? "border-amber-900"   : "border-red-900"
        }`}>
          <button
            onClick={() => setOpen(open === g.id ? null : g.id)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-left"
          >
            <GateBadge status={g.status} />
            <span className="text-[11px] font-mono text-slate-400">{g.id}</span>
            <span className="text-sm text-slate-300">{g.label}</span>
            <div className="flex items-center gap-1 ml-auto">
              <span className={`w-1.5 h-1.5 rounded-full ${PLANE_DOT[g.plane]}`} />
              <span className={`text-[10px] ${PLANE_COLOR[g.plane]}`}>{PLANE_LABEL[g.plane]}</span>
            </div>
            <span className="text-slate-600 ml-2">{open === g.id ? "▲" : "▼"}</span>
          </button>
          {open === g.id && (
            <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-800 text-xs space-y-2">
              <p className="text-slate-400">{g.description}</p>
              {g.violations.length > 0 ? (
                <ul className="space-y-1">
                  {g.violations.map((v, i) => (
                    <li key={i} className={`flex items-start gap-2 ${g.status === "fail" ? "text-red-400" : "text-amber-400"}`}>
                      <span className="shrink-0">{g.status === "fail" ? "✗" : "⚠"}</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-emerald-500">✓ Sem violações</p>
              )}
              <div className="text-[10px] text-slate-700 pt-1">← {g.sourceRef}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── V5: Story Mode ───────────────────────────────────────────────────────────
type StoryDepth = "exec" | "editor" | "eng";

function V5StoryMode({ snapshot }: { snapshot: SeoSnapshot }) {
  const [depth, setDepth] = useState<StoryDepth>("exec");
  const { metrics, routes, gates } = snapshot;
  const indexable = routes.filter(r => r.indexable);
  const failures  = gates.filter(g => g.status === "fail");
  const warns     = gates.filter(g => g.status === "warn");
  const issues    = routes.flatMap(r => r.issues);

  const DEPTHS: { id: StoryDepth; label: string; time: string }[] = [
    { id: "exec",   label: "Executivo",   time: "90s"  },
    { id: "editor", label: "Editor",      time: "5min" },
    { id: "eng",    label: "Engenheiro",  time: "15min"},
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {DEPTHS.map(d => (
          <button
            key={d.id}
            onClick={() => setDepth(d.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              depth === d.id
                ? "bg-white text-slate-950"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {d.label} <span className="opacity-50">({d.time})</span>
          </button>
        ))}
      </div>

      {depth === "exec" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Indexação",
                status: failures.some(g => g.id === "E-SEO-1") ? "fail" : "ok",
                detail: `${metrics.indexableRoutes} rota(s) indexável(is) · sitemap coherente`,
              },
              {
                label: "Páginas principais",
                status: failures.some(g => g.id === "E-SEO-2") ? "fail" :
                        warns.some(g => g.id === "E-SEO-2") ? "warn" : "ok",
                detail: `${metrics.routesWithTitle}/${metrics.indexableRoutes} com title · ${metrics.routesWithOg}/${metrics.indexableRoutes} com OG`,
              },
              {
                label: "Vitals / CI",
                status: warns.some(g => g.id === "E-SEO-5") ? "warn" :
                        failures.some(g => g.id === "E-SEO-5") ? "fail" : "ok",
                detail: warns.some(g => g.id === "E-SEO-5")
                  ? "Lighthouse CI não configurado"
                  : "Monitoring ativo",
              },
            ].map(card => (
              <div key={card.label} className={`p-4 rounded-lg border ${
                card.status === "ok"   ? "border-emerald-800 bg-emerald-900/20" :
                card.status === "warn" ? "border-amber-800 bg-amber-900/20"     :
                                         "border-red-800 bg-red-900/20"
              }`}>
                <div className="text-xs text-slate-500 mb-1">{card.label}</div>
                <div className={`text-2xl mb-2 ${
                  card.status === "ok" ? "text-emerald-400" :
                  card.status === "warn" ? "text-amber-400" : "text-red-400"
                }`}>
                  {card.status === "ok" ? "✅" : card.status === "warn" ? "⚠️" : "❌"}
                </div>
                <div className="text-[11px] text-slate-400">{card.detail}</div>
              </div>
            ))}
          </div>
          <div className={`p-3 rounded-lg text-sm font-medium ${
            metrics.healthScore >= 80 ? "bg-emerald-900/30 text-emerald-400" :
            metrics.healthScore >= 60 ? "bg-amber-900/30 text-amber-400"     :
            "bg-red-900/30 text-red-400"
          }`}>
            Score de saúde SEO: {metrics.healthScore}/100 — {
              metrics.healthScore >= 80 ? "sólido, sem bloqueadores críticos" :
              metrics.healthScore >= 60 ? "funcional, com alertas a endereçar" :
              "requer ação urgente"
            }
          </div>
        </div>
      )}

      {depth === "editor" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 mb-2">
            Pergunta: <span className="italic">&ldquo;quais páginas precisam de conteúdo e qual intenção?&rdquo;</span>
          </p>
          {indexable.map(r => (
            <div key={r.path} className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-white">{r.path}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${PLANE_DOT[r.plane]}`} />
                  <span className={`text-[10px] ${PLANE_COLOR[r.plane]}`}>{PLANE_LABEL[r.plane]}</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 mb-1">
                title: <span className={r.title.status === "ok" ? "text-white" : "text-amber-400"}>
                  {r.title.value ?? "—"}
                </span>
              </div>
              <div className="text-xs text-slate-400 mb-2">
                description: <span className={r.description.status === "ok" ? "text-white" : "text-amber-400"}>
                  {r.description.value?.slice(0, 80) ?? "—"}
                  {(r.description.value?.length ?? 0) > 80 ? "…" : ""}
                </span>
              </div>
              {r.schemaTypes.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {r.schemaTypes.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-300 text-[10px]">{t}</span>
                  ))}
                </div>
              )}
              {r.issues.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {r.issues.map((iss, i) => (
                    <div key={i} className="text-amber-400 text-[10px]">⚠ {iss}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {issues.length === 0 && (
            <div className="text-emerald-500 text-sm">✓ Nenhum issue de conteúdo detectado</div>
          )}
        </div>
      )}

      {depth === "eng" && (
        <div className="space-y-6">
          <p className="text-xs text-slate-500 mb-2">
            Pergunta: <span className="italic">&ldquo;quais arquivos/bugs corrigir e quais gates impedem regressão?&rdquo;</span>
          </p>
          <GatesPanel gates={gates} />
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Arquivos de origem</h3>
            <div className="space-y-1">
              {routes.map(r => (
                <div key={r.path} className="flex items-center gap-2 text-[11px]">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PLANE_DOT[r.plane]}`} />
                  <span className="font-mono text-slate-300">{r.path}</span>
                  <span className="text-slate-700">←</span>
                  <span className="text-slate-500">{r.sourceFile}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Gates CI — Workflow</h3>
            <div className="bg-slate-900 rounded p-3 font-mono text-[11px] text-slate-400">
              <div className="text-slate-600"># .github/workflows/seo-gates.yml</div>
              <div>bun run seo:gates --url http://localhost:3000</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── V3 — Cobertura de Conteúdo por Persona/Intent ──────────────────────────
const SEV_CLASS: Record<string, string> = {
  P0: "bg-red-900/60 text-red-400 border-red-700",
  P1: "bg-amber-900/60 text-amber-400 border-amber-700",
  P2: "bg-slate-800 text-slate-400 border-slate-600",
};
const FINDING_LABEL: Record<string, string> = {
  "thin-content":    "Conteúdo Thin",
  cannibalization:   "Canibalização",
  "heading-drift":   "Heading Drift",
  "promise-drift":   "Promise Drift",
};

function V3SevBadge({ sev }: { sev: string }) {
  return (
    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold ${SEV_CLASS[sev] ?? ""}`}>
      {sev}
    </span>
  );
}

function V3Content({ v3 }: { v3: V3CoverageReport | undefined }) {
  const [view, setView] = useState<"list" | "heatmap">("list");

  if (!v3) return (
    <div className="text-slate-500 text-sm py-12 text-center">
      V3 não disponível — recarregue o Atlas.
    </div>
  );

  const { units, findings, personaCoverage, summary } = v3;

  // Pre-compute finding severity per unit for heatmap signals
  const thinSev   = new Map<string, string>();
  const canniSev  = new Map<string, string>();
  for (const f of findings) {
    for (const uid of f.units) {
      if (f.type === "thin-content") {
        const cur = thinSev.get(uid);
        if (!cur || cur > f.severity) thinSev.set(uid, f.severity);
      }
      if (f.type === "cannibalization") {
        const cur = canniSev.get(uid);
        if (!cur || cur > f.severity) canniSev.set(uid, f.severity);
      }
    }
  }

  function sigWc(wc: number) {
    if (wc >= 180) return { icon: "✅", title: `${wc}w (ok)` };
    if (wc >= 60)  return { icon: "⚠️", title: `${wc}w (leve)` };
    return               { icon: "❌", title: `${wc}w (crítico)` };
  }
  function sigH1(u: { h1: string[]; hasH1: boolean }) {
    if (!u.hasH1)      return { icon: "❌", title: "H1 ausente" };
    if (u.h1.length>1) return { icon: "⚠️", title: `${u.h1.length} H1 (múltiplos)` };
    return                    { icon: "✅", title: u.h1[0] };
  }
  function sigH2(u: { h2: string[]; hasH2: boolean }) {
    return u.hasH2
      ? { icon: "✅", title: u.h2.slice(0, 3).join(" / ") }
      : { icon: "❌", title: "sem H2" };
  }
  function sigThin(uid: string) {
    const s = thinSev.get(uid);
    if (!s)        return { icon: "✅", title: "ok" };
    if (s === "P2") return { icon: "⚠️", title: "P2 thin" };
    return               { icon: "❌", title: `${s} thin` };
  }
  function sigCannibal(uid: string) {
    const s = canniSev.get(uid);
    if (!s)        return { icon: "✅", title: "ok" };
    if (s === "P1") return { icon: "⚠️", title: "P1 canibal" };
    return               { icon: "❌", title: `${s} canibal` };
  }

  return (
    <div className="space-y-8">
      {/* Summary strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: "Unidades",   value: summary.totalUnits },
          { label: "Thin",       value: summary.thinCount,              cls: summary.thinCount > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Canibal.",   value: summary.cannibalizationCount,   cls: summary.cannibalizationCount > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "P0",         value: summary.p0Count,               cls: summary.p0Count > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "P1",         value: summary.p1Count,               cls: summary.p1Count > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "P2",         value: summary.p2Count,               cls: "text-slate-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded p-3 text-center">
            <div className={`text-2xl font-black ${s.cls ?? "text-white"}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Findings */}
      {findings.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Findings</h3>
          <div className="space-y-2">
            {findings.map(f => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <V3SevBadge sev={f.severity} />
                  <span className="text-xs text-slate-300 font-medium">{FINDING_LABEL[f.type] ?? f.type}</span>
                  <span className="text-[10px] text-slate-600 ml-auto font-mono">{f.units.join(", ")}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-1">{f.evidence}</p>
                <p className="text-[11px] text-sky-400">{f.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persona coverage */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cobertura por Persona</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] text-slate-500">
                <th className="py-2 pr-4">Persona</th>
                <th className="py-2 pr-4"># Unidades</th>
                <th className="py-2 pr-4">Intents</th>
                <th className="py-2 pr-4">Thin?</th>
                <th className="py-2">Conflito?</th>
              </tr>
            </thead>
            <tbody>
              {personaCoverage.map(p => (
                <tr key={p.persona} className="border-b border-slate-800/50">
                  <td className="py-2 pr-4 text-slate-200 font-mono">{p.persona}</td>
                  <td className="py-2 pr-4 text-slate-400">{p.units.length}</td>
                  <td className="py-2 pr-4 text-slate-500 text-[10px]">{p.intents.join(" · ")}</td>
                  <td className="py-2 pr-4">{p.hasThinContent ? <span className="text-amber-400">⚠ thin</span> : <span className="text-slate-700">—</span>}</td>
                  <td className="py-2">{p.hasConflict ? <span className="text-red-400">⚠ conflito</span> : <span className="text-slate-700">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content units — togglable list / heatmap */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unidades de Conteúdo</h3>
          <div className="flex gap-1">
            {(["list", "heatmap"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-[10px] rounded border transition-colors ${
                  view === v
                    ? "border-slate-500 text-slate-200 bg-slate-800"
                    : "border-slate-800 text-slate-600 hover:text-slate-400"
                }`}
              >
                {v === "list" ? "Lista" : "Heatmap"}
              </button>
            ))}
          </div>
        </div>

        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-left text-[10px] text-slate-500">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Palavras</th>
                  <th className="py-2 pr-4">H1</th>
                  <th className="py-2 pr-4">H2s</th>
                  <th className="py-2 pr-4">Persona(s)</th>
                  <th className="py-2">Intent</th>
                </tr>
              </thead>
              <tbody>
                {units.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/50">
                    <td className="py-2 pr-4 font-mono text-slate-300">{u.id}</td>
                    <td className={`py-2 pr-4 ${u.wordCount < 60 ? "text-amber-400" : "text-slate-400"}`}>{u.wordCount}</td>
                    <td className="py-2 pr-4 text-slate-500 text-[10px] max-w-[160px] truncate" title={u.h1[0]}>{u.h1[0] ?? "—"}</td>
                    <td className="py-2 pr-4 text-slate-600">{u.h2.length}</td>
                    <td className="py-2 pr-4 text-slate-500 text-[10px]">{u.persona.join(" · ")}</td>
                    <td className="py-2 text-slate-500 font-mono text-[10px]">{u.intent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Heatmap: linhas = unidades, colunas = signals ── */
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500">
                  <th className="py-2 pr-4 text-left">Unidade</th>
                  <th className="py-2 px-3 text-center">wc</th>
                  <th className="py-2 px-3 text-center">H1</th>
                  <th className="py-2 px-3 text-center">H2</th>
                  <th className="py-2 px-3 text-center">thin</th>
                  <th className="py-2 px-3 text-center">canibal</th>
                  <th className="py-2 pl-4 text-left text-slate-700">H1 text</th>
                </tr>
              </thead>
              <tbody>
                {units.map(u => {
                  const wc  = sigWc(u.wordCount);
                  const h1s = sigH1(u);
                  const h2s = sigH2(u);
                  const th  = sigThin(u.id);
                  const cn  = sigCannibal(u.id);
                  return (
                    <tr key={u.id} className="border-b border-slate-800/40 hover:bg-slate-900/50 transition-colors">
                      <td className="py-1.5 pr-4 font-mono text-slate-400 text-[11px]">{u.id}</td>
                      <td className="py-1.5 px-3 text-center text-base" title={wc.title}>{wc.icon}</td>
                      <td className="py-1.5 px-3 text-center text-base" title={h1s.title}>{h1s.icon}</td>
                      <td className="py-1.5 px-3 text-center text-base" title={h2s.title}>{h2s.icon}</td>
                      <td className="py-1.5 px-3 text-center text-base" title={th.title}>{th.icon}</td>
                      <td className="py-1.5 px-3 text-center text-base" title={cn.title}>{cn.icon}</td>
                      <td className="py-1.5 pl-4 text-slate-700 text-[10px] max-w-[200px] truncate">{u.h1[0] ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-2 text-[10px] text-slate-700 flex gap-3">
              <span>✅ ok</span><span>⚠️ atenção</span><span>❌ crítico</span>
              <span className="ml-2">wc = word count · H1/H2 = headings · thin/canibal = findings</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-700 pt-2">
        Estratégia: {v3.strategy} · Fonte: {v3.sourceRef} · {new Date(v3.generatedAt).toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

// ─── TAB navigation ──────────────────────────────────────────────────────────
type Tab = "v1" | "v2" | "v3" | "v5" | "gates";

// ─── Main export ─────────────────────────────────────────────────────────────
export default function SeoAtlas({ snapshot }: { snapshot: SeoSnapshot }) {
  const [tab, setTab] = useState<Tab>("v2");

  const TABS: { id: Tab; label: string }[] = [
    { id: "v1",    label: "V1 — Rotas"     },
    { id: "v2",    label: "V2 — Metadados" },
    { id: "v3",    label: "V3 — Conteúdo"  },
    { id: "v5",    label: "V5 — Story"     },
    { id: "gates", label: "Gates"          },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-1">
          <h1 className="text-xl font-black text-white">SEO Atlas</h1>
          <span className="text-xs text-slate-600 font-mono">rev {snapshot.sourceRef}</span>
        </div>
        <p className="text-xs text-slate-500">
          Gerado em {new Date(snapshot.generatedAt).toLocaleString("pt-BR")} ·{" "}
          <a href={snapshot.sitemapUrl} target="_blank" rel="noopener" className="underline hover:text-slate-300">
            sitemap
          </a>{" "}
          ·{" "}
          <a href={snapshot.robotsUrl} target="_blank" rel="noopener" className="underline hover:text-slate-300">
            robots
          </a>
        </p>
      </div>

      {/* Health Bar */}
      <div className="mb-6">
        <HealthBar metrics={snapshot.metrics} />
      </div>

      {/* Plane legend */}
      <div className="flex gap-4 mb-6">
        {(["discovery", "relevance", "performance"] as const).map(p => (
          <div key={p} className="flex items-center gap-1.5 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${PLANE_DOT[p]}`} />
            <span className={PLANE_COLOR[p]}>{PLANE_LABEL[p]}</span>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 border-b border-slate-800 pb-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-white text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "v1"    && <V1IndexMap       routes={snapshot.routes} />}
        {tab === "v2"    && <V2MetadataMatrix  routes={snapshot.routes} />}
        {tab === "v3"    && <V3Content         v3={snapshot.v3} />}
        {tab === "v5"    && <V5StoryMode       snapshot={snapshot} />}
        {tab === "gates" && <GatesPanel        gates={snapshot.gates} />}
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-slate-800 pt-4 text-[10px] text-slate-700">
        SEO Atlas · Discovery · Relevance · Performance · V3 Conteúdo · gates E-SEO-1..5
      </div>
    </div>
  );
}
