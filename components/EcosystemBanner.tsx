"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useBrand } from "@/lib/useBrand";

const brandLabels: Record<string, { name: string; color: string }> = {
  envneo:  { name: "Env Neo",  color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5" },
  govevia: { name: "Govevia",  color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5" },
};

export default function EcosystemBanner() {
  const { refBrand } = useBrand();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only once per session when there's a ref brand
    if (refBrand && refBrand !== "personal") {
      const key = `banner-shown-${refBrand}`;
      if (!sessionStorage.getItem(key)) {
        setVisible(true);
        sessionStorage.setItem(key, "1");
      }
    }
  }, [refBrand]);

  if (!refBrand || refBrand === "personal") return null;

  const info = brandLabels[refBrand];
  if (!info) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)]"
        >
          <div className={`glass rounded-xl px-5 py-4 border ${info.color} flex items-start gap-3`}>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">
                Bem-vindo do {info.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Você está no site pessoal de Leo Américo, criador do ecossistema {info.name}.
              </p>
              {refBrand === "govevia" && (
                <button
                  onClick={() => {
                    setVisible(false);
                    // Scroll to Govevia section
                    document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-2 transition-colors"
                >
                  Ver plataforma Govevia <ArrowRight size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-slate-500 hover:text-white transition-colors shrink-0"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
