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
    name: 'Individual Plan',
    price: 0,
    priceId: null,
    features: {
      ja: [
        '基本動画アクセス',
        'ドリル・スパーログ',
        '基本的な収得度トラッキング',
      ],
      en: [
        'Basic video access',
        'Drills & sparring log',
        'Basic progress tracking',
      ],
      pt: [
        'Acesso básico aos vídeos',
        'Exercícios e registro de sparring',
        'Acompanhamento básico de progresso',
      ],
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 1200,
    currency: 'jpy',
    priceIdMonthly: process.env.STRIPE_PRO_PRICE_ID_MONTHLY!,
    priceIdYearly: process.env.STRIPE_PRO_PRICE_ID_YEARLY!,
    features: {
      ja: [
        '全動画へのフルアクセス',
        'フローエディタ全機能',
        'アダプティブ復習',
        '詳細レポート・分析',
        '優先サポート',
      ],
      en: [
        'Full video access',
        'Complete flow editor features',
        'Adaptive review system',
        'Detailed reports & analytics',
        'Priority support',
      ],
      pt: [
        'Acesso completo aos vídeos',
        'Recursos completos do editor de fluxo',
        'Sistema de revisão adaptativa',
        'Relatórios e análises detalhadas',
        'Suporte prioritário',
      ],
    },
  },
  dojo: {
    id: 'dojo',
    name: 'Dojo Plan',
    price: 6000,
    currency: 'jpy',
    priceIdMonthly: process.env.STRIPE_DOJO_PRICE_ID_MONTHLY!,
    priceIdYearly: process.env.STRIPE_DOJO_PRICE_ID_YEARLY!,
    features: {
      ja: [
        'Pro Planの全機能',
        'カリキュラム配信機能',
        '非公開スペース',
        'コーチ評価機能',
        '複数ユーザー管理',
        '専任サポート',
      ],
      en: [
        'All Pro Plan features',
        'Curriculum distribution',
        'Private workspace',
        'Coach evaluation tools',
        'Multi-user management',
        'Dedicated support',
      ],
      pt: [
        'Todos os recursos do Plano Pro',
        'Distribuição de currículo',
        'Espaço privado',
        'Ferramentas de avaliação de treinador',
        'Gerenciamento de múltiplos usuários',
        'Suporte dedicado',
      ],
    },
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[PlanId];