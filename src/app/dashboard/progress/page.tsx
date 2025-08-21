'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { Trophy, TrendingUp, Target, Calendar, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardNav from '@/components/DashboardNav'

interface ProgressData {
  id: string
  video_id: string | null
  flow_id: string | null
  progress_level: number
  notes: string | null
  last_practiced: string
  video?: {
    title: string
    category: string
    thumbnail_url: string | null
  }
  flow?: {
    title: string
    category: string
  }
}

const progressLevels = {
  ja: ['理解', '手順', '再現', '連携', '実戦'],
  en: ['Understanding', 'Steps', 'Reproduction', 'Flow', 'Sparring'],
  pt: ['Compreensão', 'Passos', 'Reprodução', 'Fluxo', 'Sparring'],
  es: ['Comprensión', 'Pasos', 'Ejecución', 'Flow', 'En Vivo'],
  fr: ['Compréhension', 'Étapes', 'Exécution', 'Flow', 'En Direct'],
  ko: ['이해', '단계', '실행', 'Flow', '라이브'],
  ru: ['Понимание', 'Шаги', 'Выполнение', 'Flow', 'Вживую']
}

const levelDescriptions = {
  ja: [
    '動画を視聴し、技の概念を理解した',
    '技の手順を記憶し、説明できる',
    '一人で技を再現できる',
    'フローの中で技を実行できる',
    'スパーリングで実戦使用できる'
  ],
  en: [
    'Watched video and understood the concept',
    'Memorized steps and can explain',
    'Can reproduce technique alone',
    'Can execute within a flow',
    'Can use in live sparring'
  ],
  pt: [
    'Assistiu o vídeo e entendeu o conceito',
    'Memorizou os passos e pode explicar',
    'Pode reproduzir a técnica sozinho',
    'Pode executar dentro de um fluxo',
    'Pode usar no sparring ao vivo'
  ],
  es: [
    'Vi el video y entendí el concepto',
    'Memoricé los pasos y puedo explicar',
    'Puedo reproducir la técnica solo',
    'Puedo ejecutar dentro de un flow',
    'Puedo usar en sparring en vivo'
  ],
  fr: [
    'A regardé la vidéo et compris le concept',
    'A mémorisé les étapes et peut expliquer',
    'Peut reproduire la technique seul',
    'Peut exécuter dans un flow',
    'Peut utiliser en sparring en direct'
  ],
  ko: [
    '비디오를 시청하고 개념을 이해했습니다',
    '단계를 암기하고 설명할 수 있습니다',
    '혼자서 기술을 재현할 수 있습니다',
    'Flow 내에서 실행할 수 있습니다',
    '라이브 스파링에서 사용할 수 있습니다'
  ],
  ru: [
    'Просмотрел видео и понял концепцию',
    'Запомнил шаги и могу объяснить',
    'Могу воспроизвести технику в одиночку',
    'Могу выполнить в рамках flow',
    'Могу использовать в живом спарринге'
  ]
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'video' | 'flow'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'level'>('recent')

  useEffect(() => {
    if (user) {
      fetchProgressData()
    }
  }, [user, filter])

  const fetchProgressData = async () => {
    try {
      console.log('[Progress] Fetching progress data for user:', user?.id)
      
      let query = supabase
        .from('progress_tracking')
        .select(`
          *,
          video:videos!video_id(title, category, thumbnail_url),
          flow:flows!flow_id(title, category)
        `)
        .eq('user_id', user!.id)

      if (filter === 'video') {
        query = query.not('video_id', 'is', null)
      } else if (filter === 'flow') {
        query = query.not('flow_id', 'is', null)
      }

      const { data, error } = await query

      if (error) {
        console.error('[Progress] Database error:', error)
        // テーブルが存在しない場合はエラーではなく空の状態として扱う
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('[Progress] Table does not exist yet, showing empty state')
          setProgressData([])
          return
        }
        throw error
      }

      console.log('[Progress] Data fetched:', data?.length || 0, 'items')
      setProgressData(data || [])
    } catch (error: any) {
      console.error('[Progress] Error fetching progress:', error)
      
      // ネットワークエラーや設定問題の場合
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        toast.error('ネットワークエラーが発生しました。接続を確認してください。')
      } else if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        toast.error('認証の問題が発生しました。ページをリロードしてください。')
      } else {
        // 一般的なエラーでも空の状態を表示
        console.log('[Progress] Showing empty state due to error')
        setProgressData([])
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (id: string, newLevel: number) => {
    try {
      const { error } = await supabase
        .from('progress_tracking')
        .update({ 
          progress_level: newLevel,
          last_practiced: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('進捗を更新しました')
      fetchProgressData()
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('進捗の更新に失敗しました')
    }
  }

  const getSortedData = () => {
    const sorted = [...progressData]
    if (sortBy === 'recent') {
      return sorted.sort((a, b) => 
        new Date(b.last_practiced).getTime() - new Date(a.last_practiced).getTime()
      )
    } else {
      return sorted.sort((a, b) => b.progress_level - a.progress_level)
    }
  }

  const getStats = () => {
    const total = progressData.length
    const mastered = progressData.filter(p => p.progress_level === 5).length
    const inProgress = progressData.filter(p => p.progress_level > 1 && p.progress_level < 5).length
    const averageLevel = total > 0 
      ? progressData.reduce((sum, p) => sum + p.progress_level, 0) / total 
      : 0

    return { total, mastered, inProgress, averageLevel }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {language === 'ja' ? '習得度トラッキング' : language === 'en' ? 'Progress Tracking' : 'Acompanhamento de Progresso'}
          </h1>
          <p className="text-bjj-muted">
            {language === 'ja' ? '技術の習得度を5段階で管理し、効率的な上達をサポートします' : 
             language === 'en' ? 'Track your technique mastery in 5 levels for efficient improvement' :
             'Acompanhe seu domínio das técnicas em 5 níveis para melhorar eficientemente'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-bjj-accent" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-bjj-muted">
              {language === 'ja' ? '学習中の技術' : language === 'en' ? 'Techniques Learning' : 'Técnicas em Aprendizado'}
            </p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{stats.mastered}</span>
            </div>
            <p className="text-sm text-bjj-muted">
              {language === 'ja' ? '実戦レベル' : language === 'en' ? 'Sparring Ready' : 'Pronto para Sparring'}
            </p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">{stats.inProgress}</span>
            </div>
            <p className="text-sm text-bjj-muted">
              {language === 'ja' ? '練習中' : language === 'en' ? 'In Progress' : 'Em Progresso'}
            </p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{stats.averageLevel.toFixed(1)}</span>
            </div>
            <p className="text-sm text-bjj-muted">
              {language === 'ja' ? '平均習得度' : language === 'en' ? 'Average Level' : 'Nível Médio'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-bjj-accent text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {language === 'ja' ? 'すべて' : language === 'en' ? 'All' : 'Todos'}
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'video' ? 'bg-bjj-accent text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {language === 'ja' ? '動画' : language === 'en' ? 'Videos' : 'Vídeos'}
            </button>
            <button
              onClick={() => setFilter('flow')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'flow' ? 'bg-bjj-accent text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {language === 'ja' ? 'フロー' : language === 'en' ? 'Flows' : 'Fluxos'}
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'recent' ? 'bg-bjj-accent text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {language === 'ja' ? '最近の練習' : language === 'en' ? 'Recent' : 'Recente'}
            </button>
            <button
              onClick={() => setSortBy('level')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'level' ? 'bg-bjj-accent text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {language === 'ja' ? '習得度順' : language === 'en' ? 'By Level' : 'Por Nível'}
            </button>
          </div>
        </div>

        {/* Progress List */}
        <div className="space-y-4">
          {getSortedData().map((item) => (
            <div key={item.id} className="card-gradient border border-white/10 rounded-bjj p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Thumbnail */}
                {item.video?.thumbnail_url && (
                  <div className="w-full md:w-32 h-20 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.video.thumbnail_url} 
                      alt={item.video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-2">
                    {item.video?.title || item.flow?.title}
                  </h3>
                  <p className="text-sm text-bjj-muted mb-4">
                    {item.video ? 'Video' : 'Flow'} • {item.video?.category || item.flow?.category}
                  </p>

                  {/* Progress Levels */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateProgress(item.id, level)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          level <= item.progress_level
                            ? 'bg-bjj-accent text-black font-semibold'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                        title={levelDescriptions[language][level - 1]}
                      >
                        {level}. {progressLevels[language][level - 1]}
                      </button>
                    ))}
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-sm text-bjj-muted mb-2">
                      {item.notes}
                    </p>
                  )}

                  {/* Last Practiced */}
                  <p className="text-xs text-bjj-muted">
                    {language === 'ja' ? '最終練習:' : language === 'en' ? 'Last practiced:' : 'Última prática:'} {
                      new Date(item.last_practiced).toLocaleDateString(
                        language === 'ja' ? 'ja-JP' : language === 'pt' ? 'pt-BR' : 'en-US'
                      )
                    }
                  </p>
                </div>

                {/* Action */}
                <div className="flex items-center">
                  <ChevronRight className="w-5 h-5 text-bjj-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {progressData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-bjj-muted">
              {language === 'ja' ? 'まだ進捗データがありません。動画を視聴して技術の習得を開始しましょう！' :
               language === 'en' ? 'No progress data yet. Watch videos to start tracking your technique mastery!' :
               'Ainda não há dados de progresso. Assista vídeos para começar a acompanhar seu domínio das técnicas!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}