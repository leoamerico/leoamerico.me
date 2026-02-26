"use client";

import { motion } from "framer-motion";
import { ShieldCheck, GitBranch, Database, Cpu, CheckCircle2 } from "lucide-react";
import { CONTROL_PLANE } from "@/lib/constants";

// ─── helpers ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  cyan:    { bar: "#22d3ee", text: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/30" },
  emerald: { bar: "#34d399", text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  violet:  { bar: "#a78bfa", text: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/30" },
  amber:   { bar: "#fbbf24", text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30" },
  slate:   { bar: "#64748b", text: "text-slate-400",   bg: "bg-slate-400/10",   border: "border-slate-500/30" },
};

// ─── Chart 1: Horizontal Bars — Enforcements por Mecanismo ──────────────────

function MechanismBars() {
  const max = Math.max(...CONTROL_PLANE.byMechanism.map(d => d.count));
  return (
    <div className="space-y-3">
      {CONTROL_PLANE.byMechanism.map((row, i) => {
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
                transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
              />
            </div>
            <span className={`text-sm font-bold font-heading w-4 text-right ${c.text}`}>
              {row.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Chart 2: Segmented Ring — ADR Maturidade ───────────────────────────────

function AdrDonut() {
  const total = CONTROL_PLANE.adrStatus.reduce((s, d) => s + d.count, 0);
  const r = 52;
  const stroke = 14;
  const circ = 2 * Math.PI * r;
  const gap = 4;

  let offset = 0;
  const segments = CONTROL_PLANE.adrStatus.map(d => {
    const pct = d.count / total;
    const len = pct * (circ - gap * CONTROL_PLANE.adrStatus.length);
    const seg = { ...d, len, offset, pct };
    offset += len + gap;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" viewBox="0 0 128 128">
          {/* track */}
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
                transition={{ duration: 0.5, delay: i * 0.15 }}
              />
            );
          })}
        </svg>
        {/* centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-heading text-white">{total}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">ADRs</span>
        </div>
      </div>
      {/* legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
        {segments.map((s, i) => {
          const c = COLOR_MAP[s.color] ?? COLOR_MAP.slate;
          return (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.bar }} />
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

function InvariantGrid() {
  return (
    <div className="space-y-3">
      {CONTROL_PLANE.invariants.map((inv, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
          className="flex items-start gap-3 glass rounded-xl px-4 py-3"
        >
          <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-heading text-emerald-400">{inv.id}</span>
              <span className="text-xs text-white leading-snug">{inv.label}</span>
            </div>
            <span className="text-[10px] text-slate-600 mt-0.5 block">{inv.adr}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-emerald-500 shrink-0">
            active
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Chart 4: E-META Hexagon Grid ────────────────────────────────────────────

function MetaEnforcementGrid() {
  const icons = [ShieldCheck, GitBranch, Database, Cpu, Database, GitBranch];
  return (
    <div className="grid grid-cols-2 gap-3">
      {CONTROL_PLANE.metaEnforcements.map((e, i) => {
        const Icon = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className="glass rounded-xl p-3 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-violet-400 shrink-0" />
              <span className="text-[10px] font-bold text-violet-400 font-heading">{e.id}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{e.label}</p>
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-violet-400"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
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
  const c = COLOR_MAP[color] ?? COLOR_MAP.cyan;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass rounded-2xl px-5 py-4 flex flex-col items-center gap-1 border ${c.border}`}
    >
      <span className={`text-3xl font-heading font-bold ${c.text}`}>{value}</span>
      <span className="text-xs text-slate-500 text-center leading-snug">{label}</span>
    </motion.div>
  );
}

// ─── Section header for each chart card ──────────────────────────────────────

function ChartCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 flex flex-col gap-5"
    >
      <div className="flex items-center gap-2.5">
        <Icon size={16} className="text-slate-400 shrink-0" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ControlPlane() {
  const { totals } = CONTROL_PLANE;
  return (
    <section className="py-24 md:py-32 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-3">
            {CONTROL_PLANE.title}
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            {CONTROL_PLANE.subtitle}
          </p>
        </motion.div>

        {/* Headline pills */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-12">
          <StatPill value={totals.enforcements} label="Enforcements ativos"    color="cyan"    />
          <StatPill value={totals.adrs}         label="ADRs no ledger"         color="emerald" />
          <StatPill value={totals.migrations}   label="Migrations governadas"  color="violet"  />
          <StatPill value={totals.invariants}   label="Invariantes de schema"  color="amber"   />
          <StatPill value={totals.ciGates}      label="Gates CI Control Plane" color="cyan"    />
          <StatPill value={totals.worlds}       label="Mundos sem colisão"     color="emerald" />
        </div>

        {/* Charts 2×2 */}
        <div className="grid md:grid-cols-2 gap-6">

          <ChartCard title="Enforcements por Mecanismo (E1–E13 + E-META)" icon={ShieldCheck}>
            <MechanismBars />
            <p className="text-[11px] text-slate-700 mt-1">
              19 enforcements · cada regra tem exit 0/1 binário sem exceção humana
            </p>
          </ChartCard>

          <ChartCard title="Maturidade de Decisões (ADRs)" icon={GitBranch}>
            <AdrDonut />
            <p className="text-[11px] text-slate-700 mt-1">
              Ledger normativo · toda decisão estrutural rastreável até implementação
            </p>
          </ChartCard>

          <ChartCard title="Invariantes de Migration (CI Gate)" icon={Database}>
            <InvariantGrid />
            <p className="text-[11px] text-slate-700 mt-1">
              INV-7 adicionado em jan/2026 · append-only deixou de ser opt-in
            </p>
          </ChartCard>

          <ChartCard title="Meta-Enforcements do Control Plane (ADR-036)" icon={Cpu}>
            <MetaEnforcementGrid />
            <p className="text-[11px] text-slate-700 mt-1">
              E-META-1..6 · cada padrão nasceu de um incidente real, virou gate
            </p>
          </ChartCard>

        </div>

        <p className="mt-8 text-center text-[11px] text-slate-700">
          Dados do repositório privado Govevia · enforcement-registry.yaml + DOC-CATALOG.yaml · última revisão {CONTROL_PLANE.lastUpdated}
        </p>
      </div>
    </section>
  );
}
