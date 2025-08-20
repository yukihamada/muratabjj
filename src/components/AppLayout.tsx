'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AppNav from './AppNav'

interface AppLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && requireAuth) {
      router.push('/auth/login')
    }
  }, [user, loading, requireAuth, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user && requireAuth) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />
      <main>{children}</main>
    </div>
  )
}