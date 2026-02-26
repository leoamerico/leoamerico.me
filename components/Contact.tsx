"use client";

import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Globe,
  BookOpen,
  MessageCircle,
  Send,
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
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
            {CONTACT.title}
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            {CONTACT.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = (form.elements.namedItem("name") as HTMLInputElement).value;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
              const subject = encodeURIComponent(`Contato de ${name}`);
              const body = encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\n${message}`);
              window.location.href = `mailto:sou@leoamerico.me?subject=${subject}&body=${body}`;
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm text-slate-400 mb-1.5"
              >
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-slate-400 mb-1.5"
              >
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm text-slate-400 mb-1.5"
              >
                Mensagem
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all resize-none"
                placeholder="Como posso ajudar?"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-all hover:shadow-lg hover:shadow-amber-500/25"
              aria-label="Enviar mensagem"
            >
              <Send size={18} />
              Enviar
            </button>
          </motion.form>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Contato direto
            </h3>
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
      </div>
    </section>
  );
}
