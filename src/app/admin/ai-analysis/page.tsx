'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import DashboardNav from '@/components/DashboardNav'
import { 
  Brain, 
  Video, 
  Play, 
  Pause,
  Settings,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Sparkles,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

interface VideoAnalysis {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail_url: string | null
  position: string
  category: string
  ai_detected_techniques: string[]
  ai_suggested_category: string | null
  ai_suggested_position: string | null
  ai_difficulty_score: number | null
  safety_warnings: string[]
  is_competition_legal: boolean
  requires_supervision: boolean
  ai_key_points: string[]
  ai_suggested_tags: string[]
  ai_analysis_completed: boolean
  ai_analyzed_at: string | null
  created_at: string
  uploader: {
    email: string
    full_name: string | null
  }
}

export default function AIAnalysisPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const [videos, setVideos] = useState<VideoAnalysis[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [analyzingVideo, setAnalyzingVideo] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoAnalysis | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'analyzed' | 'pending'>('all')
  const [batchAnalyzing, setBatchAnalyzing] = useState(false)
  const [batchResults, setBatchResults] = useState<any>(null)

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/dashboard')
      return
    }
    
    if (isAdmin) {
      fetchVideos()
    }
  }, [isAdmin, loading, router])

  const fetchVideos = async () => {
    try {
      const { data: videosData, error } = await supabase
        .from('videos')
        .select(`
          *,
          uploader:profiles!videos_uploaded_by_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVideos(videosData || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast.error('動画の取得に失敗しました')
    } finally {
      setLoadingVideos(false)
    }
  }

  const analyzeVideo = async (videoId: string) => {
    setAnalyzingVideo(videoId)
    
    try {
      const response = await fetch('/api/ai/auto-analyze-on-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          video_id: videoId,
          trigger_analysis: true,
          background: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const result = await response.json()
      toast.success('AI分析が完了しました')
      
      // 動画リストを更新
      fetchVideos()
    } catch (error: any) {
      console.error('Error analyzing video:', error)
      toast.error(error.message || 'AI分析に失敗しました')
    } finally {
      setAnalyzingVideo(null)
    }
  }

  const generateFlowSuggestions = async (videoId: string) => {
    try {
      const response = await fetch('/api/ai/suggest-flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId })
      })

      if (!response.ok) {
        throw new Error('Flow generation failed')
      }

      const result = await response.json()
      toast.success(`${result.flows.length}個のフローを生成しました`)
    } catch (error) {
      console.error('Error generating flows:', error)
      toast.error('フロー生成に失敗しました')
    }
  }

  const runBatchAnalysis = async () => {
    setBatchAnalyzing(true)
    setBatchResults(null)
    
    try {
      const response = await fetch('/api/ai/batch-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchSize: 5 })
      })

      if (!response.ok) {
        throw new Error('Batch analysis failed')
      }

      const result = await response.json()
      setBatchResults(result.results)
      
      if (result.results.processed > 0) {
        toast.success(`${result.results.processed}本の動画を分析しました`)
        fetchVideos() // リストを更新
      } else {
        toast('分析対象の動画がありませんでした')
      }
      
      if (result.results.failed > 0) {
        toast.error(`${result.results.failed}本の動画で分析が失敗しました`)
      }
    } catch (error) {
      console.error('Error in batch analysis:', error)
      toast.error('一括分析に失敗しました')
    } finally {
      setBatchAnalyzing(false)
    }
  }

  const filteredVideos = videos.filter(video => {
    if (filter === 'analyzed') return video.ai_analysis_completed
    if (filter === 'pending') return !video.ai_analysis_completed
    return true
  })

  const analysisStats = {
    total: videos.length,
    analyzed: videos.filter(v => v.ai_analysis_completed).length,
    pending: videos.filter(v => !v.ai_analysis_completed).length,
    withWarnings: videos.filter(v => v.safety_warnings && v.safety_warnings.length > 0).length
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

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-bjj-accent" />
              <h1 className="text-3xl font-bold">AI解析管理</h1>
            </div>
            <p className="text-bjj-muted">動画の自動分析とフロー生成の管理</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runBatchAnalysis}
              disabled={batchAnalyzing || loadingVideos}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {batchAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  一括分析中...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  未分析動画を一括分析
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card-gradient border border-white/10 rounded-bjj p-4">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-lg font-bold">{analysisStats.total}</p>
                <p className="text-sm text-bjj-muted">総動画数</p>
              </div>
            </div>
          </div>

          <div className="card-gradient border border-green-500/20 rounded-bjj p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-lg font-bold">{analysisStats.analyzed}</p>
                <p className="text-sm text-bjj-muted">分析完了</p>
              </div>
            </div>
          </div>

          <div className="card-gradient border border-orange-500/20 rounded-bjj p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-lg font-bold">{analysisStats.pending}</p>
                <p className="text-sm text-bjj-muted">分析待ち</p>
              </div>
            </div>
          </div>

          <div className="card-gradient border border-red-500/20 rounded-bjj p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-lg font-bold">{analysisStats.withWarnings}</p>
                <p className="text-sm text-bjj-muted">注意事項あり</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-bjj transition-colors ${
              filter === 'all' 
                ? 'bg-bjj-accent text-white' 
                : 'bg-white/10 text-bjj-muted hover:bg-white/20'
            }`}
          >
            全て ({analysisStats.total})
          </button>
          <button
            onClick={() => setFilter('analyzed')}
            className={`px-4 py-2 rounded-bjj transition-colors ${
              filter === 'analyzed' 
                ? 'bg-green-500 text-white' 
                : 'bg-white/10 text-bjj-muted hover:bg-white/20'
            }`}
          >
            分析完了 ({analysisStats.analyzed})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-bjj transition-colors ${
              filter === 'pending' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white/10 text-bjj-muted hover:bg-white/20'
            }`}
          >
            分析待ち ({analysisStats.pending})
          </button>
        </div>

        {/* Videos List */}
        <div className="space-y-4">
          {loadingVideos ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bjj-accent"></div>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-bjj-muted mx-auto mb-4" />
              <p className="text-bjj-muted">該当する動画がありません</p>
            </div>
          ) : (
            filteredVideos.map((video) => (
              <div key={video.id} className="card-gradient border border-white/10 rounded-bjj p-6">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-32 h-20 bg-white/10 rounded-lg flex-shrink-0 relative overflow-hidden">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-bjj-muted" />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{video.title}</h3>
                      <div className="flex items-center gap-2">
                        {video.ai_analysis_completed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            分析完了
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                            <Clock className="w-3 h-3" />
                            分析待ち
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-bjj-muted mb-2">
                      <span>{video.uploader.full_name || video.uploader.email}</span>
                      <span className="mx-2">•</span>
                      <span>{video.position} / {video.category}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(video.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>

                    {/* Analysis Results */}
                    {video.ai_analysis_completed && (
                      <div className="space-y-2 mb-4">
                        {video.ai_detected_techniques.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-bjj-muted">検出技術:</span>
                            <div className="flex flex-wrap gap-1">
                              {video.ai_detected_techniques.map((technique, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                  {technique}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {video.safety_warnings.length > 0 && (
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                            <div className="text-sm text-red-400">
                              安全上の注意: {video.safety_warnings.join(', ')}
                            </div>
                          </div>
                        )}

                        {video.ai_difficulty_score && (
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-bjj-muted" />
                            <span className="text-sm text-bjj-muted">
                              難易度: {video.ai_difficulty_score}/5
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!video.ai_analysis_completed && (
                        <button
                          onClick={() => analyzeVideo(video.id)}
                          disabled={analyzingVideo === video.id}
                          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {analyzingVideo === video.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              分析中...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4" />
                              AI分析開始
                            </>
                          )}
                        </button>
                      )}

                      {video.ai_analysis_completed && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedVideo(video)
                              setShowAnalysisModal(true)
                            }}
                            className="btn-ghost text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            分析結果詳細
                          </button>
                          <button
                            onClick={() => generateFlowSuggestions(video.id)}
                            className="btn-ghost text-sm"
                          >
                            <Sparkles className="w-4 h-4" />
                            フロー生成
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Analysis Detail Modal */}
        {showAnalysisModal && selectedVideo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-bjj-bg2 border border-white/10 rounded-bjj p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">AI分析結果詳細</h2>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <EyeOff className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">動画情報</h3>
                  <p className="text-bjj-muted">{selectedVideo.title}</p>
                  <p className="text-sm text-bjj-muted mt-1">
                    {selectedVideo.position} / {selectedVideo.category}
                  </p>
                </div>

                {selectedVideo.ai_detected_techniques.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">検出された技術</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.ai_detected_techniques.map((technique, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {technique}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVideo.ai_key_points.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">重要ポイント</h3>
                    <ul className="space-y-1">
                      {selectedVideo.ai_key_points.map((point, i) => (
                        <li key={i} className="text-sm text-bjj-muted">• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedVideo.safety_warnings.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-red-400">安全上の注意</h3>
                    <ul className="space-y-1">
                      {selectedVideo.safety_warnings.map((warning, i) => (
                        <li key={i} className="text-sm text-red-400">⚠ {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">難易度</h3>
                    <p className="text-bjj-muted">{selectedVideo.ai_difficulty_score}/5</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">競技使用</h3>
                    <p className="text-bjj-muted">
                      {selectedVideo.is_competition_legal ? '可能' : '禁止'}
                    </p>
                  </div>
                </div>

                {selectedVideo.ai_analyzed_at && (
                  <div className="text-xs text-bjj-muted pt-4 border-t border-white/10">
                    分析日時: {new Date(selectedVideo.ai_analyzed_at).toLocaleString('ja-JP')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}