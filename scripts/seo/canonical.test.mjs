/**
 * canonical.mjs — Testes
 *
 * Execução: node --test scripts/seo/canonical.test.mjs
 *
 * Cobre:
 *   - ANCHOR_PERSONA_MAP: 11 âncoras canônicas, personas corretas por âncora
 *   - ANCHOR_INTENT_MAP: 11 âncoras, intents válidos, consistência com personas
 *   - PERSONA_KEYWORDS: 11 personas, keywords corretas por persona
 *   - classify(): âncora → mapa; URL path → padrão; H1/title → keyword fallback; nenhum match → geral
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classify, ANCHOR_PERSONA_MAP, ANCHOR_INTENT_MAP, PERSONA_KEYWORDS } from './canonical.mjs';

// ─── Constantes de referência ─────────────────────────────────────────────────

const EXPECTED_ANCHORS = [
    'hero', 'sobre', 'capacidades', 'stack', 'resultados',
    'envneo', 'govevia', 'audit', 'certifications', 'diploma', 'contato',
];

const ALL_PERSONAS = [
    'prefeito', 'secretario', 'procurador', 'auditor', 'controlador',
    'fiscal', 'cidadao', 'empresario', 'gestor', 'tech', 'geral',
];

const VALID_INTENTS = [
    'hero', 'sobre', 'credibilidade', 'produto-grp', 'produto-erp',
    'compliance', 'governanca', 'stack', 'capacidades', 'contato', 'overview',
];

// ─── ANCHOR_PERSONA_MAP ────────────────────────────────────────────────────────

describe('ANCHOR_PERSONA_MAP', () => {
    it('contém exatamente 11 âncoras canônicas', () => {
        const keys = Object.keys(ANCHOR_PERSONA_MAP);
        assert.equal(keys.length, 11);
        for (const anchor of EXPECTED_ANCHORS) {
            assert.ok(keys.includes(anchor), `âncora ausente: ${anchor}`);
        }
    });

    it('hero cobre geral, empresario e prefeito', () => {
        assert.deepEqual(ANCHOR_PERSONA_MAP['hero'], ['geral', 'empresario', 'prefeito']);
    });

    it('stack aponta apenas para tech', () => {
        assert.deepEqual(ANCHOR_PERSONA_MAP['stack'], ['tech']);
    });

    it('resultados cobre 6 personas governamentais', () => {
        const p = ANCHOR_PERSONA_MAP['resultados'];
        assert.equal(p.length, 6);
        for (const persona of ['prefeito', 'secretario', 'procurador', 'auditor', 'controlador', 'fiscal']) {
            assert.ok(p.includes(persona), `persona ausente em resultados: ${persona}`);
        }
    });

    it('contato aponta apenas para geral', () => {
        assert.deepEqual(ANCHOR_PERSONA_MAP['contato'], ['geral']);
    });

    it('certifications e diploma apontam para geral (credibilidade)', () => {
        assert.deepEqual(ANCHOR_PERSONA_MAP['certifications'], ['geral']);
        assert.deepEqual(ANCHOR_PERSONA_MAP['diploma'], ['geral']);
    });

    it('audit cobre tech, auditor e controlador', () => {
        const p = ANCHOR_PERSONA_MAP['audit'];
        assert.ok(p.includes('tech'));
        assert.ok(p.includes('auditor'));
        assert.ok(p.includes('controlador'));
    });

    it('todas as personas listadas são válidas', () => {
        for (const [anchor, personas] of Object.entries(ANCHOR_PERSONA_MAP)) {
            for (const persona of personas) {
                assert.ok(ALL_PERSONAS.includes(persona),
                    `persona inválida "${persona}" em âncora "${anchor}"`);
            }
        }
    });
});

// ─── ANCHOR_INTENT_MAP ────────────────────────────────────────────────────────

describe('ANCHOR_INTENT_MAP', () => {
    it('contém exatamente 11 âncoras', () => {
        assert.equal(Object.keys(ANCHOR_INTENT_MAP).length, 11);
    });

    it('todas as âncoras de ANCHOR_PERSONA_MAP têm intent correspondente', () => {
        for (const anchor of Object.keys(ANCHOR_PERSONA_MAP)) {
            assert.ok(
                ANCHOR_INTENT_MAP[anchor] !== undefined,
                `intent ausente para âncora "${anchor}"`,
            );
        }
    });

    it('todos os intents mapeados são válidos', () => {
        for (const [anchor, intent] of Object.entries(ANCHOR_INTENT_MAP)) {
            assert.ok(VALID_INTENTS.includes(intent),
                `intent inválido "${intent}" para âncora "${anchor}"`);
        }
    });

    it('mapeamentos específicos críticos', () => {
        assert.equal(ANCHOR_INTENT_MAP['hero'],           'hero');
        assert.equal(ANCHOR_INTENT_MAP['sobre'],          'sobre');
        assert.equal(ANCHOR_INTENT_MAP['stack'],          'stack');
        assert.equal(ANCHOR_INTENT_MAP['resultados'],     'produto-grp');
        assert.equal(ANCHOR_INTENT_MAP['envneo'],         'produto-erp');
        assert.equal(ANCHOR_INTENT_MAP['govevia'],        'compliance');
        assert.equal(ANCHOR_INTENT_MAP['audit'],          'governanca');
        assert.equal(ANCHOR_INTENT_MAP['certifications'], 'credibilidade');
        assert.equal(ANCHOR_INTENT_MAP['diploma'],        'credibilidade');
        assert.equal(ANCHOR_INTENT_MAP['contato'],        'contato');
        assert.equal(ANCHOR_INTENT_MAP['capacidades'],    'capacidades');
    });

    it('certifications e diploma compartilham o mesmo intent (credibilidade)', () => {
        assert.equal(ANCHOR_INTENT_MAP['certifications'], ANCHOR_INTENT_MAP['diploma']);
    });
});

// ─── PERSONA_KEYWORDS ─────────────────────────────────────────────────────────

describe('PERSONA_KEYWORDS', () => {
    it('contém exatamente 11 personas', () => {
        assert.equal(Object.keys(PERSONA_KEYWORDS).length, 11);
        for (const p of ALL_PERSONAS) {
            assert.ok(Object.prototype.hasOwnProperty.call(PERSONA_KEYWORDS, p),
                `persona ausente: ${p}`);
        }
    });

    it('geral tem array vazio (fallback universal)', () => {
        assert.deepEqual(PERSONA_KEYWORDS['geral'], []);
    });

    it('prefeito contém keyword "prefeito"', () => {
        assert.ok(PERSONA_KEYWORDS['prefeito'].includes('prefeito'));
    });

    it('auditor contém keyword "auditoria"', () => {
        assert.ok(PERSONA_KEYWORDS['auditor'].includes('auditoria'));
    });

    it('tech contém keyword "API"', () => {
        assert.ok(PERSONA_KEYWORDS['tech'].includes('API'));
    });

    it('empresario contém keyword "ERP"', () => {
        assert.ok(PERSONA_KEYWORDS['empresario'].includes('ERP'));
    });

    it('todas as keywords são strings não-vazias', () => {
        for (const [persona, keywords] of Object.entries(PERSONA_KEYWORDS)) {
            if (persona === 'geral') continue;
            assert.ok(keywords.length > 0, `${persona} não tem keywords`);
            for (const kw of keywords) {
                assert.equal(typeof kw, 'string');
                assert.ok(kw.length > 0);
            }
        }
    });
});

// ─── classify() ───────────────────────────────────────────────────────────────

describe('classify — âncora direta', () => {
    it('/#hero → personas [geral, empresario, prefeito] e intent hero', () => {
        const r = classify('http://localhost:3000/#hero', '', '');
        assert.deepEqual(r.personas, ['geral', 'empresario', 'prefeito']);
        assert.equal(r.intent, 'hero');
    });

    it('/#stack → personas [tech] e intent stack', () => {
        const r = classify('http://localhost:3000/#stack', '', '');
        assert.deepEqual(r.personas, ['tech']);
        assert.equal(r.intent, 'stack');
    });

    it('/#resultados → intent produto-grp', () => {
        const r = classify('http://localhost:3000/#resultados', '', '');
        assert.equal(r.intent, 'produto-grp');
    });

    it('/#envneo → personas [empresario, gestor] e intent produto-erp', () => {
        const r = classify('http://localhost:3000/#envneo', '', '');
        assert.deepEqual(r.personas, ['empresario', 'gestor']);
        assert.equal(r.intent, 'produto-erp');
    });

    it('/#audit → intent governanca', () => {
        const r = classify('http://localhost:3000/#audit', '', '');
        assert.equal(r.intent, 'governanca');
    });

    it('/#certifications → intent credibilidade', () => {
        const r = classify('http://localhost:3000/#certifications', '', '');
        assert.equal(r.intent, 'credibilidade');
    });

    it('/#diploma → intent credibilidade (mesmo que certifications)', () => {
        const r = classify('http://localhost:3000/#diploma', '', '');
        assert.equal(r.intent, 'credibilidade');
    });

    it('/#contato → personas [geral] e intent contato', () => {
        const r = classify('http://localhost:3000/#contato', '', '');
        assert.deepEqual(r.personas, ['geral']);
        assert.equal(r.intent, 'contato');
    });

    it('âncora tem precedência sobre keywords no H1', () => {
        // Mesmo que H1 contenha "auditor", âncora #hero vence
        const r = classify('http://localhost:3000/#hero', 'Auditor e Prefeito juntos', '');
        assert.deepEqual(r.personas, ['geral', 'empresario', 'prefeito']);
        assert.equal(r.intent, 'hero');
    });
});

describe('classify — URL path patterns', () => {
    it('/plataforma/prefeito → intent produto-grp e persona prefeito', () => {
        const r = classify('http://localhost:3000/plataforma/prefeito', '', '');
        assert.equal(r.intent, 'produto-grp');
        assert.ok(r.personas.includes('prefeito'));
    });

    it('/plataforma/procurador → intent compliance', () => {
        const r = classify('http://localhost:3000/plataforma/procurador', '', '');
        assert.equal(r.intent, 'compliance');
        assert.ok(r.personas.includes('procurador'));
    });

    it('/plataforma/auditor → intent compliance', () => {
        const r = classify('http://localhost:3000/plataforma/auditor', '', '');
        assert.equal(r.intent, 'compliance');
    });

    it('/plataforma/controlador → intent compliance', () => {
        const r = classify('http://localhost:3000/plataforma/controlador', '', '');
        assert.equal(r.intent, 'compliance');
        assert.ok(r.personas.includes('controlador'));
    });

    it('/plataforma/fiscal → intent produto-grp', () => {
        const r = classify('http://localhost:3000/plataforma/fiscal', '', '');
        assert.equal(r.intent, 'produto-grp');
        assert.ok(r.personas.includes('fiscal'));
    });

    it('/erp → personas [empresario, gestor] e intent produto-erp', () => {
        const r = classify('http://localhost:3000/erp', '', '');
        assert.deepEqual(r.personas, ['empresario', 'gestor']);
        assert.equal(r.intent, 'produto-erp');
    });

    it('/envneo → intent produto-erp', () => {
        const r = classify('http://localhost:3000/envneo', '', '');
        assert.equal(r.intent, 'produto-erp');
    });

    it('/env-neo → intent produto-erp (variante de slug)', () => {
        const r = classify('http://localhost:3000/env-neo', '', '');
        assert.equal(r.intent, 'produto-erp');
    });

    it('/sobre → intent sobre e persona geral', () => {
        const r = classify('http://localhost:3000/sobre', '', '');
        assert.equal(r.intent, 'sobre');
        assert.deepEqual(r.personas, ['geral']);
    });

    it('/contato → intent contato', () => {
        const r = classify('http://localhost:3000/contato', '', '');
        assert.equal(r.intent, 'contato');
    });

    it('/compliance → intent compliance', () => {
        const r = classify('http://localhost:3000/compliance', '', '');
        assert.equal(r.intent, 'compliance');
    });

    it('/seguranca → intent stack', () => {
        const r = classify('http://localhost:3000/seguranca', '', '');
        assert.equal(r.intent, 'stack');
        assert.ok(r.personas.includes('tech'));
    });

    it('/preco → intent overview', () => {
        const r = classify('http://localhost:3000/preco', '', '');
        assert.equal(r.intent, 'overview');
    });

    it('/plataforma/secretar → persona secretario (match parcial de prefixo)', () => {
        const r = classify('http://localhost:3000/plataforma/secretario', '', '');
        assert.ok(r.personas.includes('secretario'));
    });
});

describe('classify — fallback por keyword em H1/title', () => {
    it('H1 com "prefeito" → persona prefeito', () => {
        const r = classify('http://localhost:3000/pagina-desconhecida', 'Solução para o Prefeito', '');
        assert.ok(r.personas.includes('prefeito'));
    });

    it('H1 com "auditoria" → persona auditor', () => {
        const r = classify('http://localhost:3000/', 'Sistema de Auditoria', '');
        assert.ok(r.personas.includes('auditor'));
    });

    it('H1 com "ERP" → persona empresario', () => {
        const r = classify('http://localhost:3000/produto', 'ERP para médias empresas', '');
        assert.ok(r.personas.includes('empresario'));
    });

    it('H1 com "API" → persona tech', () => {
        const r = classify('http://localhost:3000/', 'Documentação da API', '');
        assert.ok(r.personas.includes('tech'));
    });

    it('H1 com "ArchUnit" → persona tech', () => {
        const r = classify('http://localhost:3000/', 'ArchUnit enforcement', '');
        assert.ok(r.personas.includes('tech'));
    });

    it('keyword match é case-insensitive', () => {
        const r = classify('http://localhost:3000/', 'PREFEITO municipal', '');
        assert.ok(r.personas.includes('prefeito'));
    });

    it('title é combinado com H1 para keywords', () => {
        const r = classify('http://localhost:3000/', '', 'Gestão para o Prefeito');
        assert.ok(r.personas.includes('prefeito'));
    });

    it('múltiplas keywords detectam múltiplas personas', () => {
        const r = classify('http://localhost:3000/', 'Auditor e Prefeito no mesmo texto', '');
        assert.ok(r.personas.includes('auditor'));
        assert.ok(r.personas.includes('prefeito'));
    });
});

describe('classify — fallback geral (nenhum match)', () => {
    it('URL sem padrão e H1 vazio → persona geral', () => {
        const r = classify('http://localhost:3000/pagina-aleatoria', '', '');
        assert.deepEqual(r.personas, ['geral']);
    });

    it('URL sem padrão e H1 sem keyword → persona geral', () => {
        const r = classify('http://localhost:3000/', 'Bem-vindo ao sistema', '');
        assert.deepEqual(r.personas, ['geral']);
    });

    it('âncora desconhecida → não usa mapa e cai em URL patterns ou keywords', () => {
        // âncora não mapeada, sem keyword → geral
        const r = classify('http://localhost:3000/#secao-nova', '', '');
        assert.deepEqual(r.personas, ['geral']);
    });
});

describe('classify — consistência dos retornos', () => {
    it('sempre retorna objeto com personas (array) e intent (string)', () => {
        const inputs = [
            ['http://localhost:3000/#hero', '', ''],
            ['http://localhost:3000/plataforma/prefeito', '', ''],
            ['http://localhost:3000/', 'texto qualquer', ''],
            ['http://localhost:3000/', '', ''],
        ];
        for (const [url, h1, title] of inputs) {
            const r = classify(url, h1, title);
            assert.ok(Array.isArray(r.personas), 'personas deve ser array');
            assert.ok(r.personas.length > 0, 'personas nunca vazio');
            assert.equal(typeof r.intent, 'string', 'intent deve ser string');
            assert.ok(r.intent.length > 0, 'intent nunca vazio');
        }
    });

    it('cada persona retornada é um valor do conjunto canônico', () => {
        const r = classify('http://localhost:3000/#resultados', '', '');
        for (const p of r.personas) {
            assert.ok(ALL_PERSONAS.includes(p), `persona inválida retornada: ${p}`);
        }
    });
});
