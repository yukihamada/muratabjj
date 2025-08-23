'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { Home, Video, Target, Swords, Brain, PenTool, User, LogOut, Shield } from 'lucide-react'

const translations = {
  ja: {
    dashboard: 'ダッシュボード',
    videos: '動画',
    progress: '習得度',
    sparring: 'スパーリング',
    review: '復習',
    flows: 'フロー',
    admin: '管理者',
    profile: 'プロフィール',
    logout: 'ログアウト',
  },
  en: {
    dashboard: 'Dashboard',
    videos: 'Videos',
    progress: 'Progress',
    sparring: 'Sparring',
    review: 'Review',
    flows: 'Flows',
    admin: 'Admin',
    profile: 'Profile',
    logout: 'Logout',
  },
  pt: {
    dashboard: 'Painel',
    videos: 'Vídeos',
    progress: 'Progresso',
    sparring: 'Sparring',
    review: 'Revisão',
    flows: 'Fluxos',
    admin: 'Admin',
    profile: 'Perfil',
    logout: 'Sair',
  },
  es: {
    dashboard: 'Panel',
    videos: 'Videos',
    progress: 'Progreso',
    sparring: 'Sparring',
    review: 'Revisión',
    flows: 'Flujos',
    admin: 'Admin',
    profile: 'Perfil',
    logout: 'Salir',
  },
  fr: {
    dashboard: 'Tableau de bord',
    videos: 'Vidéos',
    progress: 'Progrès',
    sparring: 'Sparring',
    review: 'Révision',
    flows: 'Flux',
    admin: 'Admin',
    profile: 'Profil',
    logout: 'Déconnexion',
  },
  ko: {
    dashboard: '대시보드',
    videos: '동영상',
    progress: '진도',
    sparring: '스파링',
    review: '복습',
    flows: '플로우',
    admin: '관리자',
    profile: '프로필',
    logout: '로그아웃',
  },
  ru: {
    dashboard: 'Панель',
    videos: 'Видео',
    progress: 'Прогресс',
    sparring: 'Спарринг',
    review: 'Повторение',
    flows: 'Потоки',
    admin: 'Админ',
    profile: 'Профиль',
    logout: 'Выйти',
  },
}

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, signOut, isAdmin, isCoach } = useAuth()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.ja

  const navItems = [
    { href: '/dashboard', label: t.dashboard, icon: Home },
    { href: '/dashboard/videos', label: t.videos, icon: Video },
    { href: '/dashboard/progress', label: t.progress, icon: Target },
    { href: '/dashboard/sparring', label: t.sparring, icon: Swords },
    { href: '/dashboard/review', label: t.review, icon: Brain },
    { href: '/flow-editor', label: t.flows, icon: PenTool },
    ...(isCoach ? [{ href: '/coach', label: language === 'ja' ? 'コーチ' : language === 'en' ? 'Coach' : 'Treinador', icon: Shield }] : []),
    ...(isAdmin ? [{ href: '/admin', label: t.admin, icon: Shield }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="nav-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ea384c"/>
                  <stop offset="1" stopColor="#d21f33"/>
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#nav-gradient)" opacity=".12"/>
              <path d="M12 40c6-12 11-18 20-18s14 6 20 18" fill="none" stroke="url(#nav-gradient)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="32" cy="32" r="4" fill="#ea384c"/>
            </svg>
            <span className="hidden sm:inline">Murata BJJ</span>
          </Link>

          {/* Navigation - Compact for mobile, expanded for desktop */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-bjj-accent bg-bjj-accent/10'
                      : 'text-bjj-muted hover:text-bjj-text hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium hidden lg:inline">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bjj-accent rounded-full hidden sm:block"></span>
                  )}
                </Link>
              )
            })}
            
            {/* More menu for additional items */}
            {navItems.length > 5 && (
              <div className="relative group">
                <button className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-bjj-muted hover:text-bjj-text hover:bg-white/5 transition-all">
                  <Shield className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-bjj-bg2 border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {navItems.slice(5).map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Compact */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            
            {user && (
              <div className="flex items-center gap-2">
                {/* User menu dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-bjj-muted hover:text-bjj-text hover:bg-white/5 transition-all"
                    title={user.email}
                  >
                    <User className="w-4 sm:w-5 h-4 sm:h-5" />
                  </button>
                  
                  <div className="absolute right-0 mt-1 w-56 bg-bjj-bg2 border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-sm font-medium text-bjj-text truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">{t.profile}</span>
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm(language === 'ja' ? 'ログアウトしますか？' : language === 'en' ? 'Are you sure you want to logout?' : 'Tem certeza que deseja sair?')) {
                          signOut()
                        }
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">{t.logout}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}