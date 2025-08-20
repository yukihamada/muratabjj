'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const { refreshProfile } = useAuth()
  
  const plan = searchParams.get('plan')

  useEffect(() => {
    // Refresh profile to get updated subscription data
    refreshProfile()
    
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router, refreshProfile])

  return (
    <div className="min-h-screen bg-bjj-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="card-gradient border border-white/10 rounded-bjj p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold mb-4">
            {language === 'ja' ? 'お支払いが完了しました！' :
             language === 'en' ? 'Payment Successful!' :
             'Pagamento Realizado com Sucesso!'}
          </h1>
          
          <p className="text-bjj-muted mb-6">
            {language === 'ja' ? `${plan === 'pro' ? 'Pro' : '道場'}プランへようこそ！すべての機能をご利用いただけます。` :
             language === 'en' ? `Welcome to the ${plan === 'pro' ? 'Pro' : 'Dojo'} plan! You now have access to all features.` :
             `Bem-vindo ao plano ${plan === 'pro' ? 'Pro' : 'Dojo'}! Você agora tem acesso a todos os recursos.`}
          </p>
          
          <p className="text-sm text-bjj-muted mb-6">
            {language === 'ja' ? 'まもなくダッシュボードへリダイレクトされます...' :
             language === 'en' ? 'Redirecting to dashboard...' :
             'Redirecionando para o painel...'}
          </p>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary w-full"
          >
            {language === 'ja' ? 'ダッシュボードへ移動' :
             language === 'en' ? 'Go to Dashboard' :
             'Ir para o Painel'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bjj-bg flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}