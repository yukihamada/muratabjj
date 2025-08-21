'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { Home, Video, Target, Swords, PenTool, User, LogOut, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUserProfile } from '@/lib/supabase/helpers'

const translations = {
  ja: {
    home: 'ホーム',
    videos: '動画',
    progress: '習得度',
    sparring: 'スパーログ',
    flows: 'フロー',
    profile: 'プロフィール',
    logout: 'ログアウト',
    uploadVideo: '動画アップロード',
  },
  en: {
    home: 'Home',
    videos: 'Videos',
    progress: 'Progress',
    sparring: 'Sparring',
    flows: 'Flows',
    profile: 'Profile',
    logout: 'Logout',
    uploadVideo: 'Upload Video',
  },
  pt: {
    home: 'Início',
    videos: 'Vídeos',
    progress: 'Progresso',
    sparring: 'Sparring',
    flows: 'Fluxos',
    profile: 'Perfil',
    logout: 'Sair',
    uploadVideo: 'Enviar Vídeo',
  },
  es: {
    home: 'Inicio',
    videos: 'Videos',
    progress: 'Progreso',
    sparring: 'Sparring',
    flows: 'Flows',
    profile: 'Perfil',
    logout: 'Cerrar Sesión',
    uploadVideo: 'Subir Video',
  },
  fr: {
    home: 'Accueil',
    videos: 'Vidéos',
    progress: 'Progrès',
    sparring: 'Sparring',
    flows: 'Flows',
    profile: 'Profil',
    logout: 'Déconnexion',
    uploadVideo: 'Télécharger Vidéo',
  },
  ko: {
    home: '홈',
    videos: '비디오',
    progress: '진도',
    sparring: '스파링',
    flows: 'Flows',
    profile: '프로필',
    logout: '로그아웃',
    uploadVideo: '비디오 업로드',
  },
  ru: {
    home: 'Главная',
    videos: 'Видео',
    progress: 'Прогресс',
    sparring: 'Спарринг',
    flows: 'Flows',
    profile: 'Профиль',
    logout: 'Выйти',
    uploadVideo: 'Загрузить видео',
  },
}

export default function AppNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { locale } = useLanguage()
  const t = translations[locale]
  const [isCoach, setIsCoach] = useState(false)

  useEffect(() => {
    if (user) {
      checkCoachStatus()
    }
  }, [user])

  async function checkCoachStatus() {
    if (!user) return
    const { data } = await getUserProfile(user.id)
    if (data?.is_coach) {
      setIsCoach(true)
    }
  }

  const navItems = [
    { href: '/', label: t.home, icon: Home },
    { href: '/videos', label: t.videos, icon: Video },
    { href: '/progress', label: t.progress, icon: Target },
    { href: '/sparring', label: t.sparring, icon: Swords },
    { href: '/flows', label: t.flows, icon: PenTool },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="nav-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ea384c"/>
                  <stop offset="1" stopColor="#d21f33"/>
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#nav-g)" opacity=".12"/>
              <path d="M12 40c6-12 11-18 20-18s14 6 20 18" fill="none" stroke="url(#nav-g)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="32" cy="32" r="4" fill="#ea384c"/>
            </svg>
            Murata BJJ
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
            
            {/* Upload Video (for coaches) */}
            {isCoach && (
              <Link
                href="/videos/upload"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  pathname === '/videos/upload'
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">{t.uploadVideo}</span>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {user && (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    pathname === '/profile'
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">{user.email?.split('@')[0]}</span>
                </Link>
                
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  isActive
                    ? 'text-purple-700'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}