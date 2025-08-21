#!/usr/bin/env node

/**
 * サンプル動画データを追加するスクリプト
 * 本番環境では実際のSupabase設定が必要です
 */

import { createClient } from '@supabase/supabase-js'

// 環境変数の確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// サンプル動画データ
const sampleVideos = [
  {
    title: 'クローズドガードの基本',
    description: 'クローズドガードの基本的なコントロール方法を学びます。正しい足の使い方と上体のポジショニングについて詳しく解説します。',
    category: 'ガード',
    belt_level: 'white',
    duration: 180,
    thumbnail_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=225&fit=crop&crop=center',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    difficulty: 'beginner',
    tags: ['クローズドガード', '基本', 'コントロール'],
    is_free: true,
    instructor_notes: '初心者向けの基本的なガードポジション',
    transcript: '今日はクローズドガードの基本について説明します。まず足首をしっかりとロックして...',
    ai_analysis: {
      key_points: ['足首のロック', '上体のポジション', '腕のコントロール'],
      difficulty_assessment: 'beginner',
      common_mistakes: ['足の力を抜いてしまう', '上体が寝すぎる']
    }
  },
  {
    title: 'アームバーの基本テクニック',
    description: 'クローズドガードからのアームバーの基本的な仕掛け方を学習します。正確なタイミングとコントロールポイントを重点的に解説。',
    category: 'サブミッション',
    belt_level: 'blue',
    duration: 240,
    thumbnail_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop&crop=center',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    difficulty: 'intermediate',
    tags: ['アームバー', 'サブミッション', 'クローズドガード'],
    is_free: false,
    instructor_notes: '青帯以上推奨、正確なフォームが重要',
    transcript: 'アームバーは最も基本的なサブミッションの一つです。まず相手の腕をコントロールして...',
    ai_analysis: {
      key_points: ['腕のコントロール', '腰の回転', '足のポジション'],
      difficulty_assessment: 'intermediate',
      common_mistakes: ['急ぎすぎる', '腰の回転が不十分']
    }
  },
  {
    title: 'スパイダーガードの基本セットアップ',
    description: 'スパイダーガードの基本的なセットアップと維持方法を解説。袖のグリップの取り方と足の使い方がポイントです。',
    category: 'ガード',
    belt_level: 'blue',
    duration: 200,
    thumbnail_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=225&fit=crop&crop=center',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    difficulty: 'intermediate',
    tags: ['スパイダーガード', 'オープンガード', 'グリップ'],
    is_free: true,
    instructor_notes: '袖のグリップが重要なポイント',
    transcript: 'スパイダーガードは現代柔術の重要なガードです。まず袖をしっかりとグリップして...',
    ai_analysis: {
      key_points: ['袖のグリップ', '足の角度', 'バランス維持'],
      difficulty_assessment: 'intermediate',
      common_mistakes: ['グリップが浅い', '足の角度が悪い']
    }
  },
  {
    title: 'デラヒーバガードの基本',
    description: 'デラヒーバガードの基本的なセットアップから攻撃オプションまでを包括的に解説します。',
    category: 'ガード',
    belt_level: 'purple',
    duration: 300,
    thumbnail_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=225&fit=crop&crop=center',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    difficulty: 'advanced',
    tags: ['デラヒーバ', 'オープンガード', '上級'],
    is_free: false,
    instructor_notes: '紫帯以上推奨の高度なガードテクニック',
    transcript: 'デラヒーバガードは非常に攻撃的なガードです。足をしっかりとフックして...',
    ai_analysis: {
      key_points: ['フックの深さ', '上体のコントロール', 'タイミング'],
      difficulty_assessment: 'advanced',
      common_mistakes: ['フックが浅い', 'バランスを崩す']
    }
  },
  {
    title: 'エスケープの基本：マウントからの脱出',
    description: 'マウントポジションからの基本的な脱出方法を学習します。エルボーエスケープとブリッジエスケープの使い分けを解説。',
    category: 'エスケープ',
    belt_level: 'white',
    duration: 220,
    thumbnail_url: 'https://images.unsplash.com/photo-1599058918753-1527c525b61d?w=400&h=225&fit=crop&crop=center',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    difficulty: 'beginner',
    tags: ['エスケープ', 'マウント', '基本'],
    is_free: true,
    instructor_notes: '基本的なエスケープテクニック、必修',
    transcript: 'マウントされた時のエスケープは生命線です。まず落ち着いて...',
    ai_analysis: {
      key_points: ['エルボーの使い方', 'ブリッジのタイミング', '冷静さ'],
      difficulty_assessment: 'beginner',
      common_mistakes: ['パニックになる', 'フレームが弱い']
    }
  }
]

async function addSampleVideos() {
  try {
    console.log('🎬 サンプル動画データを追加しています...')

    // 既存のサンプル動画を削除（タイトルで判定）
    const sampleTitles = sampleVideos.map(v => v.title)
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .in('title', sampleTitles)

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.warn('⚠️ 既存データの削除時にエラー:', deleteError)
    }

    // 新しいサンプル動画を追加
    const { data, error } = await supabase
      .from('videos')
      .insert(sampleVideos)
      .select()

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('⚠️ videosテーブルが存在しません。先にデータベースのセットアップを実行してください。')
        console.log('📋 次のコマンドを実行してください: npm run setup:database')
        return
      }
      throw error
    }

    console.log('✅ サンプル動画データを追加しました:')
    data?.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.title} (${video.category})`)
    })

    console.log('')
    console.log('🎯 動画カタログページで確認できます: /dashboard/videos')
    console.log('💡 無料動画は3本、有料動画は2本追加されました。')
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  addSampleVideos()
    .then(() => {
      console.log('✅ 完了しました!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ エラー:', error)
      process.exit(1)
    })
}

export { addSampleVideos }