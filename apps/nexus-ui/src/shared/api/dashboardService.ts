// apps/nexus-ui/src/shared/api/dashboardService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tipos e cliente da API de gestão visual (backend Spring Boot / nexus).
// ─────────────────────────────────────────────────────────────────────────────

export interface ProcessesDTO {
  totalActive:          number;
  completedToday:       number;
  completedThisWeek:    number;
  atRisk:               number;
  byStatus:             Record<string, number>;
  averageCompletionDays:number;
}

export interface TasksDTO {
  totalPending:    number;
  urgentCount:     number;
  dueTodayCount:   number;
  overdueCount:    number;
  slaComplianceRate: number;
}

export interface WorkflowsDTO {
  running:      number;
  completed:    number;
  failed:       number;
  suspended:    number;
  byProcessType: unknown[];
}

export interface ComplianceDTO {
  totalViolations:       number;
  highSeverityCount:     number;
  mediumSeverityCount:   number;
  lowSeverityCount:      number;
  complianceRate:        number;
  openWorkItems:         number;
  closedWorkItems:       number;
  daysToZeroProjection:  number;
  trend:                 string;
}

export interface VisualManagementDTO {
  processes:   ProcessesDTO;
  tasks:       TasksDTO;
  workflows:   WorkflowsDTO;
  compliance:  ComplianceDTO;
  generatedAt: string;
}

export interface HardwareDTO {
  cpu:           number;
  memoryUsedMb:  number;
  memoryTotalMb: number;
  memoryPercent: number;
  diskUsedGb:    number;
  diskTotalGb:   number;
  diskPercent:   number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export const dashboardApi = {
  getVisualManagement: (): Promise<VisualManagementDTO> =>
    fetch(`${API_BASE}/api/v1/dashboard/visual-management`).then(r => r.json()),
};
