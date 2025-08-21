import { z } from 'zod'

// 動画関連のバリデーションスキーマ
export const videoUploadSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(200, 'タイトルは200文字以下で入力してください'),
  description: z.string().optional(),
  category: z.enum(['technique', 'drill', 'sparring', 'theory']),
  belt_level: z.enum(['white', 'blue', 'purple', 'brown', 'black', 'all']),
  position: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(true),
})

export const videoChapterSchema = z.object({
  timestamp: z.number().min(0),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
})

export const videoKeyPointSchema = z.object({
  timestamp: z.number().min(0),
  point: z.string().min(1).max(200),
  importance: z.enum(['low', 'medium', 'high']).default('medium'),
})

export const videoAnalysisRequestSchema = z.object({
  video_id: z.string().uuid(),
  analysis_type: z.enum(['transcript', 'keypoints', 'chapters', 'all']).default('all'),
})

// API レスポンスのバリデーション
export const videoListResponseSchema = z.object({
  videos: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    thumbnail_url: z.string().url().nullable(),
    duration: z.number().nullable(),
    view_count: z.number(),
    created_at: z.string(),
  })),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
})

// 型のエクスポート
export type VideoUploadInput = z.infer<typeof videoUploadSchema>
export type VideoChapter = z.infer<typeof videoChapterSchema>
export type VideoKeyPoint = z.infer<typeof videoKeyPointSchema>
export type VideoAnalysisRequest = z.infer<typeof videoAnalysisRequestSchema>
export type VideoListResponse = z.infer<typeof videoListResponseSchema>