// lib/structured-data.ts
//
// SSOT para dados estruturados JSON-LD do site pessoal.
//
// Decisões arquiteturais:
//   - `sameAs` inclui govevia.com.br como referência cruzada de E-E-A-T.
//     O Google usa esse sinal para conectar a pessoa ao produto que ela fundou.
//   - `worksFor` aponta para a organização ($id do govevia-site).
//     Garante que o Knowledge Graph do Google associa Leo Américo à Env Neo Ltda.
//   - `jobTitle` reflete o cargo real público. Alternar apenas com comprovável.
import { SITE_URL } from "./site-url";

const GOVEVIA_ORG_ID = "https://govevia.com.br/#organization";
const ENVNEO_HOLDING_URL = "https://www.envneo.com.br";

export const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Leonardo Américo José Ribeiro",
      alternateName: "Leo Américo",
      url: SITE_URL,
      // Cross-domain sameAs: conecta a pessoa ao produto e à rede profissional.
      // Cada URL é uma câmara de eco de credibilidade para o Google E-E-A-T.
      sameAs: [
        SITE_URL,
        "https://github.com/leoamerico",
        "https://www.linkedin.com/in/leoamericojr",
        "https://govevia.com.br",
        ENVNEO_HOLDING_URL,
      ],
      jobTitle: "CEO & Founder",
      // worksFor conecta a pessoa à organização no Knowledge Graph.
      // Usa o @id do govevia-site para não duplicar a entidade.
      worksFor: {
        "@type": "Organization",
        "@id": GOVEVIA_ORG_ID,
        name: "Env Neo Ltda.",
        url: "https://govevia.com.br",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Leo Américo",
      inLanguage: "pt-BR",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
} as const;
