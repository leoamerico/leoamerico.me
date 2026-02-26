# docs/infra/README.md
# ════════════════════════════════════════════════════════════════
# REGISTRO DE INFRAESTRUTURA — Env Neo Ltda
# ════════════════════════════════════════════════════════════════
#
# PROPÓSITO:
#   SSOT para: domínios, DNS, projetos Vercel e variáveis obrigatórias.
#   Cada entrada aqui é verificada pelo gate I7 (correspondência com constants.ts).
#   Runbooks de operação em docs/infra/prompts/.
#
# ATUALIZAÇÃO:
#   Sempre que um domínio, projeto Vercel ou variável for adicionado,
#   atualizar este arquivo NO MESMO COMMIT da mudança.
#
# ════════════════════════════════════════════════════════════════

## 1. Domínios e Registradores

| Domínio           | Registrador | Nameservers       | Destino Vercel                | Renovação  |
|-------------------|-------------|-------------------|-------------------------------|------------|
| leoamerico.me     | GoDaddy     | ns1.vercel-dns.com / ns2.vercel-dns.com | A → 76.76.21.21 | verificar anualmente |
| envneo.com        | GoDaddy     | ns1.vercel-dns.com / ns2.vercel-dns.com | A → 76.76.21.21 | verificar anualmente |
| envneo.com.br     | GoDaddy     | ns1.vercel-dns.com / ns2.vercel-dns.com | A → 76.76.21.21 | verificar anualmente |
| govevia.com.br    | GoDaddy     | ns1.vercel-dns.com / ns2.vercel-dns.com | A → 76.76.21.21 | verificar anualmente |

### DNS canônico — padrão Vercel para apex + www

```dns
; Apex domain
@    A       76.76.21.21
; www subdomain
www  CNAME   cname.vercel-dns.com.
; CAA — autoriza Let's Encrypt e Sectigo (Vercel usa ambos)
@    CAA 0 issue "letsencrypt.org"
@    CAA 0 issue "sectigo.com"
```

---

## 2. Projetos Vercel

| Projeto Vercel      | Repositório GitHub            | Branch prod | Domínios associados                            |
|---------------------|-------------------------------|-------------|------------------------------------------------|
| leoamerico-me       | leoamerico/leoamerico.me      | main        | leoamerico.me · www.leoamerico.me              |
| envneo              | leoamerico/envneo             | main        | envneo.com · www.envneo.com · envneo.com.br    |
| govevia-site        | leoamerico/govevia-site       | main        | govevia.com.br · www.govevia.com.br            |

---

## 3. Variáveis de Ambiente Obrigatórias por Projeto

### leoamerico-me (Vercel)

| Variável              | Ambiente      | Obrigatória | Gate  | Origem                          |
|-----------------------|---------------|-------------|-------|---------------------------------|
| GITHUB_TOKEN          | Production    | Sim         | —     | GitHub → Settings → Fine-grained PAT |
| CEO_PASSPHRASE_HASH   | Production    | ESA módulo  | S1    | Gerado localmente (bcrypt)       |
| CEO_TOTP_SEED         | Production    | ESA módulo  | S2    | Gerado localmente (base32)       |
| CEO_SESSION_SECRET    | Production    | ESA módulo  | —     | Gerado localmente (32+ chars)    |

### envneo / govevia-site

| Variável              | Ambiente   | Obrigatória | Gate |
|-----------------------|------------|-------------|------|
| (sem vars externas atualmente — verificar ao adicionar módulos) | — | — | — |

---

## 4. I-Series — Gates Automatizados de Infraestrutura

Gates executados por `bun run audit:infra` (`scripts/audit/infra-audit.mjs`).

| Gate | Severity | Verificação                                                   |
|------|----------|---------------------------------------------------------------|
| I1   | BLOCKER  | `public/robots.txt` existe no repositório                     |
| I2   | BLOCKER  | `robots.txt` contém `Disallow: /ceo/`                         |
| I3   | BLOCKER  | `next.config.mjs` define `Strict-Transport-Security` (HSTS)   |
| I4   | BLOCKER  | `next.config.mjs` define `X-Frame-Options: DENY`              |
| I5   | BLOCKER  | `vercel.json` não duplica headers de segurança (estão em next.config) |
| I6   | BLOCKER  | `.env.example` existe e documenta `CEO_PASSPHRASE_HASH`        |
| I7   | BLOCKER  | Nenhuma credencial real (`$2b$`, `GITHUB_TOKEN=ghp_` real) em arquivos JS/TS rastreados |
| I8   | INFO     | `docs/infra/README.md` presente (este arquivo)                |

---

## 5. Runbooks — Onde encontrar

| Operação                              | Arquivo                                    |
|---------------------------------------|--------------------------------------------|
| GoDaddy: DNS, domínio, renovação      | `docs/infra/prompts/perplexity-godaddy.md` |
| Vercel: domínios, env vars, deploy    | `docs/infra/prompts/perplexity-vercel.md`  |

---

*Env Neo Ltda · CNPJ 36.207.211/0001-47 · Atualizado 2026-02-26*
*Machina custodit. Homo gubernat.*
