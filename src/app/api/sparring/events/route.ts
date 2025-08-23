import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// バリデーションスキーマ
const createEventSchema = z.object({
  sparring_log_id: z.string().uuid(),
  timestamp: z.number().min(0),
  event_type: z.enum(['guard-pass', 'sweep', 'submission', 'submission-attempt', 'takedown', 'position-change']),
  position_from: z.string().optional().nullable(),
  position_to: z.string().optional().nullable(),
  technique_used: z.string().optional().nullable(),
  success: z.boolean().default(true),
  notes: z.string().optional().nullable(),
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
    const validatedData = createEventSchema.parse(body)
    
    // スパーリングログの所有者確認
    const { data: logData, error: logError } = await supabase
      .from('sparring_logs')
      .select('user_id')
      .eq('id', validatedData.sparring_log_id)
      .single()
      
    if (logError || !logData) {
      return NextResponse.json(
        { error: 'Sparring log not found' },
        { status: 404 }
      )
    }
    
    if (logData.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // イベントを作成
    const { data, error } = await supabase
      .from('sparring_events')
      .insert({
        sparring_log_id: validatedData.sparring_log_id,
        timestamp: validatedData.timestamp,
        event_type: validatedData.event_type,
        position_from: validatedData.position_from,
        position_to: validatedData.position_to,
        technique_used: validatedData.technique_used,
        success: validatedData.success,
        notes: validatedData.notes,
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