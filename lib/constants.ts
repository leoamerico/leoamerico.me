// ============================================================================
// lib/constants.ts — Dados centralizados do site Leonardo Américo
// Edite este arquivo para atualizar conteúdo sem mexer nos componentes.
// ============================================================================

export const SITE = {
  name: "Leonardo Américo",
  shortName: "Leo Américo",
  title: "Leonardo Américo — Arquiteto de Soluções para Gestão Pública",
  description:
    "15 anos ajudando municípios a sair do papel, do retrabalho e da insegurança jurídica. Implantação de sistemas GRP, conformidade com Tribunais de Contas e transformação digital para o setor público.",
  url: "https://leoamerico.me",
  locale: "pt-BR",
  email: "sou@leoamerico.me",
  ogImage: "/og-image.png",
};

export const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "O que eu faço", href: "#servicos" },
  { label: "Resultados", href: "#resultados" },
  { label: "Produção", href: "#audit" },
  { label: "Govevia", href: "https://govevia.com.br" },
  { label: "Contato", href: "#contato" },
];

export const HERO = {
  badge: "Disponível para novos municípios",
  heading: "Leonardo Américo",
  roles: [
    "Arquiteto de Soluções para Gestão Pública",
    "Especialista em Transformação Digital",
    "Implantação de Sistemas GRP",
  ],
  paragraph:
    "15 anos ajudando municípios a sair do papel, do retrabalho e da insegurança jurídica. Implanto sistemas que funcionam no dia a dia da prefeitura — não só na apresentação do fornecedor.",
  ctaPrimary: { label: "Ver Resultados", href: "#resultados" },
  ctaSecondary: {
    label: "Falar no WhatsApp",
    href: "https://wa.me/5534984228457",
  },
  metrics: [
    { value: "15+", label: "anos em gestão pública digital" },
    { value: "40+", label: "municípios atendidos ao longo da carreira" },
    { value: "70%", label: "menos papel — implantação Amparo Digital (Sonner Sistemas)" },
  ],
};

export const ABOUT = {
  title: "Quem é o Leo",
  photo: "/photo.svg",
  paragraphs: [
    "Trabalho com gestão pública desde 2010. Já implantei sistemas de gestão (GRP) em mais de 40 municípios entre Minas Gerais e São Paulo — de cidades com 5 mil habitantes até municípios com mais de 300 mil.",
    "Minha especialidade é o ponto onde tecnologia encontra a realidade da prefeitura: migração de dados legados, adequação a exigências do TCE e TCU, capacitação de equipes e sistemas que os servidores realmente conseguem usar.",
    "Sou fundador da Govevia, uma plataforma de gestão pública construída a partir dessa experiência de campo. Bacharel em Sistemas de Informação, membro do PMI e com formação complementar em gestão de projetos (PMP em andamento).",
  ],
  location: "Uberlândia, MG · Brasil",
  remote: "Atendimento remoto em todo o Brasil",
  education: [
    "Bacharel em Sistemas de Informação — Faculdade CNEC Unaí (2010)",
  ],
};

export const EXPERTISE = {
  title: "O que eu faço",
  cards: [
    {
      icon: "Building2",
      title: "Implantação de Sistemas GRP",
      description:
        "Implantação completa de sistemas de Gestão de Recursos Públicos — do levantamento de processos à migração de dados e capacitação da equipe. Foco em continuidade: o sistema funciona depois que o consultor vai embora.",
    },
    {
      icon: "ShieldCheck",
      title: "Conformidade e Segurança",
      description:
        "Arquitetura pensada para atender exigências dos Tribunais de Contas, LGPD e normas de transparência. Trilhas de auditoria, controle de acesso por perfil e isolamento de dados por município.",
    },
    {
      icon: "Monitor",
      title: "Transformação Digital de Serviços",
      description:
        "Digitalização de serviços ao cidadão com redução real de papel e tempo de atendimento. Do protocolo ao alvará, do IPTU à nota fiscal — processos que hoje levam dias passam a levar minutos.",
    },
    {
      icon: "Database",
      title: "Migração e Integração de Dados",
      description:
        "Migração segura de bases legadas (Oracle, SQL Server, sistemas próprios) para ambientes modernos em nuvem. Sem perda de histórico, sem interrupção de operação.",
    },
  ],
};

export const STACK = {
  title: "Tecnologias",
  groups: [
    {
      title: "Infraestrutura & Cloud",
      techs: ["AWS", "GCP", "Oracle Cloud", "Docker", "Kubernetes", "Linux"],
    },
    {
      title: "Banco de Dados",
      techs: ["PostgreSQL", "Oracle DB"],
    },
    {
      title: "Desenvolvimento",
      techs: ["Java", "Python", "React", "Next.js", "Node.js"],
    },
    {
      title: "Processos & Gestão",
      techs: ["BPMN 2.0", "Git"],
    },
  ],
};

interface ProjectEvidence {
  label: string;
  href: string;
  icon: string;
}

interface ProjectCard {
  category: string;
  title: string;
  description: string;
  impact: string | null;
  features: string[] | null;
  link: string | null;
  linkLabel: string | null;
  badge: string;
  evidence?: ProjectEvidence[];
  company?: string;
}

export const PROJECTS: { title: string; cards: ProjectCard[] } = {
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
      title: "Govevia — Plataforma de governança executável para administração municipal brasileira",
      description:
        "Plataforma de governança executável desenvolvida a partir de experiência prática em gestão pública municipal. Construída para resolver problemas reais: dados fragmentados, falta de rastreabilidade, dependência de planilhas e risco de não-conformidade.",
      impact: null,
      features: [
        "Isolamento de dados por município (multi-tenant com Row-Level Security)",
        "Trilhas de auditoria com verificação criptográfica",
        "Conformidade nativa com exigências de Tribunais de Contas",
        "Arquitetura em nuvem com alta disponibilidade",
      ],
      link: "https://govevia.com.br",
      linkLabel: "Conhecer a Govevia",
      badge: "Em operação",
      company: "Desenvolvido pela ENV-NEO LTDA",
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
  title: "Certificações & Formação",
  items: [
    {
      title: "PMP — Project Management Professional",
      org: "PMI · Membro ativo · Certificação em andamento",
      detail: "2.610 horas documentadas em 19 projetos municipais",
      link: "https://community.pmi.org/profile/leoamericojr",
      status: "active",
    },
    {
      title: "Bacharel em Sistemas de Informação",
      org: "Faculdade CNEC Unaí · Concluído em 2010",
      detail: "Diploma digital verificável — MEC/ICP-Brasil",
      link: "#diploma",
      status: "Concluído",
    },
    {
      title: "AWS Solutions Architect Professional",
      org: "Amazon Web Services · Em preparação",
      detail: null,
      link: null,
      status: "Em andamento",
    },
  ],
};

export const CONTACT = {
  title: "Seu município precisa modernizar a gestão?",
  subtitle:
    "Posso ajudar com implantação de sistemas, migração de dados, conformidade com Tribunais de Contas ou digitalização de serviços ao cidadão. 15 anos de experiência prática — sem PowerPoint bonito que não funciona na segunda-feira.",
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
  verifyUrl: "https://diplomadigital.mec.gov.br/",
};

export const FOOTER = {
  copy: `© ${new Date().getFullYear()} Leonardo Américo · leoamerico.me`,
  builtWith: "Feito com Next.js · Hosted on Vercel",
};
