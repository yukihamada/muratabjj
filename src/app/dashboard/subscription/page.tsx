'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import DashboardNav from '@/components/DashboardNav'
import { CreditCard, Check, X, Calendar, AlertCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const translations = {
  ja: {
    title: 'サブスクリプション管理',
    currentPlan: '現在のプラン',
    status: 'ステータス',
    nextBilling: '次回請求日',
    active: 'アクティブ',
    canceled: 'キャンセル済み',
    pastDue: '支払い遅延',
    changePlan: 'プラン変更',
    cancelSubscription: 'サブスクリプションをキャンセル',
    reactivateSubscription: 'サブスクリプションを再開',
    managePayment: '支払い方法を管理',
    billingHistory: '請求履歴',
    confirmCancel: '本当にサブスクリプションをキャンセルしますか？',
    cancelSuccess: 'サブスクリプションをキャンセルしました',
    cancelError: 'キャンセルに失敗しました',
    loading: '読み込み中...',
    freePlan: {
      name: 'フリープラン',
      price: undefined,
      features: [
        '基本動画アクセス',
        'ドリル・スパーログ',
        '基本的な習得度トラッキング',
      ]
    },
    proPlan: {
      name: 'Proプラン',
      price: '¥1,200/月',
      features: [
        '全動画へのフルアクセス',
        'フローエディタ全機能',
        'アダプティブ復習',
        '詳細レポート・分析',
        '優先サポート',
      ]
    },
    dojoPlan: {
      name: '道場プラン',
      price: '¥6,000/月〜',
      features: [
        'Proプランの全機能',
        'カリキュラム配信機能',
        '非公開スペース',
        'コーチ評価機能',
        '複数ユーザー管理',
        '専任サポート',
      ]
    }
  },
  en: {
    title: 'Subscription Management',
    currentPlan: 'Current Plan',
    status: 'Status',
    nextBilling: 'Next Billing Date',
    active: 'Active',
    canceled: 'Canceled',
    pastDue: 'Past Due',
    changePlan: 'Change Plan',
    cancelSubscription: 'Cancel Subscription',
    reactivateSubscription: 'Reactivate Subscription',
    managePayment: 'Manage Payment Method',
    billingHistory: 'Billing History',
    confirmCancel: 'Are you sure you want to cancel your subscription?',
    cancelSuccess: 'Subscription canceled successfully',
    cancelError: 'Failed to cancel subscription',
    loading: 'Loading...',
    freePlan: {
      name: 'Free Plan',
      price: undefined,
      features: [
        'Basic video access',
        'Drills & sparring log',
        'Basic progress tracking',
      ]
    },
    proPlan: {
      name: 'Pro Plan',
      price: '$12/month',
      features: [
        'Full video access',
        'Complete flow editor features',
        'Adaptive review system',
        'Detailed reports & analytics',
        'Priority support',
      ]
    },
    dojoPlan: {
      name: 'Dojo Plan',
      price: '$60/month+',
      features: [
        'All Pro Plan features',
        'Curriculum distribution',
        'Private workspace',
        'Coach evaluation tools',
        'Multi-user management',
        'Dedicated support',
      ]
    }
  },
  pt: {
    title: 'Gerenciar Assinatura',
    currentPlan: 'Plano Atual',
    status: 'Status',
    nextBilling: 'Próxima Cobrança',
    active: 'Ativo',
    canceled: 'Cancelado',
    pastDue: 'Pagamento Atrasado',
    changePlan: 'Mudar Plano',
    cancelSubscription: 'Cancelar Assinatura',
    reactivateSubscription: 'Reativar Assinatura',
    managePayment: 'Gerenciar Método de Pagamento',
    billingHistory: 'Histórico de Cobrança',
    confirmCancel: 'Tem certeza que deseja cancelar sua assinatura?',
    cancelSuccess: 'Assinatura cancelada com sucesso',
    cancelError: 'Falha ao cancelar assinatura',
    loading: 'Carregando...',
    freePlan: {
      name: 'Plano Gratuito',
      price: undefined,
      features: [
        'Acesso básico aos vídeos',
        'Exercícios e registro de sparring',
        'Acompanhamento básico de progresso',
      ]
    },
    proPlan: {
      name: 'Plano Pro',
      price: 'R$60/mês',
      features: [
        'Acesso completo aos vídeos',
        'Recursos completos do editor de fluxo',
        'Sistema de revisão adaptativa',
        'Relatórios e análises detalhadas',
        'Suporte prioritário',
      ]
    },
    dojoPlan: {
      name: 'Plano Dojo',
      price: 'R$300/mês+',
      features: [
        'Todos os recursos do Plano Pro',
        'Distribuição de currículo',
        'Espaço privado',
        'Ferramentas de avaliação de treinador',
        'Gerenciamento de múltiplos usuários',
        'Suporte dedicado',
      ]
    }
  }
}

export default function SubscriptionPage() {
  const { user, profile } = useAuth()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const t = translations[language as keyof typeof translations]

  const currentPlan = profile?.subscription_plan || 'free'
  const status = profile?.subscription_status || 'active'
  const endDate = profile?.subscription_period_end

  const handleCancelSubscription = async () => {
    if (!confirm(t.confirmCancel)) return

    setCanceling(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      toast.success(t.cancelSuccess)
      
      // Refresh profile data
      window.location.reload()
    } catch (error) {
      console.error('Cancel subscription error:', error)
      toast.error(t.cancelError)
    } finally {
      setCanceling(false)
    }
  }

  const handleManagePayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (error) {
      console.error('Portal session error:', error)
      toast.error(
        language === 'ja' ? 'エラーが発生しました' :
        language === 'en' ? 'An error occurred' :
        'Ocorreu um erro'
      )
    } finally {
      setLoading(false)
    }
  }

  const getPlanDetails = () => {
    switch (currentPlan) {
      case 'pro':
        return t.proPlan
      case 'dojo':
        return t.dojoPlan
      default:
        return t.freePlan
    }
  }

  const planDetails = getPlanDetails()

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t.title}</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Plan */}
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{t.currentPlan}</h2>
              <CreditCard className="w-6 h-6 text-bjj-accent" />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-bjj-muted mb-1">{t.currentPlan}</p>
                <p className="text-2xl font-bold">{planDetails.name}</p>
                {planDetails.price && (
                  <p className="text-lg text-bjj-accent">{planDetails.price}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-bjj-muted mb-1">{t.status}</p>
                <div className="flex items-center gap-2">
                  {status === 'active' && (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">{t.active}</span>
                    </>
                  )}
                  {status === 'canceled' && (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">{t.canceled}</span>
                    </>
                  )}
                  {status === 'past_due' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-500">{t.pastDue}</span>
                    </>
                  )}
                </div>
              </div>

              {endDate && (
                <div>
                  <p className="text-sm text-bjj-muted mb-1">{t.nextBilling}</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(endDate).toLocaleDateString(
                      language === 'ja' ? 'ja-JP' : 
                      language === 'pt' ? 'pt-BR' : 
                      'en-US'
                    )}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {currentPlan !== 'free' && status === 'active' && (
                <>
                  <button
                    onClick={handleManagePayment}
                    disabled={loading}
                    className="w-full btn-ghost"
                  >
                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      t.managePayment
                    )}
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                    className="w-full text-red-500 hover:text-red-400 transition-colors"
                  >
                    {canceling ? (
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      t.cancelSubscription
                    )}
                  </button>
                </>
              )}
              {currentPlan === 'free' || status === 'canceled' && (
                <Link href="/pricing" className="w-full btn-primary text-center block">
                  {t.changePlan}
                </Link>
              )}
            </div>
          </div>

          {/* Plan Features */}
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <h2 className="text-xl font-semibold mb-6">{planDetails.name} 機能</h2>
            <ul className="space-y-3">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}