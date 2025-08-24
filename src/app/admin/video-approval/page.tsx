'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Eye, Calendar, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  description: string
  approval_status: 'pending' | 'approved' | 'rejected'
  user_id: string
  created_at: string
  thumbnail_url: string
  user_email?: string
}

export default function VideoApprovalPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    checkAdminAndLoadVideos()
  }, [user])

  useEffect(() => {
    loadVideos()
  }, [filter])

  async function checkAdminAndLoadVideos() {
    if (!user) {
      router.push('/')
      return
    }

    try {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      await loadVideos()
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/dashboard')
    }
  }

  async function loadVideos() {
    try {
      setLoading(true)
      
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('approval_status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      const videosWithEmail = data?.map((video: any) => ({
        ...video,
        user_email: video.user_profiles?.email
      })) || []

      setVideos(videosWithEmail)
    } catch (error) {
      console.error('Error loading videos:', error)
      toast.error('動画の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleApproval(videoId: string, status: 'approved' | 'rejected', reason?: string) {
    try {
      const { data, error } = await supabase
        .rpc('approve_video', {
          video_id: videoId,
          status: status,
          reason: reason || null
        })

      if (error) throw error

      toast.success(status === 'approved' ? '動画を承認しました' : '動画を却下しました')
      await loadVideos()
    } catch (error) {
      console.error('Error updating video status:', error)
      toast.error('ステータスの更新に失敗しました')
    }
  }

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-bjj-text">動画承認管理</h1>
          <Link href="/admin" className="btn-ghost">
            管理画面に戻る
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-bjj-accent text-white'
                  : 'bg-bjj-bg2 text-bjj-text hover:bg-bjj-bg2/80'
              }`}
            >
              {status === 'all' && 'すべて'}
              {status === 'pending' && '承認待ち'}
              {status === 'approved' && '承認済み'}
              {status === 'rejected' && '却下'}
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-bjj-muted">該当する動画がありません</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-bjj-bg2 rounded-lg p-6 border border-bjj-line">
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="w-48 h-32 bg-bjj-bg rounded-lg overflow-hidden flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-bjj-muted">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-bjj-text mb-2">
                      {video.title}
                    </h3>
                    <p className="text-bjj-muted mb-4 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-bjj-muted mb-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {video.user_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(video.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/videos/${video.id}`}
                        className="btn-ghost text-sm"
                        target="_blank"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        視聴する
                      </Link>

                      {video.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproval(video.id, 'approved')}
                            className="btn-primary text-sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            承認
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('却下理由を入力してください')
                              if (reason) {
                                handleApproval(video.id, 'rejected', reason)
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                          >
                            <X className="w-4 h-4 mr-1" />
                            却下
                          </button>
                        </>
                      )}

                      {video.approval_status === 'approved' && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          承認済み
                        </span>
                      )}

                      {video.approval_status === 'rejected' && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                          却下
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}