'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FlowsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/dashboard/flows')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
    </div>
  )
}