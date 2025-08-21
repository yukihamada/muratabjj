import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import FormData from 'form-data'
import fetch from 'node-fetch'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// List of videos to upload
const videos = [
  {
    filePath: '/Users/yuki/Downloads/IMG_8194.MOV',
    title_ja: 'BJJテクニック動画 #1',
    title_en: 'BJJ Technique Video #1',
    title_pt: 'Vídeo de Técnica BJJ #1',
    description_ja: '実践的なBJJテクニックの解説動画',
    description_en: 'Practical BJJ technique demonstration',
    description_pt: 'Demonstração prática de técnica BJJ',
    category: 'technique',
    difficulty_level: 'intermediate',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8455.MOV',
    title_ja: 'BJJテクニック動画 #2',
    title_en: 'BJJ Technique Video #2',
    title_pt: 'Vídeo de Técnica BJJ #2',
    description_ja: '実践的なBJJテクニックの解説動画',
    description_en: 'Practical BJJ technique demonstration',
    description_pt: 'Demonstração prática de técnica BJJ',
    category: 'technique',
    difficulty_level: 'intermediate',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8107.MOV',
    title_ja: 'BJJテクニック動画 #3',
    title_en: 'BJJ Technique Video #3',
    title_pt: 'Vídeo de Técnica BJJ #3',
    description_ja: '実践的なBJJテクニックの解説動画',
    description_en: 'Practical BJJ technique demonstration',
    description_pt: 'Demonstração prática de técnica BJJ',
    category: 'technique',
    difficulty_level: 'advanced',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8482.MOV',
    title_ja: 'BJJフロー動画 #1',
    title_en: 'BJJ Flow Video #1',
    title_pt: 'Vídeo de Fluxo BJJ #1',
    description_ja: 'フロー重視のトレーニング動画',
    description_en: 'Flow-focused training video',
    description_pt: 'Vídeo de treinamento focado em fluxo',
    category: 'flow',
    difficulty_level: 'advanced',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8159.MOV',
    title_ja: 'BJJフロー動画 #2',
    title_en: 'BJJ Flow Video #2',
    title_pt: 'Vídeo de Fluxo BJJ #2',
    description_ja: 'フロー重視のトレーニング動画',
    description_en: 'Flow-focused training video',
    description_pt: 'Vídeo de treinamento focado em fluxo',
    category: 'flow',
    difficulty_level: 'intermediate',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8158.MOV',
    title_ja: 'BJJフロー動画 #3',
    title_en: 'BJJ Flow Video #3',
    title_pt: 'Vídeo de Fluxo BJJ #3',
    description_ja: 'フロー重視のトレーニング動画',
    description_en: 'Flow-focused training video',
    description_pt: 'Vídeo de treinamento focado em fluxo',
    category: 'flow',
    difficulty_level: 'intermediate',
    is_free: false,
  }
]

async function uploadVideoToStorage(filePath: string, userId: string): Promise<{ url: string; path: string }> {
  const fileName = path.basename(filePath)
  const fileBuffer = fs.readFileSync(filePath)
  const timestamp = Date.now()
  const storagePath = `videos/${userId}/${timestamp}_${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from('videos')
    .upload(storagePath, fileBuffer, {
      contentType: 'video/quicktime',
      upsert: false
    })

  if (error) {
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('videos')
    .getPublicUrl(storagePath)

  return {
    url: publicUrl,
    path: storagePath
  }
}

async function createVideoThumbnail(videoUrl: string): Promise<string> {
  // In a real implementation, this would generate a thumbnail from the video
  // For now, we'll use a placeholder
  return 'https://placehold.co/1280x720/1a1a1a/ea384c?text=BJJ+Video'
}

async function getVideoDuration(filePath: string): Promise<number> {
  // In a real implementation, this would extract the actual video duration
  // For now, we'll return a default duration
  return 600 // 10 minutes
}

async function triggerAIAnalysis(videoId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/analyze-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId })
    })
    
    if (!response.ok) {
      console.error('AI analysis failed:', await response.text())
    } else {
      console.log('AI analysis triggered for video:', videoId)
    }
  } catch (error) {
    console.error('Error triggering AI analysis:', error)
  }
}

async function uploadVideos() {
  console.log('Starting video upload process...\n')

  // Get admin user ID
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const adminUser = users?.users?.find(u => u.email === 'yuki@hamada.tokyo')
  
  if (!adminUser) {
    console.error('Admin user not found')
    return
  }

  const userId = adminUser.id
  console.log(`Using admin user ID: ${userId}\n`)

  for (const video of videos) {
    try {
      console.log(`Processing: ${video.title_ja}`)
      
      // Check if file exists
      if (!fs.existsSync(video.filePath)) {
        console.error(`File not found: ${video.filePath}`)
        continue
      }

      // Check if video already exists
      const { data: existing } = await supabaseAdmin
        .from('videos')
        .select('id')
        .eq('title', video.title_ja)
        .single()

      if (existing) {
        console.log(`Video already exists: ${video.title_ja}`)
        continue
      }

      // Upload video file
      console.log('Uploading video file...')
      const { url: videoUrl, path: videoPath } = await uploadVideoToStorage(video.filePath, userId)
      console.log('Video uploaded successfully')

      // Generate thumbnail
      const thumbnailUrl = await createVideoThumbnail(videoUrl)

      // Get video duration
      const duration = await getVideoDuration(video.filePath)

      // Save to database
      const { data: videoData, error: dbError } = await supabaseAdmin
        .from('videos')
        .insert({
          title: video.title_ja,
          description: video.description_ja,
          filename: path.basename(video.filePath),
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration,
          category: video.category,
          difficulty_level: video.difficulty_level,
          is_free: video.is_free,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          analysis_status: 'pending',
        })
        .select()
        .single()

      if (dbError) {
        console.error(`Database error for ${video.title_ja}:`, dbError)
        continue
      }

      console.log(`✓ Video saved to database: ${video.title_ja}`)
      
      // Trigger AI analysis
      console.log('Triggering AI analysis...')
      await triggerAIAnalysis(videoData.id)
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error(`Error uploading ${video.title_ja}:`, error)
    }
  }

  console.log('\nVideo upload process completed!')
}

// Run the script
uploadVideos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })