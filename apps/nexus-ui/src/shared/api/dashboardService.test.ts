/**
 * dashboardService — Testes Unitários
 *
 * Cobre:
 *   - dashboardApi.getVisualManagement(): URL, método, desserialização
 *   - Tipos: VisualManagementDTO, HardwareDTO (conformidade estrutural)
 *   - NEXT_PUBLIC_API_BASE respeitada
 *   - Propagação de erros HTTP e de rede
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
    VisualManagementDTO,
    HardwareDTO,
    ProcessesDTO,
    TasksDTO,
    WorkflowsDTO,
    ComplianceDTO,
} from './dashboardService';

// ─── Factories ────────────────────────────────────────────────────────────────

const makeProcesses = (): ProcessesDTO => ({
    totalActive:           4,
    completedToday:        2,
    completedThisWeek:     10,
    atRisk:                1,
    byStatus:              { EM_ANDAMENTO: 4 },
    averageCompletionDays: 3,
});

const makeTasks = (): TasksDTO => ({
    totalPending:      8,
    urgentCount:       2,
    dueTodayCount:     3,
    overdueCount:      1,
    slaComplianceRate: 87,
});

const makeWorkflows = (): WorkflowsDTO => ({
    running:      3,
    completed:    20,
    failed:       0,
    suspended:    1,
    byProcessType: [],
});

const makeCompliance = (): ComplianceDTO => ({
    totalViolations:      5,
    highSeverityCount:    1,
    mediumSeverityCount:  2,
    lowSeverityCount:     2,
    complianceRate:       78,
    openWorkItems:        6,
    closedWorkItems:      4,
    daysToZeroProjection: 14,
    trend:                'IMPROVING',
});

const makeVm = (overrides?: Partial<VisualManagementDTO>): VisualManagementDTO => ({
    processes:   makeProcesses(),
    tasks:       makeTasks(),
    workflows:   makeWorkflows(),
    compliance:  makeCompliance(),
    generatedAt: '2026-02-26T10:00:00Z',
    ...overrides,
});

const makeHw = (): HardwareDTO => ({
    cpu:           45.2,
    memoryUsedMb:  512,
    memoryTotalMb: 2048,
    memoryPercent: 25,
    diskUsedGb:    10,
    diskTotalGb:   50,
    diskPercent:   20,
});

// ─── Mock global fetch ────────────────────────────────────────────────────────

const mockJson  = vi.fn();
const mockFetch = vi.fn();

beforeEach(() => {
    mockJson.mockResolvedValue(makeVm());
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: mockJson });
    vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('dashboardApi.getVisualManagement', () => {

    // ── URL e método ─────────────────────────────────────────────────────────

    it('chama fetch com a URL correta do endpoint', async () => {
        const { dashboardApi } = await import('./dashboardService');
        await dashboardApi.getVisualManagement();

        expect(mockFetch).toHaveBeenCalledOnce();
        expect(mockFetch.mock.calls[0][0]).toBe(
            'http://localhost:8080/api/v1/dashboard/visual-management',
        );
    });

    it('usa base padrão http://localhost:8080 quando env não definida', async () => {
        const { dashboardApi } = await import('./dashboardService');
        await dashboardApi.getVisualManagement();

        const url: string = mockFetch.mock.calls[0][0];
        expect(url.startsWith('http://localhost:8080')).toBe(true);
    });

    it('respeita NEXT_PUBLIC_API_BASE quando definida', async () => {
        vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.nexus.example.com');
        vi.resetModules();
        const { dashboardApi } = await import('./dashboardService');
        await dashboardApi.getVisualManagement();

        expect(mockFetch.mock.calls[0][0]).toBe(
            'https://api.nexus.example.com/api/v1/dashboard/visual-management',
        );
    });

    // ── Desserialização ───────────────────────────────────────────────────────

    it('retorna VisualManagementDTO desserializado', async () => {
        const data = makeVm();
        mockJson.mockResolvedValue(data);
        const { dashboardApi } = await import('./dashboardService');

        const result = await dashboardApi.getVisualManagement();

        expect(result).toEqual(data);
    });

    it('chama response.json()', async () => {
        const { dashboardApi } = await import('./dashboardService');
        await dashboardApi.getVisualManagement();

        expect(mockJson).toHaveBeenCalledOnce();
    });

    it('retorna processos com todos os campos esperados', async () => {
        const { dashboardApi } = await import('./dashboardService');
        const result = await dashboardApi.getVisualManagement();

        expect(result.processes).toMatchObject({
            totalActive:           expect.any(Number),
            completedToday:        expect.any(Number),
            completedThisWeek:     expect.any(Number),
            atRisk:                expect.any(Number),
            byStatus:              expect.any(Object),
            averageCompletionDays: expect.any(Number),
        });
    });

    it('retorna tasks com todos os campos esperados', async () => {
        const { dashboardApi } = await import('./dashboardService');
        const result = await dashboardApi.getVisualManagement();

        expect(result.tasks).toMatchObject({
            totalPending:      expect.any(Number),
            urgentCount:       expect.any(Number),
            dueTodayCount:     expect.any(Number),
            overdueCount:      expect.any(Number),
            slaComplianceRate: expect.any(Number),
        });
    });

    it('retorna workflows com todos os campos esperados', async () => {
        const { dashboardApi } = await import('./dashboardService');
        const result = await dashboardApi.getVisualManagement();

        expect(result.workflows).toMatchObject({
            running:      expect.any(Number),
            completed:    expect.any(Number),
            failed:       expect.any(Number),
            suspended:    expect.any(Number),
            byProcessType: expect.any(Array),
        });
    });

    it('retorna compliance com campo trend string', async () => {
        mockJson.mockResolvedValue(makeVm());
        const { dashboardApi } = await import('./dashboardService');
        const result = await dashboardApi.getVisualManagement();

        expect(typeof result.compliance.trend).toBe('string');
        expect(result.compliance.complianceRate).toBe(78);
    });

    it('retorna generatedAt como string ISO', async () => {
        const { dashboardApi } = await import('./dashboardService');
        const result = await dashboardApi.getVisualManagement();

        expect(result.generatedAt).toBe('2026-02-26T10:00:00Z');
    });

    // ── Propagação de erros ───────────────────────────────────────────────────

    it('propaga rejeição de rede', async () => {
        mockFetch.mockRejectedValue(new Error('ERR_CONNECTION_REFUSED'));
        const { dashboardApi } = await import('./dashboardService');

        await expect(dashboardApi.getVisualManagement()).rejects.toThrow('ERR_CONNECTION_REFUSED');
    });

    it('propaga erro de parsing JSON', async () => {
        mockJson.mockRejectedValue(new SyntaxError('Unexpected end of JSON'));
        const { dashboardApi } = await import('./dashboardService');

        await expect(dashboardApi.getVisualManagement()).rejects.toThrow('Unexpected end of JSON');
    });
});

// ─── Tipos estruturais ────────────────────────────────────────────────────────

describe('HardwareDTO — conformidade estrutural', () => {
    it('factory makeHw tem todos os campos do tipo', () => {
        const hw = makeHw();

        expect(hw).toMatchObject({
            cpu:           expect.any(Number),
            memoryUsedMb:  expect.any(Number),
            memoryTotalMb: expect.any(Number),
            memoryPercent: expect.any(Number),
            diskUsedGb:    expect.any(Number),
            diskTotalGb:   expect.any(Number),
            diskPercent:   expect.any(Number),
        });
    });

    it('memoryPercent deve ser memoryUsedMb/memoryTotalMb*100 (convenção)', () => {
        const hw = makeHw();
        const expected = Math.round((hw.memoryUsedMb / hw.memoryTotalMb) * 100);

        expect(hw.memoryPercent).toBe(expected);
    });
});
