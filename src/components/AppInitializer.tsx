'use client'

import { useEffect, useState } from 'react'

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // アプリの初期化処理
    const initializeApp = async () => {
      try {
        // Supabase環境変数チェック
        const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!hasSupabase && typeof window !== 'undefined') {
          console.warn('[AppInitializer] Supabase credentials not found. Running in demo mode.')
        }

        // 初期化完了まで最大1秒待機
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error('[AppInitializer] Initialization error:', error)
      } finally {
        setIsReady(true)
      }
    }

    initializeApp()
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}