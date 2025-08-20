import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vyddhllzjjpqxbouqivf.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZGRobGx6ampwcXhib3VxaXZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkyNTE4OSwiZXhwIjoyMDY5NTAxMTg5fQ.SsTxDDMPOrZ7d8nzfN_6Srhd4fLJZW64L4G18h4zCaw'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUsers() {
  console.log('👤 テストユーザーを作成します...\n')

  // テストユーザーのリスト
  const testUsers = [
    {
      email: 'test@example.com',
      password: 'testpass123',
      full_name: 'テストユーザー',
      is_coach: false
    },
    {
      email: 'coach@example.com',
      password: 'coachpass123',
      full_name: 'コーチユーザー',
      is_coach: true
    }
  ]

  for (const userData of testUsers) {
    try {
      // ユーザー作成
      const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      })

      if (error) {
        console.log(`⚠️  ${userData.email} - ${error.message}`)
        continue
      }

      console.log(`✅ ${userData.email} を作成しました`)

      // コーチフラグを更新
      if (userData.is_coach && (user as any)?.user?.id) {
        const { error: updateError } = await supabaseAdmin
          .from('users_profile')
          .update({ is_coach: true })
          .eq('user_id', (user as any).user.id)

        if (updateError) {
          console.log(`   ⚠️  コーチフラグの更新エラー: ${updateError.message}`)
        } else {
          console.log(`   ✅ コーチ権限を付与しました`)
        }
      }
    } catch (err) {
      console.error(`❌ エラー: ${err}`)
    }
  }

  console.log('\n📝 作成されたテストアカウント:')
  console.log('   一般ユーザー: test@example.com / testpass123')
  console.log('   コーチ: coach@example.com / coachpass123')
}

createTestUsers()