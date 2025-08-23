'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  ja: {
    title: 'ページが見つかりません',
    message: 'お探しのページは存在しないか、移動した可能性があります。',
    homeButton: 'ホームへ戻る',
    dashboardButton: 'ダッシュボードへ',
    support: 'エラーが続く場合は、サポート（support@muratabjj.com）までご連絡ください。'
  },
  en: {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist or has been moved.',
    homeButton: 'Back to Home',
    dashboardButton: 'To Dashboard',
    support: 'If the error persists, please contact support (support@muratabjj.com).'
  },
  pt: {
    title: 'Página Não Encontrada',
    message: 'A página que você está procurando não existe ou foi movida.',
    homeButton: 'Voltar ao Início',
    dashboardButton: 'Para o Painel',
    support: 'Se o erro persistir, entre em contato com o suporte (support@muratabjj.com).'
  }
}

export default function NotFound() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.ja

  return (
    <div className="min-h-screen bg-bjj-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-bold text-bjj-accent">404</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-bjj-text">
          {t.title}
        </h1>
        
        <p className="text-bjj-muted mb-8">
          {t.message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t.homeButton}
          </Link>
          
          <Link
            href="/dashboard"
            className="btn-ghost flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.dashboardButton}
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-white/5 rounded-bjj border border-white/10">
          <p className="text-sm text-bjj-muted">
            {t.support}
          </p>
        </div>
      </div>
    </div>
  )
}