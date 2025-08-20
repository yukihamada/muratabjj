'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import { 
  Users, 
  Video, 
  Brain, 
  Shield, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Database,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalVideos: number
  publishedVideos: number
  totalSparringLogs: number
  activeSubscriptions: number
  recentRegistrations: number
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVideos: 0,
    publishedVideos: 0,
    totalSparringLogs: 0,
    activeSubscriptions: 0,
    recentRegistrations: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/dashboard')
      return
    }
    
    if (isAdmin) {
      fetchAdminStats()
    }
  }, [isAdmin, loading, router])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
        </div>
      </div>
    )
  }

  const adminCards = [
    {
      title: 'ユーザー管理',
      description: '全ユーザーの管理、権限設定',
      href: '/admin/users',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      stats: `${stats.totalUsers}名のユーザー`
    },
    {
      title: '動画管理',
      description: '動画の編集、公開設定、削除',
      href: '/admin/videos',
      icon: Video,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      stats: `${stats.publishedVideos}/${stats.totalVideos}本公開中`
    },
    {
      title: 'AI解析管理',
      description: '文字起こし、自動分類、解析結果',
      href: '/admin/ai-analysis',
      icon: Brain,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      stats: 'AI機能の管理'
    },
    {
      title: 'システム設定',
      description: 'アプリケーション設定、メンテナンス',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      stats: 'システム全般'
    }
  ]

  const quickStats = [
    {
      label: '総ユーザー数',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      label: '公開動画数',
      value: stats.publishedVideos,
      icon: Video,
      color: 'text-purple-400'
    },
    {
      label: 'アクティブ会員',
      value: stats.activeSubscriptions,
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      label: '今月の新規登録',
      value: stats.recentRegistrations,
      icon: TrendingUp,
      color: 'text-orange-400'
    }
  ]

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-bjj-accent" />
            <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
          </div>
          <p className="text-bjj-muted">
            Murata BJJシステムの管理・監視
          </p>
          <p className="text-sm text-bjj-accent mt-1">
            管理者: {user?.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card-gradient border border-white/10 rounded-bjj p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  {loadingStats ? (
                    <div className="animate-pulse bg-white/20 h-6 w-12 rounded"></div>
                  ) : (
                    <span className="text-2xl font-bold">{stat.value}</span>
                  )}
                </div>
                <p className="text-sm text-bjj-muted">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* System Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">システム状態</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-gradient border border-green-500/20 rounded-bjj p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium text-green-400">API稼働中</p>
                  <p className="text-sm text-bjj-muted">正常稼働</p>
                </div>
              </div>
            </div>
            
            <div className="card-gradient border border-green-500/20 rounded-bjj p-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium text-green-400">データベース</p>
                  <p className="text-sm text-bjj-muted">接続正常</p>
                </div>
              </div>
            </div>
            
            <div className="card-gradient border border-green-500/20 rounded-bjj p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium text-green-400">AI機能</p>
                  <p className="text-sm text-bjj-muted">Whisper API正常</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">管理機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Link 
                  key={index}
                  href={card.href}
                  className={`block p-6 rounded-bjj border ${card.bgColor} hover:border-opacity-50 transition-all hover:-translate-y-1`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className={`w-8 h-8 ${card.color}`} />
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                      {card.stats}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-bjj-muted text-sm">{card.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4">最近のアクティビティ</h2>
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-bjj-muted">システム起動</span>
                <span className="text-bjj-muted ml-auto">今日</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-bjj-muted">新規ユーザー登録: {stats.recentRegistrations}名</span>
                <span className="text-bjj-muted ml-auto">今月</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-bjj-muted">新規動画投稿待ち</span>
                <span className="text-bjj-muted ml-auto">確認中</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}