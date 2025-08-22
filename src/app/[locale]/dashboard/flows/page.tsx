'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

export default function LocalizedFlowsRedirect() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  
  useEffect(() => {
    // Redirect to the flow editor within the same locale
    router.replace(`/${locale}/dashboard/flow-editor`)
  }, [router, locale])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
    </div>
  )
}