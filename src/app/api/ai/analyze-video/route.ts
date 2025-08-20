import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for video analysis

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// 管理者チェック
function isAdmin(email: string | undefined): boolean {
  const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo']
  return adminEmails.includes(email || '')
}

interface AnalysisResult {
  techniques: string[]
  position: string
  category: string
  difficulty: number
  recommended_belts: string[]
  safety_warnings: string[]
  is_competition_legal: boolean
  requires_supervision: boolean
  key_points: string[]
  tags: string[]
}

// 動画フレームを抽出してbase64エンコード
async function extractVideoFrames(videoUrl: string, count: number = 5): Promise<string[]> {
  // この実装では、実際のフレーム抽出は省略し、
  // 本来はFFmpegやvideoプロセシングライブラリを使用します
  // ここではプレースホルダーとして空配列を返します
  return []
}

// OpenAI Vision APIで画像を分析
async function analyzeImageWithVision(imageBase64: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `あなたはブラジリアン柔術の専門家です。この画像を分析し、以下の情報をJSON形式で返してください：
              
              {
                "techniques": ["技術名1", "技術名2"],
                "position": "ポジション名",
                "category": "カテゴリー（guard、pass、submission、escape、takedown、sweep）",
                "difficulty": 1-5の数値,
                "recommended_belts": ["推奨帯のリスト"],
                "safety_warnings": ["安全上の注意点"],
                "is_competition_legal": true/false,
                "requires_supervision": true/false,
                "key_points": ["重要なポイント"],
                "tags": ["関連タグ"]
              }
              
              日本語で回答してください。技術や動きが明確でない場合は、可能性の高いものを推測してください。`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content
    if (content) {
      try {
        return JSON.parse(content)
      } catch (parseError) {
        // JSONパースに失敗した場合はテキストから情報を抽出
        return extractInfoFromText(content)
      }
    }
    return null
  } catch (error) {
    console.error('Vision API error:', error)
    return null
  }
}

// テキストから情報を抽出（フォールバック）
function extractInfoFromText(text: string): Partial<AnalysisResult> {
  const result: Partial<AnalysisResult> = {
    techniques: [],
    position: 'unknown',
    category: 'other',
    difficulty: 3,
    recommended_belts: ['white', 'blue'],
    safety_warnings: [],
    is_competition_legal: true,
    requires_supervision: false,
    key_points: [],
    tags: []
  }

  // 基本的なキーワード抽出
  const techniques = ['armbar', 'triangle', 'rear naked choke', 'guard', 'mount', 'side control']
  const positions = ['guard', 'mount', 'side control', 'back control', 'half guard']
  const categories = ['guard', 'pass', 'submission', 'escape', 'takedown', 'sweep']

  techniques.forEach(tech => {
    if (text.toLowerCase().includes(tech)) {
      result.techniques!.push(tech)
    }
  })

  for (const pos of positions) {
    if (text.toLowerCase().includes(pos)) {
      result.position = pos
      break
    }
  }

  for (const cat of categories) {
    if (text.toLowerCase().includes(cat)) {
      result.category = cat
      break
    }
  }

  return result
}

// 複数フレーム分析結果をマージ
function mergeAnalysisResults(results: Partial<AnalysisResult>[]): AnalysisResult {
  const validResults = results.filter(r => r && Object.keys(r).length > 0)
  
  if (validResults.length === 0) {
    return {
      techniques: [],
      position: 'unknown',
      category: 'other',
      difficulty: 3,
      recommended_belts: ['white', 'blue'],
      safety_warnings: [],
      is_competition_legal: true,
      requires_supervision: false,
      key_points: [],
      tags: []
    }
  }

  // 最も頻繁に出現する値を選択
  const allTechniques = validResults.flatMap(r => r.techniques || [])
  const techniques = Array.from(new Set(allTechniques))
  const positions = validResults.map(r => r.position).filter((p): p is string => Boolean(p))
  const position = positions.length > 0 ? positions[0] : 'unknown'
  
  const categories = validResults.map(r => r.category).filter((c): c is string => Boolean(c))
  const category = categories.length > 0 ? categories[0] : 'other'

  const difficulties = validResults.map(r => r.difficulty).filter((d): d is number => typeof d === 'number')
  const difficulty = difficulties.length > 0 ? Math.round(difficulties.reduce((a, b) => a + b, 0) / difficulties.length) : 3

  const allRecommendedBelts = validResults.flatMap(r => r.recommended_belts || [])
  const recommended_belts = Array.from(new Set(allRecommendedBelts))
  
  const allSafetyWarnings = validResults.flatMap(r => r.safety_warnings || [])
  const safety_warnings = Array.from(new Set(allSafetyWarnings))
  
  const allKeyPoints = validResults.flatMap(r => r.key_points || [])
  const key_points = Array.from(new Set(allKeyPoints))
  
  const allTags = validResults.flatMap(r => r.tags || [])
  const tags = Array.from(new Set(allTags))

  // 安全性チェック
  const is_competition_legal = !techniques.some(tech => 
    ['heel hook', 'knee bar', 'toe hold'].includes(tech.toLowerCase())
  )
  
  const requires_supervision = difficulties.some(d => d! >= 4) || 
    safety_warnings.length > 0

  return {
    techniques,
    position,
    category,
    difficulty,
    recommended_belts: recommended_belts.length > 0 ? recommended_belts : ['white', 'blue'],
    safety_warnings,
    is_competition_legal,
    requires_supervision,
    key_points,
    tags
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
    
    if (authError || !user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // 動画情報を取得
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // 既に分析済みかチェック
    if (video.ai_analysis_completed) {
      return NextResponse.json({ 
        message: 'Video already analyzed',
        analysis: {
          techniques: video.ai_detected_techniques || [],
          position: video.position,
          category: video.category
        }
      })
    }

    // 動画フレーム抽出（実際の実装では動画URLからフレームを抽出）
    const frames = await extractVideoFrames(video.url, 5)
    
    // 各フレームをVision APIで分析
    const analysisPromises = frames.map(frame => analyzeImageWithVision(frame))
    const analysisResults = await Promise.all(analysisPromises)

    // 分析結果をマージ
    const finalAnalysis = mergeAnalysisResults(analysisResults)

    // 分析結果をデータベースに保存
    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({
        ai_detected_techniques: finalAnalysis.techniques,
        ai_suggested_category: finalAnalysis.category,
        ai_suggested_position: finalAnalysis.position,
        ai_difficulty_score: finalAnalysis.difficulty,
        recommended_belts: finalAnalysis.recommended_belts,
        safety_warnings: finalAnalysis.safety_warnings,
        is_competition_legal: finalAnalysis.is_competition_legal,
        requires_supervision: finalAnalysis.requires_supervision,
        ai_key_points: finalAnalysis.key_points,
        ai_suggested_tags: finalAnalysis.tags,
        ai_analysis_completed: true,
        ai_analyzed_at: new Date().toISOString(),
        ai_analyzed_by: user.id
      })
      .eq('id', videoId)

    if (updateError) {
      console.error('Error updating video analysis:', updateError)
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Video analysis completed successfully',
      analysis: finalAnalysis
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}