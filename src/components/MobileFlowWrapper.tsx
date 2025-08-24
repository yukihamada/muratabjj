'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface MobileFlowWrapperProps {
  children: React.ReactNode
}

export default function MobileFlowWrapper({ children }: MobileFlowWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // モバイルの場合でもリダイレクトしない（同じページで表示）
      // if (mobile && window.location.pathname === '/flow-editor') {
      //   router.push('/flow-editor/mobile')
      // }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [router])

  // モバイルで既にリダイレクト中の場合は何も表示しない
  if (isMobile && window.location.pathname === '/flow-editor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  return <>{children}</>
}