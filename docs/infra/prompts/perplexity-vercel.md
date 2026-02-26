# Prompts Perplexity — Operações Vercel
# ════════════════════════════════════════════════════════════════
# Env Neo Ltda · docs/infra/prompts/perplexity-vercel.md
# ════════════════════════════════════════════════════════════════
#
# USO: Cole o bloco de prompt diretamente no Perplexity Pro (modo Sonar).
#      Cada prompt é autossuficiente — não requer contexto de sessão anterior.
#      Substitua os placeholders em MAIÚSCULAS antes de executar.
#
# QUANDO USAR ESTES PROMPTS:
#  → Após push que não disparou deploy automático
#  → Configuração de variável de ambiente (CEO_SECRET, VAULT_SECRET, etc.)
#  → Domínio com status "Invalid Configuration" no Vercel
#  → Reverter para um deploy anterior em emergência
#  → Verificar que HSTS/CSP estão ativos no domínio de produção
#
# PROJETOS VERCEL DA ENV NEO:
#   leoamerico-me  → leoamerico.me
#   envneo         → envneo.com · envneo.com.br
#   govevia-site   → govevia.com.br
#
# ════════════════════════════════════════════════════════════════

---

## V1 — Adicionar ou Atualizar Variável de Ambiente

**Trigger:** nova var identificada em `.env.example`, ou CEO_SECRET/VAULT_SECRET
precisa ser rotacionada.

```
Preciso adicionar (ou atualizar) uma variável de ambiente no projeto Vercel
NOME_DO_PROJETO para o ambiente de produção.

1. Acesse https://vercel.com/leoamerico/NOME_DO_PROJETO/settings/environment-variables
2. Verifique se a variável NOME_DA_VARIAVEL já existe.
   - Se existir: clique nos três pontos → Edit → atualize o valor → Save.
   - Se NÃO existir: clique em "Add New" e preencha:
     * Name:         NOME_DA_VARIAVEL
     * Value:        VALOR_DA_VARIAVEL
     * Environments: marque apenas "Production" (não marcar Preview nem Development)
     * Sensitive:    sim (ativar para ocultar o valor após salvar)
3. Após salvar, confirme que a variável aparece na lista com o ambiente "Production".
4. Para que a mudança entre em vigor, é necessário um novo deploy. Acesse:
   https://vercel.com/leoamerico/NOME_DO_PROJETO/deployments
   Clique no deploy mais recente → "Redeploy" → confirme sem alterações de source.
5. Informe o status do redeploy: se concluiu com sucesso ("Ready") ou falhou.
```

**Variáveis críticas por projeto:**
- `leoamerico-me`: `GITHUB_TOKEN`, `CEO_PASSPHRASE_HASH`, `CEO_TOTP_SEED`, `CEO_SESSION_SECRET`
- `envneo`: `CEO_SECRET`, `CEO_SALT`, `CEO_PASSWORD_HASH`, `VAULT_SECRET`, `VAULT_SALT`, `VAULT_PASSWORD_HASH`
- `govevia-site`: (sem vars externas atualmente)

**Verificação de sucesso:** variável listada no painel com ambiente "Production"; redeploy com status "Ready".

**Rollback:** remover a variável adicionada e fazer novo redeploy.

---

## V2 — Adicionar Domínio ao Projeto Vercel

**Trigger:** domínio recém-registrado no GoDaddy precisa ser conectado ao Vercel,
ou subdomínio `www` não está redirecionando para o apex.

```
Preciso adicionar o domínio NOME_DO_DOMINIO ao projeto Vercel NOME_DO_PROJETO.

1. Acesse https://vercel.com/leoamerico/NOME_DO_PROJETO/domains
2. No campo "Add Domain", digite NOME_DO_DOMINIO e clique em "Add".
3. O Vercel vai mostrar uma tela de verificação DNS. Informe exatamente:
   - O tipo de registro solicitado (A ou CNAME)
   - O valor de destino fornecido pelo Vercel
4. Verifique o status atual do domínio:
   - "Valid Configuration" → domínio funcionando.
   - "Invalid Configuration" → DNS ainda não propagado ou configuração incorreta.
     Informe a mensagem de erro exata mostrada pelo Vercel.
5. Se o status for "Invalid Configuration" e o DNS já foi configurado no GoDaddy,
   considere que a propagação pode levar até 48h. Informe a data/hora do status.

Não altere nenhuma configuração sem minha confirmação prévia.
```

**Verificação de sucesso:** status "Valid Configuration" + SSL emitido automaticamente pelo Vercel.

**Rollback:** remover o domínio do projeto Vercel (o domínio no GoDaddy não é afetado).

---

## V3 — Verificar e Forçar Redeploy

**Trigger:** código enviado ao GitHub mas deploy não disparou, ou deploy com
status "Error" após push normal.

```
Preciso verificar o status dos deploys recentes do projeto Vercel NOME_DO_PROJETO
e, se necessário, forçar um novo deploy.

1. Acesse https://vercel.com/leoamerico/NOME_DO_PROJETO/deployments
2. Liste os 3 deploys mais recentes informando:
   - Commit hash (se disponível)
   - Status: Ready, Building, Error, Canceled
   - Data e hora
3. Se o deploy mais recente estiver com status "Error":
   a) Clique no deploy com erro
   b) Acesse a aba "Build Logs"
   c) Role até o final e copie as últimas 30 linhas do log de erro
   d) Informe o texto exato sem resumir
4. Se nenhum deploy foi disparado após o último push:
   a) Verifique em https://vercel.com/leoamerico/NOME_DO_PROJETO/settings/git
      se o repositório GitHub está conectado ao branch "main"
   b) Informe o status da conexão
5. Para forçar um redeploy sem alteração de código:
   Clique no deploy mais recente → "Redeploy" → desmarque "Use existing
   Build Cache" → confirme.
```

**Verificação de sucesso:** deploy com status "Ready" e URL de produção acessível.

**Rollback:** clicar no deploy anterior em estado "Ready" → "Promote to Production".

---

## V4 — Reverter para Deploy Anterior (Emergency Rollback)

**Trigger:** deploy introduziu regressão crítica que não pode ser revertida via
código imediatamente.

```
EMERGÊNCIA: preciso reverter o site NOME_DO_PROJETO para o deploy anterior
com urgência. O deploy atual está causando DESCREVER_O_PROBLEMA.

1. Acesse https://vercel.com/leoamerico/NOME_DO_PROJETO/deployments
2. Localize o último deploy com status "Ready" ANTES do deploy problemático.
   Não clique em nenhum deploy ainda — apenas informe:
   a) O commit hash do deploy problemático (atual)
   b) O commit hash do deploy anterior estável
   c) A diferença de tempo entre os dois
3. AGUARDE minha confirmação antes de prosseguir.
4. Após confirmação: clique no deploy anterior estável → "Promote to Production"
   → confirme na tela de diálogo.
5. Informe o status final: URL de produção voltou a servir o conteúdo anterior.
```

**ATENÇÃO:** Esta operação altera o que é servido em produção imediatamente.
Não executar sem confirmação explícita do fundador.

**Verificação de sucesso:** URL de produção serve o conteúdo do deploy anterior.

**Rollback do rollback:** repetir o processo promovendo o deploy mais recente.

---

## V5 — Verificar Headers de Segurança em Produção

**Trigger:** rotina de segurança, após mudança em `next.config.mjs`, ou alerta
de ferramenta de security scan (SecurityHeaders.com, Mozilla Observatory).

```
Preciso verificar se os headers de segurança estão corretos no domínio
NOME_DO_DOMINIO em produção.

Faça as seguintes verificações usando a URL https://NOME_DO_DOMINIO:

1. Acesse https://securityheaders.com/?q=NOME_DO_DOMINIO&followRedirects=on
   e informe:
   - A nota geral (A+, A, B, C, D, E, F)
   - Quais headers estão AUSENTES (marcados em vermelho)
   - Quais headers estão PRESENTES

2. Os headers obrigatórios para todos os sites da Env Neo são:
   - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Content-Security-Policy: (deve conter frame-ancestors 'none')
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin

3. Se algum header obrigatório estiver ausente, informe exatamente qual e
   qual foi o valor encontrado (se diferente do esperado).

NÃO altere nenhuma configuração — apenas reporte o estado atual.
```

**Verificação de sucesso:** nota A+ no SecurityHeaders.com; todos os 6 headers obrigatórios presentes.

**Ação corretiva:** editar `next.config.mjs` no repositório, commitar e aguardar deploy.

---

## V6 — Configurar Subdomínio CEO no Vercel (envneo)

**Trigger:** subdomínio `ceo.envneo.com.br` precisa ser configurado para apontar
para o projeto `envneo` no Vercel.

```
Preciso configurar o subdomínio ceo.envneo.com.br no projeto Vercel "envneo".

1. Acesse https://vercel.com/leoamerico/envneo/domains
2. Adicione o domínio "ceo.envneo.com.br" (se não existir).
   O Vercel vai fornecer o registro DNS necessário — informe exatamente:
   - Tipo (quase certamente CNAME)
   - Host (ceo)
   - Valor de destino

3. No GoDaddy, configure o registro DNS informado pelo Vercel:
   - Domínio: envneo.com.br
   - Tipo: CNAME
   - Host: ceo
   - Valor: [o fornecido pelo Vercel]
   - TTL: 600

4. Aguarde propagação (normalmente < 10 minutos com Vercel DNS) e verifique
   o status no painel Vercel.

5. Confirme que o subdomínio ceo.envneo.com.br retorna o painel CEO
   (não a página pública) após login.
```

**Verificação de sucesso:** `ceo.envneo.com.br` → redirect para `/ceo/login` sem sessão → painel após autenticação.

**Rollback:** remover o domínio `ceo.envneo.com.br` do projeto Vercel e o registro CNAME do GoDaddy.

---

*Env Neo Ltda · CNPJ 36.207.211/0001-47 · docs/infra/prompts/perplexity-vercel.md*
*Versão 1.0 · 2026-02-26 · Gate: bun run audit:infra*
