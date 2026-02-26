"use client";

import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Globe,
  BookOpen,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { CONTACT } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Github,
  Linkedin,
  Mail,
  Globe,
  BookOpen,
  MessageCircle,
};

export default function Contact() {
  return (
    <section
      id="contato"
      className="py-24 md:py-32 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
            {CONTACT.title}
          </h2>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            {CONTACT.subtitle}
          </p>
        </motion.div>

        {/* Prominent CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href={CONTACT.links.find((l) => l.icon === "MessageCircle")?.href ?? "https://wa.me/5534984228457"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-all hover:shadow-lg hover:shadow-amber-500/25"
          >
            <MessageCircle size={18} />
            Falar no WhatsApp
            <ArrowRight size={16} />
          </a>
          <a
            href="mailto:sou@leoamerico.me"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 transition-all"
          >
            <Mail size={18} />
            Enviar e-mail
            <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* Links grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {CONTACT.links.map((link) => {
            const Icon = iconMap[link.icon] || Globe;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-cyan-400/30 hover:bg-slate-800/60 transition-all group"
                aria-label={link.label}
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center group-hover:bg-cyan-400/20 transition-colors">
                  <Icon size={20} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    {link.label}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {link.href.replace(/^(mailto:|https?:\/\/)/, "")}
                  </div>
                </div>
              </a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
