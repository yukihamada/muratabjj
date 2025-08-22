#!/usr/bin/env node

/**
 * Add sample video data for better user experience
 * This creates demo videos that users can see immediately
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample video data
const sampleVideos = [
  {
    title: 'BJJ基本動作：エビ（シュリンプ）',
    description: 'BJJで最も重要な基本動作の一つ。ガードポジションでの生存と脱出に必須の技術です。',
    url: '/videos/sample.mp4',
    thumbnail_url: '/api/placeholder-thumbnail?title=エビ',
    duration: 180, // 3 minutes
    category: 'technique',
    position: 'guard',
    belt: 'white',
    is_published: true,
    published_at: new Date().toISOString(),
    view_count: 0,
    recommended_belts: ['white', 'blue', 'purple', 'brown', 'black'],
    min_belt: 'white',
    is_competition_legal: true,
    requires_supervision: false,
  },
  {
    title: 'クローズドガードの基本',
    description: 'クローズドガードの基本的な構造と、相手をコントロールする方法を学びます。',
    url: '/videos/sample.mp4',
    thumbnail_url: '/api/placeholder-thumbnail?title=クローズドガード',
    duration: 300, // 5 minutes
    category: 'technique',
    position: 'guard',
    belt: 'white',
    is_published: true,
    published_at: new Date().toISOString(),
    view_count: 0,
    recommended_belts: ['white', 'blue', 'purple', 'brown', 'black'],
    min_belt: 'white',
    is_competition_legal: true,
    requires_supervision: false,
  },
  {
    title: 'マウントポジションからの腕十字',
    description: 'マウントポジションから基本的な腕十字への移行方法を詳しく解説します。',
    url: '/videos/sample.mp4',
    thumbnail_url: '/api/placeholder-thumbnail?title=腕十字',
    duration: 420, // 7 minutes
    category: 'technique',
    position: 'mount',
    belt: 'white',
    is_published: true,
    published_at: new Date().toISOString(),
    view_count: 0,
    recommended_belts: ['white', 'blue', 'purple', 'brown', 'black'],
    min_belt: 'white',
    safety_warnings: ['相手の肘に急激な圧力をかけないよう注意'],
    is_competition_legal: true,
    requires_supervision: true,
  },
  {
    title: 'Basic BJJ Movement: Shrimping',
    description: 'One of the most important fundamental movements in BJJ, essential for guard retention and escaping.',
    url: '/videos/sample.mp4',
    thumbnail_url: '/api/placeholder-thumbnail?title=Shrimping',
    duration: 180,
    category: 'technique',
    position: 'guard',
    belt: 'white',
    is_published: true,
    published_at: new Date().toISOString(),
    view_count: 0,
    recommended_belts: ['white', 'blue', 'purple', 'brown', 'black'],
    min_belt: 'white',
    is_competition_legal: true,
    requires_supervision: false,
  },
  {
    title: 'Movimento Básico: Camarão',
    description: 'Um dos movimentos fundamentais mais importantes no BJJ, essencial para retenção da guarda e fuga.',
    url: '/videos/sample.mp4',
    thumbnail_url: '/api/placeholder-thumbnail?title=Camarão',
    duration: 180,
    category: 'technique',
    position: 'guard',
    belt: 'white',
    is_published: true,
    published_at: new Date().toISOString(),
    view_count: 0,
    recommended_belts: ['white', 'blue', 'purple', 'brown', 'black'],
    min_belt: 'white',
    is_competition_legal: true,
    requires_supervision: false,
  },
];

async function seedSampleVideos() {
  try {
    console.log('🎥 Adding sample video data...\n');

    // Insert sample videos
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .upsert(sampleVideos, { onConflict: 'title' })
      .select();
    
    if (videoError) {
      // Handle case where videos table doesn't exist or has permission issues
      if (videoError.code === 'PGRST116' || videoError.message?.includes('relation')) {
        console.log('⚠️  Videos table does not exist. Please run database migrations first.');
        console.log('Run: npm run setup:database');
        process.exit(1);
      }
      throw videoError;
    }

    console.log(`✅ Created ${videoData.length} sample videos`);

    // Add some chapters for the first video
    if (videoData.length > 0) {
      console.log('\n📖 Adding sample chapters...');
      const sampleChapters = [
        {
          video_id: videoData[0].id,
          title: '準備とポジション',
          start_time: 0,
          end_time: 60,
          description: '正しい開始ポジションの説明'
        },
        {
          video_id: videoData[0].id,
          title: '基本的な動作',
          start_time: 60,
          end_time: 120,
          description: 'エビの基本動作の実演'
        },
        {
          video_id: videoData[0].id,
          title: 'よくある間違い',
          start_time: 120,
          end_time: 180,
          description: '初心者が陥りやすいミスと改善方法'
        }
      ];

      const { data: chapterData, error: chapterError } = await supabase
        .from('video_chapters')
        .upsert(sampleChapters, { onConflict: 'video_id,start_time' })
        .select();

      if (chapterError) {
        console.warn('⚠️  Could not create chapters:', chapterError.message);
      } else {
        console.log(`✅ Created ${chapterData.length} sample chapters`);
      }

      // Add some keypoints
      console.log('\n🎯 Adding sample keypoints...');
      const sampleKeypoints = [
        {
          video_id: videoData[0].id,
          timestamp: 30,
          title: '重要なポイント',
          description: '肘を地面につけて体を支える',
          keypoint_type: 'tip'
        },
        {
          video_id: videoData[0].id,
          timestamp: 90,
          title: 'よくある間違い',
          description: '膝だけで動こうとしない',
          keypoint_type: 'common_mistake'
        },
        {
          video_id: videoData[0].id,
          timestamp: 150,
          title: '注意点',
          description: '急激に動きすぎないよう注意',
          keypoint_type: 'warning'
        }
      ];

      const { data: keypointData, error: keypointError } = await supabase
        .from('video_keypoints')
        .upsert(sampleKeypoints, { onConflict: 'video_id,timestamp' })
        .select();

      if (keypointError) {
        console.warn('⚠️  Could not create keypoints:', keypointError.message);
      } else {
        console.log(`✅ Created ${keypointData.length} sample keypoints`);
      }
    }

    console.log('\n✨ Sample video data seeded successfully!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Sample Videos: ${videoData.length}`);
    console.log('   - Languages: Japanese, English, Portuguese');
    console.log('   - Categories: Fundamentals, Guard, Mount');
    console.log('   - All videos marked as published and viewable');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Users can now see sample videos in the catalog');
    console.log('   2. Replace sample videos with real content');
    console.log('   3. Update video URLs to actual files');
    console.log('   4. Add more diverse content as needed');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed
if (require.main === module) {
  seedSampleVideos();
}

module.exports = { seedSampleVideos };