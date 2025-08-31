import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Supabase Admin Client を関数内で作成
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing required environment variables')
  }

  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// 管理者チェック
function isAdmin(email: string | undefined): boolean {
  const adminEmails = ['admin@test.muratabjj.com', 'shu.shu.4029@gmail.com', 'yuki@hamada.tokyo', 'yukihamada010@gmail.com']
  return adminEmails.includes(email || '')
}

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const cookieStore = cookies()
    const authCookie = cookieStore.get('supabase-auth-token')
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authCookie.value)
    
    if (authError || !user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 統計データを並列取得
    const [
      usersResult,
      videosResult,
      publishedVideosResult,
      sparringLogsResult,
      profilesResult,
      recentUsersResult
    ] = await Promise.all([
      // 総ユーザー数
      supabaseAdmin
        .from('users_profile')
        .select('id', { count: 'exact' }),
      
      // 総動画数
      supabaseAdmin
        .from('videos')
        .select('id', { count: 'exact' }),
      
      // 公開動画数
      supabaseAdmin
        .from('videos')
        .select('id', { count: 'exact' })
        .eq('is_published', true),
      
      // 総スパーログ数
      supabaseAdmin
        .from('sparring_logs')
        .select('id', { count: 'exact' }),
      
      // アクティブ会員数（Proプラン以上）
      supabaseAdmin
        .from('users_profile')
        .select('id', { count: 'exact' })
        .in('subscription_plan', ['pro', 'dojo'])
        .eq('subscription_status', 'active'),
      
      // 今月の新規登録数
      supabaseAdmin
        .from('users_profile')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ])

    // エラーチェック
    const errors = [
      usersResult.error,
      videosResult.error,
      publishedVideosResult.error,
      sparringLogsResult.error,
      profilesResult.error,
      recentUsersResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('Database errors:', errors)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // 統計データを返す
    const stats = {
      totalUsers: usersResult.count || 0,
      totalVideos: videosResult.count || 0,
      publishedVideos: publishedVideosResult.count || 0,
      totalSparringLogs: sparringLogsResult.count || 0,
      activeSubscriptions: profilesResult.count || 0,
      recentRegistrations: recentUsersResult.count || 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}