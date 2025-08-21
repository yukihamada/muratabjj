'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  user_id: string
  full_name?: string
  belt_rank?: string
  stripes?: number
  is_coach?: boolean
  weight_class?: string
  preferred_position?: string
  years_training?: number
  dojo_id?: string
  created_at: string
  updated_at: string
  // Stripe fields
  stripe_customer_id?: string
  subscription_plan?: 'free' | 'pro' | 'dojo'
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
  subscription_period_end?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        // プロファイルが存在しない場合は作成
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                email: user?.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single()
          
          if (createError) throw createError
          setProfile(newProfile)
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    // 初期セッションの取得
    supabase.auth.getSession().then(async (response: any) => {
      const session = response.data.session
      setSession(session)
      setUser(session?.user ?? null)
      const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo']
      setIsAdmin(adminEmails.includes(session?.user?.email || ''))
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      
      setLoading(false)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      setSession(session)
      setUser(session?.user ?? null)
      const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo']
      setIsAdmin(adminEmails.includes(session?.user?.email || ''))
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // トーストメッセージはAuthDialogで表示するためここでは削除
    } catch (error: any) {
      // エラーメッセージも呼び出し元で処理するため、ここでは表示しない
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('ログアウトしました')
    } catch (error: any) {
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