'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-bjj-bg flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <span className="text-8xl font-bold text-bjj-accent">500</span>
            </div>
            
            <div className="flex justify-center mb-6">
              <AlertTriangle className="w-16 h-16 text-yellow-500" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-bjj-text">
              システムエラー
            </h1>
            
            <p className="text-bjj-muted mb-8">
              申し訳ございません。予期しないエラーが発生しました。
              システム管理者に通知されました。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={reset}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                アプリケーションを再起動
              </button>
              
              <Link
                href="/"
                className="btn-ghost flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                ホームへ戻る
              </Link>
            </div>
            
            <div className="p-6 bg-white/5 rounded-bjj border border-white/10">
              <p className="text-sm text-bjj-muted">
                サポート: support@muratabjj.com
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}