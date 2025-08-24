-- Insert detailed BJJ flow samples with proper UUIDs

-- First, ensure we have some basic techniques in the techniques table
INSERT INTO techniques (name, category, belt_level, description) VALUES
-- ガードポジション
('クローズドガード', 'guard', 'white', '相手を両足で挟み込む基本的なガードポジション'),
('スパイダーガード', 'guard', 'blue', '袖を持ち、足を相手の腕に絡めるガード'),
('デラヒーバガード', 'guard', 'blue', '相手の足首をフックし、もう一方の足で相手の太ももを押すガード'),
('Xガード', 'guard', 'purple', '相手の片足を両足で挟み込むガード'),
('バタフライガード', 'guard', 'white', '両足を相手の内股に入れるガード'),
('ハーフガード', 'guard', 'white', '相手の片足を両足で挟むガード'),
('ラッソーガード', 'guard', 'blue', '袖を持ち、足を相手の腕に深く巻きつけるガード'),

-- スイープ
('シザースイープ', 'sweep', 'white', 'クローズドガードから相手を横に倒すスイープ'),
('フラワースイープ', 'sweep', 'white', 'クローズドガードから相手を前方に倒すスイープ'),
('ヒップバンプスイープ', 'sweep', 'white', '腰を使って相手を倒すスイープ'),
('バタフライスイープ', 'sweep', 'blue', 'バタフライガードから相手を倒すスイープ'),
('Xガードスイープ', 'sweep', 'purple', 'Xガードから相手のバランスを崩して倒す'),
('ベリンボロ', 'sweep', 'brown', 'デラヒーバガードから相手の背後を取る高度な技術'),
('スパイダースイープ', 'sweep', 'blue', 'スパイダーガードから相手を倒す'),

-- パスガード
('ニーカットパス', 'pass', 'blue', '膝を使って相手のガードを割るパス'),
('トレアンドパス', 'pass', 'white', '相手の足を横に流してパスする'),
('スタックパス', 'pass', 'white', '相手を折りたたんでパスする'),
('レッグドラッグパス', 'pass', 'purple', '相手の足を引っ張ってパスする'),
('Xパス', 'pass', 'blue', '相手の足をX字にクロスさせてパスする'),

-- サブミッション
('腕十字固め（クローズド）', 'submission', 'white', 'クローズドガードからのアームバー'),
('三角絞め（クローズド）', 'submission', 'white', '足で首を絞める技'),
('キムラ（クローズド）', 'submission', 'blue', '肩関節技'),
('オモプラッタ', 'submission', 'blue', '足を使った肩関節技'),
('ギロチンチョーク', 'submission', 'white', '前方から首を絞める技'),
('リアネイキッドチョーク', 'submission', 'white', '背後から首を絞める技'),
('ボウアンドアローチョーク', 'submission', 'blue', '襟を使った絞め技'),
('十字絞め', 'submission', 'white', '襟を交差させて絞める技'),

-- トランジション
('クローズド→スパイダー', 'transition', 'blue', 'クローズドガードからスパイダーガードへの移行'),
('スパイダー→デラヒーバ', 'transition', 'blue', 'スパイダーガードからデラヒーバへの移行'),
('デラヒーバ→X', 'transition', 'purple', 'デラヒーバからXガードへの移行'),
('ハーフ→デラヒーバ', 'transition', 'blue', 'ハーフガードからデラヒーバへの移行'),

-- テイクダウン
('シングルレッグ', 'takedown', 'white', '片足タックル'),
('ダブルレッグ', 'takedown', 'white', '両足タックル'),
('大外刈り', 'takedown', 'white', '柔道の投げ技'),
('背負い投げ', 'takedown', 'blue', '柔道の投げ技')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  belt_level = EXCLUDED.belt_level,
  description = EXCLUDED.description;

-- Create sample flows for different levels
-- Note: user_id will be set to the first admin user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the first admin user
  SELECT id INTO admin_user_id 
  FROM user_profiles 
  WHERE is_admin = true 
  LIMIT 1;
  
  -- If no admin user exists, use the first user
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id 
    FROM auth.users 
    LIMIT 1;
  END IF;

  -- 1. 白帯向け：基本的なクローズドガードのフロー
  INSERT INTO flows (user_id, name, description, nodes, edges, is_public) 
  VALUES (
    admin_user_id,
    '初心者向けクローズドガードフロー',
    'クローズドガードからの基本的な攻撃の連携。アームバー、三角絞め、スイープを組み合わせた実戦的なフロー。',
    '[
      {"id": "1", "type": "position", "data": {"label": "クローズドガード"}, "position": {"x": 250, "y": 0}},
      {"id": "2", "type": "attack", "data": {"label": "アームバー狙い"}, "position": {"x": 100, "y": 150}},
      {"id": "3", "type": "attack", "data": {"label": "三角絞め移行"}, "position": {"x": 250, "y": 150}},
      {"id": "4", "type": "sweep", "data": {"label": "シザースイープ"}, "position": {"x": 400, "y": 150}},
      {"id": "5", "type": "sweep", "data": {"label": "フラワースイープ"}, "position": {"x": 550, "y": 150}},
      {"id": "6", "type": "position", "data": {"label": "マウント獲得"}, "position": {"x": 325, "y": 300}},
      {"id": "7", "type": "submission", "data": {"label": "襟絞め"}, "position": {"x": 250, "y": 450}},
      {"id": "8", "type": "submission", "data": {"label": "腕十字完成"}, "position": {"x": 400, "y": 450}}
    ]'::jsonb,
    '[
      {"id": "e1", "source": "1", "target": "2", "label": "相手が腕を出した時"},
      {"id": "e2", "source": "1", "target": "3", "label": "相手が頭を下げた時"},
      {"id": "e3", "source": "1", "target": "4", "label": "相手が姿勢を崩した時"},
      {"id": "e4", "source": "1", "target": "5", "label": "相手が立ち上がろうとした時"},
      {"id": "e5", "source": "2", "target": "3", "label": "腕を抜かれたら"},
      {"id": "e6", "source": "3", "target": "2", "label": "三角を防がれたら"},
      {"id": "e7", "source": "4", "target": "6", "label": "スイープ成功"},
      {"id": "e8", "source": "5", "target": "6", "label": "スイープ成功"},
      {"id": "e9", "source": "6", "target": "7", "label": "襟を掴めたら"},
      {"id": "e10", "source": "6", "target": "8", "label": "腕を取れたら"}
    ]'::jsonb,
    true
  );

  -- 2. 青帯向け：スパイダーガードシステム
  INSERT INTO flows (user_id, name, description, nodes, edges, is_public) 
  VALUES (
    admin_user_id,
    'スパイダーガードシステム',
    'スパイダーガードを中心とした攻撃システム。スイープ、バックテイク、サブミッションへの移行を含む。',
    '[
      {"id": "1", "type": "position", "data": {"label": "スパイダーガード"}, "position": {"x": 400, "y": 0}},
      {"id": "2", "type": "transition", "data": {"label": "ラッソーガード移行"}, "position": {"x": 200, "y": 150}},
      {"id": "3", "type": "sweep", "data": {"label": "スパイダースイープ"}, "position": {"x": 400, "y": 150}},
      {"id": "4", "type": "transition", "data": {"label": "デラヒーバ移行"}, "position": {"x": 600, "y": 150}},
      {"id": "5", "type": "submission", "data": {"label": "三角絞め"}, "position": {"x": 100, "y": 300}},
      {"id": "6", "type": "submission", "data": {"label": "オモプラッタ"}, "position": {"x": 300, "y": 300}},
      {"id": "7", "type": "position", "data": {"label": "トップポジション"}, "position": {"x": 500, "y": 300}},
      {"id": "8", "type": "sweep", "data": {"label": "ベリンボロ"}, "position": {"x": 700, "y": 300}},
      {"id": "9", "type": "position", "data": {"label": "バックテイク"}, "position": {"x": 600, "y": 450}},
      {"id": "10", "type": "submission", "data": {"label": "RNC"}, "position": {"x": 600, "y": 600}}
    ]'::jsonb,
    '[
      {"id": "e1", "source": "1", "target": "2", "label": "相手が袖を切った時"},
      {"id": "e2", "source": "1", "target": "3", "label": "相手の重心が前"},
      {"id": "e3", "source": "1", "target": "4", "label": "相手が距離を取る"},
      {"id": "e4", "source": "2", "target": "5", "label": "相手が腕を伸ばす"},
      {"id": "e5", "source": "2", "target": "6", "label": "相手が前傾"},
      {"id": "e6", "source": "3", "target": "7", "label": "スイープ成功"},
      {"id": "e7", "source": "4", "target": "8", "label": "相手の重心が浮く"},
      {"id": "e8", "source": "8", "target": "9", "label": "回転成功"},
      {"id": "e9", "source": "9", "target": "10", "label": "首を取る"},
      {"id": "e10", "source": "6", "target": "7", "label": "スイープに移行"}
    ]'::jsonb,
    true
  );

  -- 3. 紫帯向け：モダンガードの連携
  INSERT INTO flows (user_id, name, description, nodes, edges, is_public) 
  VALUES (
    admin_user_id,
    'モダンガード連携システム',
    'デラヒーバ、X、ハーフガードを組み合わせた現代的なガードシステム。',
    '[
      {"id": "1", "type": "position", "data": {"label": "デラヒーバガード"}, "position": {"x": 400, "y": 0}},
      {"id": "2", "type": "transition", "data": {"label": "Xガード移行"}, "position": {"x": 200, "y": 120}},
      {"id": "3", "type": "sweep", "data": {"label": "ベリンボロ"}, "position": {"x": 400, "y": 120}},
      {"id": "4", "type": "transition", "data": {"label": "ハーフガード"}, "position": {"x": 600, "y": 120}},
      {"id": "5", "type": "sweep", "data": {"label": "Xガードスイープ"}, "position": {"x": 100, "y": 240}},
      {"id": "6", "type": "position", "data": {"label": "レッグドラッグ"}, "position": {"x": 300, "y": 240}},
      {"id": "7", "type": "position", "data": {"label": "バックテイク"}, "position": {"x": 500, "y": 240}},
      {"id": "8", "type": "position", "data": {"label": "ディープハーフ"}, "position": {"x": 700, "y": 240}},
      {"id": "9", "type": "position", "data": {"label": "サイドコントロール"}, "position": {"x": 200, "y": 360}},
      {"id": "10", "type": "position", "data": {"label": "マウント"}, "position": {"x": 400, "y": 360}},
      {"id": "11", "type": "submission", "data": {"label": "ボウアンドアロー"}, "position": {"x": 600, "y": 360}},
      {"id": "12", "type": "sweep", "data": {"label": "ウェイター"}, "position": {"x": 800, "y": 360}}
    ]'::jsonb,
    '[
      {"id": "e1", "source": "1", "target": "2", "label": "相手が足を抜く"},
      {"id": "e2", "source": "1", "target": "3", "label": "相手が重心を下げる"},
      {"id": "e3", "source": "1", "target": "4", "label": "相手がパスを始める"},
      {"id": "e4", "source": "2", "target": "5", "label": "バランスを崩す"},
      {"id": "e5", "source": "3", "target": "6", "label": "足を引っ張る"},
      {"id": "e6", "source": "3", "target": "7", "label": "回転成功"},
      {"id": "e7", "source": "4", "target": "8", "label": "深く潜る"},
      {"id": "e8", "source": "5", "target": "9", "label": "パス成功"},
      {"id": "e9", "source": "6", "target": "9", "label": "パス完了"},
      {"id": "e10", "source": "7", "target": "11", "label": "襟を取る"},
      {"id": "e11", "source": "8", "target": "12", "label": "相手を持ち上げる"}
    ]'::jsonb,
    true
  );

  -- 4. パスガードシステム
  INSERT INTO flows (user_id, name, description, nodes, edges, is_public) 
  VALUES (
    admin_user_id,
    'システマチックパスガード',
    'プレッシャーパスとスピードパスを組み合わせたパスガードシステム。',
    '[
      {"id": "1", "type": "position", "data": {"label": "スタンディング"}, "position": {"x": 400, "y": 0}},
      {"id": "2", "type": "pass", "data": {"label": "トレアンドパス"}, "position": {"x": 200, "y": 120}},
      {"id": "3", "type": "pass", "data": {"label": "レッグドラッグ"}, "position": {"x": 400, "y": 120}},
      {"id": "4", "type": "pass", "data": {"label": "ニーカット"}, "position": {"x": 600, "y": 120}},
      {"id": "5", "type": "transition", "data": {"label": "コンバット"}, "position": {"x": 100, "y": 240}},
      {"id": "6", "type": "pass", "data": {"label": "スタックパス"}, "position": {"x": 300, "y": 240}},
      {"id": "7", "type": "pass", "data": {"label": "Xパス"}, "position": {"x": 500, "y": 240}},
      {"id": "8", "type": "position", "data": {"label": "ヘッドクォーター"}, "position": {"x": 700, "y": 240}},
      {"id": "9", "type": "position", "data": {"label": "サイドコントロール"}, "position": {"x": 300, "y": 360}},
      {"id": "10", "type": "position", "data": {"label": "ニーオンベリー"}, "position": {"x": 500, "y": 360}},
      {"id": "11", "type": "transition", "data": {"label": "マウント移行"}, "position": {"x": 400, "y": 480}},
      {"id": "12", "type": "submission", "data": {"label": "エゼキエル"}, "position": {"x": 400, "y": 600}}
    ]'::jsonb,
    '[
      {"id": "e1", "source": "1", "target": "2", "label": "足を掴む"},
      {"id": "e2", "source": "1", "target": "3", "label": "片足を引く"},
      {"id": "e3", "source": "1", "target": "4", "label": "膝をつく"},
      {"id": "e4", "source": "2", "target": "5", "label": "相手が足を戻す"},
      {"id": "e5", "source": "2", "target": "9", "label": "パス成功"},
      {"id": "e6", "source": "3", "target": "6", "label": "相手が防御"},
      {"id": "e7", "source": "3", "target": "9", "label": "パス成功"},
      {"id": "e8", "source": "4", "target": "7", "label": "相手が足を絡める"},
      {"id": "e9", "source": "4", "target": "8", "label": "半分パス"},
      {"id": "e10", "source": "6", "target": "9", "label": "パス完了"},
      {"id": "e11", "source": "7", "target": "10", "label": "パス成功"},
      {"id": "e12", "source": "8", "target": "10", "label": "完全パス"},
      {"id": "e13", "source": "9", "target": "11", "label": "安定したら"},
      {"id": "e14", "source": "10", "target": "11", "label": "マウント狙い"},
      {"id": "e15", "source": "11", "target": "12", "label": "首を取る"}
    ]'::jsonb,
    true
  );

  -- 5. 競技用コンビネーション
  INSERT INTO flows (user_id, name, description, nodes, edges, is_public) 
  VALUES (
    admin_user_id,
    '競技用コンビネーション',
    'ポイントを意識した実戦的なコンビネーション。スイープ、パス、サブミッションの連携。',
    '[
      {"id": "1", "type": "position", "data": {"label": "プルガード"}, "position": {"x": 400, "y": 0}},
      {"id": "2", "type": "position", "data": {"label": "クローズドガード"}, "position": {"x": 200, "y": 100}},
      {"id": "3", "type": "position", "data": {"label": "オープンガード"}, "position": {"x": 600, "y": 100}},
      {"id": "4", "type": "sweep", "data": {"label": "ヒップバンプ"}, "position": {"x": 100, "y": 200}},
      {"id": "5", "type": "submission", "data": {"label": "ギロチン"}, "position": {"x": 300, "y": 200}},
      {"id": "6", "type": "sweep", "data": {"label": "バタフライ"}, "position": {"x": 500, "y": 200}},
      {"id": "7", "type": "position", "data": {"label": "レッグドラッグ"}, "position": {"x": 700, "y": 200}},
      {"id": "8", "type": "position", "data": {"label": "マウント（4点）"}, "position": {"x": 200, "y": 300}},
      {"id": "9", "type": "position", "data": {"label": "サイド（3点）"}, "position": {"x": 400, "y": 300}},
      {"id": "10", "type": "position", "data": {"label": "バック（4点）"}, "position": {"x": 600, "y": 300}},
      {"id": "11", "type": "transition", "data": {"label": "S-マウント"}, "position": {"x": 100, "y": 400}},
      {"id": "12", "type": "submission", "data": {"label": "アームバー完成"}, "position": {"x": 300, "y": 400}},
      {"id": "13", "type": "submission", "data": {"label": "チョーク完成"}, "position": {"x": 500, "y": 400}},
      {"id": "14", "type": "position", "data": {"label": "ポイントリード"}, "position": {"x": 700, "y": 400}},
      {"id": "15", "type": "result", "data": {"label": "勝利"}, "position": {"x": 400, "y": 500}}
    ]'::jsonb,
    '[
      {"id": "e1", "source": "1", "target": "2", "label": "足を閉じる"},
      {"id": "e2", "source": "1", "target": "3", "label": "距離を保つ"},
      {"id": "e3", "source": "2", "target": "4", "label": "相手が前傾"},
      {"id": "e4", "source": "2", "target": "5", "label": "首を取る"},
      {"id": "e5", "source": "3", "target": "6", "label": "相手が近づく"},
      {"id": "e6", "source": "3", "target": "7", "label": "足を流す"},
      {"id": "e7", "source": "4", "target": "8", "label": "スイープ成功（2点）"},
      {"id": "e8", "source": "6", "target": "8", "label": "スイープ成功（2点）"},
      {"id": "e9", "source": "7", "target": "9", "label": "パス成功（3点）"},
      {"id": "e10", "source": "5", "target": "15", "label": "タップ"},
      {"id": "e11", "source": "8", "target": "11", "label": "腕を狙う"},
      {"id": "e12", "source": "9", "target": "10", "label": "回り込む"},
      {"id": "e13", "source": "11", "target": "12", "label": "腕を取る"},
      {"id": "e14", "source": "10", "target": "13", "label": "首を絞める"},
      {"id": "e15", "source": "8", "target": "14", "label": "時間稼ぎ"},
      {"id": "e16", "source": "9", "target": "14", "label": "キープ"},
      {"id": "e17", "source": "10", "target": "14", "label": "コントロール"},
      {"id": "e18", "source": "12", "target": "15", "label": "一本勝ち"},
      {"id": "e19", "source": "13", "target": "15", "label": "一本勝ち"},
      {"id": "e20", "source": "14", "target": "15", "label": "判定勝ち"}
    ]'::jsonb,
    true
  );

  -- 6. ノーギ用レッグロックシステム
  INSERT INTO flows (user_id, name, description, nodes, edges, is_public) 
  VALUES (
    admin_user_id,
    'ノーギレッグロックシステム',
    '50/50、サドル、アシガラミからのレッグロックエントリー。ノーギ専用。',
    '[
      {"id": "1", "type": "position", "data": {"label": "シングルレッグX"}, "position": {"x": 400, "y": 0}},
      {"id": "2", "type": "transition", "data": {"label": "50/50移行"}, "position": {"x": 200, "y": 120}},
      {"id": "3", "type": "transition", "data": {"label": "アシガラミ"}, "position": {"x": 400, "y": 120}},
      {"id": "4", "type": "transition", "data": {"label": "サドル"}, "position": {"x": 600, "y": 120}},
      {"id": "5", "type": "submission", "data": {"label": "ヒールフック"}, "position": {"x": 100, "y": 240}},
      {"id": "6", "type": "submission", "data": {"label": "ストレートアンクル"}, "position": {"x": 300, "y": 240}},
      {"id": "7", "type": "submission", "data": {"label": "インサイドヒール"}, "position": {"x": 500, "y": 240}},
      {"id": "8", "type": "submission", "data": {"label": "ニーバー"}, "position": {"x": 700, "y": 240}},
      {"id": "9", "type": "transition", "data": {"label": "クラブライド"}, "position": {"x": 400, "y": 360}},
      {"id": "10", "type": "position", "data": {"label": "バックテイク"}, "position": {"x": 400, "y": 480}}
    ]'::jsonb,
    '[
      {"id": "e1", "source": "1", "target": "2", "label": "相手が足を絡める"},
      {"id": "e2", "source": "1", "target": "3", "label": "足を深く入れる"},
      {"id": "e3", "source": "1", "target": "4", "label": "相手の膝をコントロール"},
      {"id": "e4", "source": "2", "target": "5", "label": "足首を取る"},
      {"id": "e5", "source": "3", "target": "6", "label": "足首を伸ばす"},
      {"id": "e6", "source": "4", "target": "7", "label": "内側から"},
      {"id": "e7", "source": "4", "target": "8", "label": "膝を極める"},
      {"id": "e8", "source": "4", "target": "9", "label": "上に乗る"},
      {"id": "e9", "source": "9", "target": "10", "label": "背中を取る"}
    ]'::jsonb,
    true
  );

END $$;

-- Grant permissions for public viewing
GRANT SELECT ON flows TO anon;
GRANT SELECT ON techniques TO anon;