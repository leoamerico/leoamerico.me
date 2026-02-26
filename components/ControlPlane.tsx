"use client";

import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { ShieldCheck, GitBranch, Database, Cpu, CheckCircle2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { ControlPlaneData } from "@/app/api/control-plane/route";
import { CONTROL_PLANE } from "@/lib/constants";

// ─── helpers ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  cyan:    { bar: "#22d3ee", text: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/30" },
  emerald: { bar: "#34d399", text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  violet:  { bar: "#a78bfa", text: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/30" },
  amber:   { bar: "#fbbf24", text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30" },
  slate:   { bar: "#64748b", text: "text-slate-400",   bg: "bg-slate-400/10",   border: "border-slate-500/30" },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`bg-slate-800 animate-pulse rounded ${className ?? ""}`} aria-hidden="true" />;
}

function ControlPlaneSkeleton() {
  return (
    <section className="py-24 md:py-32 border-t border-slate-800/50" aria-label="Carregando dados do Control Plane…">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <SkeletonPulse className="h-9 w-72 mx-auto" />
          <SkeletonPulse className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-12">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonPulse key={i} className="h-20 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonPulse key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    </section>
  );
}

// ─── Chart 1: Horizontal Bars — Enforcements por Mecanismo ──────────────────

function MechanismBars({ rows }: { rows: ControlPlaneData["byMechanism"] }) {
  const shouldReduce = useReducedMotion();
  const max = Math.max(...rows.map(d => d.count), 1);
  const srSummary = rows.map(r => `${r.label}: ${r.count}`).join("; ");
  return (
    <div role="img" aria-label={`Gráfico: enforcements por mecanismo — ${srSummary}`} className="space-y-3">
      <p className="sr-only">{srSummary}</p>
      {rows.map((row, i) => {
        const pct = (row.count / max) * 100;
        const c = COLOR_MAP[row.color] ?? COLOR_MAP.cyan;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 w-36 shrink-0 leading-tight">{row.label}</span>
            <div className="flex-1 h-5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: c.bar }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={shouldReduce ? { duration: 0 } : { duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
              />
            </div>
            <span className={`text-sm font-bold font-heading w-4 text-right ${c.text}`}>{row.count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Chart 2: Segmented Ring — ADR Maturidade ───────────────────────────────

function AdrDonut({ data }: { data: ControlPlaneData["adrStatus"] }) {
  const shouldReduce = useReducedMotion();
  const total = data.reduce((s, d) => s + d.count, 0);
  const r = 52;
  const stroke = 14;
  const circ = 2 * Math.PI * r;
  const gap = 4;

  let offset = 0;
  const segments = data.map(d => {
    const pct = d.count / total;
    const len = pct * (circ - gap * data.length);
    const seg = { ...d, len, offset, pct };
    offset += len + gap;
    return seg;
  });

  const srLabel = `Gráfico de maturidade de ADRs: total ${total} ADRs — ${data.map(s => `${s.label}: ${s.count}`).join(", ")}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-labelledby="adr-donut-title">
          <title id="adr-donut-title">{srLabel}</title>
          <circle cx="64" cy="64" r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
          {segments.map((s, i) => {
            const c = COLOR_MAP[s.color] ?? COLOR_MAP.slate;
            return (
              <motion.circle
                key={i}
                cx="64" cy="64" r={r}
                fill="none"
                stroke={c.bar}
                strokeWidth={stroke}
                strokeLinecap="butt"
                strokeDasharray={`${s.len} ${circ - s.len}`}
                strokeDashoffset={-(s.offset - circ / 4)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={shouldReduce ? { duration: 0 } : { duration: 0.5, delay: i * 0.15 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span className="text-2xl font-bold font-heading text-white">{total}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">ADRs</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
        {segments.map((s, i) => {
          const c = COLOR_MAP[s.color] ?? COLOR_MAP.slate;
          return (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.bar }} aria-hidden="true" />
              <span className="text-[11px] text-slate-400 leading-snug truncate">{s.label}</span>
              <span className={`text-[11px] font-bold ml-auto ${c.text}`}>{s.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chart 3: INV Status Badges ──────────────────────────────────────────────

function InvariantGrid({ items }: { items: ControlPlaneData["invariants"] }) {
  const shouldReduce = useReducedMotion();
  return (
    <div role="list" aria-label="Invariantes de migration ativos" className="space-y-3">
      {items.map((inv, i) => (
        <motion.div
          key={i}
          role="listitem"
          initial={shouldReduce ? false : { opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={shouldReduce ? { duration: 0 } : { delay: i * 0.12, duration: 0.4 }}
          className="flex items-start gap-3 glass rounded-xl px-4 py-3"
        >
          <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-heading text-emerald-400">{inv.id}</span>
              <span className="text-xs text-white leading-snug">{inv.label}</span>
            </div>
            <span className="text-[10px] text-slate-600 mt-0.5 block">{inv.adr}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-emerald-500 shrink-0">active</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Chart 4: E-META Grid ────────────────────────────────────────────────────

function MetaEnforcementGrid({ items }: { items: ControlPlaneData["metaEnforcements"] }) {
  const shouldReduce = useReducedMotion();
  const icons = [ShieldCheck, GitBranch, Database, Cpu, Database, GitBranch];
  return (
    <div role="list" aria-label="Meta-Enforcements do Control Plane" className="grid grid-cols-2 gap-3">
      {items.map((e, i) => {
        const Icon = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            role="listitem"
            initial={shouldReduce ? false : { opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={shouldReduce ? { duration: 0 } : { delay: i * 0.1, duration: 0.35 }}
            className="glass rounded-xl p-3 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-violet-400 shrink-0" aria-hidden="true" />
              <span className="text-[10px] font-bold text-violet-400 font-heading">{e.id}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{e.label}</p>
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-violet-400"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={shouldReduce ? { duration: 0 } : { duration: 0.8, delay: i * 0.1 + 0.3 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Headline stat card ───────────────────────────────────────────────────────

function StatPill({ value, label, color }: { value: number | string; label: string; color: string }) {
  const shouldReduce = useReducedMotion();
  const c = COLOR_MAP[color] ?? COLOR_MAP.cyan;
  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass rounded-2xl px-5 py-4 flex flex-col items-center gap-1 border ${c.border}`}
    >
      <span className={`text-3xl font-heading font-bold ${c.text}`} aria-label={`${value} ${label}`}>{value}</span>
      <span className="text-xs text-slate-500 text-center leading-snug" aria-hidden="true">{label}</span>
    </motion.div>
  );
}

// ─── Section header for each chart card ──────────────────────────────────────

function ChartCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 flex flex-col gap-5"
    >
      <div className="flex items-center gap-2.5">
        <Icon size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ControlPlane() {
  const [data, setData] = useState<ControlPlaneData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/control-plane")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: ControlPlaneData) => setData(d))
      .catch(() => setError(true));
  }, []);

  if (!data && !error) return <ControlPlaneSkeleton />;

  const totals      = data?.totals            ?? CONTROL_PLANE.totals;
  const byMechanism = data?.byMechanism       ?? CONTROL_PLANE.byMechanism;
  const adrStatus   = data?.adrStatus         ?? CONTROL_PLANE.adrStatus;
  const invariants  = data?.invariants        ?? CONTROL_PLANE.invariants;
  const metaEnf     = data?.metaEnforcements  ?? CONTROL_PLANE.metaEnforcements;
  const asOf        = data
    ? new Date(data.generatedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : CONTROL_PLANE.lastUpdated;

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="py-24 md:py-32 border-t border-slate-800/50"
        aria-labelledby="control-plane-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              id="control-plane-heading"
              className="font-heading font-bold text-3xl md:text-4xl text-white mb-3"
            >
              {CONTROL_PLANE.title}
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              {CONTROL_PLANE.subtitle}
            </p>
          </motion.div>

          {/* Headline pills */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-12" aria-label="Totais do Control Plane">
            <StatPill value={totals.enforcements} label="Enforcements ativos"    color="cyan"    />
            <StatPill value={totals.adrs}         label="ADRs no ledger"         color="emerald" />
            <StatPill value={totals.migrations}   label="Migrations governadas"  color="violet"  />
            <StatPill value={totals.invariants}   label="Invariantes de schema"  color="amber"   />
            <StatPill value={totals.ciGates}      label="Gates CI Control Plane" color="cyan"    />
            <StatPill value={totals.worlds}       label="Mundos sem colisão"     color="emerald" />
          </div>

          {/* Charts 2×2 */}
          <div className="grid md:grid-cols-2 gap-6">

            <ChartCard title="Enforcements por Mecanismo (ativos)" icon={ShieldCheck}>
              <MechanismBars rows={byMechanism} />
              <p className="text-[11px] text-slate-700 mt-1">
                {totals.enforcements} enforcements · cada regra tem exit 0/1 binário sem exceção humana
              </p>
            </ChartCard>

            <ChartCard title="Maturidade de Decisões (ADRs)" icon={GitBranch}>
              <AdrDonut data={adrStatus} />
              <p className="text-[11px] text-slate-700 mt-1">
                Ledger normativo · toda decisão estrutural rastreável até implementação
              </p>
            </ChartCard>

            <ChartCard title="Invariantes de Migration (CI Gate)" icon={Database}>
              <InvariantGrid items={invariants} />
              <p className="text-[11px] text-slate-700 mt-1">
                INV-7 adicionado em jan/2026 · append-only deixou de ser opt-in
              </p>
            </ChartCard>

            <ChartCard title="Meta-Enforcements do Control Plane (ADR-036)" icon={Cpu}>
              <MetaEnforcementGrid items={metaEnf} />
              <p className="text-[11px] text-slate-700 mt-1">
                E-META-1..6 · cada padrão nasceu de um incidente real, virou gate
              </p>
            </ChartCard>

          </div>

          <p className="mt-8 text-center text-[11px] text-slate-700 flex items-center justify-center gap-1.5">
            {data && <RefreshCw size={10} aria-hidden="true" />}
            Dados ao vivo · repositório Govevia · enforcement-registry.yaml + árvore de arquivos
            {error && " (fallback estático)"} · {asOf}
          </p>

        </div>
      </section>
    </MotionConfig>
  );
}
