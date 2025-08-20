'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/hooks/useAuth'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config'

export default function SubscriptionManager() {
  const { language } = useLanguage()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleCancelSubscription = async () => {
    if (!confirm(
      language === 'ja' ? '本当にサブスクリプションをキャンセルしますか？期間終了まではご利用いただけます。' :
      language === 'en' ? 'Are you sure you want to cancel your subscription? You can continue using it until the end of the period.' :
      'Tem certeza de que deseja cancelar sua assinatura? Você pode continuar usando até o final do período.'
    )) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/stripe/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel' }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      setMessage({
        type: 'success',
        text: language === 'ja' ? 'サブスクリプションをキャンセルしました。期間終了まではご利用いただけます。' :
              language === 'en' ? 'Your subscription has been canceled. You can continue using it until the end of the period.' :
              'Sua assinatura foi cancelada. Você pode continuar usando até o final do período.'
      })
    } catch (error) {
      console.error('Cancel subscription error:', error)
      setMessage({
        type: 'error',
        text: language === 'ja' ? 'キャンセル処理中にエラーが発生しました。' :
              language === 'en' ? 'An error occurred while canceling.' :
              'Ocorreu um erro ao cancelar.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/stripe/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reactivate' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription')
      }

      setMessage({
        type: 'success',
        text: language === 'ja' ? 'サブスクリプションを再開しました。' :
              language === 'en' ? 'Your subscription has been reactivated.' :
              'Sua assinatura foi reativada.'
      })
    } catch (error) {
      console.error('Reactivate subscription error:', error)
      setMessage({
        type: 'error',
        text: language === 'ja' ? '再開処理中にエラーが発生しました。' :
              language === 'en' ? 'An error occurred while reactivating.' :
              'Ocorreu um erro ao reativar.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create-portal' }),
      })

      if (!response.ok) {
        throw new Error('Failed to create billing portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Billing portal error:', error)
      setMessage({
        type: 'error',
        text: language === 'ja' ? '請求管理ポータルへのアクセスに失敗しました。' :
              language === 'en' ? 'Failed to access billing management portal.' :
              'Falha ao acessar o portal de gerenciamento de cobrança.'
      })
      setLoading(false)
    }
  }

  if (!profile || profile.subscription_plan === 'free') {
    return (
      <div className="card-gradient border border-white/10 rounded-bjj p-6">
        <h3 className="text-xl font-bold mb-4">
          {language === 'ja' ? 'サブスクリプション' : 
           language === 'en' ? 'Subscription' : 
           'Assinatura'}
        </h3>
        <p className="text-bjj-muted mb-4">
          {language === 'ja' ? '現在、無料プランをご利用中です。' :
           language === 'en' ? 'You are currently on the free plan.' :
           'Você está atualmente no plano gratuito.'}
        </p>
        <a href="/pricing" className="btn-primary">
          {language === 'ja' ? 'プランをアップグレード' :
           language === 'en' ? 'Upgrade Plan' :
           'Atualizar Plano'}
        </a>
      </div>
    )
  }

  const plan = SUBSCRIPTION_PLANS[profile.subscription_plan as keyof typeof SUBSCRIPTION_PLANS]
  const isCanceling = false // 'canceling' status is not in the current type definition

  return (
    <div className="card-gradient border border-white/10 rounded-bjj p-6">
      <h3 className="text-xl font-bold mb-4">
        {language === 'ja' ? 'サブスクリプション' : 
         language === 'en' ? 'Subscription' : 
         'Assinatura'}
      </h3>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' :
          'bg-red-500/10 border border-red-500/20 text-red-500'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-sm text-bjj-muted">
            {language === 'ja' ? '現在のプラン' :
             language === 'en' ? 'Current Plan' :
             'Plano Atual'}
          </p>
          <p className="text-lg font-semibold">{plan.name}</p>
        </div>

        <div>
          <p className="text-sm text-bjj-muted">
            {language === 'ja' ? 'ステータス' :
             language === 'en' ? 'Status' :
             'Status'}
          </p>
          <p className="text-lg">
            {profile.subscription_status === 'active' && (
              <span className="text-green-500">
                {language === 'ja' ? 'アクティブ' :
                 language === 'en' ? 'Active' :
                 'Ativo'}
              </span>
            )}
            {/* Canceling status not currently supported */}
            {profile.subscription_status === 'past_due' && (
              <span className="text-red-500">
                {language === 'ja' ? '支払い遅延' :
                 language === 'en' ? 'Past Due' :
                 'Pagamento Atrasado'}
              </span>
            )}
          </p>
        </div>

        {profile.subscription_period_end && (
          <div>
            <p className="text-sm text-bjj-muted">
              {isCanceling ? (
                language === 'ja' ? '利用終了日' :
                language === 'en' ? 'Ends on' :
                'Termina em'
              ) : (
                language === 'ja' ? '次回更新日' :
                language === 'en' ? 'Renews on' :
                'Renova em'
              )}
            </p>
            <p className="text-lg">
              {new Date(profile.subscription_period_end).toLocaleDateString(
                language === 'ja' ? 'ja-JP' :
                language === 'en' ? 'en-US' :
                'pt-BR'
              )}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            {language === 'ja' ? '請求情報を管理' :
             language === 'en' ? 'Manage Billing' :
             'Gerenciar Cobrança'}
          </button>

          {isCanceling ? (
            <button
              onClick={handleReactivateSubscription}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </span>
              ) : (
                language === 'ja' ? '再開する' :
                language === 'en' ? 'Reactivate' :
                'Reativar'
              )}
            </button>
          ) : (
            <button
              onClick={handleCancelSubscription}
              disabled={loading}
              className="btn-secondary flex-1 border-red-500/20 hover:border-red-500/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </span>
              ) : (
                language === 'ja' ? 'キャンセル' :
                language === 'en' ? 'Cancel' :
                'Cancelar'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}