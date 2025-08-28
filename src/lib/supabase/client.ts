import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// デフォルトの値を設定（実際のSupabaseプロジェクトが必要）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ダミークライアントを作成（環境変数が未設定の場合）
const createDummyClient = () => {
  // 本番環境でのみ警告を表示
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.warn('⚠️ Supabase環境変数が設定されていません。')
    console.warn('以下の手順で設定してください：')
    console.warn('1. Supabaseでプロジェクトを作成: https://supabase.com')
    console.warn('2. .env.localファイルに以下を追加:')
    console.warn('   NEXT_PUBLIC_SUPABASE_URL=your_project_url')
    console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  }
  
  // ダミーのクライアントを返す（エラーを防ぐため）
  return {
    auth: {
      getSession: async () => {
        // セッション確認時にタイムアウトしないよう即座に返す
        return Promise.resolve({ data: { session: null }, error: null })
      },
      onAuthStateChange: (callback: any) => {
        // 即座にnullセッションを通知
        if (callback) {
          setTimeout(() => callback('INITIAL', null), 0)
        }
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {} 
            } 
          } 
        }
      },
      signInWithPassword: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      signUp: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      signOut: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      signInWithOAuth: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
      exchangeCodeForSession: async () => ({ data: null, error: new Error('Supabaseが設定されていません') }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { code: 'PGRST116' } }),
        }),
        async then(resolve: any) { resolve({ data: [], error: null }) }
      }),
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

// 環境変数が設定されている場合のみ実際のクライアントを作成
export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)
  ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          if (typeof window === 'undefined') return undefined
          const cookies = document.cookie.split(';')
          const cookie = cookies
            .map(c => c.trim())
            .find(c => c.startsWith(`${name}=`))
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
        },
        set(name: string, value: string, options: any) {
          if (typeof window === 'undefined') return
          const cookieOptions = []
          if (options?.domain) cookieOptions.push(`domain=${options.domain}`)
          if (options?.path) cookieOptions.push(`path=${options.path}`)
          if (options?.maxAge) cookieOptions.push(`max-age=${options.maxAge}`)
          // httpOnly cannot be set from browser JavaScript
          if (options?.secure || window.location.protocol === 'https:') cookieOptions.push('secure')
          if (options?.sameSite) cookieOptions.push(`sameSite=${options.sameSite}`)
          
          document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions.join('; ')}`
        },
        remove(name: string, options: any) {
          if (typeof window === 'undefined') return
          document.cookie = `${name}=; path=${options?.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false, // Route handlerで処理するため無効化
        persistSession: true,
        autoRefreshToken: true,
        debug: process.env.NODE_ENV === 'development',
      },
    })
  : createDummyClient()

// Export createBrowserClient for other modules to use
export { createBrowserClient as createClient }