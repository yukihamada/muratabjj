import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { analyzeVideoWithAI } from '@/lib/ai/video-analysis'

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

// AI分析を実行
async function performVideoAnalysis(videoId: string) {
  const supabaseAdmin = getSupabaseAdmin()
  
  try {
    console.log('[AI Auto-Analysis] Starting analysis for video:', videoId)

    // 動画情報を取得
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      console.error('[AI Auto-Analysis] Video not found:', videoError)
      return { success: false, error: 'Video not found' }
    }

    // 既存の解析があるかチェック
    const { data: existingAnalysis } = await supabaseAdmin
      .from('video_analyses')
      .select('id, analysis_status')
      .eq('video_id', videoId)
      .single()

    if (existingAnalysis?.analysis_status === 'completed') {
      console.log('[AI Auto-Analysis] Analysis already completed')
      return { success: true, message: 'Analysis already completed' }
    }

    // 解析レコードを作成または更新
    let analysisId = existingAnalysis?.id

    if (!existingAnalysis) {
      const { data: newAnalysis, error: insertError } = await supabaseAdmin
        .from('video_analyses')
        .insert({
          video_id: videoId,
          analysis_status: 'pending',
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('[AI Auto-Analysis] Error creating analysis record:', insertError)
        return { success: false, error: 'Failed to create analysis record' }
      }

      analysisId = newAnalysis.id
    }

    // 解析を開始状態に更新
    await supabaseAdmin
      .from('video_analyses')
      .update({ analysis_status: 'processing' })
      .eq('id', analysisId)

    // AI分析を実行
    let thumbnailUrl = video.thumbnail_url || video.video_url

    if (!thumbnailUrl) {
      throw new Error('No thumbnail or video URL available for analysis')
    }

    // 署名付きURLの生成（必要に応じて）
    if (thumbnailUrl.startsWith('videos/')) {
      const { data: signedData } = await supabaseAdmin.storage
        .from('videos')
        .createSignedUrl(thumbnailUrl, 3600)
      
      if (signedData?.signedUrl) {
        thumbnailUrl = signedData.signedUrl
      }
    }

    const analysisResult = await analyzeVideoWithAI(
      video.video_url || '',
      thumbnailUrl,
      video.title || 'Untitled Video',
      'ja'
    )

    // 結果をデータベースに保存
    const { error: updateError } = await supabaseAdmin
      .from('video_analyses')
      .update({
        analysis_status: 'completed',
        detected_techniques: analysisResult.detected_techniques || [],
        detected_positions: analysisResult.detected_positions || [],
        detected_submissions: analysisResult.detected_submissions || [],
        difficulty_level: analysisResult.difficulty_level,
        recommended_belt: analysisResult.recommended_belt,
        ai_summary: analysisResult.ai_summary,
        key_points: analysisResult.key_points || [],
        learning_tips: analysisResult.learning_tips || [],
        frames_analyzed: analysisResult.frames_analyzed || 1,
        analyzed_at: new Date().toISOString(),
        analyzed_by_model: 'gpt-4-vision-preview',
      })
      .eq('id', analysisId)

    if (updateError) {
      console.error('[AI Auto-Analysis] Error saving results:', updateError)
      await supabaseAdmin
        .from('video_analyses')
        .update({ analysis_status: 'failed' })
        .eq('id', analysisId)
      return { success: false, error: 'Failed to save analysis results' }
    }

    console.log('[AI Auto-Analysis] Analysis completed successfully')
    return { 
      success: true, 
      analysis_id: analysisId,
      analysis_result: analysisResult 
    }

  } catch (error: any) {
    console.error('[AI Auto-Analysis] Analysis failed:', error)
    return { success: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[AI Auto-Analysis] POST request received')
    
    const { video_id, trigger_analysis = true, background = false } = await request.json()

    if (!video_id) {
      return NextResponse.json({ error: 'video_id is required' }, { status: 400 })
    }

    if (!trigger_analysis) {
      return NextResponse.json({ 
        message: 'Analysis not triggered',
        video_id 
      })
    }

    // バックグラウンド実行の場合
    if (background) {
      // 非同期で分析を実行（レスポンス時間を短縮）
      setTimeout(async () => {
        await performVideoAnalysis(video_id)
      }, 2000)

      return NextResponse.json({
        message: 'Background analysis started',
        video_id,
        status: 'processing'
      })
    }

    // 同期実行の場合
    const result = await performVideoAnalysis(video_id)

    if (result.success) {
      return NextResponse.json({
        success: true,
        video_id,
        analysis_id: result.analysis_id,
        analysis_result: result.analysis_result
      })
    } else {
      return NextResponse.json({
        error: result.error,
        video_id
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('[AI Auto-Analysis] Request error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}

// 分析状況を確認するGETエンドポイント
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const video_id = searchParams.get('video_id')

    if (!video_id) {
      return NextResponse.json({ error: 'video_id is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 解析状況を取得
    const { data: analysis, error } = await supabaseAdmin
      .from('video_analyses')
      .select('*')
      .eq('video_id', video_id)
      .single()

    if (error) {
      return NextResponse.json({ 
        video_id,
        analysis_status: 'not_found',
        message: 'No analysis found for this video'
      })
    }

    return NextResponse.json({
      video_id,
      analysis_status: analysis.analysis_status,
      analysis
    })

  } catch (error: any) {
    console.error('[AI Auto-Analysis] GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}