import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

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

// OpenAI Client を関数内で作成
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('Missing OpenAI API key')
  }
  
  return new OpenAI({ apiKey })
}

// 管理者チェック
function isAdmin(email: string | undefined): boolean {
  const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo']
  return adminEmails.includes(email || '')
}

interface FlowSuggestion {
  name: string
  description: string
  techniques: Array<{
    id: string
    name: string
    video_id?: string
    position: string
    sequence_order: number
  }>
  difficulty_level: number
  estimated_time: number
  recommended_belts: string[]
  prerequisites: string[]
}

// 技術データベースから関連技術を検索
async function findRelatedTechniques(videoId: string): Promise<any[]> {
  try {
    // 分析対象の動画情報を取得
    const supabaseAdmin = getSupabaseAdmin()
    const { data: sourceVideo, error: sourceError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (sourceError || !sourceVideo) {
      return []
    }

    // 同じポジション・カテゴリーの技術を検索
    const { data: relatedVideos, error: relatedError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .or(`position.eq.${sourceVideo.position},category.eq.${sourceVideo.category}`)
      .neq('id', videoId)
      .eq('is_published', true)
      .limit(10)

    if (relatedError) {
      console.error('Error finding related techniques:', relatedError)
      return []
    }

    return relatedVideos || []
  } catch (error) {
    console.error('Error in findRelatedTechniques:', error)
    return []
  }
}

// OpenAI GPTでフロー提案を生成
async function generateFlowSuggestions(sourceVideo: any, relatedTechniques: any[]): Promise<FlowSuggestion[]> {
  try {
    const techniquesInfo = relatedTechniques.map(video => ({
      id: video.id,
      title: video.title,
      position: video.position,
      category: video.category,
      techniques: video.ai_detected_techniques || [],
      difficulty: video.ai_difficulty_score || 3
    }))

    const prompt = `
あなたはブラジリアン柔術の専門インストラクターです。

メインテクニック：
- タイトル: ${sourceVideo.title}
- ポジション: ${sourceVideo.position}
- カテゴリ: ${sourceVideo.category}
- 技術: ${sourceVideo.ai_detected_techniques?.join(', ') || 'なし'}

関連テクニック:
${techniquesInfo.map((tech, index) => 
  `${index + 1}. ${tech.title} (${tech.position}, ${tech.category})`
).join('\n')}

上記の情報を基に、効果的な練習フローを3つ提案してください。以下のJSON形式で回答してください：

{
  "flows": [
    {
      "name": "フロー名",
      "description": "フローの説明",
      "techniques": [
        {
          "id": "技術ID",
          "name": "技術名", 
          "position": "ポジション",
          "sequence_order": 1
        }
      ],
      "difficulty_level": 1-5,
      "estimated_time": "分数",
      "recommended_belts": ["推奨帯"],
      "prerequisites": ["前提技術"]
    }
  ]
}

各フローは論理的な流れを持ち、初心者から上級者まで段階的に学習できるよう構成してください。
`

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたはブラジリアン柔術の専門インストラクターです。技術的に正確で教育的価値の高いフローを提案してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content
    if (content) {
      try {
        const parsed = JSON.parse(content)
        return parsed.flows || []
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        return generateFallbackFlows(sourceVideo, relatedTechniques)
      }
    }

    return generateFallbackFlows(sourceVideo, relatedTechniques)
  } catch (error) {
    console.error('GPT API error:', error)
    return generateFallbackFlows(sourceVideo, relatedTechniques)
  }
}

// フォールバック用のシンプルなフロー生成
function generateFallbackFlows(sourceVideo: any, relatedTechniques: any[]): FlowSuggestion[] {
  const flows: FlowSuggestion[] = []

  // 基本フロー
  const basicFlow: FlowSuggestion = {
    name: `${sourceVideo.position}基本フロー`,
    description: `${sourceVideo.position}からの基本的な技術の流れ`,
    techniques: [
      {
        id: sourceVideo.id,
        name: sourceVideo.title,
        video_id: sourceVideo.id,
        position: sourceVideo.position,
        sequence_order: 1
      }
    ],
    difficulty_level: Math.min(sourceVideo.ai_difficulty_score || 3, 3),
    estimated_time: 15,
    recommended_belts: ['white', 'blue'],
    prerequisites: []
  }

  // 関連技術を追加
  relatedTechniques.slice(0, 3).forEach((tech, index) => {
    basicFlow.techniques.push({
      id: tech.id,
      name: tech.title,
      video_id: tech.id,
      position: tech.position,
      sequence_order: index + 2
    })
  })

  flows.push(basicFlow)

  // 発展フロー
  if (relatedTechniques.length > 3) {
    const advancedFlow: FlowSuggestion = {
      name: `${sourceVideo.position}発展フロー`,
      description: `${sourceVideo.position}からより高度な技術への展開`,
      techniques: [
        {
          id: sourceVideo.id,
          name: sourceVideo.title,
          video_id: sourceVideo.id,
          position: sourceVideo.position,
          sequence_order: 1
        }
      ],
      difficulty_level: Math.max(sourceVideo.ai_difficulty_score || 3, 4),
      estimated_time: 25,
      recommended_belts: ['blue', 'purple', 'brown'],
      prerequisites: [sourceVideo.title]
    }

    relatedTechniques.slice(3, 6).forEach((tech, index) => {
      advancedFlow.techniques.push({
        id: tech.id,
        name: tech.title,
        video_id: tech.id,
        position: tech.position,
        sequence_order: index + 2
      })
    })

    flows.push(advancedFlow)
  }

  return flows
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

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // ソース動画を取得
    const { data: sourceVideo, error: sourceError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (sourceError || !sourceVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // 関連技術を検索
    const relatedTechniques = await findRelatedTechniques(videoId)

    // フローを生成
    const flowSuggestions = await generateFlowSuggestions(sourceVideo, relatedTechniques)

    // 生成したフローをデータベースに保存
    for (const flow of flowSuggestions) {
      try {
        const { data: savedFlow, error: flowError } = await supabaseAdmin
          .from('flows')
          .insert({
            name: flow.name,
            description: flow.description,
            difficulty_level: flow.difficulty_level,
            estimated_time_minutes: flow.estimated_time,
            recommended_belts: flow.recommended_belts,
            prerequisites: flow.prerequisites,
            is_ai_generated: true,
            created_by: user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (flowError) {
          console.error('Error saving flow:', flowError)
          continue
        }

        // フローノードを保存
        for (const technique of flow.techniques) {
          await supabaseAdmin
            .from('flow_nodes')
            .insert({
              flow_id: savedFlow.id,
              video_id: technique.video_id,
              title: technique.name,
              position: technique.position,
              sequence_order: technique.sequence_order,
              node_type: 'technique',
              x_position: technique.sequence_order * 200,
              y_position: 100
            })
        }
      } catch (error) {
        console.error('Error saving flow:', error)
      }
    }

    return NextResponse.json({
      message: 'Flow suggestions generated successfully',
      flows: flowSuggestions
    })

  } catch (error) {
    console.error('Flow suggestion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}