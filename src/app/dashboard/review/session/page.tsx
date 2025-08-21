'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { AdaptiveReviewSystem, ReviewItem } from '@/lib/adaptive-review'
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle,
  SkipForward,
  Video,
  GitBranch,
  BookOpen,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const translations = {
  ja: {
    title: '復習セッション',
    loading: '読み込み中...',
    noItems: '復習する項目がありません',
    backToReview: '復習ページに戻る',
    question: '次の技術を覚えていますか？',
    showAnswer: '答えを見る',
    hideAnswer: '答えを隠す',
    howWell: 'どのくらい覚えていましたか？',
    perfect: '完璧',
    good: '良い',
    ok: 'まあまあ',
    hard: '難しい',
    forgot: '忘れた',
    skip: 'スキップ',
    progress: '進捗',
    timeElapsed: '経過時間',
    completed: 'セッション完了！',
    reviewComplete: '復習が完了しました',
    itemsReviewed: '項目を復習しました',
    accuracy: '正答率',
    nextReview: '次回復習',
    viewDetails: '詳細を見る',
    continueReview: '復習を続ける',
    finishSession: 'セッションを終了',
    technique: '技術',
    flow: 'フロー',
    video: '動画',
  },
  en: {
    title: 'Review Session',
    loading: 'Loading...',
    noItems: 'No items to review',
    backToReview: 'Back to Review',
    question: 'Do you remember this technique?',
    showAnswer: 'Show Answer',
    hideAnswer: 'Hide Answer',
    howWell: 'How well did you remember?',
    perfect: 'Perfect',
    good: 'Good',
    ok: 'OK',
    hard: 'Hard',
    forgot: 'Forgot',
    skip: 'Skip',
    progress: 'Progress',
    timeElapsed: 'Time Elapsed',
    completed: 'Session Complete!',
    reviewComplete: 'Review completed',
    itemsReviewed: 'items reviewed',
    accuracy: 'Accuracy',
    nextReview: 'Next Review',
    viewDetails: 'View Details',
    continueReview: 'Continue Review',
    finishSession: 'Finish Session',
    technique: 'Technique',
    flow: 'Flow',
    video: 'Video',
  },
  pt: {
    title: 'Sessão de Revisão',
    loading: 'Carregando...',
    noItems: 'Nenhum item para revisar',
    backToReview: 'Voltar para Revisão',
    question: 'Você se lembra desta técnica?',
    showAnswer: 'Mostrar Resposta',
    hideAnswer: 'Ocultar Resposta',
    howWell: 'Quão bem você se lembrou?',
    perfect: 'Perfeito',
    good: 'Bom',
    ok: 'OK',
    hard: 'Difícil',
    forgot: 'Esqueci',
    skip: 'Pular',
    progress: 'Progresso',
    timeElapsed: 'Tempo Decorrido',
    completed: 'Sessão Completa!',
    reviewComplete: 'Revisão concluída',
    itemsReviewed: 'itens revisados',
    accuracy: 'Precisão',
    nextReview: 'Próxima Revisão',
    viewDetails: 'Ver Detalhes',
    continueReview: 'Continuar Revisão',
    finishSession: 'Finalizar Sessão',
    technique: 'Técnica',
    flow: 'Fluxo',
    video: 'Vídeo',
  },
}

function ReviewSessionPageContent() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = translations[language as keyof typeof translations]
  
  const [loading, setLoading] = useState(true)
  const [currentItem, setCurrentItem] = useState<ReviewItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStartTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [reviewedItems, setReviewedItems] = useState<{
    item: ReviewItem
    quality: number
    timeSpent: number
  }[]>([])
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const itemStartTimeRef = useRef<number>(Date.now())
  const reviewSystem = new AdaptiveReviewSystem()

  useEffect(() => {
    if (user) {
      initializeSession()
    }

    // Timer
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - sessionStartTime)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [user])

  const initializeSession = async () => {
    try {
      const sessionType = searchParams.get('type') || 'daily'
      const duration = parseInt(searchParams.get('duration') || '30')
      
      // Fetch user progress and generate session
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id)
      
      const { data: videoData } = await supabase
        .from('videos')
        .select('id, title_ja, title_en, title_pt, technique_id')
        .eq('is_published', true)
        .limit(50)
      
      const { data: flowData } = await supabase
        .from('flows')
        .select('id, title')
        .or(`created_by.eq.${user!.id},is_public.eq.true`)
        .limit(50)

      // Convert to ReviewItems
      const items: ReviewItem[] = []
      
      // Add progress-based items
      if (progressData) {
        progressData.forEach((progress: any) => {
          items.push({
            id: progress.id,
            type: progress.content_type,
            title: progress.content_title || 'Unknown',
            masteryLevel: progress.mastery_level,
            lastReviewed: new Date(progress.last_practiced_at || progress.updated_at),
            reviewCount: progress.practice_count,
            successRate: Math.min(1, progress.practice_count > 0 ? progress.success_count / progress.practice_count : 0.5),
            difficulty: Math.random() * 0.5 + 0.3,
            interval: calculateIntervalFromMastery(progress.mastery_level),
            efactor: 2.5,
            priority: 0
          })
        })
      }

      // Add videos and flows as needed
      if (videoData && items.length < 10) {
        videoData.slice(0, 5).forEach((video: any) => {
          if (!items.find(item => item.type === 'video' && item.id === video.id)) {
            items.push({
              id: video.id,
              type: 'video',
              title: video[`title_${language}`] || video.title_ja,
              masteryLevel: 1,
              lastReviewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              reviewCount: 0,
              successRate: 0.5,
              difficulty: 0.5,
              interval: 1,
              efactor: 2.5,
              priority: 0
            })
          }
        })
      }

      // Generate session
      const session = reviewSystem.generateReviewSession(items, sessionType as any, duration)
      setReviewItems(session.items)
      
      if (session.items.length > 0) {
        setCurrentItem(session.items[0])
        itemStartTimeRef.current = Date.now()
      }
      
    } catch (error) {
      console.error('Error initializing session:', error)
      toast.error('Failed to load review session')
    } finally {
      setLoading(false)
    }
  }

  const calculateIntervalFromMastery = (masteryLevel: number): number => {
    const intervals = [1, 2, 4, 7, 14]
    return intervals[Math.max(0, Math.min(4, masteryLevel - 1))]
  }

  const handleQualityResponse = async (quality: number) => {
    if (!currentItem) return

    const timeSpent = Math.floor((Date.now() - itemStartTimeRef.current) / 1000)
    const wasSuccessful = quality >= 3

    // Update item
    const updatedItem = reviewSystem.updateAfterReview(
      currentItem,
      quality,
      timeSpent,
      wasSuccessful
    )

    // Save to reviewed items
    setReviewedItems([...reviewedItems, {
      item: currentItem,
      quality,
      timeSpent
    }])

    // Update database
    try {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user!.id,
          content_type: currentItem.type,
          content_id: currentItem.id,
          content_title: currentItem.title,
          mastery_level: updatedItem.masteryLevel,
          practice_count: updatedItem.reviewCount,
          success_count: Math.round(updatedItem.successRate * updatedItem.reviewCount),
          last_practiced_at: new Date().toISOString(),
          next_review_at: new Date(Date.now() + updatedItem.interval * 24 * 60 * 60 * 1000).toISOString()
        })
    } catch (error) {
      console.error('Error updating progress:', error)
    }

    // Move to next item
    moveToNextItem()
  }

  const moveToNextItem = () => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setCurrentItem(reviewItems[currentIndex + 1])
      setShowAnswer(false)
      itemStartTimeRef.current = Date.now()
    } else {
      // Session complete
      setSessionComplete(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const skipItem = () => {
    moveToNextItem()
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />
      case 'flow': return <GitBranch className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const getQualityColor = (quality: number) => {
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-emerald-500']
    return colors[quality]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bjj-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent mx-auto mb-4"></div>
          <p className="text-bjj-muted">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!currentItem && !sessionComplete) {
    return (
      <div className="min-h-screen bg-bjj-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-bjj-muted mx-auto mb-4" />
          <p className="text-xl mb-4">{t.noItems}</p>
          <Link href="/dashboard/review" className="btn-primary">
            {t.backToReview}
          </Link>
        </div>
      </div>
    )
  }

  if (sessionComplete) {
    const correctAnswers = reviewedItems.filter(r => r.quality >= 3).length
    const accuracy = reviewedItems.length > 0 ? (correctAnswers / reviewedItems.length) * 100 : 0

    return (
      <div className="min-h-screen bg-bjj-bg flex items-center justify-center p-4">
        <div className="bg-bjj-bg2 border border-white/10 rounded-bjj p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t.completed}</h1>
          <p className="text-bjj-muted mb-6">
            {reviewedItems.length} {t.itemsReviewed}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-bjj-muted">{t.accuracy}</p>
              <p className="text-2xl font-bold text-bjj-accent">{accuracy.toFixed(0)}%</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-bjj-muted">{t.timeElapsed}</p>
              <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard/review" className="btn-primary w-full">
              {t.continueReview}
            </Link>
            <Link href="/dashboard" className="btn-ghost w-full">
              {t.finishSession}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      {/* Header */}
      <div className="border-b border-white/10 bg-bjj-bg2">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-bjj-accent" />
              {t.title}
            </h1>
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-bjj-muted">{t.progress}: </span>
                <span className="font-bold">{currentIndex + 1} / {reviewItems.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-bjj-muted">{t.timeElapsed}: </span>
                <span className="font-bold">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10">
        <div 
          className="h-full bg-bjj-accent transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / reviewItems.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="card-gradient border border-white/10 rounded-bjj p-8">
          {/* Item Header */}
          <div className="flex items-center gap-3 mb-6">
            {getItemIcon(currentItem!.type)}
            <span className="text-sm text-bjj-muted">
              {t[currentItem!.type as keyof typeof t] || currentItem!.type}
            </span>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">{currentItem!.title}</h2>
            <p className="text-bjj-muted">{t.question}</p>
          </div>

          {/* Answer Toggle */}
          {!showAnswer ? (
            <div className="text-center">
              <button
                onClick={() => setShowAnswer(true)}
                className="btn-primary"
              >
                {t.showAnswer}
              </button>
            </div>
          ) : (
            <div>
              {/* Answer Content */}
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                {/* This would show the actual content - video player, flow diagram, etc */}
                <div className="text-center py-8">
                  <p className="text-bjj-muted">
                    {currentItem!.type === 'video' && '🎥 Video content would be displayed here'}
                    {currentItem!.type === 'flow' && '🔄 Flow diagram would be displayed here'}
                    {currentItem!.type === 'technique' && '📖 Technique details would be displayed here'}
                  </p>
                </div>
              </div>

              {/* Quality Response */}
              <div>
                <p className="text-center mb-4 font-medium">{t.howWell}</p>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => handleQualityResponse(5)}
                    className={`p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500 transition-all ${getQualityColor(4)}`}
                  >
                    <ThumbsUp className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{t.perfect}</span>
                  </button>
                  <button
                    onClick={() => handleQualityResponse(4)}
                    className={`p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500 transition-all ${getQualityColor(3)}`}
                  >
                    <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{t.good}</span>
                  </button>
                  <button
                    onClick={() => handleQualityResponse(3)}
                    className={`p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500 transition-all ${getQualityColor(2)}`}
                  >
                    <Star className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{t.ok}</span>
                  </button>
                  <button
                    onClick={() => handleQualityResponse(2)}
                    className={`p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500 transition-all ${getQualityColor(1)}`}
                  >
                    <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{t.hard}</span>
                  </button>
                  <button
                    onClick={() => handleQualityResponse(1)}
                    className={`p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500 transition-all ${getQualityColor(0)}`}
                  >
                    <ThumbsDown className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{t.forgot}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Skip Button */}
          <div className="text-center mt-6">
            <button
              onClick={skipItem}
              className="text-sm text-bjj-muted hover:text-bjj-text flex items-center gap-2 mx-auto"
            >
              <SkipForward className="w-4 h-4" />
              {t.skip}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReviewSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bjj-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    }>
      <ReviewSessionPageContent />
    </Suspense>
  )
}