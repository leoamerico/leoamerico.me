// ============================================================================
// lib/constants.ts — Dados centralizados do site Leonardo Américo
// Edite este arquivo para atualizar conteúdo sem mexer nos componentes.
// ============================================================================

export const SITE = {
  name: "Leonardo Américo",
  shortName: "Leo Américo",
  title: "Leonardo Américo — Cloud Solutions Architect & Transformação Digital",
  description:
    "15 anos transformando gestão pública com tecnologia. Especialista em arquitetura cloud, sistemas GRP e transformação digital para o setor público.",
  url: "https://leoamerico.me",
  locale: "pt-BR",
  email: "sou@leoamerico.me",
  ogImage: "/og-image.png",
};

export const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Expertise", href: "#expertise" },
  { label: "Projetos", href: "#projetos" },
  { label: "Contato", href: "#contato" },
];

export const HERO = {
  badge: "Disponível para projetos",
  heading: "Leonardo Américo",
  roles: [
    "Cloud Solutions Architect",
    "Especialista em Transformação Digital",
    "Gerente de Projetos · PMP",
  ],
  paragraph:
    "15 anos transformando gestão pública com tecnologia. Especialista em arquitetura cloud, sistemas GRP e transformação digital para o setor público.",
  ctaPrimary: { label: "Ver Projetos", href: "#projetos" },
  ctaSecondary: {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/leoamericojr",
  },
  metrics: [
    { value: "15+", label: "Anos de Experiência" },
    { value: "+40", label: "Municípios Atendidos" },
    { value: "+30", label: "Serviços Digitalizados" },
  ],
};

export const ABOUT = {
  title: "Quem é o Leo Américo",
  photo: "/photo.jpg",
  text: "Profissional com 15 anos de experiência em implantação de sistemas de Gestão de Recursos Públicos (GRP) e transformação digital em municípios, câmaras e autarquias. Fundador da Envneo e Govevia, atua como Cloud Solutions Architect especializado em migração de dados, arquitetura de soluções e gestão de mudança organizacional.",
  location: "Uberlândia, MG · Brasil",
  remote: "Remoto",
  education: [
    "Bacharel em Sistemas de Informação — Faculdade CNEC Unaí (2010)",
    "Publicidade e Propaganda — IESB (2004)",
  ],
};

export const EXPERTISE = {
  title: "Especialidades",
  cards: [
    {
      icon: "Cloud",
      title: "Cloud Architecture",
      description:
        "AWS, GCP, Oracle Cloud, OpenShift. Migração e otimização de bancos de dados em escala enterprise.",
    },
    {
      icon: "Building2",
      title: "Transformação Digital Pública",
      description:
        "Implantação de sistemas GRP em prefeituras, câmaras e autarquias. +40 clientes no setor público.",
    },
    {
      icon: "ClipboardCheck",
      title: "Gestão de Projetos (PMP)",
      description:
        "Metodologias ágeis e tradicionais. BPMN 2.0, automação de processos e gestão de mudança.",
    },
    {
      icon: "Layers",
      title: "Arquitetura de Software",
      description:
        "Hexagonal Architecture, DDD, Microservices, APIs REST.",
    },
    {
      icon: "Code2",
      title: "Desenvolvimento Web",
      description: "React, Next.js, Python, Java, Node.js.",
    },
    {
      icon: "Cpu",
      title: "IoT & Wearables",
      description:
        "Prototipagem com Arduino, firmware embarcado e integração de sensores.",
    },
  ],
};

export const STACK = {
  title: "Tecnologias",
  techs: [
    "AWS",
    "GCP",
    "Oracle Cloud",
    "Docker",
    "Kubernetes",
    "Python",
    "Java",
    "React",
    "Next.js",
    "PostgreSQL",
    "Oracle DB",
    "Linux",
    "Git",
    "BPMN 2.0",
  ],
};

export const PROJECTS = {
  title: "Projetos",
  cards: [
    {
      category: "Gestão Pública",
      title: "Projeto Amparo Digital",
      description:
        "Digitalização de mais de 30 serviços públicos municipais, implementação de app cidadão premiado regionalmente e automação de processos com BPMN 2.0.",
      link: "https://www.youtube.com/watch?v=Egp92Tqmdok",
      badge: "Case de Sucesso",
      image: "/projects/amparo-digital.svg",
    },
    {
      category: "Plataforma SaaS",
      title: "Govevia — Plataforma GRP",
      description:
        "Plataforma de Gestão de Recursos Públicos implementada em mais de 40 municípios, câmaras e autarquias brasileiras.",
      link: "https://govevia.com",
      badge: "+40 clientes",
      image: "/projects/govevia.svg",
    },
    {
      category: "Cloud & Data",
      title: "Arquitetura Cloud para Setor Público",
      description:
        "Migração e otimização de bancos de dados Oracle/PostgreSQL para cloud (GCP/AWS), com foco em alta disponibilidade e segurança.",
      link: null,
      badge: "Em desenvolvimento",
      image: "/projects/cloud-architecture.svg",
    },
  ],
};

export const CERTIFICATIONS = {
  title: "Certificações & Formação",
  items: [
    {
      title: "PMP — Project Management Professional",
      org: "PMI",
      link: "https://community.pmi.org/profile/leoamericojr",
      status: "active",
    },
    {
      title: "AWS Solutions Architect Professional",
      org: "Amazon Web Services",
      link: null,
      status: "Em andamento",
    },
    {
      title: "Bacharel em Sistemas de Informação",
      org: "Faculdade CNEC Unaí (2010)",
      link: "#diploma",
      status: "Concluído",
    },
    {
      title: "Publicidade e Propaganda",
      org: "IESB (2004)",
      link: null,
      status: "Concluído",
    },
  ],
};

export const CONTACT = {
  title: "Vamos construir algo juntos?",
  subtitle:
    "Aberto a projetos de transformação digital, arquitetura cloud e consultoria em gestão pública.",
  links: [
    {
      label: "GitHub",
      href: "https://github.com/leoamerico",
      icon: "Github",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/leoamericojr",
      icon: "Linkedin",
    },
    {
      label: "Substack",
      href: "https://substack.com/@leoamericojr",
      icon: "BookOpen",
    },
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
      label: "Envneo",
      href: "https://envneo.com",
      icon: "Globe",
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
