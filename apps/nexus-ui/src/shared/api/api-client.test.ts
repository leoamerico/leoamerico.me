/**
 * api-client — Testes Unitários
 *
 * Cobre:
 *   - Construção da URL (base + path)
 *   - Delegação ao fetch nativo
 *   - Desserialização JSON da resposta
 *   - Respeito à variável NEXT_PUBLIC_API_BASE
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock global fetch ────────────────────────────────────────────────────────

const mockJson = vi.fn();
const mockFetch = vi.fn();

beforeEach(() => {
    mockJson.mockResolvedValue({});
    mockFetch.mockResolvedValue({ json: mockJson });
    vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('api.get', () => {
    it('chama fetch com URL correta usando base padrão', async () => {
        const { api } = await import('./api-client');
        await api.get('/hardware');

        expect(mockFetch).toHaveBeenCalledOnce();
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/hardware');
    });

    it('concatena corretamente base + path sem double-slash', async () => {
        const { api } = await import('./api-client');
        await api.get('/actuator/health');

        const url = mockFetch.mock.calls[0][0] as string;
        expect(url).toBe('http://localhost:8080/actuator/health');
        expect(url).not.toMatch(/\/\//);
    });

    it('retorna o objeto desserializado do JSON', async () => {
        mockJson.mockResolvedValue({ status: 'UP' });
        const { api } = await import('./api-client');

        const result = await api.get('/actuator/health');

        expect(result).toEqual({ status: 'UP' });
    });

    it('chama response.json() para desserializar', async () => {
        const { api } = await import('./api-client');
        await api.get('/anything');

        expect(mockJson).toHaveBeenCalledOnce();
    });

    it('propaga rejeição do fetch', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));
        const { api } = await import('./api-client');

        await expect(api.get('/fail')).rejects.toThrow('Network error');
    });

    it('propaga rejeição do response.json()', async () => {
        mockJson.mockRejectedValue(new SyntaxError('Unexpected token'));
        const { api } = await import('./api-client');

        await expect(api.get('/bad-json')).rejects.toThrow('Unexpected token');
    });

    it('aceita path com query string', async () => {
        const { api } = await import('./api-client');
        await api.get('/items?status=active&page=1');

        expect(mockFetch.mock.calls[0][0]).toBe('http://localhost:8080/items?status=active&page=1');
    });

    it('respeita NEXT_PUBLIC_API_BASE quando definida', async () => {
        vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.prod.example.com');
        vi.resetModules();
        const { api } = await import('./api-client');
        await api.get('/hardware');

        expect(mockFetch.mock.calls[0][0]).toBe('https://api.prod.example.com/hardware');
    });
});
