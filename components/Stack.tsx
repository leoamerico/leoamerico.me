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
  SiNodedotjs,
  SiPostgresql,
  SiLinux,
  SiGit,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { STACK } from "@/lib/constants";

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
  "Node.js": SiNodedotjs,
  PostgreSQL: SiPostgresql,
  "Oracle DB": SiOracle,
  Linux: SiLinux,
  Git: SiGit,
  "BPMN 2.0": null,
};

export default function Stack() {
  return (
    <section id="stack" className="py-24 md:py-32 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-3xl md:text-4xl text-white text-center mb-16"
        >
          {STACK.title}
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STACK.groups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.1 }}
            >
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.techs.map((tech) => {
                  const Icon = techIcons[tech];
                  return (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300 text-sm hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
                    >
                      {Icon && <Icon className="text-base" />}
                      {tech}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
