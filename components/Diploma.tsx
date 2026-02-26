"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Calendar,
  FileDown,
  ExternalLink,
  BookOpen,
  Hash,
} from "lucide-react";
import { DIPLOMA } from "@/lib/constants";

export default function Diploma() {
  return (
    <section id="diploma" className="py-24 md:py-32 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <ShieldCheck size={16} />
            Diploma Digital Verificado — MEC/ICP-Brasil
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">
            {DIPLOMA.title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main diploma card */}
          <div className="glass rounded-2xl p-8 md:p-10 border border-slate-700/50 hover:border-emerald-400/20 transition-all relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={32} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">
                  {DIPLOMA.degree}
                </h3>
                <p className="text-lg text-cyan-400 font-medium">
                  {DIPLOMA.course}
                </p>
                <p className="text-slate-400 mt-1">{DIPLOMA.degreeType}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <Building2
                  size={18}
                  className="text-slate-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Instituição Emissora
                  </p>
                  <p className="text-white font-medium text-sm">
                    {DIPLOMA.institution}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {DIPLOMA.institutionLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2
                  size={18}
                  className="text-slate-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Instituição Registradora
                  </p>
                  <p className="text-white font-medium text-sm">
                    {DIPLOMA.registrar}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {DIPLOMA.registrarLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar
                  size={18}
                  className="text-slate-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Conclusão do Curso
                  </p>
                  <p className="text-white font-medium text-sm">
                    {DIPLOMA.conclusionDate}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Colação de Grau: {DIPLOMA.graduationDate}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen
                  size={18}
                  className="text-slate-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Registro do Diploma
                  </p>
                  <p className="text-white font-medium text-sm">
                    Livro {DIPLOMA.bookNumber} · Nº {DIPLOMA.registrationNumber}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Registrado em: {DIPLOMA.registrationDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification code */}
            <div className="bg-slate-900/60 rounded-xl p-4 mb-8 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={14} className="text-emerald-400" />
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Código de Validação
                </p>
              </div>
              <p className="font-mono text-emerald-400 text-lg tracking-wider">
                {DIPLOMA.validationCode}
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Assinado digitalmente com certificado ICP-Brasil · Verificável no
                portal do MEC
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <a
                href={DIPLOMA.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
              >
                <ShieldCheck size={16} />
                Verificar no MEC
                <ExternalLink size={14} />
              </a>
              <a
                href={DIPLOMA.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <FileDown size={16} />
                Download PDF
              </a>
              <a
                href={DIPLOMA.xmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <FileDown size={16} />
                XML Assinado
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
