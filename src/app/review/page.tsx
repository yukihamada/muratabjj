'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ReviewRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/review')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}