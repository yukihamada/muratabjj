import { createClient } from '@supabase/supabase-js'

// Service Role Keyを使用して管理者権限でアクセス
const supabaseUrl = 'https://vyddhllzjjpqxbouqivf.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZGRobGx6ampwcXhib3VxaXZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkyNTE4OSwiZXhwIjoyMDY5NTAxMTg5fQ.SsTxDDMPOrZ7d8nzfN_6Srhd4fLJZW64L4G18h4zCaw'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 データベースのセットアップを開始します...')

  try {
    // 1. テストユーザーの作成
    console.log('📝 テストユーザーを作成中...')
    
    // 一般ユーザー
    const { data: user1, error: userError1 } = await supabaseAdmin.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpass123',
      email_confirm: true,
      user_metadata: {
        full_name: 'テストユーザー'
      }
    })

    if (userError1) {
      console.log('⚠️  test@example.com は既に存在している可能性があります:', userError1.message)
    } else {
      console.log('✅ テストユーザー作成完了:', (user1 as any)?.user?.email || 'test@example.com')
    }

    // コーチユーザー
    const { data: coach, error: coachError } = await supabaseAdmin.auth.admin.createUser({
      email: 'coach@example.com',
      password: 'coachpass123',
      email_confirm: true,
      user_metadata: {
        full_name: 'コーチユーザー'
      }
    })

    if (coachError) {
      console.log('⚠️  coach@example.com は既に存在している可能性があります:', coachError.message)
    } else {
      console.log('✅ コーチユーザー作成完了:', (coach as any)?.user?.email || 'coach@example.com')
      
      // コーチフラグを設定
      if ((coach as any)?.user?.id) {
        await supabaseAdmin
          .from('users_profile')
          .update({ is_coach: true })
          .eq('user_id', (coach as any).user.id)
      }
    }

    // 2. サンプル技術データの確認
    console.log('\n📊 技術データを確認中...')
    const { data: techniques, error: techError } = await supabaseAdmin
      .from('techniques')
      .select('*')
      .limit(5)

    if (techError) {
      console.error('❌ 技術データの取得エラー:', techError)
    } else {
      console.log(`✅ ${techniques?.length || 0}件の技術データが見つかりました`)
    }

    // 3. サンプル動画データの作成
    if (techniques && techniques.length > 0) {
      console.log('\n🎥 サンプル動画を作成中...')
      
      const sampleVideos = [
        {
          title_ja: 'クローズドガードの基本',
          title_en: 'Closed Guard Basics',
          title_pt: 'Básicos da Guarda Fechada',
          description_ja: '初心者向けのクローズドガードの基本的な使い方',
          description_en: 'Basic closed guard concepts for beginners',
          description_pt: 'Conceitos básicos de guarda fechada para iniciantes',
          url: 'https://example.com/videos/closed-guard-basics.mp4',
          thumbnail_url: 'https://example.com/thumbnails/closed-guard-basics.jpg',
          duration: 600,
          technique_id: techniques[0].id,
          instructor_id: (coach as any)?.user?.id || null,
          belt_requirement: 'white',
          is_premium: false
        },
        {
          title_ja: 'デラヒーバガードの詳細',
          title_en: 'De La Riva Guard Details',
          title_pt: 'Detalhes da Guarda De La Riva',
          description_ja: '上級者向けのデラヒーバガードの詳細なテクニック',
          description_en: 'Advanced De La Riva guard techniques',
          description_pt: 'Técnicas avançadas de guarda De La Riva',
          url: 'https://example.com/videos/dlr-details.mp4',
          thumbnail_url: 'https://example.com/thumbnails/dlr-details.jpg',
          duration: 900,
          technique_id: techniques[1]?.id || techniques[0].id,
          instructor_id: (coach as any)?.user?.id || null,
          belt_requirement: 'blue',
          is_premium: true
        }
      ]

      for (const video of sampleVideos) {
        const { error: videoError } = await supabaseAdmin
          .from('videos')
          .insert(video)

        if (videoError) {
          console.log('⚠️  動画の作成エラー:', videoError.message)
        } else {
          console.log('✅ サンプル動画作成完了:', video.title_ja)
        }
      }
    }

    // 4. データベース統計の表示
    console.log('\n📈 データベース統計:')
    
    const tables = ['users_profile', 'techniques', 'videos', 'subscriptions']
    for (const table of tables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`   ${table}: ${count}件`)
      }
    }

    console.log('\n✨ セットアップが完了しました！')
    console.log('\n🔐 テストアカウント:')
    console.log('   一般ユーザー: test@example.com / testpass123')
    console.log('   コーチ: coach@example.com / coachpass123')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  }
}

// スクリプトを実行
setupDatabase()