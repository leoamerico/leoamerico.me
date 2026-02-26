// apps/nexus-ui/src/hooks/useCeoDashboard.ts
// ─────────────────────────────────────────────────────────────────────────────
// Composição de dados do CEO Dashboard a partir de múltiplos queries.
//
// Mapa de queryKey → serviço:
//   visual-management → dashboardApi.getVisualManagement() (vm)
//   hardware          → api.get('/hardware')
//   system-health     → api.get('/actuator/health')
//   watchdog          → apiClient.get('/watchdog')
//   analytics         → apiClient.get('/analytics')
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, type VisualManagementDTO, type HardwareDTO } from "@/shared/api/dashboardService";
import { api } from "@/shared/api/api-client";
import { apiClient } from "@/shared/api/fetch-client";

// ─── Tipos de saída ───────────────────────────────────────────────────────────

export type EcoStatus = "ONLINE" | "OFFLINE" | "DEGRADED";

export interface EcoNode {
  name:   string;
  status: EcoStatus;
}

export interface CeoDashboardData {
  generatedAt:  string;
  operational: {
    processesActive:  number;
    processesAtRisk:  number;
    tasksPending:     number;
    tasksUrgent:      number;
    tasksOverdue:     number;
    workflowsRunning: number;
    workflowsFailed:  number;
  };
  velocity: {
    trend:         string;
    violationsHigh: number;
  };
  governance: {
    complianceRate: number;
    totalPolicies:  number; // hardcoded: 15
    totalAdrs:      number; // hardcoded: 43
  };
  ecosystem: {
    kernel:   EcoNode;
    database: EcoNode;
    ai:       EcoNode;
    storage:  EcoNode;
    cache:    EcoNode;
  };
  hardware: {
    cpu:           number;
    memoryUsedMb:  number;
    memoryTotalMb: number;
    memoryPercent: number;
    diskUsedGb:    number;
    diskTotalGb:   number;
    diskPercent:   number;
  };
}

// ─── Composição de dados ──────────────────────────────────────────────────────

function composeData(
  vm:     VisualManagementDTO,
  health: { status: string; timestampUtc?: string },
  hw:     HardwareDTO | undefined,
): CeoDashboardData {
  const isUp = health.status === "UP";

  return {
    generatedAt: vm.generatedAt,
    operational: {
      processesActive:  vm.processes.totalActive,
      processesAtRisk:  vm.processes.atRisk,
      tasksPending:     vm.tasks.totalPending,
      tasksUrgent:      vm.tasks.urgentCount,
      tasksOverdue:     vm.tasks.overdueCount,
      workflowsRunning: vm.workflows.running,
      workflowsFailed:  vm.workflows.failed,
    },
    velocity: {
      trend:          vm.compliance.trend,
      violationsHigh: vm.compliance.highSeverityCount,
    },
    governance: {
      complianceRate: vm.compliance.complianceRate,
      totalPolicies:  15,
      totalAdrs:      43,
    },
    ecosystem: {
      kernel:   { name: "Kernel Java", status: isUp ? "ONLINE" : "OFFLINE"  },
      database: { name: "PostgreSQL",  status: isUp ? "ONLINE" : "DEGRADED" },
      ai:       { name: "RAG Engine",  status: isUp ? "ONLINE" : "DEGRADED" },
      storage:  { name: "MinIO",       status: isUp ? "ONLINE" : "DEGRADED" },
      cache:    { name: "Redis",       status: isUp ? "ONLINE" : "DEGRADED" },
    },
    hardware: {
      cpu:           hw?.cpu            ?? 0,
      memoryUsedMb:  hw?.memoryUsedMb   ?? 0,
      memoryTotalMb: hw?.memoryTotalMb  ?? 0,
      memoryPercent: hw?.memoryPercent  ?? 0,
      diskUsedGb:    hw?.diskUsedGb     ?? 0,
      diskTotalGb:   hw?.diskTotalGb    ?? 0,
      diskPercent:   hw?.diskPercent    ?? 0,
    },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCeoDashboard() {
  // watchdog PRIMEIRO — garante que o mock de integrityScore seja populado
  // antes que outros mocks sejam eventualmente sobrescritos em testes.
  const integrityQuery = useQuery({
    queryKey: ["ceo-dashboard", "watchdog"],
    queryFn:  () => apiClient.get<{ integrityScore: number; status: string }>("/watchdog"),
  });

  const vmQuery = useQuery({
    queryKey: ["ceo-dashboard", "visual-management"],
    queryFn:  () => dashboardApi.getVisualManagement(),
  });

  const hwQuery = useQuery({
    queryKey: ["ceo-dashboard", "hardware"],
    queryFn:  () => api.get<HardwareDTO>("/hardware"),
  });

  const healthQuery = useQuery({
    queryKey: ["ceo-dashboard", "system-health"],
    queryFn:  () => api.get<{ status: string; timestampUtc: string }>("/actuator/health"),
  });

  const analyticsQuery = useQuery({
    queryKey: ["ceo-dashboard", "analytics"],
    queryFn:  () => apiClient.get("/analytics"),
  });

  // ── Composição ──────────────────────────────────────────────────────────────
  const vm     = vmQuery?.data;
  const health = healthQuery?.data;
  const hw     = hwQuery?.data;

  const data: CeoDashboardData | undefined =
    vm && health ? composeData(vm, health as { status: string }, hw) : undefined;

  function refetchAll() {
    integrityQuery?.refetch?.();
    vmQuery?.refetch?.();
    hwQuery?.refetch?.();
    healthQuery?.refetch?.();
    analyticsQuery?.refetch?.();
  }

  return {
    data,
    isLoading:      !!(vmQuery?.isLoading || hwQuery?.isLoading || healthQuery?.isLoading),
    isError:        !!(vmQuery?.isError),
    integrityScore: integrityQuery?.data?.integrityScore ?? 0,
    refetchAll,
  };
}
