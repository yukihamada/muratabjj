-- テストユーザーの設定とプロフィール作成

-- coach@example.comをコーチに設定
UPDATE profiles 
SET 
  is_coach = true,
  belt_rank = 'black',
  stripes = 2,
  years_training = 15,
  full_name = 'Coach Tanaka',
  updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'coach@example.com' LIMIT 1);

-- test@example.comのプロフィール設定
UPDATE profiles 
SET 
  belt_rank = 'blue',
  stripes = 1,
  years_training = 3,
  full_name = 'Test User',
  updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1);

-- 存在しないプロフィールを作成
INSERT INTO profiles (id, user_id, full_name, belt_rank, stripes, is_coach, years_training, created_at, updated_at)
SELECT 
  u.id,
  u.id,
  CASE 
    WHEN u.email = 'coach@example.com' THEN 'Coach Tanaka'
    WHEN u.email = 'test@example.com' THEN 'Test User'
    ELSE 'New User'
  END,
  CASE 
    WHEN u.email = 'coach@example.com' THEN 'black'
    WHEN u.email = 'test@example.com' THEN 'blue'
    ELSE 'white'
  END,
  CASE 
    WHEN u.email = 'coach@example.com' THEN 2
    WHEN u.email = 'test@example.com' THEN 1
    ELSE 0
  END,
  CASE 
    WHEN u.email = 'coach@example.com' THEN true
    ELSE false
  END,
  CASE 
    WHEN u.email = 'coach@example.com' THEN 15
    WHEN u.email = 'test@example.com' THEN 3
    ELSE 0
  END,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email IN ('coach@example.com', 'test@example.com')
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id);

-- サンプルの習得度データを追加
INSERT INTO progress_tracking (user_id, video_id, progress_level, last_practiced, total_practice_time)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1),
  v.id,
  FLOOR(RANDOM() * 5 + 1),
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30),
  FLOOR(RANDOM() * 3600 + 300)
FROM videos v
WHERE v.belt_level IN ('white', 'blue')
LIMIT 5;