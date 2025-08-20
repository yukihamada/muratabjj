import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// デフォルトの値を設定（実際のSupabaseプロジェクトが必要）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ダミークライアントを作成（環境変数が未設定の場合）
const createDummyClient = () => {
  console.warn('⚠️ Supabase環境変数が設定されていません。')
  console.warn('以下の手順で設定してください：')
  console.warn('1. Supabaseでプロジェクトを作成: https://supabase.com')
  console.warn('2. .env.localファイルに以下を追加:')
  console.warn('   NEXT_PUBLIC_SUPABASE_URL=your_project_url')
  console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  
  // ダミーのクライアントを返す（エラーを防ぐため）
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      signUp: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      signOut: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      signInWithOAuth: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      exchangeCodeForSession: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
    },
    from: () => ({
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      update: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      delete: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
    }),
  } as any
}

// 有効なURLかチェック
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// カスタムストレージアダプター（SSR対応）
const customStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') {
      return null
    }
    return window.localStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(key)
  },
}

// 環境変数が設定されている場合のみ実際のクライアントを作成
export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: customStorageAdapter,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : createDummyClient()

// Export createClient for other modules to use
export { createClient }