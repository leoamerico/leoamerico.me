"use client";

import { motion } from "framer-motion";
import {
  SiAmazonwebservices,
  SiGooglecloud,
  SiOracle,
  SiDocker,
  SiKubernetes,
  SiPython,
  SiReact,
  SiNextdotjs,
  SiPostgresql,
  SiLinux,
  SiGit,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { STACK } from "@/lib/constants";

// Map tech name to icon — fallback to null if not mapped
const techIcons: Record<string, React.ElementType | null> = {
  AWS: SiAmazonwebservices,
  GCP: SiGooglecloud,
  "Oracle Cloud": SiOracle,
  Docker: SiDocker,
  Kubernetes: SiKubernetes,
  Python: SiPython,
  Java: FaJava,
  React: SiReact,
  "Next.js": SiNextdotjs,
  PostgreSQL: SiPostgresql,
  "Oracle DB": SiOracle,
  Linux: SiLinux,
  Git: SiGit,
  "BPMN 2.0": null,
};

export default function Stack() {
  return (
    <section className="py-24 md:py-32 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-3xl md:text-4xl text-white text-center mb-16"
        >
          {STACK.title}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3"
        >
          {STACK.techs.map((tech, i) => {
            const Icon = techIcons[tech];
            return (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300 text-sm hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
              >
                {Icon && <Icon className="text-base" />}
                {tech}
              </motion.span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
