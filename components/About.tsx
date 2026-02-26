"use client";

import { motion } from "framer-motion";
import { MapPin, Wifi } from "lucide-react";
import Image from "next/image";
import { ABOUT } from "@/lib/constants";

export default function About() {
  return (
    <section id="sobre" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          {/* Photo */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-cyan-400/20 shadow-2xl shadow-cyan-500/10">
              <Image
                src={ABOUT.photo}
                alt="Leonardo Américo José Ribeiro"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 256px, 320px"
                priority
              />
              {/* Fallback gradient quando imagem não existe */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20" />
            </div>
          </div>

          {/* Text */}
          <div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-6">
              {ABOUT.title}
            </h2>
            <div className="space-y-4 mb-6">
              {ABOUT.paragraphs.map((p, i) => (
                <p key={i} className="text-slate-400 text-base md:text-lg leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm">
                <MapPin size={14} className="text-cyan-400" />
                {ABOUT.location}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm">
                <Wifi size={14} className="text-cyan-400" />
                {ABOUT.remote}
              </span>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Formação
              </h3>
              <ul className="space-y-1">
                {ABOUT.education.map((item, i) => (
                  <li key={i} className="text-slate-400 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
