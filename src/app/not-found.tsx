import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bjj-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-bold text-bjj-accent">404</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-bjj-text">
          ページが見つかりません
        </h1>
        
        <p className="text-bjj-muted mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            ホームへ戻る
          </Link>
          
          <Link
            href="/dashboard"
            className="btn-ghost flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            ダッシュボードへ
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-white/5 rounded-bjj border border-white/10">
          <p className="text-sm text-bjj-muted">
            エラーが続く場合は、サポート（support@muratabjj.com）までご連絡ください。
          </p>
        </div>
      </div>
    </div>
  )
}