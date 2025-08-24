export const pt = {
  // Navegação
  nav: {
    features: 'Recursos',
    howToUse: 'Como Usar',
    pricing: 'Preços',
    supervisor: 'Supervisor',
    faq: 'FAQ',
    login: 'Entrar',
    logout: 'Sair',
    dashboard: 'Painel',
    freeStart: 'Começar Grátis',
    upload: 'Enviar',
  },

  // Seção Hero
  hero: {
    badge: 'Flow × Vídeo × Progresso',
    title1: 'Domine o BJJ com',
    title2: 'Flow e',
    titleHighlight: 'Vídeo.',
    description: 'Murata BJJ é uma plataforma de aprendizado centrada em flow para Jiu-Jitsu Brasileiro. ',
    descriptionPoints: ['Vídeos', 'Flows', 'Progresso', 'Logs de Sparring'],
    descriptionEnd: 'para criar um ciclo de compreensão → prática → aplicação.',
    healthNote: 'Instrução segura apoiando melhoria de QOL & MQ como esporte vitalício.',
    cta: {
      start: 'Começar Grátis',
      features: 'Ver Recursos',
    },
  },

  // Seção de Recursos
  features: {
    title: 'Recursos Principais',
    items: {
      videoCatalog: {
        title: 'Catálogo de Vídeos',
        description: 'Organizado por faixa, posição e técnica. Capítulos, pontos-chave, controle de velocidade e transcrição automática.',
      },
      flowEditor: {
        title: 'Editor de Flow',
        description: 'Visualize conexões com nós (técnicas/posições) e arestas (transições). Inclui ramificações e alternativas.',
      },
      progressTracker: {
        title: 'Rastreador de Progresso',
        description: 'Avaliação em 5 estágios: Compreensão → Passos → Execução → Flow → Ao Vivo. Identifica fraquezas e sugere próximos passos.',
      },
      sparringLog: {
        title: 'Log de Sparring',
        description: 'Registre posições iniciais e eventos (passagens/raspagens/finalizações) em ordem cronológica.',
      },
      adaptiveReview: {
        title: 'Revisão Adaptativa',
        description: 'Otimiza intervalos de revisão baseados em curvas de esquecimento. Foca em transições gargalo.',
      },
      coachFeatures: {
        title: 'Recursos para Treinador/Academia',
        description: 'Distribuição de currículo, tarefas por faixa, relatórios de avaliação e espaços privados.',
      },
    },
  },

  // Seção Como Usar
  howToUse: {
    title: 'Como Usar (3 min)',
    steps: {
      account: {
        number: '01',
        title: 'Configurar Conta',
        description: 'Configure faixa/físico/técnicas favoritas → Receba sugestões de flow inicial.',
      },
      understand: {
        number: '02',
        title: 'Aprender com Vídeos',
        description: 'Entenda pontos-chave através de capítulos e destaques.',
      },
      practice: {
        number: '03',
        title: 'Treinar para Executar',
        description: 'Registre repetições/lados/resistência%. Foque nas transições.',
      },
      apply: {
        number: '04',
        title: 'Aplicar no Sparring',
        description: 'Registre eventos. O painel sugere seu próximo movimento.',
      },
    },
  },

  // Seção de Preços
  pricing: {
    title: 'Preços',
    plans: {
      personal: {
        name: 'Pessoal',
        price: 'R$0',
        features: ['Vídeos Básicos', 'Logs de Treino/Sparring', 'Progresso Básico'],
      },
      pro: {
        name: 'Pro',
        price: 'R$60/mês',
        popular: 'Popular',
        features: ['Editor de Flow', 'Revisão Adaptativa', 'Relatórios Detalhados'],
      },
      dojo: {
        name: 'Academia',
        price: 'R$300/mês+',
        features: ['Distribuição de Currículo', 'Espaços Privados', 'Avaliações de Treinador'],
      },
    },
  },

  // Seção do Supervisor
  supervisor: {
    title: 'Supervisionado por Ryozo Murata',
    description: 'Campeão Mundial SJJIF Master 2 Faixa Preta Pena 2018 e 2019. Presidente da SJJJF. Diretor da Academia YAWARA Jiu-Jitsu / Over Limit Jiu-Jitsu Association. SWEEP Kitasando.',
    details: [
      'De: Abashiri, Hokkaido / Nascido: 24 de abril de 1980',
      'Prata 2016 e 2017, Ouro 2018 e 2019 (SJJIF/M2 Preta/Pena)',
    ],
    photoNote: '*Foto a ser substituída. Imagem licenciada será fornecida para publicação.',
    comment: {
      title: 'Comentário do Supervisor',
      text: 'BJJ não é sobre técnicas isoladas, mas conexões. Murata BJJ foi projetado em torno de flows e logs para criar o ciclo de compreensão → execução → aplicação.',
    },
  },

  // Seção de Inscrição
  signup: {
    title: 'Começar Grátis',
    loggedIn: {
      description: 'Você já está conectado. Comece a aprender do seu painel.',
      cta: 'Ir para o Painel',
    },
    loggedOut: {
      description: 'Crie sua conta gratuita agora e comece a aprender BJJ.',
      cta: 'Começar Grátis',
    },
    info: {
      title: 'O que é Murata BJJ?',
      description: 'Plataforma de aprendizado centrada em flow para Jiu-Jitsu Brasileiro. Projetada e supervisionada por Ryozo Murata.',
      seeEnglish: 'See English',
      seePortuguese: 'Ver em Português',
    },
  },

  // Diálogo de Autenticação
  auth: {
    login: 'Entrar',
    signup: 'Cadastrar',
    email: 'Email',
    password: 'Senha',
    emailPlaceholder: 'voce@exemplo.com',
    passwordPlaceholder: '••••••••',
    processing: 'Processando...',
    or: 'ou',
    googleLogin: 'Entrar com Google',
    noAccount: 'Não tem uma conta?',
    hasAccount: 'Já tem uma conta?',
    confirmEmailSent: 'Email de confirmação enviado. Verifique sua caixa de entrada.',
    loginSuccess: 'Login realizado com sucesso',
    logoutSuccess: 'Logout realizado com sucesso',
    loginFailed: 'Falha no login',
    signupFailed: 'Falha no cadastro',
    logoutFailed: 'Falha no logout',
    googleLoginFailed: 'Falha no login com Google',
    supabaseNotConfigured: 'Supabase não configurado',
    invalidCredentials: 'Email ou senha inválidos',
    userAlreadyExists: 'Este email já está registrado',
    signupSuccess: 'Email de confirmação enviado. Verifique sua caixa de entrada.',
  },

  // Painel
  dashboard: {
    title: 'Painel',
    welcome: 'Bem-vindo, {{email}}',
    stats: {
      watchedVideos: 'Vídeos Assistidos',
      masteredTechniques: 'Técnicas Dominadas',
      practiceDays: 'Dias de Treino',
      completedFlows: 'Flows Concluídos',
    },
    recentActivity: {
      title: 'Atividade Recente',
      progress: 'Progresso',
      lastWatched: 'Assistido pela última vez',
      daysAgo: '{{days}} dias atrás',
    },
    recommendations: {
      title: 'Próximos Passos Recomendados',
      fromConnection: 'Conexão de {{technique}}',
      alternative: 'Alternativa de {{technique}}',
    },
  },

  // Player de Vídeo
  video: {
    instructor: 'Instrutor',
    chapters: 'Capítulos',
    keyPoints: 'Pontos-Chave',
    transcript: 'Transcrição',
    relatedTechniques: 'Técnicas Relacionadas',
    toNextStep: 'Para o Próximo Passo',
    alternative: 'Alternativa',
    recordProgress: 'Registrar Progresso',
    progressLevels: ['Compreensão', 'Passos', 'Execução', 'Flow', 'Ao Vivo'],
    loginToWatch: 'Login necessário para assistir este vídeo',
    loginToWatchButton: 'Entrar para Assistir',
  },

  // Rodapé
  footer: {
    copyright: '© {{year}} Murata BJJ — Flow × Vídeo × Progresso',
  },

  // Comum
  common: {
    loading: 'Carregando...',
    error: 'Ocorreu um erro',
    retry: 'Tentar novamente',
    back: 'Voltar',
    next: 'Próximo',
    save: 'Salvar',
    cancel: 'Cancelar',
    close: 'Fechar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    all: 'Todos',
    none: 'Nenhum',
  },
}