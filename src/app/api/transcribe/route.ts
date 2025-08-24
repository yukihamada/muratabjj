import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, language = 'ja' } = await request.json()

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      )
    }

    // Check if OPENAI_API_KEY is available
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('[Transcribe] OpenAI API key is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }
    
    console.log('[Transcribe] Starting transcription for:', videoUrl)
    console.log('[Transcribe] Language:', language)

    // Download video from Supabase Storage
    const response = await fetch(videoUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch video')
    }

    const videoBlob = await response.blob()
    
    // Create form data for Whisper API
    const formData = new FormData()
    formData.append('file', videoBlob, 'video.mp4')
    formData.append('model', 'whisper-1')
    formData.append('language', language)
    formData.append('response_format', 'verbose_json')

    // Call Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: formData,
    })

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text()
      console.error('Whisper API error:', error)
      throw new Error(`Whisper API error: ${whisperResponse.statusText}`)
    }

    const result = await whisperResponse.json()
    
    console.log('[Transcribe] Success! Text length:', result.text?.length || 0)
    console.log('[Transcribe] Segments:', result.segments?.length || 0)

    return NextResponse.json({
      text: result.text,
      segments: result.segments,
      language: result.language,
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}