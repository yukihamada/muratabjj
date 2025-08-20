'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // ログインしている場合はダッシュボードへリダイレクト
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // ローディング中またはログイン済みの場合はローディング画面を表示
  if (loading || user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bjj-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  // 未ログインの場合は何も表示しない
  return null
}