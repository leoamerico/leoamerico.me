"use client";

import { motion } from "framer-motion";
import {
  Archive,
  FileCode,
  Cpu,
  TrendingUp,
} from "lucide-react";
import { EXPERTISE } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Archive,
  FileCode,
  Cpu,
  TrendingUp,
};

export default function Expertise() {
  return (
    <section id="servicos" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-3xl md:text-4xl text-white text-center mb-16"
        >
          {EXPERTISE.title}
        </motion.h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {EXPERTISE.cards.map((card, i) => {
            const Icon = iconMap[card.icon] || Archive;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:border-cyan-400/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
                  <Icon size={24} className="text-cyan-400" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
