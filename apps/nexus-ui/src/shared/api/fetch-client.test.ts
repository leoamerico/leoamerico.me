/**
 * fetch-client — Testes Unitários
 *
 * Cobre:
 *   - Construção da URL (base + path)
 *   - Header Content-Type: application/json
 *   - Opção credentials: "include"
 *   - Desserialização JSON da resposta
 *   - Respeito à variável NEXT_PUBLIC_API_BASE
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock global fetch ────────────────────────────────────────────────────────

const mockJson  = vi.fn();
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

describe('apiClient.get', () => {
    it('chama fetch com URL correta usando base padrão', async () => {
        const { apiClient } = await import('./fetch-client');
        await apiClient.get('/watchdog');

        expect(mockFetch).toHaveBeenCalledOnce();
        expect(mockFetch.mock.calls[0][0]).toBe('http://localhost:8080/watchdog');
    });

    it('envia header Content-Type: application/json', async () => {
        const { apiClient } = await import('./fetch-client');
        await apiClient.get('/watchdog');

        const options = mockFetch.mock.calls[0][1] as RequestInit;
        expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });

    it('envia credentials: include', async () => {
        const { apiClient } = await import('./fetch-client');
        await apiClient.get('/analytics');

        const options = mockFetch.mock.calls[0][1] as RequestInit;
        expect(options.credentials).toBe('include');
    });

    it('retorna o objeto desserializado do JSON', async () => {
        mockJson.mockResolvedValue({ integrityScore: 99, status: 'OK' });
        const { apiClient } = await import('./fetch-client');

        const result = await apiClient.get('/watchdog');

        expect(result).toEqual({ integrityScore: 99, status: 'OK' });
    });

    it('chama response.json() para desserializar', async () => {
        const { apiClient } = await import('./fetch-client');
        await apiClient.get('/anything');

        expect(mockJson).toHaveBeenCalledOnce();
    });

    it('propaga rejeição do fetch', async () => {
        mockFetch.mockRejectedValue(new Error('CORS error'));
        const { apiClient } = await import('./fetch-client');

        await expect(apiClient.get('/protected')).rejects.toThrow('CORS error');
    });

    it('propaga rejeição do response.json()', async () => {
        mockJson.mockRejectedValue(new SyntaxError('Malformed JSON'));
        const { apiClient } = await import('./fetch-client');

        await expect(apiClient.get('/bad')).rejects.toThrow('Malformed JSON');
    });

    it('aceita path com parâmetros de query', async () => {
        const { apiClient } = await import('./fetch-client');
        await apiClient.get('/analytics?from=2026-01-01&to=2026-02-26');

        expect(mockFetch.mock.calls[0][0]).toBe(
            'http://localhost:8080/analytics?from=2026-01-01&to=2026-02-26',
        );
    });

    it('respeita NEXT_PUBLIC_API_BASE quando definida', async () => {
        vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.internal.example.com');
        vi.resetModules();
        const { apiClient } = await import('./fetch-client');
        await apiClient.get('/watchdog');

        expect(mockFetch.mock.calls[0][0]).toBe('https://api.internal.example.com/watchdog');
    });

    it('difere de api-client: envia headers e credentials explícitos', async () => {
        const { apiClient } = await import('./fetch-client');
        await apiClient.get('/watchdog');

        // fetch-client envia RequestInit como segundo argumento
        expect(mockFetch.mock.calls[0].length).toBe(2);
    });
});
