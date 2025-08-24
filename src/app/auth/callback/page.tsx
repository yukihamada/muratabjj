'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URLからコードを取得
        const code = searchParams.get('code')
        
        if (code) {
          // コードを使ってセッションを交換
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            router.push('/')
            return
          }
        }
        
        // 認証成功後、ダッシュボードへリダイレクト
        router.push('/dashboard')
      } catch (error) {
        router.push('/')
      }
    }
    
    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent mx-auto mb-4"></div>
        <p className="text-bjj-muted">認証中...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent mx-auto mb-4"></div>
          <p className="text-bjj-muted">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}