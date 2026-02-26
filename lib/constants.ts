// ============================================================================
// lib/constants.ts — Dados centralizados do site Leonardo Américo
// Edite este arquivo para atualizar conteúdo sem mexer nos componentes.
// ============================================================================

export const SITE = {
  name: "Leonardo Américo",
  shortName: "Leo Américo",
  title: "Leonardo Américo — Gestão Pública Digital",
  description:
    "15 anos implantando sistemas em prefeituras, câmaras e autarquias. Fundador da Govevia. Para clientes e parceiros que querem saber com quem estão negociando.",
  url: "https://leoamerico.me",
  locale: "pt-BR",
  email: "sou@leoamerico.me",
  ogImage: "/og-image.png",
};

export const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "O que faço", href: "#servicos" },
  { label: "Resultados", href: "#resultados" },
  { label: "Produção técnica", href: "#audit" },
  { label: "Govevia", href: "https://govevia.com" },
  { label: "Contato", href: "#contato" },
];

export const HERO = {
  badge: "Uberlândia, MG · Atendimento em todo o Brasil",
  heading: "Leonardo Américo",
  roles: [
    "Especialista em Gestão Pública Digital",
    "Fundador da Govevia",
    "15 anos implantando sistemas em prefeituras",
  ],
  paragraph:
    "Trabalho com transformação digital no setor público desde 2010. Este site existe para que clientes e parceiros possam conhecer minha trajetória, os projetos em que estive envolvido e verificar as informações antes de qualquer conversa.",
  ctaPrimary: { label: "Ver Resultados", href: "#resultados" },
  ctaSecondary: {
    label: "Falar no WhatsApp",
    href: "https://wa.me/5534984228457",
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
    "Trabalho com a realidade das prefeituras desde 2010. Já atuei em mais de 60 municípios entre MG, SP, RS e BA — implantando sistemas, migrando bases legadas, adequando processos ao TCE e apoiando equipes na transição.",
    "Em 2024 fundei a Govevia, uma plataforma de gestão pública desenvolvida com base nessa experiência acumulada em campo.",
    "Bacharel em Sistemas de Informação e membro ativo do PMI, com 2.610 horas documentadas em 19 projetos municipais.",
  ],
  location: "Uberlândia, MG · Brasil",
  remote: "Atendimento remoto em todo o Brasil",
  education: [
    "Bacharel em Sistemas de Informação — Faculdade CNEC Unaí (2010)",
  ],
};

export const EXPERTISE = {
  title: "O que faço",
  cards: [
    {
      icon: "Building2",
      title: "Implantação de sistemas GRP",
      description:
        "Condução do processo completo de implantação — levantamento, migração de dados, adequação ao TCE e capacitação da equipe. O objetivo é que o município opere de forma autônoma após a entrega.",
    },
    {
      icon: "ShieldCheck",
      title: "Conformidade e controle",
      description:
        "Trilhas de auditoria, controle de acesso por perfil e adequação a LGPD e Tribunais de Contas. Estrutura que suporta fiscalização sem depender de ajustes emergenciais.",
    },
    {
      icon: "Monitor",
      title: "Digitalização de serviços ao cidadão",
      description:
        "Implantação de serviços online com redução mensurável de prazo e papel. Protocolo, alvará, IPTU, nota fiscal — processos que passam a funcionar de forma integrada e rastreável.",
    },
    {
      icon: "Database",
      title: "Migração de dados legados",
      description:
        "Transferência de bases históricas (Oracle, SQL Server, sistemas próprios) para ambientes modernos, sem interrupção da operação e preservando o histórico que os órgãos de controle podem solicitar.",
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
  title: "Resultados",
  cards: [
    {
      category: "Implantação consultiva · 2020–2025",
      title: "Amparo Digital — Sonner Sistemas",
      description:
        "Atuei como consultor técnico responsável pela implantação do Projeto Amparo Digital, conduzido pela Sonner Sistemas junto ao município. A implantação abrangeu mais de 30 serviços públicos digitalizados, redução de 70% no uso de papel e automação de processos internos com BPMN 2.0.",
      impact:
        "Redução do tempo médio de atendimento, eliminação de filas para serviços básicos e rastreabilidade completa de processos — resultados documentados e divulgados pelo cliente.",
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
  title: "Entre em contato",
  subtitle:
    "Para projetos, parcerias ou dúvidas sobre a Govevia — estou disponível pelos canais abaixo.",
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
