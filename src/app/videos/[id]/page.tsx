'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User, Lock, ChevronRight, AlertTriangle, PlayCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import ProgressTracker from '@/components/ProgressTracker'
import VideoAnalysisDisplay from '@/components/VideoAnalysisDisplay'
import { useAuth } from '@/hooks/useAuth'
import DashboardNav from '@/components/DashboardNav'

const translations = {
  ja: {
    back: '動画一覧に戻る',
    premium: 'プレミアムコンテンツ',
    upgradeRequired: 'このコンテンツを視聴するにはプロ会員にアップグレードしてください',
    upgrade: 'アップグレード',
    chapters: 'チャプター',
    instructor: 'インストラクター',
    duration: '長さ',
    uploadedOn: 'アップロード日',
    technique: '技術',
    beltRequirement: '推奨帯',
    markComplete: '完了としてマーク',
    completed: '完了',
    minutes: '分',
    seconds: '秒',
    white: '白帯',
    blue: '青帯',
    purple: '紫帯',
    brown: '茶帯',
    black: '黒帯',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    videoNotFound: '動画が見つかりません',
    transcript: '文字起こし',
    showTranscript: '文字起こしを表示',
    hideTranscript: '文字起こしを隠す',
    safetyWarnings: '安全上の注意',
    requiresSupervision: '指導者の監督下で練習推奨',
    notCompetitionLegal: '競技での使用不可',
    playbackSpeed: '再生速度',
  },
  en: {
    back: 'Back to Videos',
    premium: 'Premium Content',
    upgradeRequired: 'Upgrade to Pro to watch this content',
    upgrade: 'Upgrade',
    chapters: 'Chapters',
    instructor: 'Instructor',
    duration: 'Duration',
    uploadedOn: 'Uploaded on',
    technique: 'Technique',
    beltRequirement: 'Recommended Belt',
    markComplete: 'Mark as Complete',
    completed: 'Completed',
    minutes: 'min',
    seconds: 'sec',
    white: 'White Belt',
    blue: 'Blue Belt',
    purple: 'Purple Belt',
    brown: 'Brown Belt',
    black: 'Black Belt',
    loading: 'Loading...',
    error: 'An error occurred',
    videoNotFound: 'Video not found',
    transcript: 'Transcript',
    showTranscript: 'Show Transcript',
    hideTranscript: 'Hide Transcript',
    safetyWarnings: 'Safety Warnings',
    requiresSupervision: 'Practice under supervision recommended',
    notCompetitionLegal: 'Not competition legal',
    playbackSpeed: 'Playback Speed',
  },
  pt: {
    back: 'Voltar aos Vídeos',
    premium: 'Conteúdo Premium',
    upgradeRequired: 'Faça upgrade para Pro para assistir este conteúdo',
    upgrade: 'Fazer Upgrade',
    chapters: 'Capítulos',
    instructor: 'Instrutor',
    duration: 'Duração',
    uploadedOn: 'Enviado em',
    technique: 'Técnica',
    beltRequirement: 'Faixa Recomendada',
    markComplete: 'Marcar como Completo',
    completed: 'Completo',
    minutes: 'min',
    seconds: 'seg',
    white: 'Faixa Branca',
    blue: 'Faixa Azul',
    purple: 'Faixa Roxa',
    brown: 'Faixa Marrom',
    black: 'Faixa Preta',
    loading: 'Carregando...',
    error: 'Ocorreu um erro',
    videoNotFound: 'Vídeo não encontrado',
    transcript: 'Transcrição',
    showTranscript: 'Mostrar Transcrição',
    hideTranscript: 'Ocultar Transcrição',
    safetyWarnings: 'Avisos de Segurança',
    requiresSupervision: 'Prática sob supervisão recomendada',
    notCompetitionLegal: 'Não permitido em competição',
    playbackSpeed: 'Velocidade de Reprodução',
  },
}

const safetyWarningLabels = {
  ja: {
    'neck-spine': '首・脊椎への負荷が高い技術',
    knee: '膝への負荷が高い技術',
    'beginner-unsafe': '初心者には推奨しない',
    'sparring-caution': 'スパーリングでの使用注意',
    'supervision-required': '指導者の監督下で練習推奨',
  },
  en: {
    'neck-spine': 'High stress on neck/spine',
    knee: 'High stress on knees',
    'beginner-unsafe': 'Not recommended for beginners',
    'sparring-caution': 'Use caution in sparring',
    'supervision-required': 'Practice under supervision',
  },
  pt: {
    'neck-spine': 'Alto estresse no pescoço/coluna',
    knee: 'Alto estresse nos joelhos',
    'beginner-unsafe': 'Não recomendado para iniciantes',
    'sparring-caution': 'Cuidado ao usar no sparring',
    'supervision-required': 'Praticar sob supervisão',
  },
}

export default function VideoPage() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const warningLabels = safetyWarningLabels[language as keyof typeof safetyWarningLabels]
  const router = useRouter()
  const params = useParams()
  const videoId = params.id as string
  const { user } = useAuth()
  
  const [video, setVideo] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [chapters, setChapters] = useState<any[]>([])
  const [technique, setTechnique] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadVideo()
  }, [videoId, user])

  async function loadVideo() {
    try {
      // Load video
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('is_published', true)
        .single()
      
      if (videoError || !videoData) {
        setError(t.videoNotFound)
        setIsLoading(false)
        return
      }

      setVideo(videoData)

      // Load chapters
      const { data: chaptersData } = await supabase
        .from('video_chapters')
        .select('*')
        .eq('video_id', videoId)
        .order('start_time')

      if (chaptersData) {
        setChapters(chaptersData)
      }

      // Load technique information if available
      if (videoData.technique_id) {
        const { data: techniqueData } = await supabase
          .from('techniques')
          .select('*')
          .eq('id', videoData.technique_id)
          .single()
        
        if (techniqueData) {
          setTechnique(techniqueData)
        }
      }

      // Load user progress if available
      if (user && videoData.technique_id) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('technique_id', videoData.technique_id)
          .single()
        
        if (progressData) {
          setProgress(progressData)
        }
      }

      // Update view count
      await supabase.rpc('increment_view_count', { video_id: videoId })

    } catch (err) {
      console.error('Error loading video:', err)
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}${t.minutes} ${remainingSeconds}${t.seconds}`
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ja' ? 'ja-JP' : language === 'pt' ? 'pt-BR' : 'en-US')
  }

  function seekToChapter(startTime: number) {
    const videoElement = document.querySelector('video') as HTMLVideoElement
    if (videoElement) {
      videoElement.currentTime = startTime
      videoElement.play()
    }
  }

  function handlePlaybackRateChange(rate: number) {
    setPlaybackRate(rate)
    const videoElement = document.querySelector('video') as HTMLVideoElement
    if (videoElement) {
      videoElement.playbackRate = rate
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/dashboard/videos" className="btn-primary">
            {t.back}
          </Link>
        </div>
      </div>
    )
  }

  if (!video) return null

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/dashboard/videos" className="inline-flex items-center text-bjj-muted hover:text-bjj-accent mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Safety Warnings */}
            {(video.safety_warnings?.length > 0 || video.requires_supervision || !video.is_competition_legal) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-red-500">{t.safetyWarnings}</p>
                    {video.safety_warnings?.map((warning: string) => (
                      <p key={warning} className="text-sm text-red-400">
                        • {warningLabels[warning as keyof typeof warningLabels] || warning}
                      </p>
                    ))}
                    {video.requires_supervision && (
                      <p className="text-sm text-red-400">• {t.requiresSupervision}</p>
                    )}
                    {!video.is_competition_legal && (
                      <p className="text-sm text-red-400">• {t.notCompetitionLegal}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <video
                controls
                className="w-full"
                src={video.url}
                poster={video.thumbnail_url}
                onLoadedMetadata={(e) => {
                  const videoElement = e.target as HTMLVideoElement
                  videoElement.playbackRate = playbackRate
                }}
              />
            </div>

            {/* Playback Speed Controls */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium mb-2">{t.playbackSpeed}</p>
              <div className="flex gap-2">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      playbackRate === rate
                        ? 'bg-bjj-accent text-black font-medium'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
              
              {video.description && (
                <p className="text-bjj-muted mb-6">{video.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {video.recommended_belts?.length > 0 && (
                  <div>
                    <p className="text-bjj-muted">{t.beltRequirement}</p>
                    <p className="font-medium">
                      {video.recommended_belts.map((belt: string) => t[belt as keyof typeof t]).join(', ')}
                    </p>
                  </div>
                )}
                
                {video.duration && (
                  <div>
                    <p className="text-bjj-muted">{t.duration}</p>
                    <p className="font-medium">{formatDuration(video.duration)}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-bjj-muted">{t.uploadedOn}</p>
                  <p className="font-medium">{formatDate(video.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Transcript */}
            {video.transcript && (
              <div className="bg-white/5 rounded-lg p-6">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-lg font-semibold">{t.transcript}</h2>
                  <ChevronRight className={`w-5 h-5 transition-transform ${showTranscript ? 'rotate-90' : ''}`} />
                </button>
                
                {showTranscript && (
                  <div className="mt-4 max-h-96 overflow-y-auto">
                    {Array.isArray(video.transcript) ? (
                      <div className="space-y-2">
                        {video.transcript.map((item: any, index: number) => (
                          <div key={index} className="text-sm">
                            <button
                              onClick={() => seekToChapter(item.start)}
                              className="text-bjj-accent hover:underline mr-2"
                            >
                              [{Math.floor(item.start / 60)}:{(item.start % 60).toString().padStart(2, '0')}]
                            </button>
                            <span className="text-bjj-muted">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-bjj-muted whitespace-pre-wrap">{video.transcript}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Tracker */}
            {user && video.technique_id && (
              <ProgressTracker
                techniqueId={video.technique_id}
                currentLevel={progress?.progress_level || 0}
                onLevelChange={(level) => {
                  // Handle level change - will be implemented
                  // Progress level changed
                }}
              />
            )}

            {/* AI Video Analysis */}
            <VideoAnalysisDisplay 
              videoId={videoId} 
              autoTriggerAnalysis={false}
              showTriggerButton={true}
            />

            {/* Chapters */}
            {chapters.length > 0 && (
              <div className="bg-white/5 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  {t.chapters}
                </h2>
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => seekToChapter(chapter.start_time)}
                      className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{chapter.title}</span>
                        <span className="text-xs text-bjj-muted">
                          {Math.floor(chapter.start_time / 60)}:{(chapter.start_time % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      {chapter.description && (
                        <p className="text-xs text-bjj-muted mt-1">{chapter.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}