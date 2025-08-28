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
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        // エラーパラメータが存在する場合
        if (error) {
          console.error('[Auth Callback] OAuth error:', error, errorDescription)
          router.push(`/?auth_error=${encodeURIComponent(errorDescription || error)}`)
          return
        }
        
        if (code) {
          // eslint-disable-next-line no-console
          console.log('[Auth Callback] Processing auth code')
          
          // コードを使ってセッションを交換
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('[Auth Callback] Code exchange error:', exchangeError)
            router.push(`/?auth_error=${encodeURIComponent(exchangeError.message)}`)
            return
          }
          
          if (data?.session) {
            // eslint-disable-next-line no-console
            console.log('[Auth Callback] Session established successfully')
            // セッションが確立したら、少し待ってからリダイレクト
            await new Promise(resolve => setTimeout(resolve, 500))
            router.push('/dashboard')
          } else {
            console.error('[Auth Callback] No session data received')
            router.push('/?auth_error=no_session')
          }
        } else {
          console.error('[Auth Callback] No code parameter found')
          router.push('/?auth_error=no_code')
        }
      } catch (error: any) {
        console.error('[Auth Callback] Unexpected error:', error)
        router.push(`/?auth_error=${encodeURIComponent(error.message || 'unknown_error')}`)
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