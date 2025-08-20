export const en = {
  // Navigation
  nav: {
    features: 'Features',
    howToUse: 'How to Use',
    pricing: 'Pricing',
    supervisor: 'Supervisor',
    faq: 'FAQ',
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    freeStart: 'Start Free',
  },

  // Hero Section
  hero: {
    badge: 'Flow × Video × Progress',
    title1: 'Master BJJ with',
    title2: 'Flow and',
    titleHighlight: 'Video',
    description: 'Murata BJJ is a flow-first learning platform for Brazilian Jiu-Jitsu.',
    descriptionPoints: ['Videos', 'Flows', 'Progress', 'Sparring Logs'],
    descriptionEnd: 'to create a cycle of understanding → practice → application.',
    healthNote: 'Safe instruction supporting QOL & MQ improvement as a lifelong sport.',
    cta: {
      start: 'Start Free',
      features: 'View Features',
    },
  },

  // Features Section
  features: {
    title: 'Key Features',
    items: {
      videoCatalog: {
        title: 'Video Catalog',
        description: 'Organized by belt, position, and technique. Chapters, key points, playback speed control, and auto-transcription.',
      },
      flowEditor: {
        title: 'Flow Editor',
        description: 'Visualize connections with nodes (techniques/positions) and edges (transitions). Includes branches and alternatives.',
      },
      progressTracker: {
        title: 'Progress Tracker',
        description: '5-stage evaluation: Understanding → Steps → Execution → Flow → Live. Identifies weaknesses and suggests next steps.',
      },
      sparringLog: {
        title: 'Sparring Log',
        description: 'Record starting positions and events (passes/sweeps/submissions) in chronological order.',
      },
      adaptiveReview: {
        title: 'Adaptive Review',
        description: 'Optimizes review intervals based on forgetting curves. Focuses on bottleneck transitions.',
      },
      coachFeatures: {
        title: 'Coach/Dojo Features',
        description: 'Curriculum distribution, belt-specific assignments, evaluation reports, and private spaces.',
      },
    },
  },

  // How to Use Section
  howToUse: {
    title: 'How to Use (3 min)',
    steps: {
      account: {
        number: '01',
        title: 'Account Setup',
        description: 'Set your belt/build/favorite techniques → Get initial flow suggestions.',
      },
      understand: {
        number: '02',
        title: 'Learn with Videos',
        description: 'Grasp key points through chapters and highlights.',
      },
      practice: {
        number: '03',
        title: 'Drill to Execute',
        description: 'Record reps/sides/resistance%. Focus on transitions.',
      },
      apply: {
        number: '04',
        title: 'Apply in Sparring',
        description: 'Log events. Dashboard suggests your next move.',
      },
    },
  },

  // Pricing Section
  pricing: {
    title: 'Pricing',
    plans: {
      personal: {
        name: 'Personal',
        price: '$0',
        features: ['Basic Videos', 'Drill/Sparring Logs', 'Basic Progress'],
      },
      pro: {
        name: 'Pro',
        price: '$12/mo',
        popular: 'Popular',
        features: ['Flow Editor', 'Adaptive Review', 'Detailed Reports'],
      },
      dojo: {
        name: 'Dojo',
        price: '$60/mo+',
        features: ['Curriculum Distribution', 'Private Spaces', 'Coach Evaluations'],
      },
    },
  },

  // Supervisor Section
  supervisor: {
    title: 'Supervised by Ryozo Murata',
    description: 'SJJIF World Championship Master 2 Black Belt Featherweight Champion 2018 & 2019. President of SJJJF. Representative of YAWARA BJJ Academy and Over Limit Sapporo.',
    details: [
      'From: Abashiri, Hokkaido / Born: April 24, 1980',
      'Silver 2016 & 2017, Gold 2018 & 2019 (SJJIF/M2 Black/Feather)',
    ],
    photoNote: '*Photo to be replaced. Licensed image will be provided for publication.',
    comment: {
      title: 'Supervisor Comment',
      text: 'BJJ is not about isolated techniques but connections. Murata BJJ is designed around flows and logs to create the cycle of understanding → execution → application.',
    },
  },

  // Signup Section
  signup: {
    title: 'Start Free',
    loggedIn: {
      description: "You're already logged in. Start learning from your dashboard.",
      cta: 'Go to Dashboard',
    },
    loggedOut: {
      description: 'Create your free account now and start learning BJJ.',
      cta: 'Start Free',
    },
    info: {
      title: 'What is Murata BJJ?',
      description: 'Flow-first learning platform for Brazilian Jiu-Jitsu. Designed & supervised by Ryozo Murata.',
      seeEnglish: 'See English',
      seePortuguese: 'Ver em Português',
    },
  },

  // Auth Dialog
  auth: {
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: '••••••••',
    processing: 'Processing...',
    or: 'or',
    googleLogin: 'Sign in with Google',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    confirmEmailSent: 'Confirmation email sent. Please check your inbox.',
    loginSuccess: 'Logged in successfully',
    logoutSuccess: 'Logged out successfully',
    loginFailed: 'Login failed',
    signupFailed: 'Sign up failed',
    logoutFailed: 'Logout failed',
    googleLoginFailed: 'Google login failed',
    supabaseNotConfigured: 'Supabase not configured',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome, {{email}}',
    stats: {
      watchedVideos: 'Videos Watched',
      masteredTechniques: 'Techniques Mastered',
      practiceDays: 'Practice Days',
      completedFlows: 'Flows Completed',
    },
    recentActivity: {
      title: 'Recent Activity',
      progress: 'Progress',
      lastWatched: 'Last watched',
      daysAgo: '{{days}} days ago',
    },
    recommendations: {
      title: 'Recommended Next Steps',
      fromConnection: 'Connection from {{technique}}',
      alternative: 'Alternative from {{technique}}',
    },
  },

  // Video Player
  video: {
    instructor: 'Instructor',
    chapters: 'Chapters',
    keyPoints: 'Key Points',
    transcript: 'Transcript',
    relatedTechniques: 'Related Techniques',
    toNextStep: 'To Next Step',
    alternative: 'Alternative',
    recordProgress: 'Record Progress',
    progressLevels: ['Understanding', 'Steps', 'Execution', 'Flow', 'Live'],
    loginToWatch: 'Login required to watch this video',
    loginToWatchButton: 'Login to Watch',
  },

  // Footer
  footer: {
    copyright: '© {{year}} Murata BJJ — Flow × Video × Progress',
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    none: 'None',
  },
}