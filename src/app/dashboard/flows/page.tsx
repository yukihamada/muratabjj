'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardFlowsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the correct flow-editor path
    router.replace('/dashboard/flow-editor')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
    </div>
  )
}