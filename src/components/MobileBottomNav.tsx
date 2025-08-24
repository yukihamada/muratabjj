'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Video, Target, Swords, PenTool } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  ja: {
    dashboard: 'ホーム',
    videos: '動画',
    progress: '習得度',
    sparring: 'スパー',
    flows: 'フロー',
  },
  en: {
    dashboard: 'Home',
    videos: 'Videos',
    progress: 'Progress',
    sparring: 'Spar',
    flows: 'Flows',
  },
  pt: {
    dashboard: 'Início',
    videos: 'Vídeos',
    progress: 'Progresso',
    sparring: 'Spar',
    flows: 'Fluxos',
  },
  es: {
    dashboard: 'Inicio',
    videos: 'Videos',
    progress: 'Progreso',
    sparring: 'Spar',
    flows: 'Flujos',
  },
  fr: {
    dashboard: 'Accueil',
    videos: 'Vidéos',
    progress: 'Progrès',
    sparring: 'Spar',
    flows: 'Flux',
  },
  ko: {
    dashboard: '홈',
    videos: '동영상',
    progress: '진도',
    sparring: '스파',
    flows: '플로우',
  },
  ru: {
    dashboard: 'Главная',
    videos: 'Видео',
    progress: 'Прогресс',
    sparring: 'Спар',
    flows: 'Потоки',
  },
  zh: {
    dashboard: '首页',
    videos: '视频',
    progress: '进度',
    sparring: '对练',
    flows: '流程',
  },
  de: {
    dashboard: 'Startseite',
    videos: 'Videos',
    progress: 'Fortschritt',
    sparring: 'Spar',
    flows: 'Abläufe',
  },
  it: {
    dashboard: 'Home',
    videos: 'Video',
    progress: 'Progresso',
    sparring: 'Spar',
    flows: 'Flussi',
  },
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]

  // ダッシュボード以外のページでは表示しない
  if (!pathname.startsWith('/dashboard')) {
    return null
  }

  const navItems = [
    { href: '/dashboard', label: t.dashboard, icon: Home },
    { href: '/dashboard/videos', label: t.videos, icon: Video },
    { href: '/dashboard/flows', label: t.flows, icon: PenTool },
    { href: '/dashboard/progress', label: t.progress, icon: Target },
    { href: '/dashboard/sparring', label: t.sparring, icon: Swords },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bjj-bg2 border-t border-white/10 safe-area-padding overscroll-none">
      <div className="grid grid-cols-5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative touch-target tap-highlight-transparent ${
                isActive
                  ? 'text-bjj-accent'
                  : 'text-bjj-muted'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-bjj-accent rounded-full"></span>
              )}
              <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}