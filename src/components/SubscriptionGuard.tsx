'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { checkSubscriptionAccess } from '@/lib/stripe/subscription-guard'
import { type PlanId } from '@/lib/stripe/config'
import { Lock } from 'lucide-react'

interface SubscriptionGuardProps {
  requiredPlan?: PlanId
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function SubscriptionGuard({
  requiredPlan,
  children,
  fallback,
  redirectTo = '/pricing',
}: SubscriptionGuardProps) {
  const { user, profile, loading: authLoading } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || authLoading) {
        setLoading(false)
        return
      }

      const result = await checkSubscriptionAccess(user.id, requiredPlan)
      setHasAccess(result.hasAccess)
      setLoading(false)

      if (!result.hasAccess && redirectTo && !fallback) {
        router.push(redirectTo)
      }
    }

    checkAccess()
  }, [user, profile, authLoading, requiredPlan, redirectTo, router, fallback])

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="text-center p-8 card-gradient border border-white/10 rounded-bjj">
        <Lock className="w-12 h-12 mx-auto mb-4 text-bjj-muted" />
        <h3 className="text-xl font-bold mb-2">
          {language === 'ja' ? 'ログインが必要です' :
           language === 'en' ? 'Login Required' :
           'Login Necessário'}
        </h3>
        <p className="text-bjj-muted mb-4">
          {language === 'ja' ? 'この機能を利用するにはログインしてください。' :
           language === 'en' ? 'Please login to access this feature.' :
           'Por favor, faça login para acessar este recurso.'}
        </p>
        <button
          onClick={() => router.push('/auth/callback')}
          className="btn-primary"
        >
          {language === 'ja' ? 'ログイン' :
           language === 'en' ? 'Login' :
           'Entrar'}
        </button>
      </div>
    )
  }

  if (hasAccess === false) {
    return fallback || (
      <div className="text-center p-8 card-gradient border border-white/10 rounded-bjj">
        <Lock className="w-12 h-12 mx-auto mb-4 text-bjj-accent" />
        <h3 className="text-xl font-bold mb-2">
          {language === 'ja' ? 'プレミアム機能' :
           language === 'en' ? 'Premium Feature' :
           'Recurso Premium'}
        </h3>
        <p className="text-bjj-muted mb-4">
          {language === 'ja' ? `この機能を利用するには${requiredPlan === 'pro' ? 'Pro' : '道場'}プラン以上への登録が必要です。` :
           language === 'en' ? `This feature requires ${requiredPlan === 'pro' ? 'Pro' : 'Dojo'} plan or higher.` :
           `Este recurso requer o plano ${requiredPlan === 'pro' ? 'Pro' : 'Dojo'} ou superior.`}
        </p>
        <button
          onClick={() => router.push('/pricing')}
          className="btn-primary"
        >
          {language === 'ja' ? 'プランを見る' :
           language === 'en' ? 'View Plans' :
           'Ver Planos'}
        </button>
      </div>
    )
  }

  return <>{children}</>
}