# Env Neo · Brand System
### Versão 2.0 · Fevereiro 2026 · Confidencial

> **Tokens implementados em `app/globals.css` + `tailwind.config.ts`. Gates D1/D2/D3 ativos em `repo-audit.mjs`.**
> Consulte `docs/brand/atlas-humano.md` para arqueologia completa de pintores e axiomas éticos.

> *Machina custodit. Homo gubernat.*
> *A máquina guarda. O humano governa.*

---

## Premissa filosófica

Este não é um manual de estilo. É uma partitura.

A Env Neo produz marcas da mesma forma que produz software: modelando a realidade antes de gerar o artefato. Cada elemento visual carrega sua raiz semântica. Cada cor tem arqueologia. Cada forma existe porque a lógica exige — não porque o gosto permite.

O modelo que governa o software governa a identidade:

```
Primitivos semânticos → Metáforas → Emoção → Etimologia
→ Ontologia → Contratos → Enforcement → Código visual
```

A estabilidade cresce para baixo. O círculo não muda. O token CSS muda toda semana.

---

## Metáfora estrutural: A Ópera

Uma ópera é a síntese de inteligência e emoção sob um único gesto estético. Não é entretenimento — é argumento. Cada parte tem função inegociável:

| Parte da ópera | Função | Equivalente no brand system |
|---|---|---|
| **Abertura (Overture)** | Prepara o público. Clima antes da ação. | Env Neo — a marca-pai. Tudo começa aqui. |
| **Libreto** | O texto. A narrativa. O que será dito. | Este documento. Os princípios. O vocabulário. |
| **Recitativo** | Diálogo cantado. Ação avançando. Próximo da fala. | UI funcional: nav, dados, audit, formulários. |
| **Ária** | O momento do solista. Emoção pura. A ação para. | Hero sections. Claims. O gesto de cada marca. |
| **Conjunto (Duo/Trio)** | Vários personagens, uma harmonia. | Os três sites em coexistência coerente. |
| **Coro** | A multidão. O coletivo. | Municípios, empresas, cidadãos — os usuários. |
| **Interlúdio** | Música entre atos. Transição. Respiração. | Páginas de transição, loading states, footer. |
| **Ato I / II / III** | Divisões dramáticas da narrativa. | Env Neo → Govevia → Env Live (portfolio). |

**Regra operística:** a Abertura contém os temas de toda a ópera. A Env Neo contém os princípios de todas as marcas. Nenhuma filha reinventa — herda.

---

## Hierarquia de marcas

```
                    ╔══════════════════╗
                    ║    ENV NEO       ║  ← Abertura. A holding. O círculo.
                    ║   (Holding)      ║     Princípios inegociáveis.
                    ╚════════╤═════════╝
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ╔═════╧═════╗  ╔═════╧═════╗  ╔════╧══════╗
        ║  GOVEVIA  ║  ║ ENV LIVE  ║  ║  [futura] ║
        ║  (Ato I)  ║  ║ (Ato II)  ║  ║ (Ato III) ║
        ╚═══════════╝  ╚═══════════╝  ╚═══════════╝
```

**Leo Américo** é o compositor — não é uma marca do portfólio. É a assinatura autoral. leoamerico.me é o libreto: mostra a partitura, o método, a evidência.

---

## ENV NEO — A marca-pai (Overture)

### Etimologia e semântica

- **ENV** — *environment*. O ambiente onde as coisas existem antes de serem nomeadas. Raiz: *ambire* (lat.) — "ir ao redor". Associação: contenção, perímetro, contexto.
- **NEO** — do grego *νέος* (neos) — novo, mas também: renovado, recorrente, cíclico. O "O" de Neo **é o círculo**. Não é ornamento — é a sílaba final tornada símbolo gráfico.

**Conceito:** ENV NEO = *o ambiente que se renova por dentro*. Não disruption. Evolução endógena. A empresa que transforma de dentro para fora, preservando o que tem profundidade.

### O símbolo: O Círculo Env Neo

O círculo carrega três significados simultâneos:

1. **O "O" de Neo** — a etymologia visível. A marca literaliza sua própria palavra.
2. **Open/Closed (P3)** — o círculo é fechado por dentro (modificação proibida) e aberto por fora (extensão livre). A abertura no arco superior representa o ponto de extensão.
3. **O ciclo operacional** — Busque → Capte → Ordene → Faça → Prove. Cinco fases. Cinco pontos no arco.

```
         ·  ·  ·            ← abertura (extensão possível)
       ·         ·
      ·  ENV NEO  ·
       ·         ·
         · · · ·            ← fechado (núcleo estável)
```

**Construção geométrica:**
- Círculo externo: stroke 2.5px, abertura de 40° no arco superior (11h–1h)
- Círculo interno (menor, concêntrico): stroke 1px, preenchido — o núcleo imutável
- Tipografia: `ENV NEO` em maiúsculas, tracking +0.15em, posicionada abaixo do centro geométrico
- Ponto semântico: um ponto (·) às 12h marcando o eixo de extensão

### Paleta Env Neo

| Token | Hex | Nome semântico | Arqueologia |
|---|---|---|---|
| `--en-void` | `#020617` | Vazio primordial | O escuro antes da forma — slate-950 |
| `--en-depth` | `#0f172a` | Profundidade | Onde as camadas repousam — slate-900 |
| `--en-surface` | `#1e293b` | Superfície | O que o usuário toca — slate-800 |
| `--en-arc` | `#22d3ee` | Arco elétrico | Ciano — precisão, condução, verdade técnica |
| `--en-arc-dim` | `#0891b2` | Arco velado | Ciano profundo — contexto, referência |
| `--en-authority` | `#f8fafc` | Autoridade | Branco frio — o que tem peso de lei |
| `--en-muted` | `#94a3b8` | Silêncio | Slate-400 — o que informa sem insistir |

**Princípio cromático:** O ciano não é "cor de tech". É o espectro do arco elétrico — o momento em que energia se torna trabalho mensurável. Env Neo mede. Por isso o ciano.

O fundo escuro não é moda. É profundidade. As camadas 01–10 descem para o escuro. O código está na superfície; os primitivos semânticos estão no abismo.

### Tipografia Env Neo

| Nível | Fonte | Uso |
|---|---|---|
| Display (Ária) | `Inter` Bold 700–900, tracking -0.03em | Headlines, claims, números de impacto |
| Corpo (Recitativo) | `Inter` Regular 400, tracking 0 | Parágrafos, descrições funcionais |
| Código/Prova | `JetBrains Mono` ou `Fira Code` | Evidências técnicas, audit data, hashes |
| Institucional | `Inter` Medium 500, tracking +0.08em, MAIÚSCULAS | Labels de seção, badges |

**Regra:** nunca serif em produto digital da Env Neo. Serif pertence ao impresso institucional (diplomas, contratos físicos). Digital é Inter.

---

## GOVEVIA — Ato I

### Etimologia e semântica

- **GOVE** — *governance* + *governo*. Raiz: *gubernare* (lat.) — conduzir um navio. O piloto que vê à frente. Autoridade navegacional.
- **VIA** — caminho, método, a forma de chegar. Raiz: *via* (lat.) — estrada, passagem, solução.

**Conceito:** GOVEVIA = *o caminho governado*. Governança não como burocracia — como arquitetura de rota. O sistema que sabe para onde o município deve ir e registra cada passo.

### O símbolo Govevia

Herda o arco do círculo Env Neo (filho carrega o DNA do pai) e adiciona um elemento direcional: uma seta ou vetor emergindo do ponto de extensão às 12h — *gubernare*, o piloto que aponta a rota.

```
         →                  ← seta de governança (adicional ao pai)
       ·   ·
      · GOVEVIA ·
       ·       ·
         · · ·
```

### Paleta Govevia

| Token | Hex | Nome semântico | Arqueologia |
|---|---|---|---|
| `--gv-base` | `#020617` | Herda void do pai | Continuidade holding |
| `--gv-signal` | `#10b981` | Sinal de conformidade | Esmeralda — lei cumprida, check verde |
| `--gv-signal-dim` | `#059669` | Sinal velado | Referência, histórico |
| `--gv-alert` | `#f59e0b` | Alerta normativo | Âmbar — atenção, prazo, obrigação pendente |
| `--gv-trust` | `#6366f1` | Autoridade pública | Violeta — selos, validações oficiais |

**Princípio cromático:** Esmeralda não é "sucesso genérico". É a cor da conformidade — o TCE verificado, a LGPD cumprida, o caixa fechado. Âmbar não é "aviso". É o prazo jurídico vivo — urgência com base em lei.

O violeta de confiança herda da tradição da autoridade pública (selos, carimbos, documentos oficiais brasileiros). Nunca alaranjado no setor público — laranja é startup. Violeta é instituição.

---

## ENV LIVE — Ato II (Planejado)

### Semântica provisória

- **LIVE** — *ao vivo*, presente, sem latência. Raiz germânica *libban* — permanecer, continuar existindo.
- **ENV LIVE** = *o ambiente que existe agora*. Tempo real como princípio, não como feature.

### Paleta provisória

| Token | Hex | Nome semântico |
|---|---|---|
| `--el-pulse` | `#a855f7` | Pulso — o sinal ao vivo | Violeta elétrico |
| `--el-now` | `#ec4899` | Presença — o instante | Rosa profundo |
| `--el-ground` | `#020617` | Herda void do pai | Continuidade |

**Status:** domínio a definir. Paleta confirmar quando o produto for especificado.

---

## LEO AMÉRICO — O Compositor (leoamerico.me)

Leo Américo não é uma marca de portfólio. É a identidade autoral — o ser humano que assume responsabilidade (Princípio P1). O site leoamerico.me é o libreto: mostra como a partitura foi escrita, o método, a evidência viva.

**Tom:** arquiteto, não CEO. Produtor, não vendedor. A autoridade vem da evidência — código ao vivo, ADRs, commits contados em tempo real.

**Paleta:** herda `--en-arc` (ciano) sobre `--en-void`. Sem cor adicional. O compositor não tem cor própria — usa a paleta da obra.

---

## Sistema de aplicação nos três sites

### Hierarquia de emoção (estrutura operística por site)

```
leoamerico.me
├── Abertura:   O método. "Modelamos a realidade antes de gerar software."
├── Recitativo: Audit ao vivo. Código contado. Evidência.
├── Ária:       "Um núcleo. Dois domínios." — o claim do compositor.
└── Interlúdio: Links para Govevia e Env Neo.

envneo.com
├── Abertura:   O círculo. "Machina custodit. Homo gubernat."
├── Libreto:    As 10 camadas. Os 4 princípios.
├── Recitativo: O portfólio. Govevia ativo. Env Live planejado.
├── Ária:       "Quaere, capta, ordina, fac et proba." — o imperativo.
└── Coro:       "Conformidade por arquitetura." — a promessa coletiva.

govevia.com.br
├── Abertura:   "Governança pública executável." — a ária do produto.
├── Recitativo: Módulos, capacidades, personas, compliance.
├── Ária:       Os números: 7 módulos, 88 entidades, 178 casos de uso.
└── Prova:      Trilha auditável. TCE. LGPD. LAI.
```

### Tokens compartilhados (herança da holding)

Todo produto herda estas invariantes da Env Neo. **Proibido sobrescrever:**

```css
/* Invariantes da holding — não modificar nos produtos filhos */
--en-void:      #020617;   /* fundo profundo — identidade Env Neo */
--en-arc:       #22d3ee;   /* ciano elétrico — o arco da holding */
--en-authority: #f8fafc;   /* branco frio — peso institucional */
font-family: "Inter", system-ui, sans-serif;   /* tipografia canônica */
```

**Extensível por produto:**
```css
/* Tokens de produto — definidos por cada marca, nunca pelo pai */
--product-signal: [cor primária do produto];
--product-alert:  [cor de alerta do produto];
--product-trust:  [cor de autoridade do produto];
```

---

## Regras de marca (enforcement)

### R1 — Herança obrigatória
Todo produto exibe o rodapé `Env Neo Ltda · CNPJ 36.207.211/0001-47`. A holding assina.

### R2 — Círculo antes do nome
O símbolo Env Neo (círculo com abertura) precede o nome em qualquer aplicação institucional. Nunca nome isolado sem símbolo na comunicação formal.

### R3 — Claims ancorados
Nenhum site exibe uma capacidade sem evidência verificável linkada. Número = fonte. "88 entidades" = link para o audit ao vivo. Isso é P2 materializado em brand.

### R4 — Vocabulário consistente
Os termos abaixo têm definição canônica. Proibido usar sinônimos livres:

| Termo canônico | Proibido usar |
|---|---|
| Enforcement | "garantia", "segurança", "proteção" |
| Conformidade | "adequação", "compliance" (em pt-BR formal) |
| Primitivo semântico | "conceito básico", "fundamento" |
| Domínio | "área", "setor", "módulo" (quando se refere ao DDD domain) |
| Claim | "afirmação", "promessa" (sem âncora verificável) |

### R5 — A seta da ópera
Cada página tem uma "ária" — um momento onde a ação para e a emoção fala. Esse momento **não mistura recitativo**. Fundo limpo, tipografia grande, zero elementos de UI funcional. O herói respira sozinho.

### R6 — Interlúdio sempre existe
Toda transição entre seções tem respiração visual de pelo menos `py-16`. Não há dois blocos "ativos" colados. A ópera precisa de silêncio entre os atos.

---

## Aplicação imediata: assets a produzir

Para cada site, os seguintes artefatos visuais devem ser produzidos seguindo este sistema:

### Env Neo (envneo.com)
- [ ] `logo-envneo.svg` — círculo com abertura 40°, ponto a 12h, tipografia ENV NEO abaixo
- [ ] `logo-envneo-dark.svg` — versão sobre fundo escuro (principal)
- [ ] `logo-envneo-light.svg` — versão sobre fundo claro (documentos)
- [ ] `og-image.png` (1200×630) — logo centralizado, fundo `#020617`, tagline em ciano
- [ ] `apple-touch-icon.png` (180×180) — círculo isolado, sem texto
- [ ] `favicon.svg` — círculo com abertura, 32×32

### Govevia (govevia.com.br)
- [ ] `logo-govevia.svg` — círculo herdado + seta direcional, tipografia GOVEVIA
- [ ] `og-image.png` — logo + "Governança Pública Executável"
- [ ] `apple-touch-icon.png` — símbolo isolado

### Leo Américo (leoamerico.me)
- [ ] `logo-leoamerico.svg` — "LA" no arco ciano, sem círculo (o compositor não tem forma própria)
- [ ] `og-image.png` — "Leo Américo · ERP · GRP" sobre fundo `#020617`

---

## Manifesto de execução

```
Quaere.   Busque a raiz — etimologia, primitivo, emoção.
Capta.    Capture em token — cor, forma, tipografia com arqueologia.
Ordina.   Ordene na hierarquia — holding → produto → artefato.
Fac.      Faça o SVG, o token CSS, o og-image. Artefato físico.
Proba.    Prove: audit visual, consistência de herança, R1–R6 passando.
```

Nenhum artefato de marca existe sem ter passado por essas cinco fases.
A máquina guarda a regra. O humano valida a emoção.

---

*Env Neo Ltda · CNPJ 36.207.211/0001-47 · Uberlândia, MG · Brasil*
*Documento interno — Brand System v1.0 · 2026-02-26*
