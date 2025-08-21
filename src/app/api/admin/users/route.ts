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
  const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo']
  return adminEmails.includes(email || '')
}

export async function GET(request: NextRequest) {
  try {
    // 認証チェック - Supabaseのセッションクッキーを確認
    const cookieStore = cookies()
    const supabaseCookies = cookieStore.getAll().filter(cookie => 
      cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
    )
    
    if (!supabaseCookies.length) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Authorization headerからトークンを取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // ユーザー一覧を取得
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('users_profile')
      .select(`
        user_id,
        full_name,
        belt,
        stripes,
        is_coach,
        is_admin,
        subscription_plan,
        subscription_status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      // テーブルが存在しない場合の詳細なエラーメッセージ
      if (profilesError.message.includes('users_profile') && profilesError.message.includes('not exist')) {
        return NextResponse.json({ 
          error: 'Database table not found. Please run the migration: npm run fix:admin-users',
          details: profilesError.message 
        }, { status: 500 })
      }
      return NextResponse.json({ error: 'Database error', details: profilesError.message }, { status: 500 })
    }

    // 認証情報からemailを取得
    const { data: { users: authUsers }, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError)
      return NextResponse.json({ error: 'Auth error' }, { status: 500 })
    }

    // プロフィールとemailを結合
    const usersWithEmail = profiles?.map(profile => {
      const authUser = authUsers.find(u => u.id === profile.user_id)
      return {
        id: profile.user_id,
        email: authUser?.email || '',
        full_name: profile.full_name,
        belt: profile.belt,
        stripes: profile.stripes,
        role: profile.is_admin ? 'admin' : 'user',
        is_coach: profile.is_coach,
        subscription_plan: profile.subscription_plan,
        subscription_status: profile.subscription_status,
        created_at: profile.created_at,
        last_sign_in_at: authUser?.last_sign_in_at
      }
    }) || []

    return NextResponse.json({ users: usersWithEmail })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}