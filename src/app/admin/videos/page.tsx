'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Video {
  id: string
  title: string
  description: string | null
  url: string
  category: string
  position: string
  is_published: boolean
  published_at: string | null
  uploaded_by: string
  created_at: string
  recommended_belts: string[]
  min_belt: string | null
  safety_warnings: string[]
  is_competition_legal: boolean
  requires_supervision: boolean
  uploader: {
    email: string
    full_name: string | null
  }
}

export default function AdminVideosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndLoadVideos()
  }, [user])

  const checkAdminAndLoadVideos = async () => {
    if (!user) {
      router.push('/')
      return
    }

    try {
      // 管理者権限チェック
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        toast.error('管理者権限が必要です')
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)

      // 全動画を取得（公開・非公開問わず）
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
      console.error('Error:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const togglePublishStatus = async (video: Video) => {
    try {
      const updates = video.is_published
        ? { is_published: false, published_at: null, published_by: null }
        : { is_published: true, published_at: new Date().toISOString(), published_by: user!.id }

      const { error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', video.id)

      if (error) throw error

      toast.success(video.is_published ? '非公開にしました' : '公開しました')
      checkAdminAndLoadVideos() // リロード
    } catch (error) {
      console.error('Error:', error)
      toast.error('更新に失敗しました')
    }
  }

  const deleteVideo = async (videoId: string) => {
    if (!confirm('この動画を削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      toast.success('動画を削除しました')
      checkAdminAndLoadVideos() // リロード
    } catch (error) {
      console.error('Error:', error)
      toast.error('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bjj-bg flex items-center justify-center">
        <p className="text-bjj-muted">読み込み中...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-bjj-bg py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">動画管理</h1>

        <div className="bg-bjj-bg2 rounded-bjj border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium">動画情報</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">投稿者</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">推奨・注意</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">公開状態</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">アクション</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold">{video.title}</p>
                        <p className="text-sm text-bjj-muted">
                          {video.category} / {video.position}
                        </p>
                        <p className="text-xs text-bjj-muted">
                          {new Date(video.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p>{video.uploader.full_name || video.uploader.email}</p>
                        <p className="text-xs text-bjj-muted">{video.uploader.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {video.recommended_belts.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-bjj-muted">推奨:</span>
                            {video.recommended_belts.map(belt => (
                              <span key={belt} className="text-xs px-2 py-0.5 bg-white/10 rounded">
                                {belt}
                              </span>
                            ))}
                          </div>
                        )}
                        {video.safety_warnings.length > 0 && (
                          <div className="flex items-start gap-1">
                            <AlertCircle className="w-4 h-4 text-bjj-accent mt-0.5" />
                            <div className="text-xs text-bjj-accent">
                              {video.safety_warnings.length}件の注意事項
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 text-xs">
                          {!video.is_competition_legal && (
                            <span className="text-orange-500">競技禁止</span>
                          )}
                          {video.requires_supervision && (
                            <span className="text-yellow-500">要監督</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {video.is_published ? (
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-500">公開中</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <EyeOff className="w-4 h-4 text-bjj-muted" />
                          <span className="text-sm text-bjj-muted">非公開</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePublishStatus(video)}
                          className={`p-2 rounded-bjj transition-colors ${
                            video.is_published
                              ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-500'
                              : 'bg-green-500/20 hover:bg-green-500/30 text-green-500'
                          }`}
                          title={video.is_published ? '非公開にする' : '公開する'}
                        >
                          {video.is_published ? <EyeOff className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-bjj transition-colors"
                          title="削除"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}