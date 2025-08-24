'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  user_id: string
  full_name?: string
  belt?: string
  stripes?: number
  preferred_position?: string
  height?: number
  weight?: number
  is_coach: boolean
  is_admin: boolean
  subscription_plan?: 'free' | 'pro' | 'dojo'
  subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isCoach: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCoach, setIsCoach] = useState(false)

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('[useAuth] Fetching profile for userId:', userId)
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.log('[useAuth] Profile fetch error:', error)
        // プロファイルが存在しない場合は作成
        if (error.code === 'PGRST116') {
          console.log('[useAuth] Creating new profile')
          // Profile not found, creating new profile
          const { data: newProfile, error: createError } = await supabase
            .from('users_profile')
            .insert([
              {
                user_id: userId,
                full_name: userEmail?.split('@')[0] || '',
                belt: 'white',
                stripes: 0,
                is_admin: false,
                is_coach: false
              }
            ])
            .select()
            .single()
          
          if (createError) {
            console.error('[useAuth] Error creating profile:', createError)
            // プロファイル作成に失敗してもログインは成功させる
            return
          } else {
            console.log('[useAuth] Profile created successfully')
          }
          setProfile(newProfile)
          setIsCoach(newProfile?.is_coach || false)
          setIsAdmin(newProfile?.is_admin || false)
        } else {
          console.error('[useAuth] Error fetching profile:', error)
          // プロファイル取得に失敗してもログインは成功させる
          return
        }
      } else {
        console.log('[useAuth] Profile found:', data)
        setProfile(data)
        setIsCoach(data?.is_coach || false)
        setIsAdmin(data?.is_admin || false)
      }
    } catch (error) {
      console.error('[useAuth] Error in fetchProfile:', error)
      // エラーが発生してもログインは成功させる
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    let isSubscribed = true
    let timeoutId: NodeJS.Timeout

    // 初期セッションの取得
    // Checking initial session
    
    const checkSession = async () => {
      try {
        console.log('[useAuth] Starting session check...')
        
        // より短いタイムアウトで早期解決
        timeoutId = setTimeout(() => {
          if (isSubscribed && loading) {
            console.log('[useAuth] Session check timeout - forcing completion')
            setLoading(false)
          }
        }, 3000) // 3秒のタイムアウト

        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('[useAuth] Session result:', session ? 'Found session' : 'No session', error || '')
        
        if (!isSubscribed) return
        
        if (error) {
          console.error('[useAuth] Error getting session:', error)
          setLoading(false)
          return
        }
        
        // Initial session check completed
        
        setSession(session)
        setUser(session?.user ?? null)
        // isAdmin is set from profile data in fetchProfile
        
        if (session?.user) {
          console.log('[useAuth] Fetching profile for user:', session.user.id)
          // プロファイル取得は非同期で実行（ブロックしない）
          fetchProfile(session.user.id, session.user.email).catch(err => {
            console.warn('[useAuth] Profile fetch failed:', err)
          })
        }
        
        console.log('[useAuth] Session check completed, setting loading to false')
        setLoading(false)
      } catch (error: any) {
        console.error('[useAuth] Error in checkSession:', error)
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }
    
    checkSession()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      // Auth state changed
      
      setSession(session)
      setUser(session?.user ?? null)
      // isAdmin is set from profile data in fetchProfile
      
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email)
      } else {
        setProfile(null)
        setIsCoach(false)
      }
      
      setLoading(false)
    })

    return () => {
      isSubscribed = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Starting sign in
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Sign in response received
      
      if (error) throw error
      
      // セッションが確立したか確認
      if (!data?.session) {
        console.error('[useAuth] No session returned after sign in')
        throw new Error('セッションの確立に失敗しました')
      }
      
      return data
    } catch (error: any) {
      console.error('[useAuth] Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      // トーストメッセージはAuthDialogで表示するためここでは削除
    } catch (error: any) {
      // エラーメッセージも呼び出し元で処理するため、ここでは表示しない
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Starting sign out
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // 状態をクリア
      setUser(null)
      setSession(null)
      setProfile(null)
      setIsAdmin(false)
      setIsCoach(false)
      
      toast.success('ログアウトしました')
      
      // ダッシュボードにいる場合はホームにリダイレクト
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/'
      }
    } catch (error: any) {
      console.error('[useAuth] Sign out error:', error)
      toast.error(error.message || 'ログアウトに失敗しました')
      throw error
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    isCoach,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}