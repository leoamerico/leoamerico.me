"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { PROJECTS } from "@/lib/constants";

export default function Projects() {
  return (
    <section id="projetos" className="py-24 md:py-32">
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
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                  {project.description}
                </p>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    aria-label={`Ver ${project.title}`}
                  >
                    Ver projeto <ExternalLink size={14} />
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
