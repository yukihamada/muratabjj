'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-bjj-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-bold text-bjj-accent">500</span>
        </div>
        
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-yellow-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-bjj-text">
          エラーが発生しました
        </h1>
        
        <p className="text-bjj-muted mb-8">
          申し訳ございません。サーバー側でエラーが発生しました。
          しばらく時間をおいてから再度お試しください。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            再試行する
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
          <p className="text-sm text-bjj-muted mb-2">
            エラーが続く場合は、以下の情報と共にサポートまでご連絡ください：
          </p>
          <div className="mt-3 p-3 bg-black/30 rounded-lg">
            <code className="text-xs text-bjj-accent break-all">
              {error.digest || 'エラー情報なし'}
            </code>
          </div>
          <p className="text-xs text-bjj-muted mt-3">
            support@muratabjj.com
          </p>
        </div>
      </div>
    </div>
  )
}