import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-bjj-accent mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">ページが見つかりません</h2>
        <p className="text-bjj-muted mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
        <Link href="/" className="btn-primary">
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}