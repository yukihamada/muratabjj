'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // ログインしている場合はダッシュボードへリダイレクト
    if (!loading && user) {
      setRedirecting(true)
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // リダイレクト中のみローディング画面を表示
  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bjj-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
          <p className="text-bjj-muted">ダッシュボードへ移動中...</p>
        </div>
      </div>
    )
  }

  // 未ログインまたは初期ロード中は何も表示しない
  return null
}