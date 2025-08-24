'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/stripe/config'
import { getStripe } from '@/lib/stripe/client'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

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
      toast.error(
        language === 'ja' ? 'サブスクリプションを購入するにはログインが必要です' :
        language === 'en' ? 'Please log in to subscribe' :
        'Faça login para assinar'
      )
      // Show login dialog
      const loginButton = document.querySelector('[data-testid="login-button"]') as HTMLButtonElement
      if (loginButton) {
        loginButton.click()
      }
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
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      // Create checkout session
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header if session exists
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId,
          locale: language,
          billingPeriod: 'monthly', // TODO: Add billing period selection
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout session error:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session')
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
    const plan = SUBSCRIPTION_PLANS[planId]

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
      // If logged in but not subscribed, show current plan
      if (!profile?.subscription_plan || profile?.subscription_plan === 'free') {
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

    // Enterprise plan - custom pricing
    if (planId === 'dojo_enterprise') {
      return (
        <button
          className="btn-accent w-full"
          onClick={() => {
            // Open contact form or redirect to contact page
            window.open('mailto:sales@muratabjj.com?subject=Dojo Enterprise Plan Inquiry', '_blank')
          }}
        >
          {language === 'ja' ? 'お問い合わせ' : 
           language === 'en' ? 'Contact Sales' : 
           'Contatar Vendas'}
        </button>
      )
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

  const formatPrice = (price: number | null, currency: string = 'jpy') => {
    if (price === null) return language === 'ja' ? 'カスタム価格' : language === 'en' ? 'Custom pricing' : 'Preço personalizado'
    if (price === 0) return language === 'ja' ? '無料' : language === 'en' ? 'Free' : 'Gratuito'
    
    if (currency === 'jpy') {
      return `¥${price.toLocaleString()}/月`
    }
    return `$${(price / 100).toFixed(0)}/month`
  }

  // Split plans into personal and dojo categories
  const personalPlans: PlanId[] = ['free', 'basic', 'pro', 'master']
  const dojoPlans: PlanId[] = ['dojo_basic', 'dojo_pro', 'dojo_enterprise']

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">{t.pricing.title}</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}
        
        {/* Personal Plans */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">
            {language === 'ja' ? '個人プラン' : language === 'en' ? 'Personal Plans' : 'Planos Pessoais'}
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {personalPlans.map((planId) => {
              const plan = SUBSCRIPTION_PLANS[planId]
              return (
                <div
                  key={planId}
                  className={`card-gradient border ${planId === 'pro' ? 'border-bjj-accent' : 'border-white/10'} rounded-bjj p-6 relative`}
                >
                  {planId === 'pro' && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bjj-accent text-white px-3 py-1 rounded-full text-sm">
                      {language === 'ja' ? '人気' : language === 'en' ? 'Popular' : 'Popular'}
                    </span>
                  )}
                  
                  <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                  
                  <div className="mb-6">
                    <p className="text-2xl font-bold">
                      {formatPrice(plan.price, plan.currency)}
                    </p>
                    {plan.price && plan.price > 0 && (
                      <p className="text-sm text-bjj-muted mt-1">
                        {language === 'ja' ? `年払いで¥${Math.round(plan.price * 0.85).toLocaleString()}/月` : 
                         language === 'en' ? `$${Math.round(plan.price * 0.85 / 100)}/month billed yearly` : 
                         `R$${Math.round(plan.price * 0.85 / 20)}/mês cobrado anualmente`}
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mb-6 min-h-[160px]">
                    {plan.features[language as keyof typeof plan.features].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-bjj-accent mt-1">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {renderPlanButton(planId)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dojo Plans */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-center">
            {language === 'ja' ? '道場プラン' : language === 'en' ? 'Dojo Plans' : 'Planos do Dojo'}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {dojoPlans.map((planId) => {
              const plan = SUBSCRIPTION_PLANS[planId]
              return (
                <div
                  key={planId}
                  className={`card-gradient border ${planId === 'dojo_pro' ? 'border-bjj-accent' : 'border-white/10'} rounded-bjj p-6 relative`}
                >
                  {planId === 'dojo_pro' && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bjj-accent text-white px-3 py-1 rounded-full text-sm">
                      {language === 'ja' ? '推奨' : language === 'en' ? 'Recommended' : 'Recomendado'}
                    </span>
                  )}
                  
                  <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                  
                  <div className="mb-6">
                    <p className="text-2xl font-bold">
                      {formatPrice(plan.price, plan.currency)}
                    </p>
                    {plan.price && plan.price > 0 && (
                      <p className="text-sm text-bjj-muted mt-1">
                        {language === 'ja' ? `年払いで¥${Math.round(plan.price * 0.85).toLocaleString()}/月` : 
                         language === 'en' ? `$${Math.round(plan.price * 0.85 / 100)}/month billed yearly` : 
                         `R$${Math.round(plan.price * 0.85 / 20)}/mês cobrado anualmente`}
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mb-6 min-h-[200px]">
                    {plan.features[language as keyof typeof plan.features].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-bjj-accent mt-1">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {renderPlanButton(planId)}
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="mt-12 text-center text-sm text-bjj-muted">
          <p className="mb-2">
            {language === 'ja' ? '※ いつでもキャンセル可能' : 
             language === 'en' ? '* Cancel anytime' : 
             '* Cancele a qualquer momento'}
          </p>
          <p className="mb-2">
            {language === 'ja' ? '※ 料金は税込み表示です' : 
             language === 'en' ? '* Prices include tax' : 
             '* Preços incluem impostos'}
          </p>
          <p>
            {language === 'ja' ? '※ 年額プランは15%オフ' : 
             language === 'en' ? '* 15% off with yearly plans' : 
             '* 15% de desconto nos planos anuais'}
          </p>
        </div>
      </div>
    </section>
  )
}