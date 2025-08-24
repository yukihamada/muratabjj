'use client'

import { useState, useEffect, useCallback } from 'react'
import { Brain, Clock, Star, Target, Lightbulb, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface VideoAnalysis {
  id: string
  video_id: string
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
  detected_techniques: string[]
  detected_positions: string[]
  detected_submissions: string[]
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  recommended_belt?: 'white' | 'blue' | 'purple' | 'brown' | 'black'
  ai_summary?: string
  key_points: string[]
  learning_tips: string[]
  frames_analyzed?: number
  analyzed_at?: string
  analyzed_by_model?: string
}

interface VideoAnalysisDisplayProps {
  videoId: string
  autoTriggerAnalysis?: boolean
  showTriggerButton?: boolean
}

export default function VideoAnalysisDisplay({ 
  videoId, 
  autoTriggerAnalysis = false,
  showTriggerButton = true 
}: VideoAnalysisDisplayProps) {
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  // 分析結果を取得
  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await fetch(`/api/ai/auto-analyze-on-upload?video_id=${videoId}`)
      const data = await response.json()
      
      if (data.analysis_status !== 'not_found') {
        setAnalysis(data.analysis)
      }
    } catch (err) {
      // Silently handle fetch errors
    }
  }, [videoId])

  // AI分析をトリガー
  const triggerAnalysis = useCallback(async (background = true) => {
    setAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/auto-analyze-on-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          trigger_analysis: true,
          background
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (background) {
        // バックグラウンド実行の場合は定期的にステータスを確認
        const checkStatus = setInterval(async () => {
          await fetchAnalysis()
          if (analysis?.analysis_status === 'completed' || analysis?.analysis_status === 'failed') {
            clearInterval(checkStatus)
            setAnalyzing(false)
          }
        }, 3000)

        // 30秒でタイムアウト
        setTimeout(() => {
          clearInterval(checkStatus)
          setAnalyzing(false)
        }, 30000)
      } else {
        // 同期実行の場合は即座に結果を表示
        if (data.analysis_result) {
          setAnalysis({
            id: data.analysis_id,
            video_id: videoId,
            analysis_status: 'completed',
            ...data.analysis_result
          })
        }
        setAnalyzing(false)
      }

    } catch (err: any) {
      setError(err.message)
      setAnalyzing(false)
    }
  }, [videoId, fetchAnalysis, analysis])

  useEffect(() => {
    fetchAnalysis()
    
    if (autoTriggerAnalysis && !analysis) {
      triggerAnalysis(true)
    }
  }, [videoId, fetchAnalysis, autoTriggerAnalysis, analysis, triggerAnalysis])

  const getBeltColor = (belt?: string) => {
    switch (belt) {
      case 'white': return 'bg-gray-100 text-gray-800'
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'brown': return 'bg-amber-100 text-amber-800'
      case 'black': return 'bg-gray-800 text-white'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="w-4 h-4 animate-spin" />
          <span>分析結果を読み込み中...</span>
        </div>
      </div>
    )
  }

  if (!analysis && !showTriggerButton) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI動画解析</h3>
          </div>
          
          {showTriggerButton && (
            <button
              onClick={() => triggerAnalysis(false)}
              disabled={analyzing}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {analyzing ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  解析中...
                </>
              ) : (
                <>
                  <Brain className="w-3 h-3" />
                  解析実行
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {analyzing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2 text-blue-700">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI分析を実行中です...しばらくお待ちください。</span>
          </div>
        )}

        {analysis && analysis.analysis_status === 'completed' && (
          <div className="space-y-4">
            {/* ステータス情報 */}
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">解析完了</span>
              {analysis.analyzed_at && (
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(analysis.analyzed_at).toLocaleString('ja-JP')}
                </span>
              )}
            </div>

            {/* 難易度・推奨帯 */}
            {(analysis.difficulty_level || analysis.recommended_belt) && (
              <div className="flex flex-wrap gap-2">
                {analysis.difficulty_level && (
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(analysis.difficulty_level)}`}>
                    <Target className="w-3 h-3 inline mr-1" />
                    {analysis.difficulty_level === 'beginner' && '初級'}
                    {analysis.difficulty_level === 'intermediate' && '中級'}
                    {analysis.difficulty_level === 'advanced' && '上級'}
                    {analysis.difficulty_level === 'expert' && 'エキスパート'}
                  </div>
                )}
                {analysis.recommended_belt && (
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getBeltColor(analysis.recommended_belt)}`}>
                    推奨: {analysis.recommended_belt === 'white' && '白帯'}
                    {analysis.recommended_belt === 'blue' && '青帯'}
                    {analysis.recommended_belt === 'purple' && '紫帯'}
                    {analysis.recommended_belt === 'brown' && '茶帯'}
                    {analysis.recommended_belt === 'black' && '黒帯'}
                  </div>
                )}
              </div>
            )}

            {/* AI要約 */}
            {analysis.ai_summary && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">AI要約</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {analysis.ai_summary}
                </p>
              </div>
            )}

            {/* 検出された技術 */}
            {analysis.detected_techniques.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">検出された技術</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.detected_techniques.map((technique, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      {technique}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ポジション */}
            {analysis.detected_positions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">ポジション</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.detected_positions.map((position, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                      {position}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* サブミッション */}
            {analysis.detected_submissions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">サブミッション</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.detected_submissions.map((submission, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md">
                      {submission}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* キーポイント */}
            {analysis.key_points.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  キーポイント
                </h4>
                <ul className="space-y-1">
                  {analysis.key_points.map((point, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 学習のコツ */}
            {analysis.learning_tips.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" />
                  学習のコツ
                </h4>
                <ul className="space-y-1">
                  {analysis.learning_tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* メタ情報 */}
            <div className="text-xs text-gray-500 pt-2 border-t flex items-center gap-4">
              {analysis.frames_analyzed && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {analysis.frames_analyzed}フレーム解析済み
                </span>
              )}
              {analysis.analyzed_by_model && (
                <span>{analysis.analyzed_by_model}</span>
              )}
            </div>
          </div>
        )}

        {analysis && analysis.analysis_status === 'failed' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">解析に失敗しました。後でもう一度お試しください。</span>
          </div>
        )}

        {analysis && analysis.analysis_status === 'processing' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2 text-blue-700">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">解析処理中です...</span>
          </div>
        )}

        {analysis && analysis.analysis_status === 'pending' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2 text-yellow-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm">解析待機中です...</span>
          </div>
        )}
      </div>
    </div>
  )
}