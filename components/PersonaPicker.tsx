"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, ChevronRight } from "lucide-react";
import { useBrand } from "@/lib/useBrand";
import { GOVEVIA_PERSONAS, type GoveviaPersona } from "@/lib/brand-context";

const colorMap: Record<string, string> = {
  amber:   "bg-amber-500/20 text-amber-300 border-amber-500/30",
  cyan:    "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  violet:  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  blue:    "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function PersonaPicker() {
  const { brand, refBrand, persona, setPersona } = useBrand();
  const [open, setOpen] = useState(false);

  // Only show for Govevia-context visitors (direct or referral)
  const isGoveviaContext = brand === "govevia" || refBrand === "govevia";
  if (!isGoveviaContext) return null;

  const current = persona
    ? GOVEVIA_PERSONAS.find((p) => p.key === persona)
    : null;

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full glass border border-emerald-500/20 text-emerald-400 text-sm font-medium shadow-lg shadow-black/20 hover:border-emerald-400/40 transition-all group"
        aria-label="Escolher persona Govevia"
      >
        <Users size={18} />
        {current ? (
          <span className="hidden sm:inline">{current.shortLabel} · {current.label}</span>
        ) : (
          <span className="hidden sm:inline">Escolher visão</span>
        )}
      </motion.button>

      {/* Persona picker modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:rounded-2xl glass border border-slate-700/30 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Qual é sua visão?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cada persona vê o que é relevante ao seu cargo ou função
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="section-divider" />

              {/* Persona grid */}
              <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-2">
                {GOVEVIA_PERSONAS.map((p) => {
                  const isSelected = persona === p.key;
                  const cls = colorMap[p.color] ?? colorMap.cyan;
                  return (
                    <button
                      key={p.key}
                      onClick={() => {
                        setPersona(p.key as GoveviaPersona);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                        isSelected
                          ? `${cls} ring-1 ring-current`
                          : "border-slate-700/30 hover:border-slate-600/50 text-slate-300"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full border text-[10px] font-bold flex items-center justify-center shrink-0 ${cls}`}
                      >
                        {p.shortLabel}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">
                          {p.label}
                        </div>
                        <div className="text-[11px] text-slate-500 leading-snug truncate">
                          {p.description}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="section-divider" />
              <div className="px-6 py-4 flex items-center justify-between">
                <p className="text-[11px] text-slate-600">
                  Vindo de govevia.com.br
                </p>
                {persona && (
                  <button
                    onClick={() => {
                      setPersona(null);
                      setOpen(false);
                    }}
                    className="text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Limpar seleção
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
