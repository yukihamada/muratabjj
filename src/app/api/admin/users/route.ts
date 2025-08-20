import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 管理者チェック
function isAdmin(email: string | undefined): boolean {
  const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo']
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

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authCookie.value)
    
    if (authError || !user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // ユーザー一覧を取得
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        belt,
        stripes,
        role,
        is_coach,
        subscription_plan,
        subscription_status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ users: profiles })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}