import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

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

// バッチ解析の実行
async function runBatchAnalysis(batchSize: number = 5): Promise<{
  processed: number
  failed: number
  errors: string[]
}> {
  try {
    // 未解析の動画を取得
    const { data: pendingVideos, error: fetchError } = await getSupabaseAdmin()
      .from('videos')
      .select('id, title, url')
      .eq('ai_analysis_completed', false)
      .eq('is_published', true)
      .limit(batchSize)

    if (fetchError) {
      throw fetchError
    }

    if (!pendingVideos || pendingVideos.length === 0) {
      return { processed: 0, failed: 0, errors: [] }
    }

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[]
    }

    // 各動画を順次処理（並行処理は負荷を考慮して避ける）
    for (const video of pendingVideos) {
      let logEntryId: string | null = null
      
      try {
        // AI解析ログにエントリを作成
        const { data: logEntry, error: logError } = await getSupabaseAdmin()
          .from('ai_analysis_logs')
          .insert({
            video_id: video.id,
            analysis_type: 'video_analysis',
            status: 'processing',
            input_data: {
              video_id: video.id,
              title: video.title,
              url: video.url
            }
          })
          .select()
          .single()

        if (logError) {
          throw logError
        }
        
        logEntryId = logEntry.id

        const startTime = Date.now()

        // 個別動画解析APIを呼び出し
        const analysisResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/analyze-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId: video.id })
        })

        const processingTime = Math.round((Date.now() - startTime) / 1000)

        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json()

          // ログを更新（成功）
          await getSupabaseAdmin()
            .from('ai_analysis_logs')
            .update({
              status: 'completed',
              result_data: analysisResult,
              processing_time_seconds: processingTime,
              completed_at: new Date().toISOString()
            })
            .eq('id', logEntry.id)

          results.processed++
        } else {
          const errorText = await analysisResponse.text()
          throw new Error(`Analysis failed: ${errorText}`)
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // ログを更新（失敗） - logEntryIdが存在する場合のみ
        if (logEntryId) {
          await getSupabaseAdmin()
            .from('ai_analysis_logs')
            .update({
              status: 'failed',
              error_message: errorMessage,
              completed_at: new Date().toISOString()
            })
            .eq('id', logEntryId)
        }

        results.failed++
        results.errors.push(`Video ${video.title}: ${errorMessage}`)

        console.error(`Batch analysis error for video ${video.id}:`, error)
      }

      // レート制限を考慮して少し待機
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return results

  } catch (error) {
    console.error('Batch analysis error:', error)
    throw error
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

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authCookie.value)
    
    if (authError || !user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { batchSize = 5 } = await request.json().catch(() => ({}))

    // バッチ解析を実行
    const results = await runBatchAnalysis(batchSize)

    // バッチ処理のログを記録
    await supabaseAdmin
      .from('ai_analysis_logs')
      .insert({
        video_id: null, // バッチ処理なのでvideo_idはnull
        analysis_type: 'video_analysis',
        status: results.failed > 0 ? 'completed' : 'completed',
        input_data: {
          batch_size: batchSize,
          type: 'batch_analysis'
        },
        result_data: {
          processed: results.processed,
          failed: results.failed,
          errors: results.errors
        },
        created_by: user.id
      })

    return NextResponse.json({
      message: 'Batch analysis completed',
      results: {
        processed: results.processed,
        failed: results.failed,
        totalErrors: results.errors.length,
        errors: results.errors.slice(0, 5) // 最初の5つのエラーのみ返す
      }
    })

  } catch (error) {
    console.error('Batch analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

// バッチ解析の状況を取得するGETエンドポイント
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

    // 解析状況の統計を取得
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('ai_analysis_stats')
      .select('*')
      .single()

    if (statsError) {
      console.error('Error fetching AI analysis stats:', statsError)
    }

    // 最近の解析ログを取得
    const { data: recentLogs, error: logsError } = await supabaseAdmin
      .from('ai_analysis_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('Error fetching recent logs:', logsError)
    }

    // 現在処理中のジョブ数を取得
    const { data: processingJobs, error: processingError } = await supabaseAdmin
      .from('ai_analysis_logs')
      .select('id')
      .eq('status', 'processing')

    if (processingError) {
      console.error('Error fetching processing jobs:', processingError)
    }

    return NextResponse.json({
      stats: stats || {
        total_videos: 0,
        analyzed_videos: 0,
        pending_videos: 0,
        videos_with_warnings: 0,
        avg_difficulty_score: 0
      },
      recentLogs: recentLogs || [],
      processingJobs: processingJobs ? processingJobs.length : 0
    })

  } catch (error) {
    console.error('Batch analysis status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}