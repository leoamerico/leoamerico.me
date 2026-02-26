// ============================================================================
// lib/constants.ts — Dados centralizados do site Leo Américo
// Edite este arquivo para atualizar conteúdo sem mexer nos componentes.
//
// ENFORCEMENT — Nome canônico: "Leo Américo"
// Nunca usar "Leonardo Américo" ou "Leonardo" isolado em textos visíveis,
// labels, alt text, metadata, schema.org ou qualquer ponto de contato.
// ============================================================================

export interface ProjectCard {
  category: string;
  title: string;
  description: string;
  impact: string | null;
  features: string[];
  link: string | null;
  linkLabel: string | null;
  badge: string;
  evidence?: { label: string; href: string; icon: string }[];
}

export const SITE = {
  name: "Leo Américo",
  shortName: "Leo Américo",
  title: "Leo Américo — ERP · GRP",
  description:
    "Arquitetura modular construída em dois domínios: Env Neo (ERP) e Govevia (GRP). Um núcleo. Dois domínios. Produzido por quem opera o sistema.",
  url: "https://leoamerico.me",
  locale: "pt-BR",
  email: "sou@leoamerico.me",
  ogImage: "/og-image.png",
};

export const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Plataformas", href: "#resultados" },
  { label: "Código ao vivo", href: "#audit" },
  { label: "ESA Atlas", href: "/atlas/matrix" },
  { label: "Govevia", href: "https://govevia.com.br" },
  { label: "Contato", href: "#contato" },
];

export const HERO = {
  badge: "Uberlândia, MG · Brasil",
  heading: "Leo Américo",
  roles: [
    "ERP · Env Neo — gestão empresarial",
    "GRP · Govevia — gestão pública",
  ],
  paragraph:
    "Software de gestão que valida regras no fonte, se auto-documenta. Um núcleo modular onde o humano define as regras e a arquitetura as executa — a prova está no código ao vivo abaixo.",
  ctaPrimary: { label: "Ver código ao vivo", href: "#audit" },
  ctaSecondary: {
    label: "Substack",
    href: "https://substack.com/@leoamericojr",
  },
  metrics: [
    {
      value: "2",
      label: "domínios. Um núcleo.",
      source: "ERP · GRP",
      href: "#resultados",
    },
    {
      value: "88",
      label: "entidades JPA no kernel do Govevia",
      source: "Verificado → Produção Técnica",
      href: "#audit",
    },
    {
      value: "178",
      label: "casos de uso implementados",
      source: "Java · arquitetura hexagonal",
      href: "#audit",
    },
  ],
};

export const ABOUT = {
  title: "A tese em dois domínios",
  photo: "/photo.jpg",
  paragraphs: [
    "16 anos operando sistemas de gestão no setor público produziram uma arquitetura: um núcleo modular com validação no fonte, que testa e documenta as regras que a pessoa decidiu. Essa experiência é a origem — não o serviço atual.",
    "Em 2024 fundei a <a href=\"https://envneo.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-cyan-400 hover:text-cyan-300 underline underline-offset-2\">Env Neo Ltda</a> para materializar essa arquitetura em dois domínios: Env Neo (ERP) e Govevia (GRP). A IA como instrumento de quem opera — não como substituto do que já está rodando.",
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
        "Não IA como feature colada em processo quebrado. IA que executa as regras que o humano definiu no fonte, gera documentação estruturada sob supervisão — não como camada adicional. O processo limpo é o ponto de partida.",
    },
    {
      icon: "TrendingUp",
      title: "Digitalização orientada a resultado",
      description:
        "O mesmo ciclo aplicado na gestão pública municipal — rastreabilidade, controle por perfil, trilha de auditoria — agora disponível para empresas privadas que querem usar IA como aliada, não como experimento.",
    },
  ],
};

export const STACK = {
  title: "Como o núcleo é construído",
  groups: [
    {
      title: "Domínio",
      techs: ["Java LTS", "Arquitetura Hexagonal", "DDD", "CQRS"],
    },
    {
      title: "Dados",
      techs: ["PostgreSQL", "Row-Level Security", "Oracle DB"],
    },
    {
      title: "Infra",
      techs: ["AWS", "GCP", "Docker"],
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

export const PROJECTS: { title: string; cards: ProjectCard[] } = {
  title: "Dois domínios. Um núcleo.",
  cards: [
    {
      category: "GRP · Gestão Pública · Em produção",
      title: "Govevia",
      description:
        "Obrigações normativas (TCE, LGPD, transparência) transformadas em controles técnicos verificáveis. Multi-tenant com Row-Level Security por município. Trilhas de auditoria com verificação criptográfica. Desenvolvida pela Env Neo Ltda.",
      impact: null,
      features: [
        "88 entidades JPA no kernel do Govevia",
        "178 casos de uso implementados",
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
        "Compartilha núcleo técnico com GRP",
      ],
      link: "https://envneo.com.br",
      linkLabel: "envneo.com.br",
      badge: "ERP",
    },
  ],
};

export const GOVEVIA_STATS = {
  title: "Govevia em números",
  /** Dados editoriais — escopo da plataforma definido pela equipe. Não são métricas de código. */
  lastUpdated: "2026-02",
  subtitle:
    "Capacidades da plataforma GRP verificáveis no repositório privado.",
  compliance: [
    {
      label: "LAI — Lei de Acesso à Informação",
      year: "Lei 12.527 / 2011",
      note: "Controles de transparência pública implementados como regra técnica",
    },
    {
      label: "LGPD — Lei Geral de Proteção de Dados",
      year: "Lei 13.709 / 2018",
      note: "Políticas de privacidade e consentimento no fonte, não em documentos",
    },
  ],
  metrics: [
    {
      value: "7",
      label: "Módulos integrados",
      sublabel: "Orçamento · Tributário · RH · Protocolo · Patrimônio · Contratos · Transparência",
      visual: "modules",
      color: "cyan",
    },
    {
      value: "12",
      label: "Capacidades canônicas",
      sublabel: "Operações de domínio com regra declarativa, testada e auditável",
      visual: "dots",
      color: "emerald",
    },
    {
      value: "12",
      label: "Personas atendidas",
      sublabel: "Prefeito · Secretário · Fiscal · Contador · Jurídico · Cidadão e mais",
      visual: "personas",
      color: "violet",
    },
    {
      value: "100%",
      label: "Trilha auditável",
      sublabel: "Toda operação registrada com hash · timestamp · usuário responsável",
      visual: "ring",
      color: "amber",
    },
  ],
};

// ---------------------------------------------------------------------------
// Control Plane — dados para o painel de governança executável
// Fonte: enforcement-registry.yaml (E1–E13) + ADR-036 (E-META-1..6)
// ---------------------------------------------------------------------------
export const CONTROL_PLANE = {
  title: "Control Plane em Números",
  subtitle:
    "Governança executável: toda regra é um gate CI/DB/Runtime, não uma disciplina humana.",
  lastUpdated: "2026-02",

  // Gráfico 1 — Enforcements por Mecanismo
  byMechanism: [
    { label: "ArchUnit (build)",     count: 3,  color: "cyan"    },
    { label: "DB Trigger (runtime)", count: 3,  color: "emerald" },
    { label: "GitHub Actions",       count: 2,  color: "violet"  },
    { label: "Runtime Guard",        count: 3,  color: "amber"   },
    { label: "Script CI Gate",       count: 2,  color: "cyan"    },
    { label: "ADR + PR Review",      count: 6,  color: "emerald" },
  ],

  // Gráfico 2 — Maturidade dos ADRs (fonte: DOC-CATALOG.yaml · fev/2026)
  adrStatus: [
    { label: "Accepted/Active", count: 171, color: "emerald" },
    { label: "Archived",        count: 53,  color: "slate"   },
    { label: "Deprecated",      count: 4,   color: "amber"   },
    { label: "Draft",           count: 3,   color: "violet"  },
  ],

  // Gráfico 3 — Invariantes de migration ativos
  invariants: [
    { id: "INV-1", label: "Row-Level Security (RLS)",        adr: "ADR-021", active: true },
    { id: "INV-3", label: "Rollback declarado",              adr: "ADR-015", active: true },
    { id: "INV-5", label: "Classificação LGPD",              adr: "ADR-014", active: true },
    { id: "INV-7", label: "Append-Only (evidence tables)",   adr: "ADR-036", active: true },
  ],

  // Gráfico 4 — Meta-Enforcements E-META-1..6 (Control Plane, ADR-036)
  metaEnforcements: [
    { id: "E-META-1", label: "Singularidade de Autoridade",  implemented: true },
    { id: "E-META-2", label: "Gates CI-Verificáveis",        implemented: true },
    { id: "E-META-3", label: "DAG GRP → ERP → ESA",         implemented: true },
    { id: "E-META-4", label: "truth_source obrigatório",     implemented: true },
    { id: "E-META-5", label: "Append-Only por Default",      implemented: true },
    { id: "E-META-6", label: "Rastreabilidade ADR ↔ Código", implemented: true },
  ],

  // Totais para headline cards
  totals: {
    enforcements: 19,   // E1–E13 (13) + E-META-1..6 (6)
    adrs: 231,          // 171 active + 53 archived + 4 deprecated + 3 draft
    migrations: 27,
    invariants: 4,
    ciGates: 2,         // governance-gates.yml jobs
    worlds: 3,
  },
};

export const CERTIFICATIONS = {
  title: "Certificações e Formação",
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
      href: "https://govevia.com.br",
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
  copy: `© ${new Date().getFullYear()} Leo Américo · leoamerico.me`,
  builtWith: "Feito com Next.js · Hosted on Vercel",
};
