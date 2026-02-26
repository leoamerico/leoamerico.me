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
  // cpf removed — PII never exposed in public API
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
  goveiaheatmap: Array<{ week: number; days: number[] }>;
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

// GitHub-style heatmap cell colour based on commit count
function heatColor(count: number, max: number): string {
  if (count === 0) return "bg-slate-800/60";
  const pct = count / Math.max(max, 1);
  if (pct < 0.25) return "bg-emerald-900/70";
  if (pct < 0.5)  return "bg-emerald-700/80";
  if (pct < 0.75) return "bg-emerald-500";
  return "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]";
}

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function GoveiaHeatmap({ weeks }: { weeks: Array<{ week: number; days: number[] }> }) {
  if (!weeks || weeks.length === 0) return null;

  // Flatten all day entries to find max
  const allCounts = weeks.flatMap((w) => w.days);
  const max = Math.max(...allCounts, 1);
  const total = allCounts.reduce((a, b) => a + b, 0);
  const activeDays = allCounts.filter((c) => c > 0).length;
  const peak = max;

  return (
    <div className="glass rounded-2xl p-6 mb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-heading font-semibold text-white mb-1">
            Atividade — govevia
          </h3>
          <p className="text-xs text-slate-500">Commits por dia · últimos 90 dias</p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-2xl font-heading font-bold text-emerald-400">{total.toLocaleString("pt-BR")}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">commits</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-heading font-bold text-amber-400">{peak}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">pico/dia</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-heading font-bold text-cyan-400">{activeDays}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">dias ativos</div>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-0">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 mr-1.5 justify-around">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className="text-[9px] text-slate-600 w-3 text-right leading-[11px]">{d}</span>
            ))}
          </div>
          {/* Columns = weeks */}
          {weeks.map(({ week, days }, wIdx) => {
            const weekDate = new Date(week * 1000);
            const label = weekDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            return (
              <div key={week} className="flex flex-col gap-0.5 flex-1">
                {days.map((count, dayIdx) => (
                  <motion.div
                    key={dayIdx}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (wIdx * 7 + dayIdx) * 0.003, duration: 0.2 }}
                    title={`${count} commit${count !== 1 ? "s" : ""}`}
                    className={`w-full aspect-square rounded-[2px] cursor-default transition-all hover:ring-1 hover:ring-white/20 ${heatColor(count, max)}`}
                  />
                ))}
                <span className="text-[7px] text-slate-700 text-center mt-0.5 truncate">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/50 text-[10px] text-slate-600">
        <span>Menos</span>
        {["bg-slate-800/60", "bg-emerald-900/70", "bg-emerald-700/80", "bg-emerald-500", "bg-emerald-400"].map((cls, i) => (
          <span key={i} className={`w-3 h-3 rounded-[2px] inline-block ${cls}`} />
        ))}
        <span>Mais</span>
        <span className="ml-auto text-slate-700">repositório: govevia</span>
      </div>
    </div>
  );
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

  // Monthly chart data — kept for KPI reference, chart replaced by heatmap
  const months = data ? Object.entries(data.monthlyActivity) : [];
  const maxCommits = months.length > 0 ? Math.max(...months.map(([, v]) => v), 1) : 1;
  void maxCommits; // used by legacy chart, suppressed lint warning

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

            {/* Govevia heatmap — 90 days */}
            {data.goveiaheatmap && data.goveiaheatmap.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <GoveiaHeatmap weeks={data.goveiaheatmap} />
              </motion.div>
            )}

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
