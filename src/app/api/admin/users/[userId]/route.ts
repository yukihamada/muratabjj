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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params
    const updateData = await request.json()

    // 許可された更新フィールドのみを処理
    const allowedFields = ['role', 'is_coach', 'belt', 'stripes']
    const filteredUpdateData: any = {}
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = value
      }
    }

    // 自分自身の管理者権限を削除できないようにする
    if (filteredUpdateData.role && user.id === userId && isAdmin(user.email)) {
      if (filteredUpdateData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Cannot remove admin role from yourself' }, 
          { status: 400 }
        )
      }
    }

    // ユーザー情報を更新
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        ...filteredUpdateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // 管理ログを記録（今後実装）
    // await logAdminAction(user.id, 'user_update', { userId, updateData: filteredUpdateData })

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: updatedUser 
    })

  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params

    // 自分自身は削除できない
    if (user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' }, 
        { status: 400 }
      )
    }

    // ユーザーを削除（実際には非アクティブ化）
    const { error: deleteError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    // 管理ログを記録（今後実装）
    // await logAdminAction(user.id, 'user_delete', { userId })

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}