#!/usr/bin/env node

/**
 * Create sample videos for the video catalog
 * Uses the actual database schema from migrations
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Sample videos data matching the actual schema
const sampleVideos = [
  {
    title: 'クローズドガードの基本',
    description: 'クローズドガードの基本的なコントロール方法を学びます。正しい足の使い方と上体のポジショニングについて詳しく解説します。',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=225&fit=crop&crop=center',
    duration: 180,
    category: 'technique',
    position: 'guard',
    technique_type: 'guard_control',
    is_published: true,
    published_at: new Date().toISOString(),
    recommended_belts: ['white', 'blue'],
    min_belt: 'white',
    safety_warnings: ['相手の首を強く締めないように注意'],
    is_competition_legal: true,
    requires_supervision: false,
    uploaded_by: null, // Will be set to admin user
    transcript: {
      segments: [
        { start: 0, end: 30, text: '今日はクローズドガードの基本について説明します。' },
        { start: 30, end: 60, text: 'まず足首をしっかりとロックして...' }
      ]
    },
    transcript_language: 'ja'
  },
  {
    title: 'Basic Mount Escape',
    description: 'Learn the fundamental escapes from mount position. This tutorial covers the elbow escape and bridge techniques.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1599058918753-1527c525b61d?w=400&h=225&fit=crop&crop=center',
    duration: 240,
    category: 'technique',
    position: 'mount',
    technique_type: 'escape',
    is_published: true,
    published_at: new Date().toISOString(),
    recommended_belts: ['white'],
    min_belt: 'white',
    safety_warnings: ['Do not panic when mounted'],
    is_competition_legal: true,
    requires_supervision: false,
    uploaded_by: null,
    transcript: {
      segments: [
        { start: 0, end: 30, text: 'When you are mounted, the first thing is to stay calm.' },
        { start: 30, end: 60, text: 'Use your elbows to create frames...' }
      ]
    },
    transcript_language: 'en'
  },
  {
    title: 'Spider Guard Setup',
    description: 'Learn how to set up and maintain spider guard. Key points include grip placement and foot positioning.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=225&fit=crop&crop=center',
    duration: 200,
    category: 'technique',
    position: 'guard',
    technique_type: 'spider_guard',
    is_published: true,
    published_at: new Date().toISOString(),
    recommended_belts: ['blue', 'purple'],
    min_belt: 'blue',
    safety_warnings: ['Be careful with sleeve grips'],
    is_competition_legal: true,
    requires_supervision: false,
    uploaded_by: null,
    transcript: {
      segments: [
        { start: 0, end: 30, text: 'Spider guard is a modern guard system.' },
        { start: 30, end: 60, text: 'First, establish your sleeve grips...' }
      ]
    },
    transcript_language: 'en'
  },
  {
    title: 'Armbar from Guard',
    description: 'Classic armbar submission from closed guard. Learn the key details for a high-percentage finish.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop&crop=center',
    duration: 300,
    category: 'technique',
    position: 'guard',
    technique_type: 'submission',
    is_published: true,
    published_at: new Date().toISOString(),
    recommended_belts: ['white', 'blue'],
    min_belt: 'white',
    safety_warnings: ['Apply slowly', 'Tap early to avoid injury'],
    is_competition_legal: true,
    requires_supervision: true,
    uploaded_by: null,
    transcript: {
      segments: [
        { start: 0, end: 30, text: 'The armbar is one of the most fundamental submissions.' },
        { start: 30, end: 60, text: 'Start by controlling the arm...' }
      ]
    },
    transcript_language: 'en'
  },
  {
    title: 'Basic BJJ Movements',
    description: 'Essential movement drills every BJJ practitioner should master. Covers shrimping, bridging, and forward rolls.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=225&fit=crop&crop=center',
    duration: 360,
    category: 'drill',
    position: null,
    technique_type: 'movement',
    is_published: true,
    published_at: new Date().toISOString(),
    recommended_belts: ['white'],
    min_belt: 'white',
    safety_warnings: ['Warm up properly before drilling'],
    is_competition_legal: true,
    requires_supervision: false,
    uploaded_by: null,
    transcript: {
      segments: [
        { start: 0, end: 30, text: 'Movement is the foundation of Brazilian Jiu-Jitsu.' },
        { start: 30, end: 60, text: 'Let\'s start with the shrimp...' }
      ]
    },
    transcript_language: 'en'
  }
]

async function createSampleVideos() {
  try {
    console.log('🎬 Creating sample videos...')

    // First, get or create an admin user for uploaded_by field
    let adminUserId = null
    
    // Try to find an existing admin
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (adminProfiles && adminProfiles.length > 0) {
      adminUserId = adminProfiles[0].id
      console.log(`✅ Found admin user: ${adminUserId}`)
    } else {
      console.log('⚠️  No admin user found, videos will be created without uploader reference')
    }

    // Set the uploaded_by field for all videos
    const videosToInsert = sampleVideos.map(video => ({
      ...video,
      uploaded_by: adminUserId,
      published_by: adminUserId
    }))

    // Delete existing sample videos first
    const sampleTitles = sampleVideos.map(v => v.title)
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .in('title', sampleTitles)

    if (deleteError && !deleteError.message?.includes('0 rows affected')) {
      console.warn('⚠️  Warning during cleanup:', deleteError.message)
    }

    // Insert new sample videos
    const { data, error } = await supabase
      .from('videos')
      .insert(videosToInsert)
      .select()

    if (error) {
      console.error('❌ Error inserting videos:', error)
      throw error
    }

    console.log(`✅ Created ${data.length} sample videos:`)
    data.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.title} (${video.category})`)
    })

    // Add some video chapters for the first video
    if (data.length > 0) {
      const firstVideo = data[0]
      const chapters = [
        {
          video_id: firstVideo.id,
          title: 'Introduction',
          start_time: 0,
          end_time: 30,
          description: 'Video introduction and overview'
        },
        {
          video_id: firstVideo.id,
          title: 'Basic Position',
          start_time: 30,
          end_time: 90,
          description: 'Setting up the basic position'
        },
        {
          video_id: firstVideo.id,
          title: 'Key Details',
          start_time: 90,
          end_time: 150,
          description: 'Important details and common mistakes'
        }
      ]

      const { error: chaptersError } = await supabase
        .from('video_chapters')
        .insert(chapters)

      if (chaptersError) {
        console.warn('⚠️  Could not create chapters:', chaptersError.message)
      } else {
        console.log(`✅ Added ${chapters.length} chapters to first video`)
      }
    }

    console.log('\n🎯 Sample videos created successfully!')
    console.log('You can now view them at: /dashboard/videos')
    
  } catch (error) {
    console.error('❌ Error creating sample videos:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  createSampleVideos()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { createSampleVideos }