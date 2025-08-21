import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

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

// Sample videos data
const sampleVideos = [
  {
    title: 'BJJ基礎 - シュリンプムーブメント',
    description: 'ブラジリアン柔術の基本動作であるシュリンプ（エビ）の動きを解説します。',
    filename: 'bjj-basics-shrimp-movement.mp4',
    video_url: 'https://www.youtube.com/watch?v=sample1',
    thumbnail_url: 'https://placehold.co/1280x720/1a1a1a/ea384c?text=Shrimp+Movement',
    duration: 300, // 5 minutes
    category: 'basic',
    difficulty_level: 'beginner',
    is_free: true,
  },
  {
    title: 'ガードの基本概念',
    description: 'オープンガード、クローズドガードの基本的な考え方と使い分けを学びます。',
    filename: 'guard-basics.mp4',
    video_url: 'https://www.youtube.com/watch?v=sample2',
    thumbnail_url: 'https://placehold.co/1280x720/1a1a1a/ea384c?text=Guard+Basics',
    duration: 600, // 10 minutes
    category: 'basic',
    difficulty_level: 'beginner',
    is_free: true,
  },
  {
    title: 'アームバーの基本',
    description: 'クローズドガードからのアームバー（腕十字）の基本的なセットアップと仕掛け方。',
    filename: 'armbar-basics.mp4',
    video_url: 'https://www.youtube.com/watch?v=sample3',
    thumbnail_url: 'https://placehold.co/1280x720/1a1a1a/ea384c?text=Armbar+Basics',
    duration: 480, // 8 minutes
    category: 'technique',
    difficulty_level: 'intermediate',
    is_free: false,
  },
  {
    title: 'パスガードの基本戦略',
    description: 'ガードを突破するための基本的な考え方と、圧力のかけ方を解説。',
    filename: 'pass-guard-strategy.mp4',
    video_url: 'https://www.youtube.com/watch?v=sample4',
    thumbnail_url: 'https://placehold.co/1280x720/1a1a1a/ea384c?text=Pass+Guard+Strategy',
    duration: 720, // 12 minutes
    category: 'strategy',
    difficulty_level: 'intermediate',
    is_free: false,
  },
  {
    title: 'スイープの連携 - フラワースイープからの展開',
    description: 'フラワースイープから次の技への連携を学ぶ、フロー重視のレッスン。',
    filename: 'sweep-flow-flower.mp4',
    video_url: 'https://www.youtube.com/watch?v=sample5',
    thumbnail_url: 'https://placehold.co/1280x720/1a1a1a/ea384c?text=Sweep+Flow',
    duration: 900, // 15 minutes
    category: 'flow',
    difficulty_level: 'advanced',
    is_free: false,
  }
]

async function createSampleVideos() {
  console.log('Creating sample videos...\n')

  for (const video of sampleVideos) {
    try {
      // Check if video already exists
      const { data: existing } = await supabaseAdmin
        .from('videos')
        .select('id')
        .eq('title', video.title)
        .single()

      if (existing) {
        console.log(`Video "${video.title}" already exists, skipping...`)
        continue
      }

      // Create video
      const { error } = await supabaseAdmin
        .from('videos')
        .insert({
          ...video,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error(`Error creating video "${video.title}":`, error)
      } else {
        console.log(`✓ Created video: ${video.title}`)
      }
    } catch (error) {
      console.error(`Unexpected error for "${video.title}":`, error)
    }
  }

  console.log('\nSample video creation completed!')
}

// Run the script
createSampleVideos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })