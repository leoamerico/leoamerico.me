# SEO Atlas — leoamerico.me

> SEO como sistema governado. Três planos. Cinco visões. Gates binários que impedem regressão.

---

## Modelo mental

SEO não é "achismo de keywords". É **observabilidade sobre o que o Google pode descobrir, entender e confiar**. O mesmo princípio do ESA se aplica:

| Plano | Pergunta | Fontes |
|-------|----------|--------|
| **Discovery** 🔵 | Crawlers *encontram*? | `robots.ts`, `sitemap.ts`, status HTTP, canonical |
| **Relevance** 🟣 | Crawlers *entendem*? | `metadata`, OG tags, `schema.org`, conteúdo por rota |
| **Performance** 🟡 | Crawlers *confiam*? | Core Web Vitals, payload JS, headers, a11y |

**Regra invariante:** toda ação de SEO declara em qual plano atua.

---

## As 5 visões

### V1 — Mapa de Rotas Indexáveis

Pergunta: *"o que o Google pode indexar?"*

- Lista de rotas com status HTTP, canonical, `index/noindex`, `lastmod` do sitemap
- Remove o problema "tem página mas não indexa"

**Acesso:** `/atlas/seo` → tab "V1 — Rotas"

### V2 — Matriz de Metadados

Pergunta: *"toda rota tem o mínimo correto?"*

Linhas: rotas · Colunas: `title`, `desc`, `canonical`, `og:title`, `og:desc`, `og:img`, `tw:img`, `robots`, `lang`, `schema.org`

Células: ✅/⚠️/❌ · Drill-down: aponta arquivo de origem.

É o equivalente SEO da [Coverage Matrix ESA](/atlas/matrix).

**Acesso:** `/atlas/seo` → tab "V2 — Metadados"

### V3 — Cobertura de Conteúdo *(backlog)*

Pergunta: *"o conteúdo atende intenção e não compete consigo?"*

- Clusters por persona (Prefeito/Procurador/Auditor/Secretário)
- Duplicidade semântica, thin content, canibalização

### V4 — Saúde Técnica / CWV *(backlog)*

Pergunta: *"o site é rápido e estável o suficiente para rankear?"*

LCP / CLS / INP · payload JS por rota · imagens · caching · headers.

### V5 — Story Mode

Pergunta: *"como explicar o estado do SEO em 90s/5min/15min?"*

- **Executivo (90s):** indexação ok? páginas ok? vitals ok?
- **Editor (5min):** quais páginas precisam de conteúdo e qual intenção?
- **Engenheiro (15min):** arquivos a corrigir + gates que impedem regressão

**Acesso:** `/atlas/seo` → tab "V5 — Story"

---

## Gates binários E-SEO-1..5

| Gate | Nome | Plano | Falha se |
|------|------|-------|----------|
| **E-SEO-1** | Robots & Sitemap coerentes | Discovery | `sitemap` não referenciado em `robots.ts`; sitemap sem URLs; rota no sitemap bloqueada por `Disallow` |
| **E-SEO-2** | Toda rota indexável tem metadata mínima | Relevance | rota 200 + indexável sem `title`, `description`, `canonical` ou `og:image` |
| **E-SEO-3** | Canonical único e sem auto-conflito | Relevance | rota indexável com canonical apontando para URL diferente sem redirect explícito |
| **E-SEO-4** | Nenhuma thin page em produção | Relevance | página indexável com <200 palavras e sem `schema.org` |
| **E-SEO-5** | CWV baseline (Lighthouse CI) | Performance | Lighthouse seo <90, a11y <90, performance <70 |

---

## Fontes canônicas (Truth Sources)

```
app/robots.ts           → regras de disallow + referência ao sitemap
app/sitemap.ts          → lista de rotas indexáveis + lastmod/priority
app/layout.tsx          → metadata raiz: title, description, OG, Twitter, JSON-LD
app/(*/page.tsx)        → metadata por rota (override do layout)
lib/structured-data.ts  → schema.org Person + WebSite
lib/constants.ts        → SITE (url, title, description, ogImage, locale)
next.config.mjs         → headers de segurança/cache
public/robots.txt       → espelho estático do app/robots.ts
```

---

## Implementação

### Scripts

```bash
# Rodar gates localmente (servidor deve estar ativo na porta 3000)
bun run seo:gates

# Output JSON para CI
bun run seo:gates --json > reports/seo/seo-gates.json

# Contra staging/produção
bun run seo:gates --url https://leoamerico.me
```

Adicione ao `package.json`:
```json
"seo:gates": "node scripts/seo/seo-gates.mjs"
```

### CI (automatizado)

`.github/workflows/seo-gates.yml` — dois jobs:

1. **`seo-metadata`** — E-SEO-1..4: build → start server → `seo-gates.mjs` → upload artefato
2. **`lighthouse-ci`** — E-SEO-5: Lighthouse CI com thresholds (seo≥90, a11y≥90, perf≥70)

Trigger: `push main`, `PR` em arquivos SEO, `cron` semanal.

---

## Estado atual

| Gate | Status | Detalhe |
|------|--------|---------|
| E-SEO-1 | ✅ PASS | `robots.ts` referencia sitemap; sitemap inclui rota raiz |
| E-SEO-2 | ⚠️ WARN | `title` de 24 chars (ideal ≥30); `description` ok (143 chars) |
| E-SEO-3 | ✅ PASS | Canonical da home = `https://leoamerico.me/` sem conflito |
| E-SEO-4 | ✅ PASS | Home tem schema.org Person + WebSite + rich content |
| E-SEO-5 | ⚠️ WARN | Workflow presente; relatório Lighthouse não gerado ainda |

**Ação prioritária:** ajustar `title` de `"Leo Américo — ERP · GRP"` (24 chars) para ≥30 chars.  
**Sugestão:** `"Leo Américo — Arquitetura ERP · GRP"` (37 chars).

---

## Roadmap

- [ ] **E-SEO-2** — Corrigir `SITE.title` para ≥30 chars
- [ ] **E-SEO-5** — Gerar primeiro relatório Lighthouse e ajustar thresholds reais
- [ ] **V3** — Implementar análise de intenção/persona (após definir cluster de personas para GRP/ERP)
- [ ] **V4** — Timeline de CWV com histórico por commit (integrar LHCI com upload para servidor)
- [ ] **Search Console** — Integrar cobertura real de indexação via API (verdade externa)
