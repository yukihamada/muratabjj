-- ===================================
-- テストデータ作成スクリプト
-- ===================================
-- テストユーザー作成後に実行してください

-- テスト用動画データの作成
DO $$
DECLARE
  admin_id UUID;
  coach_id UUID;
BEGIN
  -- 管理者IDを取得
  SELECT u.id INTO admin_id
  FROM auth.users u
  JOIN users_profile up ON u.id = up.user_id
  WHERE u.email = 'admin@test.muratabjj.com';

  -- コーチIDを取得
  SELECT u.id INTO coach_id
  FROM auth.users u
  JOIN users_profile up ON u.id = up.user_id
  WHERE u.email = 'coach@test.muratabjj.com';

  -- 基本技の動画
  INSERT INTO videos (
    title, description, url, category, position, belt,
    uploaded_by, is_published, published_at,
    recommended_belts, safety_warnings
  ) VALUES 
  -- 白帯向け
  (
    'エビの基本動作',
    '柔術の基本中の基本であるエビ（シュリンプ）の動作を解説。ガードリカバリーやエスケープの基礎となる重要な動きです。',
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    'drill', 'guard', 'white',
    coach_id, true, NOW() - INTERVAL '30 days',
    ARRAY['white', 'blue'],
    ARRAY[]::TEXT[]
  ),
  (
    'ブリッジの基本',
    'マウントエスケープに必須のブリッジ動作。正しいフォームと練習方法を解説します。',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    'drill', 'mount', 'white',
    coach_id, true, NOW() - INTERVAL '28 days',
    ARRAY['white', 'blue'],
    ARRAY['首に負担がかかる場合は無理をしない']
  ),
  
  -- 青帯向け
  (
    'クローズドガードからのアームバー',
    'クローズドガードからの基本的なアームバー。グリップの取り方、角度の作り方、フィニッシュまでを詳しく解説。',
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    'submission', 'guard', 'blue',
    admin_id, true, NOW() - INTERVAL '25 days',
    ARRAY['blue', 'purple'],
    ARRAY['相手の腕に過度な圧力をかけない', 'タップされたらすぐに離す']
  ),
  (
    'ニースライスパス',
    'クローズドガードを突破する基本的なパスガード。姿勢、グリップ、圧力の使い方を解説。',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    'guard-pass', 'guard', 'blue',
    admin_id, true, NOW() - INTERVAL '20 days',
    ARRAY['blue', 'purple', 'brown'],
    ARRAY[]::TEXT[]
  ),
  
  -- 紫帯向け
  (
    'デラヒーバガードの基本',
    'モダン柔術の代表的なオープンガード。エントリー、コントロール、スイープへの展開を解説。',
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    'guard-pass', 'guard', 'purple',
    admin_id, true, NOW() - INTERVAL '15 days',
    ARRAY['purple', 'brown', 'black'],
    ARRAY['膝に負担がかかる場合は注意']
  ),
  (
    'バックテイクからのRNC',
    'バックポジションからのリアネイキッドチョーク。コントロールの維持とフィニッシュのディテール。',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    'submission', 'back', 'purple',
    coach_id, true, NOW() - INTERVAL '10 days',
    ARRAY['purple', 'brown', 'black'],
    ARRAY['首への圧力に十分注意', '意識を失う前に必ずタップ']
  );

  -- チャプターデータの作成
  INSERT INTO video_chapters (video_id, title, timestamp, order_index)
  SELECT 
    v.id,
    c.title,
    c.timestamp,
    c.order_index
  FROM videos v
  CROSS JOIN (
    VALUES 
      ('イントロダクション', 0, 1),
      ('基本姿勢の説明', 30, 2),
      ('ステップバイステップ', 60, 3),
      ('よくある間違い', 120, 4),
      ('ドリル練習', 180, 5),
      ('まとめ', 240, 6)
  ) AS c(title, timestamp, order_index)
  WHERE v.title IN ('エビの基本動作', 'ブリッジの基本');

  -- キーポイントの作成
  INSERT INTO video_keypoints (video_id, timestamp, description)
  SELECT 
    v.id,
    k.timestamp,
    k.description
  FROM videos v
  CROSS JOIN (
    VALUES 
      (45, '重要：腰の使い方に注目'),
      (90, 'ここでよくミスが起きます'),
      (150, 'このグリップが成功の鍵'),
      (200, '実戦での応用例')
  ) AS k(timestamp, description)
  WHERE v.category = 'submission';

END $$;

-- テスト用フローデータの作成
DO $$
DECLARE
  user_id UUID;
  flow_id UUID;
BEGIN
  -- プレミアムユーザーのIDを取得
  SELECT u.id INTO user_id
  FROM auth.users u
  WHERE u.email = 'pro@test.muratabjj.com';

  -- フローを作成
  INSERT INTO flows (user_id, name, description, is_public)
  VALUES (
    user_id,
    'クローズドガード基本攻撃フロー',
    'クローズドガードからの基本的な攻撃の連携。アームバー、三角絞め、オモプラータへの展開。',
    true
  )
  RETURNING id INTO flow_id;

  -- フローのノードとエッジデータ
  UPDATE flows
  SET flow_data = jsonb_build_object(
    'nodes', jsonb_build_array(
      jsonb_build_object(
        'id', '1',
        'type', 'technique',
        'position', jsonb_build_object('x', 100, 'y', 100),
        'data', jsonb_build_object(
          'label', 'クローズドガード',
          'description', '基本のスタートポジション'
        )
      ),
      jsonb_build_object(
        'id', '2',
        'type', 'technique',
        'position', jsonb_build_object('x', 300, 'y', 50),
        'data', jsonb_build_object(
          'label', 'アームバー',
          'description', '腕を極める基本的なサブミッション'
        )
      ),
      jsonb_build_object(
        'id', '3',
        'type', 'technique',
        'position', jsonb_build_object('x', 300, 'y', 150),
        'data', jsonb_build_object(
          'label', '三角絞め',
          'description', '足で首を絞める技'
        )
      ),
      jsonb_build_object(
        'id', '4',
        'type', 'technique',
        'position', jsonb_build_object('x', 300, 'y', 250),
        'data', jsonb_build_object(
          'label', 'オモプラータ',
          'description', '肩関節を極める技'
        )
      )
    ),
    'edges', jsonb_build_array(
      jsonb_build_object(
        'id', 'e1-2',
        'source', '1',
        'target', '2',
        'label', '腕を引く'
      ),
      jsonb_build_object(
        'id', 'e1-3',
        'source', '1',
        'target', '3',
        'label', '頭を押し下げる'
      ),
      jsonb_build_object(
        'id', 'e1-4',
        'source', '1',
        'target', '4',
        'label', '腕を外に'
      ),
      jsonb_build_object(
        'id', 'e2-3',
        'source', '2',
        'target', '3',
        'label', '防御された場合'
      )
    )
  )
  WHERE id = flow_id;

END $$;

-- テスト用習得度データ
DO $$
DECLARE
  user_id UUID;
  video_id UUID;
BEGIN
  -- 一般ユーザーのIDを取得
  SELECT u.id INTO user_id
  FROM auth.users u
  WHERE u.email = 'user@test.muratabjj.com';

  -- 動画に対する習得度を記録
  FOR video_id IN (SELECT id FROM videos WHERE belt IN ('white', 'blue') LIMIT 3)
  LOOP
    INSERT INTO technique_progress (
      user_id, 
      technique_name, 
      mastery_level, 
      last_practiced,
      notes
    ) VALUES (
      user_id,
      (SELECT title FROM videos WHERE id = video_id),
      floor(random() * 5 + 1)::INTEGER,
      NOW() - INTERVAL '1 day' * floor(random() * 30),
      CASE 
        WHEN random() > 0.5 THEN '良い感じで進歩している'
        ELSE NULL
      END
    );
  END LOOP;
END $$;

-- テスト用スパーリングログ
DO $$
DECLARE
  user_id UUID;
  session_id UUID;
  i INTEGER;
BEGIN
  -- プロユーザーのIDを取得
  SELECT u.id INTO user_id
  FROM auth.users u
  WHERE u.email = 'pro@test.muratabjj.com';

  -- 過去30日間のスパーリングセッションを作成
  FOR i IN 1..10 LOOP
    INSERT INTO sparring_sessions (
      user_id,
      partner_name,
      duration_minutes,
      starting_position,
      notes,
      session_date
    ) VALUES (
      user_id,
      CASE 
        WHEN i % 3 = 0 THEN '田中さん（茶帯）'
        WHEN i % 3 = 1 THEN '佐藤さん（紫帯）'
        ELSE '鈴木さん（青帯）'
      END,
      5 + floor(random() * 6)::INTEGER,
      CASE 
        WHEN i % 4 = 0 THEN 'standing'
        WHEN i % 4 = 1 THEN 'guard'
        WHEN i % 4 = 2 THEN 'side-control'
        ELSE 'mount'
      END,
      CASE 
        WHEN random() > 0.7 THEN 'ガードの維持が良くできた'
        WHEN random() > 0.5 THEN '新しい技を試せた'
        ELSE NULL
      END,
      CURRENT_DATE - INTERVAL '1 day' * (i * 3)
    )
    RETURNING id INTO session_id;

    -- セッションにイベントを追加
    INSERT INTO sparring_events (
      session_id,
      event_type,
      technique_used,
      success,
      timestamp_seconds,
      notes
    ) 
    SELECT
      session_id,
      event_type,
      technique_used,
      success,
      timestamp_seconds,
      notes
    FROM (
      VALUES
        ('guard-pass', 'ニースライス', true, 45, NULL),
        ('sweep', 'シザースイープ', false, 120, '途中まで良かった'),
        ('submission', 'アームバー', true, 180, NULL),
        ('position-change', NULL, true, 240, 'サイドからマウントへ')
    ) AS events(event_type, technique_used, success, timestamp_seconds, notes)
    WHERE random() > 0.3;
  END LOOP;
END $$;

-- データ作成の確認
SELECT 'Videos created:' as info, COUNT(*) as count FROM videos
UNION ALL
SELECT 'Flows created:', COUNT(*) FROM flows
UNION ALL
SELECT 'Progress records:', COUNT(*) FROM technique_progress
UNION ALL
SELECT 'Sparring sessions:', COUNT(*) FROM sparring_sessions
UNION ALL
SELECT 'Sparring events:', COUNT(*) FROM sparring_events;