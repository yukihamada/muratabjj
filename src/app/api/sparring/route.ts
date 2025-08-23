import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// バリデーションスキーマ
const createLogSchema = z.object({
  partner_name: z.string().min(1, 'Partner name is required'),
  duration: z.number().min(1, 'Duration must be positive'),
  starting_position: z.string().optional(),
  date: z.string(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // バリデーション
    const validatedData = createLogSchema.parse(body)
    
    // スパーリングログを作成
    const { data, error } = await supabase
      .from('sparring_logs')
      .insert({
        user_id: user.id,
        partner_name: validatedData.partner_name.trim(),
        duration: validatedData.duration,
        starting_position: validatedData.starting_position || null,
        date: new Date(validatedData.date).toISOString(),
        notes: validatedData.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      
      // テーブル不存在エラー
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database not set up',
            message: 'Sparring tables are not created. Please run database migration.',
            needsSetup: true
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
    
  } catch (error: any) {
    console.error('API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // スパーリングログを取得
    const { data, error } = await supabase
      .from('sparring_logs')
      .select(`
        *,
        events:sparring_events(*)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      
      // テーブル不存在エラー
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database not set up',
            message: 'Sparring tables are not created. Please run database migration.',
            needsSetup: true,
            data: []
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
    
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}