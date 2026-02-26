# leoamerico.me

Landing page pessoal e profissional de **Leonardo Américo José Ribeiro** — Cloud Solutions Architect, especialista em Transformação Digital e Gerente de Projetos PMP.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion
- **Ícones:** Lucide React + React Icons
- **Fontes:** Inter + Sora (Google Fonts via next/font)
- **Deploy:** Vercel

## Estrutura

```
app/
  layout.tsx          # Layout raiz com SEO metadata
  page.tsx            # Página principal (single page)
  globals.css         # Estilos globais + Tailwind
  icon.svg            # Favicon
  opengraph-image.tsx # OG image dinâmica
components/
  Navbar.tsx          # Navegação fixa com glassmorphism
  Hero.tsx            # Seção principal com typewriter
  About.tsx           # Sobre + foto + formação
  Expertise.tsx       # Grid de especialidades
  Stack.tsx           # Badges de tecnologias
  Projects.tsx        # Cards de projetos
  Certifications.tsx  # Certificações e formação
  Contact.tsx         # Formulário + links de contato
  Footer.tsx          # Rodapé
lib/
  constants.ts        # Todos os dados centralizados
public/
  photo.svg           # Placeholder da foto (substituir)
  projects/           # Imagens dos projetos
```

## Instalação

```bash
# Clone o repositório
git clone https://github.com/leoamerico/leoamerico.me.git
cd leoamerico.me

# Instale as dependências
npm install

# Rode em modo de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Build para produção

```bash
npm run build
npm start
```

## Deploy na Vercel

O projeto é compatível com deploy direto na Vercel sem configuração adicional. Basta conectar o repositório GitHub na Vercel.

## Personalização

Todos os textos, links e métricas estão centralizados em `lib/constants.ts`. Para atualizar:

1. **Foto**: Substitua `public/photo.svg` por sua foto real (JPG/PNG) e atualize o path em `lib/constants.ts`
2. **Textos**: Edite `lib/constants.ts`
3. **Cores**: Edite `tailwind.config.ts` e `app/globals.css`

## Links

- **Site:** [leoamerico.me](https://leoamerico.me)
- **GitHub:** [github.com/leoamerico](https://github.com/leoamerico)
- **LinkedIn:** [linkedin.com/in/leoamericojr](https://www.linkedin.com/in/leoamericojr)
- **Substack:** [substack.com/@leoamericojr](https://substack.com/@leoamericojr)

## Licença

MIT © Leonardo Américo
Site Pessoal
