'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FlowEditorPage() {
  const router = useRouter()

  useEffect(() => {
    // /dashboard/flows にリダイレクト
    router.replace('/dashboard/flows')
  }, [router])

  return (
    <div className="min-h-screen bg-bjj-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
    </div>
  )
}