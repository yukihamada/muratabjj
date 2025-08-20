'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import VideoUpload from '@/components/VideoUpload'
import AppLayout from '@/components/AppLayout'

export default function VideoUploadPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isCoach, setIsCoach] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is a coach
    const { data: profile } = await supabase
      .from('users_profile')
      .select('is_coach')
      .eq('user_id', user.id)
      .single()

    if (!profile?.is_coach) {
      router.push('/videos')
      return
    }

    setIsCoach(true)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (!isCoach) {
    return null
  }

  return (
    <AppLayout>
      <div className="py-12">
        <VideoUpload />
      </div>
    </AppLayout>
  )
}