import { POST } from '../transcribe/route'
import { NextRequest } from 'next/server'

// 環境変数を設定
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.OPENAI_API_KEY = 'test-openai-key'

// Supabaseクライアントをモック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null })),
        })),
      })),
    })),
  })),
}))

// OpenAI APIをモック
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: jest.fn().mockResolvedValue({
            text: 'これはテスト用の文字起こしテキストです。',
          }),
        },
      },
    })),
  }
})

describe.skip('POST /api/transcribe', () => {
  it('ビデオURLから文字起こしを実行する', async () => {
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: 'https://example.com/video.mp4',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.transcript).toBe('これはテスト用の文字起こしテキストです。')
  })

  it('videoUrlが無い場合は400エラーを返す', async () => {
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Video URL is required')
  })

  it('OpenAI APIキーが設定されていない場合は500エラーを返す', async () => {
    // 一時的に環境変数を削除
    const originalApiKey = process.env.OPENAI_API_KEY
    delete process.env.OPENAI_API_KEY

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: 'https://example.com/video.mp4',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('OpenAI API key not configured')

    // 環境変数を復元
    if (originalApiKey) {
      process.env.OPENAI_API_KEY = originalApiKey
    }
  })
})