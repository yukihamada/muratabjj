-- ===================================
-- 管理者ユーザー設定スクリプト
-- ===================================
-- 本番サイトでユーザー登録後、このSQLを実行してください

-- 管理者権限を付与（メールアドレスを実際のものに変更）
UPDATE users_profile
SET 
  is_admin = true,
  is_coach = true,
  belt = 'black',
  stripes = 0,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'shu.shu.4029@gmail.com'
);

-- 追加の管理者がいる場合
UPDATE users_profile
SET 
  is_admin = true,
  is_coach = true,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'yuki@hamada.tokyo'
);

-- 管理者ユーザーの確認
SELECT 
  u.email,
  up.full_name,
  up.is_admin,
  up.is_coach,
  up.belt,
  up.stripes,
  up.created_at,
  up.updated_at
FROM auth.users u
JOIN users_profile up ON u.id = up.user_id
WHERE up.is_admin = true
ORDER BY up.created_at;

-- サンプル動画の作成（オプション）
-- 管理者のuser_idを取得してから実行
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- 管理者のIDを取得
  SELECT u.id INTO admin_user_id
  FROM auth.users u
  JOIN users_profile up ON u.id = up.user_id
  WHERE up.is_admin = true
  LIMIT 1;

  -- サンプル動画を追加
  INSERT INTO videos (
    title,
    description,
    url,
    category,
    position,
    belt,
    uploaded_by,
    is_published,
    published_at,
    recommended_belts,
    safety_warnings
  ) VALUES 
  (
    'アームバーの基本',
    'ガードポジションからのアームバーの基本的な手順を解説します。初心者向けに、グリップの取り方から最終的なフィニッシュまでを詳しく説明しています。',
    'https://example.com/sample-video-1.mp4',
    'submission',
    'guard',
    'blue',
    admin_user_id,
    true,
    NOW(),
    ARRAY['white', 'blue', 'purple'],
    ARRAY['相手の腕に過度な圧力をかけないよう注意']
  ),
  (
    'パスガードの基本 - ニースライス',
    'クローズドガードを突破する基本的なテクニックです。姿勢の作り方、グリップの切り方、パスの手順を解説します。',
    'https://example.com/sample-video-2.mp4',
    'guard-pass',
    'guard',
    'blue',
    admin_user_id,
    true,
    NOW(),
    ARRAY['blue', 'purple', 'brown'],
    ARRAY[]
  );
END $$;