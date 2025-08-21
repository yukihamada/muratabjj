import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const getStripeJs = async () => {
  const { loadStripe } = await import('@stripe/stripe-js')
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    priceMonthly: 1980,
    priceYearly: 19800,
    stripePriceIdMonthly: '', // To be filled after creating products in Stripe
    stripePriceIdYearly: '',
    features: {
      ja: [
        '全ての基本技術動画へのアクセス',
        'フローチャート作成・閲覧',
        '習得度トラッキング',
        'スパーリングログ',
        'モバイルアプリ対応'
      ],
      en: [
        'Access to all basic technique videos',
        'Flow chart creation & viewing',
        'Progress tracking',
        'Sparring logs',
        'Mobile app support'
      ],
      pt: [
        'Acesso a todos os vídeos de técnicas básicas',
        'Criação e visualização de fluxogramas',
        'Acompanhamento de progresso',
        'Registros de sparring',
        'Suporte para aplicativo móvel'
      ]
    }
  },
  pro: {
    name: 'Pro',
    priceMonthly: 3980,
    priceYearly: 39800,
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    features: {
      ja: [
        'Basicプランの全機能',
        '上級技術動画へのアクセス',
        'アダプティブ復習システム',
        '詳細な分析レポート',
        'コーチングサポート',
        'プライベートフロー共有'
      ],
      en: [
        'All Basic features',
        'Access to advanced technique videos',
        'Adaptive review system',
        'Detailed analytics reports',
        'Coaching support',
        'Private flow sharing'
      ],
      pt: [
        'Todos os recursos do plano Basic',
        'Acesso a vídeos de técnicas avançadas',
        'Sistema de revisão adaptativa',
        'Relatórios analíticos detalhados',
        'Suporte de coaching',
        'Compartilhamento privado de fluxos'
      ]
    }
  },
  dojo: {
    name: 'Dojo',
    priceMonthly: 9800,
    priceYearly: 98000,
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    features: {
      ja: [
        'Proプランの全機能',
        '道場管理ダッシュボード',
        '生徒管理（最大50名）',
        'カスタムカリキュラム作成',
        'グループ分析',
        '技術認定システム',
        '優先サポート'
      ],
      en: [
        'All Pro features',
        'Dojo management dashboard',
        'Student management (up to 50)',
        'Custom curriculum creation',
        'Group analytics',
        'Technique certification system',
        'Priority support'
      ],
      pt: [
        'Todos os recursos do plano Pro',
        'Painel de gerenciamento de dojo',
        'Gerenciamento de alunos (até 50)',
        'Criação de currículo personalizado',
        'Análises de grupo',
        'Sistema de certificação de técnicas',
        'Suporte prioritário'
      ]
    }
  }
}

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS