import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    currency: 'jpy',
    priceId: null,
    features: {
      ja: [
        '基本動画アクセス（月5本まで）',
        '基本的な習得度トラッキング',
        'コミュニティフォーラム',
      ],
      en: [
        'Basic video access (5/month)',
        'Basic progress tracking',
        'Community forum',
      ],
      pt: [
        'Acesso básico aos vídeos (5/mês)',
        'Acompanhamento básico de progresso',
        'Fórum da comunidade',
      ],
    },
  },
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 980,
    currency: 'jpy',
    priceIdMonthly: process.env.STRIPE_BASIC_PRICE_ID_MONTHLY!,
    priceIdYearly: process.env.STRIPE_BASIC_PRICE_ID_YEARLY!,
    features: {
      ja: [
        '動画アクセス（月50本まで）',
        'ドリル・スパーログ',
        '習得度トラッキング',
        'モバイルアプリ対応',
      ],
      en: [
        'Video access (50/month)',
        'Drills & sparring log',
        'Progress tracking',
        'Mobile app access',
      ],
      pt: [
        'Acesso aos vídeos (50/mês)',
        'Exercícios e registro de sparring',
        'Acompanhamento de progresso',
        'Acesso ao aplicativo móvel',
      ],
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 2480,
    currency: 'jpy',
    priceIdMonthly: process.env.STRIPE_PRO_PRICE_ID_MONTHLY!,
    priceIdYearly: process.env.STRIPE_PRO_PRICE_ID_YEARLY!,
    features: {
      ja: [
        '全動画への無制限アクセス',
        'フローエディタ全機能',
        'アダプティブ復習システム',
        'AI動画解析',
        'スパーリングログ詳細分析',
        '優先サポート',
      ],
      en: [
        'Unlimited video access',
        'Full flow editor features',
        'Adaptive review system',
        'AI video analysis',
        'Detailed sparring analytics',
        'Priority support',
      ],
      pt: [
        'Acesso ilimitado aos vídeos',
        'Recursos completos do editor de fluxo',
        'Sistema de revisão adaptativa',
        'Análise de vídeo com IA',
        'Análise detalhada de sparring',
        'Suporte prioritário',
      ],
    },
  },
  master: {
    id: 'master',
    name: 'Master Plan',
    price: 3980,
    currency: 'jpy',
    priceIdMonthly: process.env.STRIPE_MASTER_PRICE_ID_MONTHLY!,
    priceIdYearly: process.env.STRIPE_MASTER_PRICE_ID_YEARLY!,
    features: {
      ja: [
        'Pro Planの全機能',
        '月1回のオンラインコーチング',
        '動画リクエスト権',
        '新機能への早期アクセス',
        'プライベートコミュニティ',
        'カスタムトレーニングプラン',
      ],
      en: [
        'All Pro Plan features',
        'Monthly online coaching',
        'Video request privileges',
        'Early access to new features',
        'Private community access',
        'Custom training plans',
      ],
      pt: [
        'Todos os recursos do Plano Pro',
        'Coaching online mensal',
        'Privilégios de solicitação de vídeo',
        'Acesso antecipado a novos recursos',
        'Acesso à comunidade privada',
        'Planos de treinamento personalizados',
      ],
    },
  },
  dojo_basic: {
    id: 'dojo_basic',
    name: 'Dojo Basic',
    price: 9800,
    currency: 'jpy',
    priceIdMonthly: process.env.STRIPE_DOJO_BASIC_PRICE_ID_MONTHLY!,
    priceIdYearly: process.env.STRIPE_DOJO_BASIC_PRICE_ID_YEARLY!,
    features: {
      ja: [
        '生徒10名まで',
        '基本カリキュラム配信',
        '生徒進捗管理',
        '基本レポート機能',
        'メールサポート',
      ],
      en: [
        'Up to 10 students',
        'Basic curriculum distribution',
        'Student progress management',
        'Basic reporting',
        'Email support',
      ],
      pt: [
        'Até 10 alunos',
        'Distribuição básica de currículo',
        'Gerenciamento de progresso dos alunos',
        'Relatórios básicos',
        'Suporte por email',
      ],
    },
  },
  dojo_pro: {
    id: 'dojo_pro',
    name: 'Dojo Pro',
    price: 19800,
    currency: 'jpy',
    priceIdMonthly: process.env.STRIPE_DOJO_PRO_PRICE_ID_MONTHLY!,
    priceIdYearly: process.env.STRIPE_DOJO_PRO_PRICE_ID_YEARLY!,
    features: {
      ja: [
        '生徒50名まで',
        'カスタムカリキュラム作成',
        '詳細分析レポート',
        'コーチ評価機能',
        '優先サポート',
        'API連携（制限あり）',
      ],
      en: [
        'Up to 50 students',
        'Custom curriculum creation',
        'Detailed analytics reports',
        'Coach evaluation tools',
        'Priority support',
        'API access (limited)',
      ],
      pt: [
        'Até 50 alunos',
        'Criação de currículo personalizado',
        'Relatórios analíticos detalhados',
        'Ferramentas de avaliação de treinador',
        'Suporte prioritário',
        'Acesso à API (limitado)',
      ],
    },
  },
  dojo_enterprise: {
    id: 'dojo_enterprise',
    name: 'Dojo Enterprise',
    price: null, // Custom pricing
    currency: 'jpy',
    priceIdMonthly: null,
    priceIdYearly: null,
    features: {
      ja: [
        '生徒数無制限',
        '完全カスタマイズ可能',
        '専用サーバー環境',
        'フルAPI連携',
        '専任サポートチーム',
        'SLA保証',
      ],
      en: [
        'Unlimited students',
        'Fully customizable',
        'Dedicated server environment',
        'Full API integration',
        'Dedicated support team',
        'SLA guarantee',
      ],
      pt: [
        'Alunos ilimitados',
        'Totalmente personalizável',
        'Ambiente de servidor dedicado',
        'Integração completa da API',
        'Equipe de suporte dedicada',
        'Garantia de SLA',
      ],
    },
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[PlanId];