// ============================================================================
// lib/constants.ts — Dados centralizados do site Leonardo Américo
// Edite este arquivo para atualizar conteúdo sem mexer nos componentes.
// ============================================================================

export const SITE = {
  name: "Leonardo Américo",
  shortName: "Leo Américo",
  title: "Leonardo Américo — Gestão Pública Digital",
  description:
    "Gestão pública digital em prática desde 2010. 60+ municípios, 2.610 horas documentadas no PMI, fundador da Govevia. Escreve no Substack sobre o que aprende em campo.",
  url: "https://leoamerico.me",
  locale: "pt-BR",
  email: "sou@leoamerico.me",
  ogImage: "/og-image.png",
};

export const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Prática", href: "#servicos" },
  { label: "Trabalho", href: "#resultados" },
  { label: "Produção técnica", href: "#audit" },
  { label: "Govevia", href: "https://govevia.com" },
  { label: "Contato", href: "#contato" },
];

export const HERO = {
  badge: "Uberlândia, MG · Brasil",
  heading: "Leonardo Américo",
  roles: [
    "Gestão pública digital em prática desde 2010",
    "Fundador da Govevia",
    "Escreve sobre o que aprende em campo",
  ],
  paragraph:
    "60+ municípios em MG, SP, RS e BA. 2.610 horas documentadas no PMI. O que aprendo está publicado no Substack e no GitHub.",
  ctaPrimary: { label: "Substack", href: "https://substack.com/@leoamericojr" },
  ctaSecondary: {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/leoamericojr",
  },
  metrics: [
    {
      value: "15+",
      label: "anos em gestão pública digital",
      source: "Desde 2010",
      href: "#credenciais",
    },
    {
      value: "60+",
      label: "municípios, câmaras e autarquias atendidos",
      source: "MG · SP · RS · BA",
      href: "#resultados",
    },
    {
      value: "70%",
      label: "redução de papel documentada",
      source: "Amparo Digital — Sonner Sistemas",
      href: "https://www.youtube.com/watch?v=Egp92Tqmdok",
      external: true,
    },
  ],
};

export const ABOUT = {
  title: "Quem é Leo Américo",
  photo: "/photo.svg",
  paragraphs: [
    "Trabalho com prefeituras desde 2010. Implantei sistemas em mais de 60 municípios entre MG, SP, RS e BA — migrando bases legadas, adequando processos ao TCE, documentando o que funcionou e o que não funcionou.",
    "Em 2024 fundei a Govevia, uma plataforma de gestão pública construída a partir dessa experiência de campo.",
    "Bacharel em Sistemas de Informação e membro ativo do PMI, com 2.610 horas documentadas em 19 projetos municipais.",
  ],
  location: "Uberlândia, MG · Brasil",
  remote: "Brasil",
  education: [
    "Bacharel em Sistemas de Informação — Faculdade CNEC Unaí (2010)",
  ],
};

export const EXPERTISE = {
  title: "Prática",
  cards: [
    {
      icon: "Building2",
      title: "Implantação de sistemas GRP",
      description:
        "Atuei em mais de 60 implantações de sistemas de gestão pública. O padrão encontrado: dados fragmentados, bases legadas sem documentação, equipes sem treinamento formal. O que aprendi nesse ciclo está publicado.",
    },
    {
      icon: "ShieldCheck",
      title: "Conformidade com Tribunais de Contas",
      description:
        "Adequação de processos às exigências do TCE em múltiplos estados — MG, SP, RS e BA. Cada estado tem suas próprias regras. O acerto aqui vem de conhecer as diferenças na prática, não no papel.",
    },
    {
      icon: "Monitor",
      title: "Digitalização de serviços públicos",
      description:
        "Protocolo, alvará, IPTU, nota fiscal eletrônica — processos que na maioria das prefeituras ainda dependem de papel e fila. A experiência mais documentada nessa área é o Projeto Amparo Digital (Sonner Sistemas).",
    },
    {
      icon: "Database",
      title: "Migração de bases legadas",
      description:
        "Oracle, SQL Server, sistemas proprietários sem documentação — esse é o estado real da maioria das prefeituras ao trocar de sistema. Trabalhei com esse tipo de migração em dezenas de municípios.",
    },
  ],
};

export const STACK = {
  title: "Como construo",
  groups: [
    {
      title: "Infraestrutura",
      techs: ["AWS", "GCP", "Oracle Cloud", "Docker", "Linux"],
    },
    {
      title: "Dados",
      techs: ["PostgreSQL", "Oracle DB"],
    },
    {
      title: "Plataforma",
      techs: ["Java", "React", "Next.js", "Node.js"],
    },
    {
      title: "Processos",
      techs: ["BPMN 2.0"],
    },
  ],
};

export const PROJECTS = {
  title: "Trabalho",
  cards: [
    {
      category: "Implantação consultiva · 2020–2025",
      title: "Amparo Digital — Sonner Sistemas",
      description:
        "Atuei como consultor técnico na implantação do Projeto Amparo Digital, conduzido pela Sonner Sistemas. Segundo os dados divulgados pela Sonner Sistemas, o projeto abrangeu mais de 30 serviços públicos digitalizados e reduziu em 70% o uso de papel, com automação de processos internos via BPMN 2.0.",
      impact:
        "Redução do tempo médio de atendimento e eliminação de filas para serviços básicos — resultados documentados e publicados pela Sonner Sistemas nos vídeos e post abaixo.",
      features: null,
      link: "https://www.youtube.com/watch?v=Egp92Tqmdok",
      linkLabel: "Ver vídeo institucional (Sonner Sistemas)",
      badge: "Consultoria técnica",
      evidence: [
        {
          label: "Vídeo do projeto — publicado pela Sonner Sistemas",
          href: "https://www.youtube.com/watch?v=Egp92Tqmdok",
          icon: "Youtube",
        },
        {
          label: "Segundo vídeo — publicado pela Sonner Sistemas",
          href: "https://www.youtube.com/watch?v=7L_t_aBcR-w",
          icon: "Youtube",
        },
        {
          label: "Validação pública — post da Sonner Sistemas no LinkedIn",
          href: "https://www.linkedin.com/posts/sonner-sistemas_sonner-transformaaexaetodigital-caseamparo-activity-7378549132732469248-ek0Y",
          icon: "Linkedin",
        },
      ],
    },
    {
      category: "Plataforma própria · Em operação",
      title: "Govevia — Plataforma de Gestão Pública",
      description:
        "Plataforma de Gestão de Recursos Públicos desenvolvida a partir de 15 anos de experiência em campo. Construída para resolver os problemas reais que encontrei em dezenas de implantações: dados fragmentados, falta de rastreabilidade, dependência de planilhas e risco de não-conformidade.",
      impact: null,
      features: [
        "Isolamento de dados por município (multi-tenant com Row-Level Security)",
        "Trilhas de auditoria com verificação criptográfica",
        "Conformidade nativa com exigências de Tribunais de Contas",
        "Arquitetura em nuvem com alta disponibilidade",
      ],
      link: "https://govevia.com",
      linkLabel: "Conhecer a Govevia",
      badge: "Em operação",
    },
    {
      category: "Serviço de consultoria",
      title: "Arquitetura Cloud para o Setor Público",
      description:
        "Migração e modernização de infraestrutura de TI para prefeituras que precisam sair de servidores locais, reduzir custos com licenciamento e ganhar segurança. Trabalho com AWS, GCP e Oracle Cloud.",
      impact: null,
      features: null,
      link: null,
      linkLabel: null,
      badge: "Consultoria",
    },
  ],
};

export const CERTIFICATIONS = {
  title: "Formação & Credenciais",
  items: [
    {
      title: "Membro PMI — Project Management Institute",
      org: "PMI · Membro ativo verificável",
      detail: "2.610 horas documentadas em 19 projetos municipais — base para elegibilidade PMP",
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
