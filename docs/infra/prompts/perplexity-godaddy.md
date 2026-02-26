# Prompts Perplexity — Operações GoDaddy
# ════════════════════════════════════════════════════════════════
# Env Neo Ltda · docs/infra/prompts/perplexity-godaddy.md
# ════════════════════════════════════════════════════════════════
#
# USO: Cole o bloco de prompt diretamente no Perplexity Pro (modo Sonar).
#      Cada prompt é autossuficiente — não requer contexto de sessão anterior.
#      Substitua os placeholders em MAIÚSCULAS antes de executar.
#
# QUANDO USAR ESTES PROMPTS:
#  → Após mudança de plataforma de hosting (redirect DNS para novo IP)
#  → Verificação de expiração anual de domínios
#  → Correção de registro DNS após alerta do Vercel ("domain misconfigured")
#  → Rotina de hardening (CAA records, transfer lock)
#
# ════════════════════════════════════════════════════════════════

---

## G1 — Configurar DNS para Vercel (apex + www)

**Trigger:** domínio registrado no GoDaddy, hosting movido para Vercel, ou alerta
"domain misconfigured" no painel Vercel.

**Pré-condição:** Projeto já criado no Vercel e domínio adicionado ao projeto.

```
Preciso configurar o DNS do domínio NOME_DO_DOMINIO no GoDaddy para apontar
para o Vercel. Faça as seguintes operações no painel GoDaddy:

1. Acesse https://dcc.godaddy.com/control/portfolio
2. Localize o domínio NOME_DO_DOMINIO e clique em "Gerenciar DNS"
3. Verifique se existe um registro A para o host "@" (apex).
   - Se existir com valor diferente de 76.76.21.21: edite e altere para 76.76.21.21
   - Se não existir: crie registro A, host "@", valor "76.76.21.21", TTL 600
4. Verifique se existe um registro CNAME para o host "www".
   - Se existir: edite e altere o valor para "cname.vercel-dns.com."
   - Se não existir: crie registro CNAME, host "www", valor "cname.vercel-dns.com.", TTL 600
5. Remova qualquer registro A ou CNAME conflitante para "@" ou "www" que não
   sejam os valores acima.
6. Confirme as alterações e aguarde a tela de sucesso do GoDaddy.

Informe o estado final de cada registro após a conclusão.
```

**Verificação de sucesso:** Vercel painel → Project → Domains → status "Valid Configuration" (pode levar até 48h para propagar, mas geralmente < 10min com nameservers Vercel).

**Rollback:** Se o site sair do ar, restaurar o registro A anterior no GoDaddy.
Valor anterior habitual para Vercel: `76.76.21.21` (não muda). Para outros
hosts, verificar histórico no GoDaddy → DNS → "Ver histórico de alterações".

---

## G2 — Verificar e Ativar Auto-Renovação dos Domínios

**Trigger:** rotina anual preventiva, ou alerta de expiração recebido por e-mail.

```
Preciso verificar o status de renovação dos domínios da Env Neo no GoDaddy.
Realize as seguintes verificações:

1. Acesse https://dcc.godaddy.com/control/portfolio
2. Para cada um dos seguintes domínios, verifique e informe:
   - leoamerico.me
   - envneo.com
   - envneo.com.br
   - govevia.com.br

   Para cada domínio, capture:
   a) Data de expiração atual
   b) Status de auto-renovação (Ativo / Inativo)
   c) Se auto-renovação estiver INATIVA: clique em "Renovação automática" e ative.

3. Se algum domínio expira em menos de 60 dias: informe como alerta crítico
   com a data exata de expiração.

Retorne uma tabela com: Domínio | Data expiração | Auto-renovação | Ação tomada.
```

**Verificação de sucesso:** todos os domínios com auto-renovação "Ativo" e expiração > 60 dias.

**Rollback:** não aplicável — ativar auto-renovação não tem rollback negativo.

---

## G3 — Ativar Bloqueio de Transferência (Transfer Lock)

**Trigger:** hardening de segurança anual, ou suspeita de comprometimento de conta.

```
Preciso ativar o bloqueio de transferência em todos os domínios da Env Neo
no GoDaddy para prevenir transferência não autorizada de domínio.

1. Acesse https://dcc.godaddy.com/control/portfolio
2. Para cada domínio abaixo, verifique o status do "Transfer Lock":
   - leoamerico.me
   - envneo.com
   - envneo.com.br
   - govevia.com.br

3. Para cada domínio onde o Transfer Lock estiver DESATIVADO:
   - Clique no domínio → Configurações → Outras configurações
   - Localize "Transfer lock" e ative
   - Confirme a alteração

4. Retorne uma tabela: Domínio | Transfer Lock anterior | Transfer Lock atual
```

**Verificação de sucesso:** todos os domínios com Transfer Lock ativo.

**Rollback:** desativar transfer lock (necessário apenas para transferência legítima).

---

## G4 — Configurar Registros CAA (Autoridade de Certificado)

**Trigger:** configuração inicial de domínio no Vercel, ou falhas de emissão de SSL.

```
Preciso configurar registros CAA no DNS do domínio NOME_DO_DOMINIO no GoDaddy
para autorizar apenas as CAs que o Vercel utiliza (Let's Encrypt e Sectigo).

1. Acesse https://dcc.godaddy.com/control/portfolio
2. Localize NOME_DO_DOMINIO → Gerenciar DNS
3. Verifique se já existem registros do tipo CAA.
   - Se existirem registros CAA que não sejam "letsencrypt.org" ou "sectigo.com":
     anote e informe antes de qualquer alteração.
   - Se não existirem registros CAA: prossiga para criar.

4. Crie (ou confirme existência de) os seguintes registros CAA:
   - Tipo: CAA | Host: @ | Flag: 0 | Tag: issue | Valor: letsencrypt.org | TTL: 3600
   - Tipo: CAA | Host: @ | Flag: 0 | Tag: issue | Valor: sectigo.com    | TTL: 3600

5. Confirme as alterações.

Informe todos os registros CAA presentes após a conclusão.
```

**Verificação de sucesso:** `dig CAA NOME_DO_DOMINIO` retorna os dois registros acima.

**Rollback:** remover registros CAA adicionados (o domínio voltará a aceitar qualquer CA).

---

## G5 — Verificar Nameservers Ativos

**Trigger:** alerta Vercel "domain not pointing to Vercel", ou dúvida sobre qual
entidade controla o DNS do domínio.

```
Preciso verificar e, se necessário, corrigir os nameservers do domínio
NOME_DO_DOMINIO no GoDaddy para que apontem para o Vercel DNS.

1. Acesse https://dcc.godaddy.com/control/portfolio
2. Clique no domínio NOME_DO_DOMINIO → "Gerenciar DNS"
3. Localize a seção "Nameservers" e informe os valores atuais.

4. Os nameservers corretos para domínios gerenciados pelo Vercel DNS são:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com

5. Se os nameservers atuais forem diferentes dos acima:
   - Clique em "Alterar" na seção Nameservers
   - Selecione "Inserir meus próprios nameservers"
   - Informe os dois valores acima
   - ATENÇÃO: alterar nameservers apaga todos os registros DNS existentes
     no GoDaddy e delega o controle ao Vercel. Confirme se este é o
     comportamento desejado antes de prosseguir.
   - Confirme apenas após minha autorização explícita.

6. Se os nameservers já forem os corretos (ns1/ns2.vercel-dns.com):
   informe "nameservers corretos — nenhuma ação necessária".
```

**Verificação de sucesso:** `dig NS NOME_DO_DOMINIO` retorna `ns1.vercel-dns.com` e `ns2.vercel-dns.com`.

**Rollback:** reverter para nameservers anteriores no GoDaddy (restaura controle DNS ao GoDaddy).
**ATENÇÃO:** mudança de nameservers tem propagação de 24–48h global. Execute em horário de baixo tráfego.

---

*Env Neo Ltda · CNPJ 36.207.211/0001-47 · docs/infra/prompts/perplexity-godaddy.md*
*Versão 1.0 · 2026-02-26 · Gate: bun run audit:infra*
