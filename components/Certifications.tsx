"use client";

import { motion } from "framer-motion";
import { Award, GraduationCap, BookOpen, FileDown } from "lucide-react";
import { CERTIFICATIONS } from "@/lib/constants";

const statusIcon: Record<string, React.ElementType> = {
  active: Award,
  "Em andamento": BookOpen,
  "Concluído": GraduationCap,
};

export default function Certifications() {
  return (
    <section id="credenciais" className="py-24 md:py-32">
      <div className="section-divider mb-24 md:mb-32" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-3xl md:text-4xl text-white text-center mb-16"
        >
          {CERTIFICATIONS.title}
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CERTIFICATIONS.items.map((item, i) => {
            const Icon = statusIcon[item.status] || Award;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 text-center card-glow"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-cyan-400" />
                </div>
                <h3 className="font-heading font-semibold text-white mb-1 text-sm">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs mb-1">{item.org}</p>
                {item.detail && (
                  <p className="text-cyan-400/70 text-xs font-medium mb-3">{item.detail}</p>
                )}
                {item.link ? (
                  <a
                    href={item.link}
                    target={item.link.startsWith("#") ? "_self" : "_blank"}
                    rel={item.link.startsWith("#") ? undefined : "noopener noreferrer"}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    aria-label={`Ver ${item.title}`}
                  >
                    {item.link.startsWith("#") ? "Ver diploma →" : "Ver perfil →"}
                  </a>
                ) : (
                  <span className="text-xs text-slate-600">
                    {item.status}
                  </span>
                )}
                {item.docs && item.docs.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3 pt-3 border-t border-slate-700/30">
                    {item.docs.map((doc: { label: string; href: string }, j: number) => (
                      <a
                        key={j}
                        href={doc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 text-[10px] text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                      >
                        <FileDown size={10} />
                        {doc.label}
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
