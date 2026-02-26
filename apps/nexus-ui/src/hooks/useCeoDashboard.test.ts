/**
 * useCeoDashboard — Testes Unitários
 *
 * Cobre a lógica de composição do hook:
 *   - Mapeamento de vm.processes → operational
 *   - Mapeamento de vm.compliance → velocity + governance
 *   - Composição do ecosystem a partir de healthQuery
 *   - Estado de loading agregado dos 3 queries críticos
 *   - isError delegado ao vmQuery
 *   - integrityScore do integrityQuery com fallback 0
 *
 * @see useCeoDashboard.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { VisualManagementDTO } from '@/shared/api/dashboardService';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return { ...(actual as object), useQuery: vi.fn() };
});

vi.mock('@/shared/api/dashboardService', () => ({
    dashboardApi: { getVisualManagement: vi.fn() },
}));

vi.mock('@/shared/api/api-client', () => ({
    api: { get: vi.fn() },
}));

vi.mock('@/shared/api/fetch-client', () => ({
    apiClient: { get: vi.fn() },
}));

import { useQuery } from '@tanstack/react-query';
import { useCeoDashboard } from './useCeoDashboard';

const mockUseQuery = useQuery as ReturnType<typeof vi.fn>;

// ─── Factories ──────────────────────────────────────────────────────────────

const makeVmData = (overrides?: Partial<VisualManagementDTO>): VisualManagementDTO => ({
    processes: {
        totalActive: 4,
        completedToday: 2,
        completedThisWeek: 10,
        atRisk: 1,
        byStatus: { EM_ANDAMENTO: 4 },
        averageCompletionDays: 3,
    },
    tasks: {
        totalPending: 8,
        urgentCount: 2,
        dueTodayCount: 3,
        overdueCount: 1,
        slaComplianceRate: 87,
    },
    workflows: {
        running: 3,
        completed: 20,
        failed: 0,
        suspended: 1,
        byProcessType: [],
    },
    compliance: {
        totalViolations: 5,
        highSeverityCount: 1,
        mediumSeverityCount: 2,
        lowSeverityCount: 2,
        complianceRate: 78,
        openWorkItems: 6,
        closedWorkItems: 4,
        daysToZeroProjection: 14,
        trend: 'IMPROVING',
    },
    generatedAt: '2026-02-26T10:00:00Z',
    ...overrides,
});

const makeHwData = () => ({
    cpu: 45.2,
    memoryUsedMb: 512,
    memoryTotalMb: 2048,
    memoryPercent: 25,
    diskUsedGb: 10,
    diskTotalGb: 50,
    diskPercent: 20,
});

/**
 * Configura mockUseQuery para retornar dados controlados por queryKey.
 */
function setupQueryMocks({
    vmData = makeVmData(),
    hwData = makeHwData(),
    healthStatus = 'UP',
    vmLoading = false,
    hwLoading = false,
    healthLoading = false,
    vmError = false,
    integrityScore = 99,
}: {
    vmData?: VisualManagementDTO | null;
    hwData?: ReturnType<typeof makeHwData> | null;
    healthStatus?: string;
    vmLoading?: boolean;
    hwLoading?: boolean;
    healthLoading?: boolean;
    vmError?: boolean;
    integrityScore?: number;
} = {}) {
    mockUseQuery.mockImplementation(
        ({ queryKey }: { queryKey: string[] }) => {
            const key = queryKey[1];

            if (key === 'visual-management') {
                return {
                    data: vmData ?? undefined,
                    isLoading: vmLoading,
                    isError: vmError,
                    refetch: vi.fn(),
                };
            }
            if (key === 'system-health') {
                return {
                    data: { status: healthStatus, timestampUtc: '' },
                    isLoading: healthLoading,
                    isError: false,
                    refetch: vi.fn(),
                };
            }
            if (key === 'hardware') {
                return {
                    data: hwData ?? undefined,
                    isLoading: hwLoading,
                    isError: false,
                    refetch: vi.fn(),
                };
            }
            if (key === 'watchdog') {
                return {
                    data: { integrityScore, status: 'OK' },
                    isLoading: false,
                    isError: false,
                    refetch: vi.fn(),
                };
            }
            // analytics
            return {
                data: { data: { overview: { totalDocuments: 42 } } },
                isLoading: false,
                isError: false,
                refetch: vi.fn(),
            };
        },
    );
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('useCeoDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── Composição de dados ───────────────────────────────────────────────────

    describe('data composition', () => {
        it('retorna undefined quando vmQuery não tem dados', () => {
            setupQueryMocks({ vmData: null });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data).toBeUndefined();
        });

        it('retorna CeoDashboardData completo quando todos os queries carregaram', () => {
            setupQueryMocks();

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data).toBeDefined();
            expect(result.current.data?.generatedAt).toBe('2026-02-26T10:00:00Z');
        });

        it('mapeia operational.processesActive de vm.processes.totalActive', () => {
            setupQueryMocks({ vmData: makeVmData({ processes: { totalActive: 7, completedToday: 1, completedThisWeek: 5, atRisk: 0, byStatus: {}, averageCompletionDays: 2 } }) });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.operational.processesActive).toBe(7);
        });

        it('mapeia operational.processesAtRisk de vm.processes.atRisk', () => {
            setupQueryMocks({ vmData: makeVmData({ processes: { totalActive: 5, completedToday: 1, completedThisWeek: 3, atRisk: 3, byStatus: {}, averageCompletionDays: 4 } }) });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.operational.processesAtRisk).toBe(3);
        });

        it('mapeia operational.tasksPending / tasksUrgent / tasksOverdue de vm.tasks', () => {
            const vm = makeVmData({
                tasks: { totalPending: 12, urgentCount: 5, dueTodayCount: 2, overdueCount: 3, slaComplianceRate: 75 },
            });
            setupQueryMocks({ vmData: vm });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.operational.tasksPending).toBe(12);
            expect(result.current.data?.operational.tasksUrgent).toBe(5);
            expect(result.current.data?.operational.tasksOverdue).toBe(3);
        });

        it('mapeia operational.workflowsRunning / workflowsFailed de vm.workflows', () => {
            const vm = makeVmData({
                workflows: { running: 6, completed: 10, failed: 2, suspended: 0, byProcessType: [] },
            });
            setupQueryMocks({ vmData: vm });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.operational.workflowsRunning).toBe(6);
            expect(result.current.data?.operational.workflowsFailed).toBe(2);
        });

        it('mapeia velocity.trend de vm.compliance.trend', () => {
            const vm = makeVmData();
            vm.compliance.trend = 'DEGRADING';
            setupQueryMocks({ vmData: vm });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.velocity.trend).toBe('DEGRADING');
        });

        it('mapeia velocity.violationsHigh de vm.compliance.highSeverityCount', () => {
            const vm = makeVmData();
            vm.compliance.highSeverityCount = 4;
            setupQueryMocks({ vmData: vm });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.velocity.violationsHigh).toBe(4);
        });

        it('mapeia governance.complianceRate de vm.compliance.complianceRate', () => {
            const vm = makeVmData();
            vm.compliance.complianceRate = 92;
            setupQueryMocks({ vmData: vm });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.governance.complianceRate).toBe(92);
        });

        it('inclui valores hardcoded de governança (totalPolicies=15, totalAdrs=43)', () => {
            setupQueryMocks();

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.governance.totalPolicies).toBe(15);
            expect(result.current.data?.governance.totalAdrs).toBe(43);
        });
    });

    // ── Ecosystem ─────────────────────────────────────────────────────────────

    describe('ecosystem composition', () => {
        it('todos os nós ficam ONLINE quando health.status === UP', () => {
            setupQueryMocks({ healthStatus: 'UP' });

            const { result } = renderHook(() => useCeoDashboard());

            const eco = result.current.data?.ecosystem;
            expect(eco?.kernel.status).toBe('ONLINE');
            expect(eco?.database.status).toBe('ONLINE');
            expect(eco?.ai.status).toBe('ONLINE');
            expect(eco?.storage.status).toBe('ONLINE');
            expect(eco?.cache.status).toBe('ONLINE');
        });

        it('kernel fica OFFLINE quando health.status !== UP', () => {
            setupQueryMocks({ healthStatus: 'DOWN' });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.ecosystem.kernel.status).toBe('OFFLINE');
        });

        it('database/ai/storage/cache ficam DEGRADED quando health.status !== UP', () => {
            setupQueryMocks({ healthStatus: 'DOWN' });

            const { result } = renderHook(() => useCeoDashboard());

            const eco = result.current.data?.ecosystem;
            expect(eco?.database.status).toBe('DEGRADED');
            expect(eco?.ai.status).toBe('DEGRADED');
            expect(eco?.storage.status).toBe('DEGRADED');
            expect(eco?.cache.status).toBe('DEGRADED');
        });

        it('o ecosystem tem exatamente 5 nós com os nomes esperados', () => {
            setupQueryMocks();

            const { result } = renderHook(() => useCeoDashboard());

            const nodeNames = Object.values(result.current.data!.ecosystem).map(n => n.name);
            expect(nodeNames).toContain('Kernel Java');
            expect(nodeNames).toContain('PostgreSQL');
            expect(nodeNames).toContain('RAG Engine');
            expect(nodeNames).toContain('MinIO');
            expect(nodeNames).toContain('Redis');
        });
    });

    // ── Hardware fallback ─────────────────────────────────────────────────────

    describe('hardware fallback', () => {
        it('usa zeros quando hardwareQuery não retornou dados', () => {
            setupQueryMocks({ hwData: null });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.hardware.cpu).toBe(0);
            expect(result.current.data?.hardware.memoryUsedMb).toBe(0);
        });

        it('usa os dados reais de hardware quando disponíveis', () => {
            setupQueryMocks({ hwData: { cpu: 72, memoryUsedMb: 1024, memoryTotalMb: 4096, memoryPercent: 25, diskUsedGb: 30, diskTotalGb: 100, diskPercent: 30 } });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.data?.hardware.cpu).toBe(72);
            expect(result.current.data?.hardware.memoryUsedMb).toBe(1024);
        });
    });

    // ── Estado de loading / error ─────────────────────────────────────────────

    describe('loading state', () => {
        it('isLoading=true quando vmQuery está carregando', () => {
            setupQueryMocks({ vmLoading: true });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.isLoading).toBe(true);
        });

        it('isLoading=true quando hardwareQuery está carregando', () => {
            setupQueryMocks({ hwLoading: true });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.isLoading).toBe(true);
        });

        it('isLoading=true quando healthQuery está carregando', () => {
            setupQueryMocks({ healthLoading: true });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.isLoading).toBe(true);
        });

        it('isLoading=false quando todos os 3 queries terminaram', () => {
            setupQueryMocks({ vmLoading: false, hwLoading: false, healthLoading: false });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('error state', () => {
        it('isError reflete o estado de erro do vmQuery', () => {
            setupQueryMocks({ vmError: true });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.isError).toBe(true);
        });

        it('isError=false quando vmQuery não tem erro', () => {
            setupQueryMocks({ vmError: false });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.isError).toBe(false);
        });
    });

    // ── Integrity score ───────────────────────────────────────────────────────

    describe('integrityScore', () => {
        it('retorna integrityScore do integrityQuery', () => {
            setupQueryMocks({ integrityScore: 87 });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.integrityScore).toBe(87);
        });

        it('retorna 0 como fallback quando integrityQuery não tem dados', () => {
            mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
                if (queryKey[1] === 'watchdog') return { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
                return setupQueryMocks();
            });

            const { result } = renderHook(() => useCeoDashboard());

            expect(result.current.integrityScore).toBe(0);
        });
    });

    // ── refetchAll ────────────────────────────────────────────────────────────

    describe('refetchAll', () => {
        it('expõe função refetchAll', () => {
            setupQueryMocks();

            const { result } = renderHook(() => useCeoDashboard());

            expect(typeof result.current.refetchAll).toBe('function');
        });

        it('refetchAll pode ser chamado sem lançar erros', () => {
            setupQueryMocks();

            const { result } = renderHook(() => useCeoDashboard());

            expect(() => result.current.refetchAll()).not.toThrow();
        });
    });
});
