"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Terminal } from "lucide-react";
import { HERO } from "@/lib/constants";

interface LiveMetrics {
  entityCount: number;
  useCaseCount: number;
  generatedAt: string;
}

function Typewriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[index];
    const speed = isDeleting ? 30 : 60;

    if (!isDeleting && text === current) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && text === "") {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setText(
        isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)
      );
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, words]);

  return (
    <span className="text-cyan-400">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function Hero() {
  const [live, setLive] = useState<LiveMetrics | null>(null);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.entityCount === "number") {
          setLive({ entityCount: d.entityCount, useCaseCount: d.useCaseCount, generatedAt: d.generatedAt });
        }
      })
      .catch(() => {/* fallback to static */});
  }, []);

  const metrics = HERO.metrics.map((m, i) => {
    if (i === 1 && live) return { ...m, value: String(live.entityCount), _live: true };
    if (i === 2 && live) return { ...m, value: String(live.useCaseCount), _live: true };
    return { ...m, _live: false };
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Aurora gradient mesh */}
      <div className="aurora" />
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      {/* Bottom fade to slate-950 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          {HERO.badge}
        </motion.div>

        {/* Name — gradient text for premium feel */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-heading font-bold text-5xl sm:text-6xl md:text-8xl text-gradient mb-6 tracking-tight"
        >
          {HERO.heading}
        </motion.h1>

        {/* Typewriter roles */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl sm:text-2xl md:text-3xl font-heading font-medium mb-8 h-10"
        >
          <Typewriter words={HERO.roles} />
        </motion.h2>

        {/* Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto text-slate-400 text-base md:text-lg mb-12 leading-relaxed"
        >
          {HERO.paragraph}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <motion.a
            href={HERO.ctaPrimary.href}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-semibold transition-all hover:shadow-lg hover:shadow-amber-500/25"
            aria-label={HERO.ctaPrimary.label}
          >
            <Terminal size={18} />
            {HERO.ctaPrimary.label}
          </motion.a>
          <motion.a
            href={HERO.ctaSecondary.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-slate-700/60 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
            aria-label={HERO.ctaSecondary.label}
          >
            <BookOpen size={18} />
            {HERO.ctaSecondary.label}
          </motion.a>
        </motion.div>

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {metrics.map((metric, i) => {
            const m = metric as {
              value: string;
              label: string;
              source?: string;
              href?: string;
              external?: boolean;
              _live: boolean;
            };
            const inner = (
              <>
                <div className="text-3xl md:text-4xl font-heading font-bold text-cyan-400 mb-1">
                  {m.value}
                </div>
                <div className="text-sm text-slate-300 font-medium mb-1">{m.label}</div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                  {m._live ? (
                    <span className="inline-flex items-center gap-1 text-emerald-500/80">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                      </span>
                      ao vivo
                    </span>
                  ) : (
                    m.source && <span>{m.source}</span>
                  )}
                  {m.href && <ExternalLink size={9} className="text-cyan-500/60" />}
                </div>
              </>
            );
            return m.href ? (
              <a
                key={i}
                href={m.href}
                target={m.external ? "_blank" : "_self"}
                rel={m.external ? "noopener noreferrer" : undefined}
                className="glass rounded-2xl p-6 text-center card-glow cursor-pointer group"
              >
                {inner}
              </a>
            ) : (
              <div key={i} className="glass rounded-2xl p-6 text-center">
                {inner}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
