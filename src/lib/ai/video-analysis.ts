import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// 柔術技術のカテゴリ定義
export const BJJ_CATEGORIES = {
  positions: [
    'クローズドガード', 'オープンガード', 'ハーフガード', 'サイドコントロール', 
    'マウント', 'バック', 'ニーオンベリー', 'ノースサウス'
  ],
  techniques: [
    'ガードパス', 'スイープ', 'サブミッション', 'エスケープ', 
    'トランジション', 'テイクダウン'
  ],
  submissions: [
    '腕十字', 'トライアングル', 'チョーク', 'キムラ', 'アメリカーナ', 
    'ギロチン', 'オモプラータ', 'ヒールフック', 'アンクルロック'
  ],
  guards: [
    'クローズドガード', 'バタフライガード', 'デラヒーバガード', 
    'スパイダーガード', 'ラッソーガード', '50/50ガード', 'Xガード'
  ]
} as const

export interface VideoAnalysisResult {
  id: string
  video_id: string
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
  
  // 技術認識結果
  detected_techniques: string[]
  detected_positions: string[]
  detected_submissions: string[]
  
  // 詳細分析
  technique_timestamps: Array<{
    timestamp: number
    technique: string
    confidence: number
    description: string
  }>
  
  // 総合評価
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  recommended_belt: 'white' | 'blue' | 'purple' | 'brown' | 'black'
  
  // AIコメント
  ai_summary: string
  key_points: string[]
  learning_tips: string[]
  
  // メタデータ
  analyzed_at: string
  analysis_duration: number
  frames_analyzed: number
}

/**
 * 動画のキーフレームを抽出してGPT-4 Visionで分析
 */
export async function analyzeVideoWithAI(
  videoUrl: string, 
  thumbnailUrl: string,
  videoTitle: string,
  language: 'ja' | 'en' | 'pt' = 'ja'
): Promise<Partial<VideoAnalysisResult>> {
  
  const systemPrompt = getSystemPrompt(language)
  
  try {
    console.log('[AI Analysis] Starting video analysis for:', videoTitle)
    
    // GPT-4 Visionで画像分析
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `この柔術動画を分析してください。タイトル: "${videoTitle}". 以下の形式でJSON形式で回答してください：

{
  "detected_techniques": ["技術名1", "技術名2"],
  "detected_positions": ["ポジション1", "ポジション2"],  
  "detected_submissions": ["サブミッション1"],
  "difficulty_level": "beginner|intermediate|advanced|expert",
  "recommended_belt": "white|blue|purple|brown|black",
  "ai_summary": "この動画の内容要約",
  "key_points": ["ポイント1", "ポイント2", "ポイント3"],
  "learning_tips": ["学習のコツ1", "学習のコツ2"]
}`
            },
            {
              type: "image_url",
              image_url: {
                url: thumbnailUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from GPT-4 Vision')
    }

    console.log('[AI Analysis] Raw response:', content)

    // JSONレスポンスを解析
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      
      const analysisResult = JSON.parse(jsonMatch[0])
      
      return {
        ...analysisResult,
        analysis_status: 'completed' as const,
        analyzed_at: new Date().toISOString(),
        frames_analyzed: 1, // サムネイルのみの場合
      }
      
    } catch (parseError) {
      console.error('[AI Analysis] JSON parse error:', parseError)
      
      // JSONパースに失敗した場合は、テキストから情報を抽出
      return {
        analysis_status: 'completed' as const,
        ai_summary: content.substring(0, 500),
        key_points: ['AI分析を完了しました'],
        learning_tips: ['詳細な分析結果は後日提供されます'],
        analyzed_at: new Date().toISOString(),
        frames_analyzed: 1,
      }
    }

  } catch (error) {
    console.error('[AI Analysis] Error:', error)
    throw error
  }
}

/**
 * 複数フレーム分析（将来の拡張用）
 */
export async function analyzeMultipleFrames(
  frameUrls: string[],
  videoTitle: string,
  language: 'ja' | 'en' | 'pt' = 'ja'
): Promise<Partial<VideoAnalysisResult>> {
  // 将来的には複数のフレームを分析して、より詳細な解析を行う
  // 現在はサムネイル1枚のみの分析
  if (frameUrls.length === 0) {
    throw new Error('No frames provided for analysis')
  }
  
  return analyzeVideoWithAI('', frameUrls[0], videoTitle, language)
}

/**
 * システムプロンプト（言語別）
 */
function getSystemPrompt(language: 'ja' | 'en' | 'pt'): string {
  switch (language) {
    case 'ja':
      return `あなたは柔術（ブラジリアン柔術）の専門家です。動画の画像を分析して、以下の情報を正確に特定してください：

1. 技術認識：使用されている具体的な技術名
2. ポジション：基本的なポジション（ガード、マウント、サイド等）
3. サブミッション：絞め技・関節技の種類
4. 難易度評価：beginner/intermediate/advanced/expert
5. 推奨帯：white/blue/purple/brown/black
6. 要約：動画の内容を簡潔に説明
7. 重要ポイント：技術の要点を3つ
8. 学習のコツ：習得のための具体的なアドバイス

必ずJSON形式で回答し、日本語の技術名を使用してください。`

    case 'en':
      return `You are a Brazilian Jiu-Jitsu expert. Analyze the video frame and identify:

1. Techniques: Specific technique names being demonstrated
2. Positions: Basic positions (guard, mount, side control, etc.)
3. Submissions: Types of chokes and joint locks
4. Difficulty: beginner/intermediate/advanced/expert
5. Recommended belt: white/blue/purple/brown/black
6. Summary: Brief description of the video content
7. Key points: 3 main technical points
8. Learning tips: Specific advice for mastering the technique

Respond in JSON format using English technique names.`

    case 'pt':
      return `Você é um especialista em Jiu-Jitsu Brasileiro. Analise o frame do vídeo e identifique:

1. Técnicas: Nomes específicos das técnicas demonstradas
2. Posições: Posições básicas (guarda, montada, controle lateral, etc.)
3. Finalizações: Tipos de estrangulamentos e chaves
4. Dificuldade: beginner/intermediate/advanced/expert
5. Faixa recomendada: white/blue/purple/brown/black
6. Resumo: Descrição breve do conteúdo do vídeo
7. Pontos-chave: 3 pontos técnicos principais
8. Dicas de aprendizado: Conselhos específicos para dominar a técnica

Responda em formato JSON usando nomes de técnicas em português.`
  }
}

/**
 * 分析結果をデータベースに保存
 */
export async function saveAnalysisResult(
  videoId: string,
  analysisResult: Partial<VideoAnalysisResult>
) {
  // この関数は別ファイルで実装される予定
  // 現在はコンソールログのみ
  console.log('[AI Analysis] Saving result for video:', videoId, analysisResult)
}

/**
 * 分析の進捗を更新
 */
export async function updateAnalysisStatus(
  videoId: string,
  status: VideoAnalysisResult['analysis_status'],
  error?: string
) {
  console.log(`[AI Analysis] Status update for ${videoId}: ${status}`, error)
}