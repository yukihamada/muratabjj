import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

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

// 自動AI分析を実行（バックグラウンド）
async function scheduleAutoAnalysis(videoId: string, userId: string) {
  try {
    // AI解析ログにエントリを作成（ペンディング状態）
    const { error: logError } = await supabaseAdmin
      .from('ai_analysis_logs')
      .insert({
        video_id: videoId,
        analysis_type: 'video_analysis',
        status: 'pending',
        input_data: {
          video_id: videoId,
          auto_triggered: true,
          trigger_event: 'video_upload'
        },
        created_by: userId
      })

    if (logError) {
      console.error('Error creating analysis log:', logError)
    }

    // 実際の分析は非同期で実行（レスポンス時間を短縮）
    setTimeout(async () => {
      try {
        const analysisResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/analyze-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId })
        })

        if (!analysisResponse.ok) {
          console.error('Auto analysis failed:', await analysisResponse.text())
        }
      } catch (error) {
        console.error('Auto analysis error:', error)
      }
    }, 5000) // 5秒後に実行

  } catch (error) {
    console.error('Error scheduling auto analysis:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const cookieStore = cookies()
    const authCookie = cookieStore.get('supabase-auth-token')
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authCookie.value)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // 動画の存在確認
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('id, title, uploaded_by')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // アップロード者または管理者のみがトリガー可能
    const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo']
    const isAdmin = adminEmails.includes(user.email || '')
    
    if (video.uploaded_by !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // 自動分析をスケジュール
    await scheduleAutoAnalysis(videoId, user.id)

    return NextResponse.json({
      message: 'Auto analysis scheduled successfully',
      videoId: videoId,
      status: 'scheduled'
    })

  } catch (error) {
    console.error('Auto analysis trigger error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}