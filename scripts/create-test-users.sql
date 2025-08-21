-- ===================================
-- テストユーザー作成スクリプト
-- ===================================
-- 開発環境でのみ使用してください
-- 本番環境では実行しないでください

-- このスクリプトはSupabase Auth APIを使用してユーザーを作成する必要があるため、
-- 直接SQLでは実行できません。代わりに、以下の手順でテストユーザーを作成してください：

-- 1. 各テストユーザーを通常の登録フローで作成
-- 2. 以下のSQLを実行して権限を設定

-- 管理者アカウントの権限設定
UPDATE users_profile
SET 
  is_admin = true,
  is_coach = true,
  belt = 'black',
  stripes = 0,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'admin@test.muratabjj.com'
);

-- コーチアカウントの権限設定
UPDATE users_profile
SET 
  is_admin = false,
  is_coach = true,
  belt = 'brown',
  stripes = 2,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'coach@test.muratabjj.com'
);

-- プレミアムユーザーの設定
UPDATE users_profile
SET 
  is_admin = false,
  is_coach = false,
  belt = 'purple',
  stripes = 3,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'pro@test.muratabjj.com'
);

-- 一般ユーザーの設定
UPDATE users_profile
SET 
  is_admin = false,
  is_coach = false,
  belt = 'blue',
  stripes = 1,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'user@test.muratabjj.com'
);

-- 初心者ユーザーの設定
UPDATE users_profile
SET 
  is_admin = false,
  is_coach = false,
  belt = 'white',
  stripes = 2,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'beginner@test.muratabjj.com'
);

-- テストユーザーの確認
SELECT 
  u.email,
  up.full_name,
  up.is_admin,
  up.is_coach,
  up.belt,
  up.stripes,
  up.created_at
FROM auth.users u
JOIN users_profile up ON u.id = up.user_id
WHERE u.email IN (
  'admin@test.muratabjj.com',
  'coach@test.muratabjj.com',
  'pro@test.muratabjj.com',
  'user@test.muratabjj.com',
  'beginner@test.muratabjj.com'
)
ORDER BY 
  CASE up.is_admin WHEN true THEN 1 ELSE 2 END,
  CASE up.is_coach WHEN true THEN 1 ELSE 2 END,
  up.created_at;