'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      nodeEnv: process.env.NODE_ENV,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      timestamp: new Date().toISOString(),
    }
    setDebugInfo(info)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        <div className="mt-4">
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  )
}