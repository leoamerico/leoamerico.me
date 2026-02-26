"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Scale } from "lucide-react";
import { GOVEVIA_STATS } from "@/lib/constants";

// Visual: segmented ring for 100%
function Ring({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="72" height="72" className="shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
      <motion.circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={circ}
        transform="rotate(-90 36 36)"
        initial={{ strokeDashoffset: circ }}
        whileInView={{ strokeDashoffset: circ - dash }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <text x="36" y="41" textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="700">
        {pct}%
      </text>
    </svg>
  );
}

// Visual: dot grid for counts
function DotGrid({ count, color }: { count: number; color: string }) {
  const colors: Record<string, string> = {
    cyan: "bg-cyan-400",
    emerald: "bg-emerald-400",
    violet: "bg-violet-400",
    amber: "bg-amber-400",
  };
  const cls = colors[color] ?? "bg-cyan-400";
  return (
    <div className="flex flex-wrap gap-1 w-20">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          className={`w-2.5 h-2.5 rounded-full ${cls}`}
        />
      ))}
    </div>
  );
}

// Visual: module blocks
function ModuleBlocks({ count, color }: { count: number; color: string }) {
  const colors: Record<string, string> = {
    cyan: "bg-cyan-400/80 border-cyan-400/40",
    emerald: "bg-emerald-400/80 border-emerald-400/40",
    violet: "bg-violet-400/80 border-violet-400/40",
    amber: "bg-amber-400/80 border-amber-400/40",
  };
  const cls = colors[color] ?? "bg-cyan-400/80 border-cyan-400/40";
  return (
    <div className="flex flex-wrap gap-1 w-24">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.25, ease: "easeOut" }}
          className={`w-6 h-4 rounded-sm border ${cls}`}
          style={{ transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

// Visual: persona icons (initials)
const PERSONA_LABELS = ["PF", "SC", "FC", "CT", "JR", "CI", "PL", "TC", "GC", "AU", "VD", "AD"];
function PersonaGrid({ count, color }: { count: number; color: string }) {
  const colors: Record<string, string> = {
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    violet: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  };
  const cls = colors[color] ?? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.2 }}
          className={`w-7 h-7 rounded-full border text-[9px] font-bold flex items-center justify-center ${cls}`}
        >
          {PERSONA_LABELS[i] ?? "—"}
        </motion.span>
      ))}
    </div>
  );
}

function MetricVisual({ visual, value, color }: { visual: string; value: string; color: string }) {
  const num = parseInt(value.replace("%", ""), 10);
  if (visual === "ring") return <Ring pct={num} />;
  if (visual === "modules") return <ModuleBlocks count={num} color={color} />;
  if (visual === "personas") return <PersonaGrid count={num} color={color} />;
  return <DotGrid count={num} color={color} />;
}

const metricColor: Record<string, string> = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  violet: "text-violet-400",
  amber: "text-amber-400",
};

export default function GoveiaStats() {
  return (
    <section className="py-24 md:py-32 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-3">
            {GOVEVIA_STATS.title}
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            {GOVEVIA_STATS.subtitle}
          </p>
        </motion.div>

        {/* Compliance badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-14"
        >
          {GOVEVIA_STATS.compliance.map((c, i) => (
            <div
              key={i}
              className="glass rounded-xl px-5 py-4 flex items-start gap-3 max-w-xs"
            >
              <div className="mt-0.5">
                {i === 0 ? (
                  <Scale size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <ShieldCheck size={18} className="text-cyan-400 shrink-0" />
                )}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{c.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{c.year}</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{c.note}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Metric cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GOVEVIA_STATS.metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 flex flex-col gap-4"
            >
              {/* Visual */}
              <div className="flex items-center justify-start min-h-[48px]">
                <MetricVisual visual={m.visual} value={m.value} color={m.color} />
              </div>

              {/* Value + label */}
              <div>
                <div className={`text-4xl font-heading font-bold ${metricColor[m.color] ?? "text-cyan-400"}`}>
                  {m.value}
                </div>
                <div className="text-white font-medium text-sm mt-1">{m.label}</div>
                <div className="text-slate-500 text-xs mt-1 leading-relaxed">{m.sublabel}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Curated data footnote */}
        <p className="mt-6 text-center text-[11px] text-slate-700">
          Dados editoriais — escopo da plataforma definido pela equipe · última revisão {GOVEVIA_STATS.lastUpdated}
        </p>
      </div>
    </section>
  );
}
