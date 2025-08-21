'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/stripe/config'
import { getStripe } from '@/lib/stripe/client'
import { useAuth } from '@/hooks/useAuth'

export default function PricingWithStripe() {
  const { t, language } = useLanguage()
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (planId: PlanId) => {
    setError(null)
    
    // Check if user is authenticated
    if (!user) {
      router.push(`/auth/callback?redirect=/pricing&plan=${planId}`)
      return
    }

    // Don't process free plan
    if (planId === 'free') {
      return
    }

    // Check if user already has this plan
    if (profile?.subscription_plan === planId && profile?.subscription_status === 'active') {
      setError(language === 'ja' ? 'このプランは既に登録されています。' : 
               language === 'en' ? 'You are already subscribed to this plan.' : 
               'Você já está inscrito neste plano.')
      return
    }

    setLoading(planId)

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          locale: language,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      const { error } = await stripe!.redirectToCheckout({ sessionId })

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Subscription error:', err)
      setError(
        language === 'ja' ? '申し込み処理中にエラーが発生しました。' :
        language === 'en' ? 'An error occurred during subscription.' :
        'Ocorreu um erro durante a inscrição.'
      )
    } finally {
      setLoading(null)
    }
  }

  const renderPlanButton = (planId: PlanId) => {
    const isCurrentPlan = profile?.subscription_plan === planId && profile?.subscription_status === 'active'
    const isLoading = loading === planId
    const isPro = profile?.subscription_plan === 'pro' && profile?.subscription_status === 'active'
    const isDojo = profile?.subscription_plan === 'dojo' && profile?.subscription_status === 'active'

    // Free plan button
    if (planId === 'free') {
      // If not logged in, show start free button
      if (!user) {
        return (
          <button
            className="btn-primary w-full"
            onClick={() => router.push('/signup')}
          >
            {language === 'ja' ? '無料で始める' : 
             language === 'en' ? 'Start Free' : 
             'Começar Grátis'}
          </button>
        )
      }
      // If logged in but not Pro/Dojo, show current plan
      if (!isPro && !isDojo) {
        return (
          <button
            className="btn-secondary w-full"
            disabled
          >
            {language === 'ja' ? '現在のプラン' : 
             language === 'en' ? 'Current Plan' : 
             'Plano Atual'}
          </button>
        )
      }
      return null
    }

    // Current plan
    if (isCurrentPlan) {
      return (
        <button
          className="btn-secondary w-full"
          disabled
        >
          {language === 'ja' ? '現在のプラン' : 
           language === 'en' ? 'Current Plan' : 
           'Plano Atual'}
        </button>
      )
    }

    // Downgrade not allowed
    if (planId === 'pro' && isDojo) {
      return null
    }

    return (
      <button
        className="btn-primary w-full"
        onClick={() => handleSubscribe(planId)}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {language === 'ja' ? '処理中...' : 
             language === 'en' ? 'Processing...' : 
             'Processando...'}
          </span>
        ) : (
          language === 'ja' ? '申し込む' : 
          language === 'en' ? 'Subscribe' : 
          'Assinar'
        )}
      </button>
    )
  }

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">{t.pricing.title}</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(SUBSCRIPTION_PLANS) as [PlanId, typeof SUBSCRIPTION_PLANS[PlanId]][]).map(([planId, plan], index) => (
            <div
              key={planId}
              className={`card-gradient border ${planId === 'pro' ? 'border-bjj-accent' : 'border-white/10'} rounded-bjj p-6 relative`}
            >
              {planId === 'pro' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bjj-accent text-white px-3 py-1 rounded-full text-sm">
                  {language === 'ja' ? '人気' : language === 'en' ? 'Popular' : 'Popular'}
                </span>
              )}
              
              <h3 className="text-xl font-bold mb-2">
                {planId === 'free' && (language === 'ja' ? '個人 Free' : language === 'en' ? 'Personal Free' : 'Pessoal Gratuito')}
                {planId === 'pro' && 'Pro'}
                {planId === 'dojo' && (language === 'ja' ? '道場' : 'Dojo')}
              </h3>
              
              <div className="mb-6">
                <p className="text-2xl font-bold">
                  {planId === 'free' && (language === 'ja' ? '¥0' : language === 'en' ? '$0' : 'R$0')}
                  {planId === 'pro' && (language === 'ja' ? '¥1,200/月' : language === 'en' ? '$12/month' : 'R$60/mês')}
                  {planId === 'dojo' && (language === 'ja' ? '¥6,000/月〜' : language === 'en' ? '$60/month+' : 'R$300/mês+')}
                </p>
                {planId === 'pro' && (
                  <p className="text-sm text-bjj-muted mt-1">
                    {language === 'ja' ? '年払いで¥1,080/月' : 
                     language === 'en' ? '$10.80/month billed yearly' : 
                     'R$54/mês cobrado anualmente'}
                  </p>
                )}
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features[language as keyof typeof plan.features].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-bjj-accent mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {renderPlanButton(planId)}
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-bjj-muted">
          <p>
            {language === 'ja' ? '※ いつでもキャンセル可能' : 
             language === 'en' ? '* Cancel anytime' : 
             '* Cancele a qualquer momento'}
          </p>
          <p>
            {language === 'ja' ? '※ 料金は税込み表示です' : 
             language === 'en' ? '* Prices include tax' : 
             '* Preços incluem impostos'}
          </p>
        </div>
      </div>
    </section>
  )
}