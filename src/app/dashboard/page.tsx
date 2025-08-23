'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Video, Target, Swords, PenTool, TrendingUp, Calendar } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import DashboardNav from '@/components/DashboardNav'

const translations = {
  ja: {
    dashboard: 'ダッシュボード',
    welcome: 'ようこそ',
    quickActions: 'クイックアクション',
    viewVideos: '動画を見る',
    trackProgress: '習得度を確認',
    logSparring: 'スパーリングを記録',
    createFlow: 'フローを作成',
    recentActivity: '最近のアクティビティ',
    stats: '統計',
    totalVideos: '視聴した動画',
    techniquesLearned: '習得した技術',
    sparringSessions: 'スパーリング回数',
    currentBelt: '現在の帯',
    white: '白帯',
    blue: '青帯',
    purple: '紫帯',
    brown: '茶帯',
    black: '黒帯',
    loading: '読み込み中...',
  },
  en: {
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    quickActions: 'Quick Actions',
    viewVideos: 'View Videos',
    trackProgress: 'Track Progress',
    logSparring: 'Log Sparring',
    createFlow: 'Create Flow',
    recentActivity: 'Recent Activity',
    stats: 'Statistics',
    totalVideos: 'Videos Watched',
    techniquesLearned: 'Techniques Learned',
    sparringSessions: 'Sparring Sessions',
    currentBelt: 'Current Belt',
    white: 'White Belt',
    blue: 'Blue Belt',
    purple: 'Purple Belt',
    brown: 'Brown Belt',
    black: 'Black Belt',
    loading: 'Loading...',
  },
  pt: {
    dashboard: 'Painel',
    welcome: 'Bem-vindo',
    quickActions: 'Ações Rápidas',
    viewVideos: 'Ver Vídeos',
    trackProgress: 'Acompanhar Progresso',
    logSparring: 'Registrar Sparring',
    createFlow: 'Criar Fluxo',
    recentActivity: 'Atividade Recente',
    stats: 'Estatísticas',
    totalVideos: 'Vídeos Assistidos',
    techniquesLearned: 'Técnicas Aprendidas',
    sparringSessions: 'Sessões de Sparring',
    currentBelt: 'Faixa Atual',
    white: 'Faixa Branca',
    blue: 'Faixa Azul',
    purple: 'Faixa Roxa',
    brown: 'Faixa Marrom',
    black: 'Faixa Preta',
    loading: 'Carregando...',
  },
}

export default function DashboardPage() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    videosWatched: 0,
    techniquesLearned: 0,
    sparringSessions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error('プロフィールの取得エラー:', profileError)
      } else if (profileData) {
        setProfile(profileData)
      }

      // Load statistics
      const [progressData, sparringData] = await Promise.all([
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('sparring_logs')
          .select('*')
          .eq('user_id', user.id),
      ])

      setStats({
        videosWatched: progressData.data?.length || 0,
        techniquesLearned: progressData.data?.filter((p: any) => p.progress_level >= 3).length || 0,
        sparringSessions: sparringData.data?.length || 0,
      })

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    {
      title: t.viewVideos,
      href: '/dashboard/videos',
      icon: Video,
      color: 'bg-blue-500',
    },
    {
      title: t.trackProgress,
      href: '/dashboard/progress',
      icon: Target,
      color: 'bg-green-500',
    },
    {
      title: t.logSparring,
      href: '/dashboard/sparring',
      icon: Swords,
      color: 'bg-red-500',
    },
    {
      title: t.createFlow,
      href: '/flows',
      icon: PenTool,
      color: 'bg-purple-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.dashboard}</h1>
          <p className="text-bjj-muted">
            {t.welcome}, {profile?.full_name || profile?.email?.split('@')[0] || 'User'}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Video className="w-8 h-8 text-bjj-accent" />
              <span className="text-2xl font-bold">{stats.videosWatched}</span>
            </div>
            <p className="text-bjj-muted text-sm">{t.totalVideos}</p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{stats.techniquesLearned}</span>
            </div>
            <p className="text-bjj-muted text-sm">{t.techniquesLearned}</p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Swords className="w-8 h-8 text-red-500" />
              <span className="text-2xl font-bold">{stats.sparringSessions}</span>
            </div>
            <p className="text-bjj-muted text-sm">{t.sparringSessions}</p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div className="text-right">
                <p className="text-sm font-medium">{t.currentBelt}</p>
                <p className="text-lg font-bold">
                  {profile?.belt ? t[profile.belt as keyof typeof t] : t.white}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.quickActions}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="card-gradient border border-white/10 rounded-bjj p-6 hover:border-bjj-accent/50 transition-all"
                >
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium">{action.title}</h3>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{t.recentActivity}</h2>
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <p className="text-bjj-muted text-center py-8">
              {/* TODO: Implement recent activity */}
              No recent activity to display
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}