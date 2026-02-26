"use client";

import { motion } from "framer-motion";
import { ExternalLink, Youtube, Linkedin } from "lucide-react";
import { PROJECTS } from "@/lib/constants";

export default function Projects() {
  return (
    <section id="resultados" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-3xl md:text-4xl text-white text-center mb-16"
        >
          {PROJECTS.title}
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.cards.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl overflow-hidden group hover:border-cyan-400/30 transition-all flex flex-col"
            >
              {/* Image placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center">
                <div className="text-6xl font-heading font-bold text-cyan-400/20">
                  {i + 1}
                </div>
                {/* Badge */}
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-medium">
                  {project.badge}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-2">
                  {project.category}
                </span>
                <h3 className="font-heading font-semibold text-lg text-white mb-3">
                  {project.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {project.description}
                </p>
                {project.impact && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Impacto</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{project.impact}</p>
                  </div>
                )}
                {project.features && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Diferenciais técnicos</p>
                    <ul className="space-y-1">
                      {(project.features as string[]).map((f: string, j: number) => (
                        <li key={j} className="text-slate-400 text-sm flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex-1" />
                {/* Evidence links */}
                {(project as { evidence?: { label: string; href: string; icon: string }[] }).evidence && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Evidências externas</p>
                    <div className="flex flex-col gap-1.5">
                      {(project as { evidence: { label: string; href: string; icon: string }[] }).evidence.map((ev, k) => (
                        <a
                          key={k}
                          href={ev.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group/ev"
                        >
                          {ev.icon === "Youtube" && <Youtube size={13} className="text-red-400 shrink-0" />}
                          {ev.icon === "Linkedin" && <Linkedin size={13} className="text-blue-400 shrink-0" />}
                          {ev.icon !== "Youtube" && ev.icon !== "Linkedin" && <ExternalLink size={13} className="text-slate-500 shrink-0" />}
                          <span className="truncate group-hover/ev:underline">{ev.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    aria-label={`Ver ${project.title}`}
                  >
                    {project.linkLabel || "Ver projeto"} <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
