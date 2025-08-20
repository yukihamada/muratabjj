'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardNav from '@/components/DashboardNav'
import { AdaptiveReviewSystem, ReviewItem, ReviewSession } from '@/lib/adaptive-review'
import { 
  Brain, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar, 
  PlayCircle, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Video,
  GitBranch,
  Star
} from 'lucide-react'
import toast from 'react-hot-toast'

const translations = {
  ja: {
    title: 'アダプティブ復習',
    subtitle: 'AIが最適化した復習スケジュール',
    todaySession: '今日の復習セッション',
    weaknessSession: '弱点強化セッション',
    maintenanceSession: 'メンテナンス復習',
    startSession: 'セッション開始',
    estimatedTime: '推定時間',
    focusAreas: '重点分野',
    urgent: '緊急',
    recommended: '推奨',
    maintenance: 'メンテナンス',
    noReviews: '復習する項目がありません',
    masteryLevels: {
      1: '理解',
      2: '手順',
      3: '再現',
      4: '連携', 
      5: '実戦'
    },
    sessionTypes: {
      daily: '日次復習',
      weakness: '弱点強化',
      prep: '試合準備',
      maintenance: 'メンテナンス'
    },
    reviewNow: '今すぐ復習',
    minutes: '分',
    items: '項目',
    successRate: '成功率',
    difficulty: '難易度',
    lastReviewed: '最終復習',
    nextReview: '次回復習',
    loading: '読み込み中...',
  },
  en: {
    title: 'Adaptive Review',
    subtitle: 'AI-optimized review schedule',
    todaySession: "Today's Review Session",
    weaknessSession: 'Weakness Focus Session',
    maintenanceSession: 'Maintenance Review',
    startSession: 'Start Session',
    estimatedTime: 'Estimated Time',
    focusAreas: 'Focus Areas',
    urgent: 'Urgent',
    recommended: 'Recommended',
    maintenance: 'Maintenance',
    noReviews: 'No items to review',
    masteryLevels: {
      1: 'Understanding',
      2: 'Steps',
      3: 'Reproduction',
      4: 'Flow',
      5: 'Combat'
    },
    sessionTypes: {
      daily: 'Daily Review',
      weakness: 'Weakness Focus',
      prep: 'Competition Prep',
      maintenance: 'Maintenance'
    },
    reviewNow: 'Review Now',
    minutes: 'min',
    items: 'items',
    successRate: 'Success Rate',
    difficulty: 'Difficulty',
    lastReviewed: 'Last Reviewed',
    nextReview: 'Next Review',
    loading: 'Loading...',
  },
  pt: {
    title: 'Revisão Adaptativa',
    subtitle: 'Cronograma de revisão otimizado por IA',
    todaySession: 'Sessão de Revisão de Hoje',
    weaknessSession: 'Sessão de Foco em Fraquezas',
    maintenanceSession: 'Revisão de Manutenção',
    startSession: 'Iniciar Sessão',
    estimatedTime: 'Tempo Estimado',
    focusAreas: 'Áreas de Foco',
    urgent: 'Urgente',
    recommended: 'Recomendado',
    maintenance: 'Manutenção',
    noReviews: 'Nenhum item para revisar',
    masteryLevels: {
      1: 'Compreensão',
      2: 'Passos',
      3: 'Reprodução',
      4: 'Fluxo',
      5: 'Combate'
    },
    sessionTypes: {
      daily: 'Revisão Diária',
      weakness: 'Foco em Fraquezas',
      prep: 'Prep. Competição',
      maintenance: 'Manutenção'
    },
    reviewNow: 'Revisar Agora',
    minutes: 'min',
    items: 'itens',
    successRate: 'Taxa de Sucesso',
    difficulty: 'Dificuldade',
    lastReviewed: 'Última Revisão',
    nextReview: 'Próxima Revisão',
    loading: 'Carregando...',
  },
}

export default function AdaptiveReviewPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  
  const [loading, setLoading] = useState(true)
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [dailySession, setDailySession] = useState<ReviewSession | null>(null)
  const [weaknessSession, setWeaknessSession] = useState<ReviewSession | null>(null)
  const [maintenanceSession, setMaintenanceSession] = useState<ReviewSession | null>(null)
  const [selectedSession, setSelectedSession] = useState<ReviewSession | null>(null)
  
  const reviewSystem = new AdaptiveReviewSystem()

  useEffect(() => {
    if (user) {
      fetchUserProgress()
    }
  }, [user])

  const fetchUserProgress = async () => {
    try {
      // Fetch user progress data from multiple sources
      const [progressData, videoData, flowData] = await Promise.all([
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user!.id),
        supabase
          .from('videos')
          .select('id, title_ja, title_en, title_pt')
          .eq('is_published', true)
          .limit(50),
        supabase
          .from('flows')
          .select('id, title')
          .or(`created_by.eq.${user!.id},is_public.eq.true`)
          .limit(50)
      ])

      // Convert data to ReviewItems
      const items: ReviewItem[] = []
      
      // Add progress-based items
      if (progressData.data) {
        progressData.data.forEach((progress: any) => {
          items.push({
            id: progress.id,
            type: progress.content_type,
            title: progress.content_title || 'Unknown',
            masteryLevel: progress.mastery_level,
            lastReviewed: new Date(progress.last_practiced_at || progress.updated_at),
            reviewCount: progress.practice_count,
            successRate: Math.min(1, progress.practice_count > 0 ? progress.success_count / progress.practice_count : 0.5),
            difficulty: Math.random() * 0.5 + 0.3, // Mock difficulty
            interval: calculateIntervalFromMastery(progress.mastery_level),
            efactor: 2.5,
            priority: 0
          })
        })
      }

      // Add videos as potential review items
      if (videoData.data) {
        videoData.data.forEach((video: any) => {
          // Only add if not already in progress
          if (!items.find(item => item.type === 'video' && item.id === video.id)) {
            items.push({
              id: video.id,
              type: 'video',
              title: video[`title_${language}`] || video.title_ja,
              masteryLevel: 1,
              lastReviewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random last week
              reviewCount: 0,
              successRate: 0.5,
              difficulty: Math.random() * 0.4 + 0.3,
              interval: 1,
              efactor: 2.5,
              priority: 0
            })
          }
        })
      }

      // Add flows as potential review items
      if (flowData.data) {
        flowData.data.forEach((flow: any) => {
          if (!items.find(item => item.type === 'flow' && item.id === flow.id)) {
            items.push({
              id: flow.id,
              type: 'flow',
              title: flow.title,
              masteryLevel: 1,
              lastReviewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              reviewCount: 0,
              successRate: 0.5,
              difficulty: Math.random() * 0.4 + 0.3,
              interval: 1,
              efactor: 2.5,
              priority: 0
            })
          }
        })
      }

      setReviewItems(items)
      
      // Generate sessions
      const daily = reviewSystem.generateReviewSession(items, 'daily', 30)
      const weakness = reviewSystem.generateReviewSession(items, 'weakness', 20)
      const maintenance = reviewSystem.generateReviewSession(items, 'maintenance', 15)
      
      setDailySession(daily)
      setWeaknessSession(weakness)
      setMaintenanceSession(maintenance)

    } catch (error) {
      console.error('Error fetching user progress:', error)
      toast.error('Failed to load review data')
    } finally {
      setLoading(false)
    }
  }

  const calculateIntervalFromMastery = (masteryLevel: number): number => {
    const intervals = [1, 2, 4, 7, 14] // days
    return intervals[Math.max(0, Math.min(4, masteryLevel - 1))]
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'flow': return <GitBranch className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const getMasteryColor = (level: number): string => {
    const colors = [
      'text-red-400',
      'text-orange-400', 
      'text-yellow-400',
      'text-blue-400',
      'text-green-400'
    ]
    return colors[Math.max(0, Math.min(4, level - 1))]
  }

  const renderSessionCard = (session: ReviewSession | null, title: string, icon: React.ReactNode, type: string) => {
    if (!session || session.items.length === 0) {
      return (
        <div className="card-gradient border border-white/10 rounded-bjj p-6">
          <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-bjj-muted text-center py-8">{t.noReviews}</p>
        </div>
      )
    }

    return (
      <div className="card-gradient border border-white/10 rounded-bjj p-6 hover:border-bjj-accent/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={() => setSelectedSession(session)}
            className="btn-primary text-sm px-4 py-2"
          >
            {t.startSession}
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <p className="text-bjj-muted">{t.items}</p>
            <p className="font-semibold">{session.items.length}</p>
          </div>
          <div>
            <p className="text-bjj-muted">{t.estimatedTime}</p>
            <p className="font-semibold">{session.estimatedDuration}{t.minutes}</p>
          </div>
          <div>
            <p className="text-bjj-muted">タイプ</p>
            <p className="font-semibold">{t.sessionTypes[session.sessionType as keyof typeof t.sessionTypes]}</p>
          </div>
        </div>

        {session.focusAreas.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-bjj-muted mb-2">{t.focusAreas}</p>
            <div className="flex flex-wrap gap-2">
              {session.focusAreas.map((area, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-bjj-accent/20 text-bjj-accent rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {session.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm p-2 bg-white/5 rounded">
              {getItemIcon(item.type)}
              <span className="flex-1 truncate">{item.title}</span>
              <span className={`${getMasteryColor(item.masteryLevel)} font-medium`}>
                {t.masteryLevels[item.masteryLevel as keyof typeof t.masteryLevels]}
              </span>
            </div>
          ))}
          {session.items.length > 3 && (
            <p className="text-xs text-bjj-muted text-center">
              +{session.items.length - 3} more items
            </p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-bjj-accent" />
            {t.title}
          </h1>
          <p className="text-bjj-muted">{t.subtitle}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-gradient border border-white/10 rounded-bjj p-4">
            <div className="flex items-center justify-between">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <span className="text-xl font-bold">
                {reviewItems.filter(item => 
                  reviewSystem.calculatePriority(item) > 2
                ).length}
              </span>
            </div>
            <p className="text-sm text-bjj-muted">{t.urgent}</p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-4">
            <div className="flex items-center justify-between">
              <Target className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold">
                {reviewItems.filter(item => {
                  const priority = reviewSystem.calculatePriority(item)
                  return priority > 1 && priority <= 2
                }).length}
              </span>
            </div>
            <p className="text-sm text-bjj-muted">{t.recommended}</p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-xl font-bold">
                {reviewItems.filter(item => item.masteryLevel >= 4).length}
              </span>
            </div>
            <p className="text-sm text-bjj-muted">{t.maintenance}</p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-6 h-6 text-bjj-accent" />
              <span className="text-xl font-bold">
                {reviewItems.length > 0 
                  ? Math.round(reviewItems.reduce((sum, item) => sum + item.successRate, 0) / reviewItems.length * 100)
                  : 0}%
              </span>
            </div>
            <p className="text-sm text-bjj-muted">{t.successRate}</p>
          </div>
        </div>

        {/* Review Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderSessionCard(
            dailySession,
            t.todaySession,
            <Calendar className="w-6 h-6 text-bjj-accent" />,
            'daily'
          )}
          {renderSessionCard(
            weaknessSession,
            t.weaknessSession,
            <AlertCircle className="w-6 h-6 text-red-400" />,
            'weakness'
          )}
          {renderSessionCard(
            maintenanceSession,
            t.maintenanceSession,
            <Star className="w-6 h-6 text-green-400" />,
            'maintenance'
          )}
        </div>

        {/* Session Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-bjj-bg2 border border-white/10 rounded-bjj p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {t.sessionTypes[selectedSession.sessionType as keyof typeof t.sessionTypes]}
                </h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-bjj-muted hover:text-bjj-text"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-bjj-accent" />
                  <p className="font-semibold">{selectedSession.estimatedDuration} {t.minutes}</p>
                  <p className="text-sm text-bjj-muted">{t.estimatedTime}</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-bjj-accent" />
                  <p className="font-semibold">{selectedSession.items.length} {t.items}</p>
                  <p className="text-sm text-bjj-muted">復習項目</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {selectedSession.items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-bjj-muted w-6">{index + 1}</span>
                    {getItemIcon(item.type)}
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <div className="flex items-center gap-4 text-xs text-bjj-muted mt-1">
                        <span className={getMasteryColor(item.masteryLevel)}>
                          {t.masteryLevels[item.masteryLevel as keyof typeof t.masteryLevels]}
                        </span>
                        <span>{Math.round(item.successRate * 100)}% 成功率</span>
                        <span>{Math.round(item.difficulty * 100)}% 難易度</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    // TODO: Implement session start logic
                    toast.success('復習セッションを開始します')
                    setSelectedSession(null)
                  }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  {t.startSession}
                </button>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="btn-ghost px-6"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}