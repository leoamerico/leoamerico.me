"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  FileCheck,
  ShieldCheck,
  Clock,
  Activity,
  Lock,
  Globe,
  RefreshCw,
  BookOpen,
  TestTube2,
  Layers,
} from "lucide-react";

interface RepoData {
  name: string;
  description: string;
  isPrivate: boolean;
  commits: number;
  lastActivity: string | null;
  recentMessages: string[];
  adrCount: number;
  adrFiles: string[];
  policyCount: number;
  testCount: number;
  portAdapterCount: number;
  guardCount: number;
  totalFiles: number;
}

interface AuditData {
  generatedAt: string;
  period: string;
  author: string;
  cpf: string;
  totalRepos: number;
  activeRepos: number;
  totalCommits: number;
  totalADRs: number;
  totalPolicies: number;
  totalTests: number;
  totalPortsAdapters: number;
  totalGuards: number;
  repos: RepoData[];
  monthlyActivity: Record<string, number>;
}

// Countdown hook
function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Atualizando...");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Audit() {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
  const countdown = useCountdown(nextRefresh);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/audit");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AuditData = await res.json();
      setData(json);
      setError(null);
      // Next refresh in 1 hour
      setNextRefresh(new Date(Date.now() + 3600000));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Monthly chart data
  const months = data ? Object.entries(data.monthlyActivity) : [];
  const maxCommits = months.length > 0 ? Math.max(...months.map(([, v]) => v), 1) : 1;

  return (
    <section id="audit" className="py-24 md:py-32 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <Activity size={16} className={loading ? "animate-pulse" : ""} />
            Dados ao vivo via GitHub API
          </div>
          <div className="flex flex-col items-center justify-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">
                Produção Verificável
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-semibold ml-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                Verificado via GitHub API
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Métricas extraídas em tempo real dos repositórios via API oficial do GitHub.
            Todo dado é verificável. Nenhum código-fonte é exposto.
          </p>
        </motion.div>

        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12 text-xs text-slate-500"
        >
          {data && (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} />
                Atualizado: {formatDate(data.generatedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw size={12} />
                Próximo refresh: {countdown}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                Período: {data.period}
              </span>
            </>
          )}
          {loading && (
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <RefreshCw size={12} className="animate-spin" />
              Consultando GitHub API...
            </span>
          )}
          {error && (
            <span className="text-red-400">
              {error} —{" "}
              <button onClick={fetchData} className="underline hover:text-red-300">
                tentar novamente
              </button>
            </span>
          )}
        </motion.div>

        {data && (
          <>
            {/* Metric cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
            >
              {[
                { icon: GitBranch, label: "Repositórios Ativos", value: data.activeRepos, color: "text-cyan-400" },
                { icon: Activity, label: "Commits (12m)", value: data.totalCommits, color: "text-amber-400" },
                { icon: BookOpen, label: "ADRs Registrados", value: data.totalADRs, color: "text-emerald-400" },
                { icon: FileCheck, label: "Políticas (POLICY-)", value: data.totalPolicies, color: "text-violet-400" },
                { icon: TestTube2, label: "Arquivos de Teste", value: data.totalTests, color: "text-blue-400" },
                { icon: Layers, label: "Ports & Adapters", value: data.totalPortsAdapters, color: "text-rose-400" },
              ].map((m, i) => (
                <div
                  key={i}
                  className="glass rounded-xl p-4 text-center hover:border-cyan-400/20 transition-all"
                >
                  <m.icon size={20} className={`${m.color} mx-auto mb-2`} />
                  <div className={`text-2xl font-heading font-bold ${m.color}`}>
                    {m.value.toLocaleString("pt-BR")}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{m.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Monthly activity chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 mb-12"
            >
              {/* Chart header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-base font-heading font-semibold text-white mb-1">
                    Atividade Mensal
                  </h3>
                  <p className="text-xs text-slate-500">Commits em todos os repositórios · últimos 12 meses</p>
                </div>
                {months.length > 0 && (
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-heading font-bold text-cyan-400">
                        {months.reduce((a, [, v]) => a + v, 0).toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">total commits</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-heading font-bold text-amber-400">
                        {maxCommits.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">pico mensal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-heading font-bold text-emerald-400">
                        {Math.round(months.reduce((a, [, v]) => a + v, 0) / Math.max(months.filter(([, v]) => v > 0).length, 1)).toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">média/mês ativo</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart body */}
              <div className="relative">
                {/* Horizontal grid lines */}
                {[100, 75, 50, 25].map((pct) => (
                  <div
                    key={pct}
                    className="absolute w-full border-t border-slate-800/60 flex items-center"
                    style={{ bottom: `${pct}%`, top: "auto" }}
                  >
                    <span className="text-[9px] text-slate-700 -translate-y-2 pr-1 w-6 text-right shrink-0">
                      {Math.round((pct / 100) * maxCommits)}
                    </span>
                  </div>
                ))}

                {/* Bars */}
                <div className="flex items-end gap-1.5 sm:gap-2.5 h-52 pl-7">
                  {months.map(([month, count], idx) => {
                    const pct = count > 0 ? Math.max((count / maxCommits) * 100, 3) : 0;
                    const label = month.split("-")[1] + "/" + month.split("-")[0].slice(2);
                    const isPeak = count === maxCommits && count > 0;
                    const isRecent = idx >= months.length - 3;
                    return (
                      <motion.div
                        key={month}
                        initial={{ opacity: 0, scaleY: 0 }}
                        whileInView={{ opacity: 1, scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
                        style={{ transformOrigin: "bottom" }}
                        className="flex-1 flex flex-col items-center gap-1 group cursor-default"
                      >
                        {/* Count label — always visible for non-zero */}
                        <span className={`text-[10px] font-semibold transition-all ${count > 0 ? (isPeak ? "text-amber-400" : isRecent ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300") : "text-transparent"}`}>
                          {count > 0 ? count : "·"}
                        </span>

                        {/* Bar */}
                        {count > 0 ? (
                          <div
                            className={`w-full rounded-t transition-all duration-300 ${
                              isPeak
                                ? "bg-gradient-to-t from-amber-500/80 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                                : isRecent
                                ? "bg-gradient-to-t from-cyan-500/80 to-cyan-300/90 group-hover:to-white/80"
                                : "bg-gradient-to-t from-slate-600/60 to-slate-400/60 group-hover:from-cyan-500/60 group-hover:to-cyan-300/80"
                            }`}
                            style={{ height: `${pct}%` }}
                          />
                        ) : (
                          <div className="w-full flex-1 flex items-end pb-0.5">
                            <div className="w-full h-px border-t border-dashed border-slate-800" />
                          </div>
                        )}

                        {/* Month label */}
                        <span className={`text-[9px] hidden sm:block transition-colors ${isPeak ? "text-amber-400 font-semibold" : isRecent ? "text-slate-400" : "text-slate-700 group-hover:text-slate-500"}`}>
                          {label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-5 pt-4 border-t border-slate-800/50 text-[10px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-amber-500 to-amber-300 inline-block" />
                  Pico de produção
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-cyan-500/80 to-cyan-300 inline-block" />
                  Últimos 3 meses
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-slate-600/60 to-slate-400/60 inline-block" />
                  Histórico
                </span>
              </div>
            </motion.div>

            {/* Repos grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
                Repositórios Ativos no Período
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.repos.map((repo, i) => (
                  <motion.div
                    key={repo.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl p-5 hover:border-cyan-400/20 transition-all"
                  >
                    {/* Repo header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {repo.isPrivate ? (
                          <Lock size={14} className="text-amber-400" />
                        ) : (
                          <Globe size={14} className="text-emerald-400" />
                        )}
                        <h4 className="font-heading font-semibold text-white text-sm">
                          {repo.name}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-600">
                        {repo.isPrivate ? "privado" : "público"}
                      </span>
                    </div>

                    {repo.description && (
                      <p className="text-xs text-slate-500 mb-3">{repo.description}</p>
                    )}

                    {/* Metrics row */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-cyan-400">
                        <GitBranch size={10} />
                        {repo.commits} commits
                      </span>
                      {repo.adrCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-emerald-400">
                          <BookOpen size={10} />
                          {repo.adrCount} ADRs
                        </span>
                      )}
                      {repo.testCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-blue-400">
                          <TestTube2 size={10} />
                          {repo.testCount} testes
                        </span>
                      )}
                      {repo.portAdapterCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-rose-400">
                          <Layers size={10} />
                          {repo.portAdapterCount} ports/adapters
                        </span>
                      )}
                      {repo.policyCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-violet-400">
                          <ShieldCheck size={10} />
                          {repo.policyCount} policies
                        </span>
                      )}
                    </div>

                    {/* Last activity */}
                    {repo.lastActivity && (
                      <div className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Clock size={10} />
                        Última atividade: {formatDate(repo.lastActivity)}
                      </div>
                    )}

                    {/* Recent commit messages */}
                    {repo.recentMessages.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/50">
                        <p className="text-[10px] text-slate-600 mb-1.5 uppercase tracking-wider">
                          Commits recentes
                        </p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {repo.recentMessages.slice(0, 5).map((msg, j) => (
                            <p
                              key={j}
                              className="text-[11px] text-slate-400 truncate"
                              title={msg}
                            >
                              <span className="text-cyan-400/50">›</span> {msg}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center text-[11px] text-slate-600"
            >
              <ShieldCheck size={12} className="inline mr-1 text-emerald-400/50" />
              Dados obtidos via API REST oficial do GitHub (api.github.com).
              Repositórios privados permanecem protegidos — apenas metadados agregados são exibidos.
              Nenhum código-fonte é transmitido ou exposto.
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
