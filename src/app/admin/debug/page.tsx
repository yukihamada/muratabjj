'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardNav from '@/components/DashboardNav'

export default function AdminDebugPage() {
  const { user, profile, isAdmin, loading } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`)
          return
        }
        setSessionData(session)

        // Get profile directly
        if (user?.id) {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profileError) {
            setError(`Profile error: ${profileError.message}`)
          } else {
            setProfileData(data)
          }
        }
      } catch (err: any) {
        setError(`Error: ${err.message}`)
      }
    }

    if (!loading && user) {
      fetchDebugInfo()
    }
  }, [user, loading])

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Debug Information</h1>
        
        <div className="space-y-6">
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                loading,
                userId: user?.id,
                userEmail: user?.email,
                isAdmin,
                hasProfile: !!profile,
                profileIsAdminProp: profile?.is_admin,
                profileIsCoachProp: profile?.is_coach,
                profileIsAdmin: profile?.is_admin
              }, null, 2)}
            </pre>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <h2 className="text-xl font-semibold mb-4">Profile from Hook</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <h2 className="text-xl font-semibold mb-4">Profile from Direct Query</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <h2 className="text-xl font-semibold mb-4">Session Data</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                hasSession: !!sessionData,
                userId: sessionData?.user?.id,
                userEmail: sessionData?.user?.email,
                expiresAt: sessionData?.expires_at
              }, null, 2)}
            </pre>
          </div>

          {error && (
            <div className="card-gradient border border-red-500/20 rounded-bjj p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-400">Error</h2>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="btn-primary mr-4"
              >
                Try Admin Page
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}