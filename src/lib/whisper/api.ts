import { supabase } from '@/lib/supabase/client'

const WHISPER_API_URL = process.env.NEXT_PUBLIC_WHISPER_API_URL || 'https://api.openai.com/v1/audio/transcriptions'
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY

export interface TranscriptionResult {
  text: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
  language?: string
}

export async function transcribeVideo(videoFile: File, language: string = 'ja'): Promise<TranscriptionResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

  try {
    // Extract audio from video file
    const audioBlob = await extractAudioFromVideo(videoFile)
    const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' })

    // Create form data for Whisper API
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')
    formData.append('language', language)
    formData.append('response_format', 'verbose_json')
    formData.append('timestamp_granularities[]', 'segment')

    // Call Whisper API
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.statusText}`)
    }

    const result = await response.json()

    return {
      text: result.text,
      segments: result.segments,
      language: result.language,
    }
  } catch (error) {
    console.error('Transcription error:', error)
    throw error
  }
}

async function extractAudioFromVideo(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const audio = document.createElement('audio')
    
    video.src = URL.createObjectURL(videoFile)
    video.muted = true
    
    video.addEventListener('loadedmetadata', async () => {
      try {
        // Use MediaRecorder to extract audio
        const stream = (canvas as any).captureStream()
        const audioContext = new AudioContext()
        const source = audioContext.createMediaElementSource(video)
        const destination = audioContext.createMediaStreamDestination()
        source.connect(destination)
        
        const mediaRecorder = new MediaRecorder(destination.stream, {
          mimeType: 'audio/webm'
        })
        
        const chunks: Blob[] = []
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data)
          }
        }
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' })
          resolve(audioBlob)
        }
        
        mediaRecorder.start()
        video.play()
        
        // Record for the full duration
        video.addEventListener('ended', () => {
          mediaRecorder.stop()
          audioContext.close()
          URL.revokeObjectURL(video.src)
        })
        
      } catch (error) {
        reject(error)
      }
    })
    
    video.addEventListener('error', reject)
  })
}

export async function saveTranscription(
  videoId: string,
  transcription: TranscriptionResult,
  userId: string
) {
  try {
    // Save main transcription
    const { data, error } = await supabase
      .from('video_transcriptions')
      .insert({
        video_id: videoId,
        transcription_text: transcription.text,
        language: transcription.language || 'ja',
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error

    // Save segments as chapters/keypoints if available
    if (transcription.segments && transcription.segments.length > 0) {
      const chapters = transcription.segments.map((segment, index) => ({
        video_id: videoId,
        title: `Chapter ${index + 1}`,
        description: segment.text,
        timestamp: segment.start,
        order_index: index,
      }))

      const { error: chapterError } = await supabase
        .from('video_chapters')
        .insert(chapters)

      if (chapterError) {
        console.error('Error saving chapters:', chapterError)
      }
    }

    return data
  } catch (error) {
    console.error('Error saving transcription:', error)
    throw error
  }
}

// Alternative: Use server-side API route for Whisper
export async function transcribeVideoServerSide(
  videoUrl: string,
  language: string = 'ja'
): Promise<TranscriptionResult> {
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl,
        language,
      }),
    })

    if (!response.ok) {
      throw new Error('Transcription failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Server-side transcription error:', error)
    throw error
  }
}