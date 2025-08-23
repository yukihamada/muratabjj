import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// バリデーションスキーマ
const startSessionSchema = z.object({
  partner_name: z.string().default('Live Session'),
  starting_position: z.string().default('standing'),
  notes: z.string().default('Live recording session'),
})

const endSessionSchema = z.object({
  sparring_log_id: z.string().uuid(),
  duration: z.number().min(0),
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
    const action = body.action
    
    if (action === 'start') {
      // ライブセッション開始
      const validatedData = startSessionSchema.parse(body)
      
      const { data, error } = await supabase
        .from('sparring_logs')
        .insert({
          user_id: user.id,
          partner_name: validatedData.partner_name,
          duration: 0,
          starting_position: validatedData.starting_position,
          date: new Date().toISOString(),
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
      
    } else if (action === 'end') {
      // ライブセッション終了
      const validatedData = endSessionSchema.parse(body)
      
      const { error } = await supabase
        .from('sparring_logs')
        .update({ duration: validatedData.duration })
        .eq('id', validatedData.sparring_log_id)
        .eq('user_id', user.id) // セキュリティのため自分のログのみ更新可能

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Database error', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
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