// ============================================================================
// lib/constants.ts — Dados centralizados do site Leonardo Américo
// Edite este arquivo para atualizar conteúdo sem mexer nos componentes.
// ============================================================================

export const SITE = {
  name: "Leonardo Américo",
  shortName: "Leo Américo",
  title: "Leonardo Américo — ERP · GRP · ERA",
  description:
    "Arquitetura modular AI-first em três domínios: Env Neo (ERP), Govevia (GRP) e Envlive (ERA). Um núcleo. Três instâncias. Produzido por quem opera o sistema.",
  url: "https://leoamerico.me",
  locale: "pt-BR",
  email: "sou@leoamerico.me",
  ogImage: "/og-image.png",
};

export const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Plataformas", href: "#resultados" },
  { label: "Código ao vivo", href: "#audit" },
  { label: "Govevia", href: "https://govevia.com.br" },
  { label: "Contato", href: "#contato" },
];

export const HERO = {
  badge: "Uberlândia, MG · Brasil",
  heading: "Leonardo Américo",
  roles: [
    "ERP · Env Neo — gestão empresarial",
    "GRP · Govevia — gestão pública",
    "ERA · Envlive — corretagem e agenciamento",
  ],
  paragraph:
    "Um núcleo modular AI-first. Três instâncias de domínio. O sistema se auto-regula, testa e documenta — a prova está no código ao vivo abaixo.",
  ctaPrimary: { label: "Ver código ao vivo", href: "#audit" },
  ctaSecondary: {
    label: "Substack",
    href: "https://substack.com/@leoamericojr",
  },
  metrics: [
    {
      value: "3",
      label: "domínios. Um núcleo.",
      source: "ERP · GRP · ERA",
      href: "#resultados",
    },
    {
      value: "88+",
      label: "entidades JPA no govevia-kernel",
      source: "Verificado → Produção Técnica",
      href: "#audit",
    },
    {
      value: "178+",
      label: "casos de uso implementados",
      source: "Java · arquitetura hexagonal",
      href: "#audit",
    },
  ],
};

export const ABOUT = {
  title: "A tese em três domínios",
  photo: "/photo.svg",
  paragraphs: [
    "15 anos operando sistemas de gestão no setor público produziram uma arquitetura: um núcleo modular com validação no fonte, que se auto-regula, testa e documenta. Essa experiência é a origem — não o serviço atual.",
    "Em 2024 fundei a Env Neo Ltda para materializar essa arquitetura em três instâncias: Env Neo (ERP), Govevia (GRP) e Envlive (ERA multi-agentes). A transição de SaaS para IA-first é a condição técnica do que já está rodando.",
    "Bacharel em Sistemas de Informação, membro ativo do PMI.",
  ],
  location: "Uberlândia, MG · Brasil",
  remote: "Brasil",
  education: [
    "Bacharel em Sistemas de Informação — Faculdade CNEC Unaí (2010)",
  ],
};

export const EXPERTISE = {
  title: "O que consigo recuperar antes que se perca",
  cards: [
    {
      icon: "Archive",
      title: "Lógica de negócio antes da migração",
      description:
        "Sistemas legados guardam regras que nenhum documento registrou. Quando a empresa troca de plataforma — ou adota IA — essa lógica desaparece junto. Estruturo e transponho antes da perda: processos, validações, políticas e dependências ocultas viram arquitetura verificável.",
    },
    {
      icon: "FileCode",
      title: "Processo como contrato técnico",
      description:
        "O que hoje é um documento Word ou uma planilha de RH vira BPMN, ADR ou POLÍTICA no fonte. A regra deixa de viver na cabeça de quem sabe — e passa a ser testada, auditada e documentada automaticamente pelo próprio sistema.",
    },
    {
      icon: "Cpu",
      title: "IA como parte da operação",
      description:
        "Não IA como feature colada em processo quebrado. IA que valida regras no fonte, gera documentação estruturada e se auto-regula como infra — não como camada adicional. A transição de SaaS para IA-first começa com o processo limpo.",
    },
    {
      icon: "TrendingUp",
      title: "Digitalização orientada a resultado",
      description:
        "O mesmo ciclo que estruturou gestão pública em 60+ municípios — rastreabilidade, controle por perfil, trilha de auditoria — agora aplicado a empresas privadas que querem usar IA como aliada, não como experimento.",
    },
  ],
};

export const STACK = {
  title: "Como o núcleo é construído",
  groups: [
    {
      title: "Domínio",
      techs: ["Java 21", "Arquitetura Hexagonal", "DDD", "CQRS"],
    },
    {
      title: "Dados",
      techs: ["PostgreSQL", "Row-Level Security", "Oracle DB"],
    },
    {
      title: "Infra",
      techs: ["AWS", "GCP", "Oracle Cloud", "Docker"],
    },
    {
      title: "Frontends",
      techs: ["Next.js", "React", "Node.js"],
    },
    {
      title: "Qualidade",
      techs: ["BPMN 2.0", "ADR", "POLICY-", "ArchUnit"],
    },
  ],
};

export const PROJECTS = {
  title: "Três domínios. Um núcleo.",
  cards: [
    {
      category: "GRP · Gestão Pública · Em produção",
      title: "Govevia",
      description:
        "Obrigações normativas (TCE, LGPD, transparência) transformadas em controles técnicos verificáveis. Multi-tenant com Row-Level Security por município. Trilhas de auditoria com verificação criptográfica. Desenvolvida pela Env Neo Ltda.",
      impact: null,
      features: [
        "88 entidades JPA no govevia-kernel",
        "178+ casos de uso implementados",
        "Arquitetura hexagonal com ArchUnit",
        "ADRs e POLICYs como estrutura do código",
      ],
      link: "https://govevia.com.br",
      linkLabel: "govevia.com.br",
      badge: "GRP",
    },
    {
      category: "ERP · Gestão Empresarial",
      title: "Env Neo",
      description:
        "Núcleo de gestão empresarial com a mesma base modular do GRP. Processos, contratos, documentos e fluxos financeiros com validação declarativa no fonte. Env Neo Ltda, CNPJ 36.207.211/0001-47.",
      impact: null,
      features: [
        "API com validação no fonte",
        "Controle de acesso por perfil e organização",
        "Documentação gerada como saída operacional",
        "Compartilha shared-kernel com GRP e ERA",
      ],
      link: "https://envneo.com.br",
      linkLabel: "envneo.com.br",
      badge: "ERP",
    },
    {
      category: "ERA · Multi-Agentes · Corretagem e Agenciamento",
      title: "Envlive",
      description:
        "Credenciamento, engajamento e ciclos de contrato entre empresas e profissionais. A mesma lógica de auditoria e controle do ERP e GRP aplicada a agenciamento — com IA para match, proposta e avaliação.",
      impact: null,
      features: [
        "Agenciamento multi-agente com ciclo rastreable",
        "Credenciamento com validação e auditoria",
        "Integração via shared-kernel",
        "IA aplicada a match e avaliação de agentes",
      ],
      link: null,
      linkLabel: null,
      badge: "ERA",
    },
  ],
};

export const CERTIFICATIONS = {
  title: "Formação & Credenciais",
  items: [
    {
      title: "Membro PMI — Project Management Institute",
      org: "PMI · Membro ativo verificável",
      detail: "Membro ativo com experiência documentada em projetos de sistema — base para elegibilidade PMP",
      link: "https://community.pmi.org/profile/leoamericojr",
      status: "active",
      docs: [
        { label: "Certificado de Membro", href: "/pmi/pmi-member-certificate.pdf" },
        { label: "Cartão Membro", href: "/pmi/pmi-member-card.pdf" },
      ],
    },
    {
      title: "Bacharel em Sistemas de Informação",
      org: "Faculdade CNEC Unaí · 2010",
      detail: "Diploma digital com verificação MEC/ICP-Brasil",
      link: "#diploma",
      status: "Concluído",
    },
  ],
};

export const CONTACT = {
  title: "Contato",
  subtitle:
    "Canais diretos.",
  links: [
    {
      label: "WhatsApp",
      href: "https://wa.me/5534984228457",
      icon: "MessageCircle",
    },
    {
      label: "E-mail",
      href: "mailto:sou@leoamerico.me",
      icon: "Mail",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/leoamericojr",
      icon: "Linkedin",
    },
    {
      label: "Govevia",
      href: "https://govevia.com",
      icon: "Globe",
    },
    {
      label: "GitHub",
      href: "https://github.com/leoamerico",
      icon: "Github",
    },
    {
      label: "Substack",
      href: "https://substack.com/@leoamericojr",
      icon: "BookOpen",
    },
  ],
};

export const DIPLOMA = {
  title: "Diploma Digital",
  degree: "Bacharel em Sistemas de Informação",
  course: "Sistemas de Informação",
  degreeType: "Bacharelado · Modalidade Presencial",
  institution: "Faculdade CNEC Unaí",
  institutionLocation: "Unaí, MG · Código MEC: 1070",
  registrar: "Universidade Tuiuti do Paraná",
  registrarLocation: "Curitiba, PR · Código MEC: 355",
  conclusionDate: "18 de dezembro de 2010",
  graduationDate: "31 de maio de 2011",
  registrationDate: "04 de dezembro de 2023",
  bookNumber: "3",
  registrationNumber: "10554",
  validationCode: "1070.355.640eebc868a1",
  verifyUrl: "https://diplomadigital.mec.gov.br/",
  pdfUrl: "/diploma/diploma-sistemas-informacao.pdf",
  xmlUrl: "/diploma/diploma-sistemas-informacao.xml",
};

export const FOOTER = {
  copy: `© ${new Date().getFullYear()} Leonardo Américo · leoamerico.me`,
  builtWith: "Feito com Next.js · Hosted on Vercel",
};
