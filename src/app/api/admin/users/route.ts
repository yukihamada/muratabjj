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
async function isAdmin(userId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()
  
  // First check profiles table
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!profileError && profile?.role === 'admin') {
    return true
  }
  
  // Then check user_profiles table if it exists
  const { data: userProfile, error: userProfileError } = await supabaseAdmin
    .from('user_profiles')
    .select('is_admin')
    .or(`id.eq.${userId},user_id.eq.${userId}`)
    .single()
  
  if (!userProfileError && userProfile?.is_admin) {
    return true
  }
  
  return false
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
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const isUserAdmin = await isAdmin(user.id)
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // ユーザー一覧を取得
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        belt,
        stripes,
        role,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      // テーブルが存在しない場合の詳細なエラーメッセージ
      if (profilesError.message.includes('profiles') && profilesError.message.includes('not exist')) {
        return NextResponse.json({ 
          error: 'Database table not found',
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
      const authUser = authUsers.find(u => u.id === profile.id)
      return {
        id: profile.id,
        email: authUser?.email || '',
        full_name: profile.full_name,
        belt: profile.belt,
        stripes: profile.stripes,
        role: profile.role || 'user',
        is_coach: profile.role === 'coach',
        subscription_plan: 'free',
        subscription_status: 'active',
        created_at: profile.created_at,
        last_sign_in_at: authUser?.last_sign_in_at
      }
    }) || []

    console.log(`Returning ${usersWithEmail.length} users`)
    return NextResponse.json({ users: usersWithEmail })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}