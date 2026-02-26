"use client";

// components/atlas/CoverageMatrix.tsx
// V2 — Matriz de Cobertura ESA
// Linhas: Enforcements + Invariantes
// Colunas: Mecanismos
// Célula: ✅ enforced / ⚠️ partial / ❌ declared / — N/A
// Drill-down: clique em linha → painel lateral com code_refs + ADRs + gates

import { useState } from "react";
import type { EsaEnforcement, EsaInvariant, EsaPlane, EsaSnapshot } from "@/lib/esa/types";
import type { Mechanism } from "@/lib/esa/types";

// ─── Helpers visuais ──────────────────────────────────────────────────────

const PLANE_STYLE: Record<EsaPlane, { bg: string; border: string; text: string; dot: string }> = {
  trust:    { bg: "bg-cyan-950/40",    border: "border-cyan-800/40",    text: "text-cyan-300",    dot: "bg-cyan-500"    },
  decision: { bg: "bg-violet-950/40",  border: "border-violet-800/40",  text: "text-violet-300",  dot: "bg-violet-500"  },
  evidence: { bg: "bg-emerald-950/40", border: "border-emerald-800/40", text: "text-emerald-300", dot: "bg-emerald-500" },
};

const COVERAGE_CELL: Record<string, { icon: string; bg: string; title: string }> = {
  enforced: { icon: "✅", bg: "bg-emerald-950/60", title: "Enforced — gate binário confirma" },
  partial:  { icon: "⚠️", bg: "bg-amber-950/60",   title: "Partial — active mas code_refs faltando ou não verificadas" },
  declared: { icon: "❌", bg: "bg-red-950/40",      title: "Declarado — sem mecanismo automatizado" },
  gap:      { icon: "🔴", bg: "bg-red-950/60",      title: "Gap confirmado — precisa de remediação" },
};

const MECHANISMS: { key: Mechanism | string; label: string; abbr: string }[] = [
  { key: "archunit",        label: "ArchUnit",        abbr: "AU"   },
  { key: "db_trigger",      label: "DB Trigger",      abbr: "DB"   },
  { key: "github_actions",  label: "GitHub Actions",  abbr: "GHA"  },
  { key: "runtime_guard",   label: "Runtime Guard",   abbr: "RG"   },
  { key: "script_ci_gate",  label: "Script CI Gate",  abbr: "SCI"  },
  { key: "adr_pr_review",   label: "ADR + PR Review", abbr: "ADR"  },
];

// ─── Totais macro ────────────────────────────────────────────────────────

function MacroBar({ totals }: { totals: EsaSnapshot["totals"] }) {
  const total = totals.enforced + totals.partial + totals.declared + totals.gap;
  const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex gap-4 flex-wrap text-xs">
        {[
          { key: "enforced", label: "Enforced",  n: totals.enforced,  color: "text-emerald-400" },
          { key: "partial",  label: "Partial",   n: totals.partial,   color: "text-amber-400"   },
          { key: "declared", label: "Declarado", n: totals.declared,  color: "text-red-400"     },
          { key: "gap",      label: "Gap",       n: totals.gap,       color: "text-red-600"     },
        ].map(s => (
          <span key={s.key} className={`font-bold ${s.color}`}>
            {s.n} <span className="text-slate-500 font-normal">{s.label} ({pct(s.n)}%)</span>
          </span>
        ))}
        <span className="text-slate-600 ml-auto">{totals.active} ativos</span>
      </div>
      {/* coverage bar */}
      <div className="h-2 rounded-full bg-slate-800 flex overflow-hidden">
        {[
          { n: totals.enforced, cls: "bg-emerald-500" },
          { n: totals.partial,  cls: "bg-amber-500"   },
          { n: totals.declared, cls: "bg-red-500"     },
          { n: totals.gap,      cls: "bg-red-800"     },
        ].filter(s => s.n > 0).map((s, i) => (
          <div key={i} className={s.cls} style={{ width: `${pct(s.n)}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Drill-down panel ────────────────────────────────────────────────────

function DrillPanel({
  item,
  onClose,
}: {
  item: EsaEnforcement | EsaInvariant;
  onClose: () => void;
}) {
  const isEnf = "mechanism" in item;
  const enf = isEnf ? (item as EsaEnforcement) : null;
  const inv = !isEnf ? (item as EsaInvariant) : null;
  const plane = item.plane;
  const p = PLANE_STYLE[plane];
  const cov = COVERAGE_CELL[item.coverage] ?? COVERAGE_CELL.declared;

  return (
    <aside className={`w-80 shrink-0 border-l ${p.border} ${p.bg} flex flex-col text-sm`}>
      {/* header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${p.border}`}>
        <div>
          <span className={`text-xs font-bold ${p.text}`}>{item.id}</span>
          <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-600">{plane}</span>
        </div>
        <button onClick={onClose} className="text-slate-600 hover:text-slate-300 text-lg leading-none">×</button>
      </div>

      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
        {/* Description */}
        {enf && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Descrição</p>
            <p className="text-slate-300 text-xs leading-relaxed">{enf.description || "—"}</p>
          </div>
        )}
        {inv && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Invariante</p>
            <p className="text-slate-300 text-xs leading-relaxed">{inv.label}</p>
          </div>
        )}

        {/* Coverage */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Cobertura</p>
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${cov.bg}`}>
            {cov.icon} <span>{item.coverage}</span>
          </span>
        </div>

        {/* Mechanism */}
        {enf && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Mecanismo</p>
            <span className="text-slate-300 text-xs">{enf.mechanismLabel}</span>
            {enf.ciGateRef && (
              <span className="ml-2 text-[10px] text-violet-400">(gate: {enf.ciGateRef})</span>
            )}
          </div>
        )}

        {/* ADRs */}
        {(enf?.adrs.length || (inv && inv.adr)) && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">ADRs</p>
            <div className="flex flex-wrap gap-1">
              {(enf?.adrs ?? [inv!.adr]).map(adr => (
                <span key={adr} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {adr}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Code refs */}
        {enf && enf.codeRefs.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">
              code_refs <span className="text-slate-700">({enf.codeRefs.length})</span>
            </p>
            <ul className="space-y-1">
              {enf.codeRefs.map(ref => (
                <li key={ref.path} className="flex items-start gap-1.5">
                  <span className={ref.exists ? "text-emerald-400" : "text-red-400"} title={ref.exists ? "verificado no repo" : "não encontrado"}>
                    {ref.exists ? "✓" : "✗"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 break-all leading-tight">
                    {ref.path}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {enf && !enf.codeRefs.length && (
          <div className="rounded-lg bg-amber-950/40 border border-amber-800/30 px-3 py-2">
            <p className="text-[11px] text-amber-400">⚠️ Nenhum code_ref registrado</p>
            <p className="text-[10px] text-amber-600 mt-0.5">status: active sem refs → P7 gate falharia</p>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Linha da matriz ─────────────────────────────────────────────────────

function MatrixRow({
  item,
  selected,
  onClick,
}: {
  item: EsaEnforcement | EsaInvariant;
  selected: boolean;
  onClick: () => void;
}) {
  const isEnf = "mechanism" in item;
  const enf = isEnf ? (item as EsaEnforcement) : null;
  const plane = item.plane;
  const p = PLANE_STYLE[plane];
  const cov = item.coverage;

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer border-b border-slate-800/60 transition-colors
        ${selected ? `${p.bg} border-l-2 ${p.border.replace("border-", "border-l-")}` : "hover:bg-slate-900/60"}`}
    >
      {/* ID + plane dot */}
      <td className="px-4 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
          <span className={`text-xs font-mono font-bold ${selected ? p.text : "text-slate-300"}`}>
            {item.id}
          </span>
        </div>
      </td>

      {/* Short description */}
      <td className="px-4 py-2.5 max-w-[240px]">
        <span className="text-[11px] text-slate-400 leading-snug line-clamp-1">
          {enf?.description ?? (item as EsaInvariant).label}
        </span>
      </td>

      {/* Mechanism columns */}
      {MECHANISMS.map(mech => {
        const isThis = enf?.mechanism === mech.key;
        const cell = isThis ? COVERAGE_CELL[cov] : null;
        return (
          <td key={mech.key} className="px-2 py-2.5 text-center">
            {cell
              ? (
                <span
                  className={`inline-flex items-center justify-center w-8 h-6 rounded text-sm ${cell.bg}`}
                  title={cell.title}
                >
                  {cell.icon}
                </span>
              )
              : (
                <span className="text-slate-800 text-xs">—</span>
              )}
          </td>
        );
      })}

      {/* Coverage badge */}
      <td className="px-4 py-2.5 text-right">
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${COVERAGE_CELL[cov]?.bg ?? ""} text-slate-400`}>
          {cov}
        </span>
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export default function CoverageMatrix({ snapshot }: { snapshot: EsaSnapshot | null }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm p-12">
        GITHUB_TOKEN não configurado ou snapshot indisponível.
      </div>
    );
  }

  const allRows: (EsaEnforcement | EsaInvariant)[] = [
    ...snapshot.enforcements,
    ...snapshot.invariants,
  ];

  const selectedItem = allRows.find(r => r.id === selected) ?? null;
  const asOf = new Date(snapshot.generatedAt).toLocaleString("pt-BR", {
    dateStyle: "short", timeStyle: "short",
  });

  return (
    <div className="flex h-full">
      {/* Matrix */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-baseline gap-3 mb-1">
            <h2 className="text-lg font-bold text-white">V2 — Coverage Matrix</h2>
            <span className="text-[10px] text-slate-600 font-mono">src: {snapshot.sourceRef}</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Enforcements e invariantes ativos × mecanismo de aplicação · clique em uma linha para drill-down
          </p>
          <MacroBar totals={snapshot.totals} />

          {/* Mechanism legend */}
          <div className="flex gap-3 flex-wrap">
            {MECHANISMS.map(m => (
              <span key={m.key} className="text-[10px] text-slate-600">
                <span className="text-slate-500 font-mono">{m.abbr}</span> = {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-600">Descrição</th>
                {MECHANISMS.map(m => (
                  <th key={m.key} className="px-2 py-3 text-[10px] uppercase tracking-wider text-slate-600 text-center whitespace-nowrap">
                    {m.abbr}
                  </th>
                ))}
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-600 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Enforcements */}
              <tr>
                <td colSpan={MECHANISMS.length + 3} className="px-4 py-1.5 text-[9px] uppercase tracking-widest text-slate-700 bg-slate-900/40">
                  Enforcements ({snapshot.enforcements.length})
                </td>
              </tr>
              {snapshot.enforcements.map(enf => (
                <MatrixRow
                  key={enf.id}
                  item={enf}
                  selected={selected === enf.id}
                  onClick={() => setSelected(selected === enf.id ? null : enf.id)}
                />
              ))}

              {/* Invariants */}
              <tr>
                <td colSpan={MECHANISMS.length + 3} className="px-4 py-1.5 text-[9px] uppercase tracking-widest text-slate-700 bg-slate-900/40">
                  Invariantes ({snapshot.invariants.length})
                </td>
              </tr>
              {snapshot.invariants.map(inv => (
                <MatrixRow
                  key={inv.id}
                  item={inv}
                  selected={selected === inv.id}
                  onClick={() => setSelected(selected === inv.id ? null : inv.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[10px] text-slate-700">
            enforcement-registry.yaml · Govevia / main · {asOf}
          </p>
          <div className="flex items-center gap-4 text-[10px]">
            {[
              { icon: "✅", label: "Enforced — gate CI/DB/Runtime confirma" },
              { icon: "⚠️", label: "Partial — active sem code_refs ou refs inexistentes" },
              { icon: "❌", label: "Declarado — sem gate automatizado" },
            ].map(l => (
              <span key={l.label} className="text-slate-700" title={l.label}>
                {l.icon} {l.label.split("—")[0].trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Drill-down panel */}
      {selectedItem && (
        <DrillPanel item={selectedItem} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
