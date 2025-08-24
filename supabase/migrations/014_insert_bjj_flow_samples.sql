-- Insert detailed BJJ flow samples

-- First, ensure we have some basic techniques in the techniques table
INSERT INTO techniques (id, name, category, belt_level, description) VALUES
-- ガードポジション
('tech_closed_guard', 'クローズドガード', 'guard', 'white', '相手を両足で挟み込む基本的なガードポジション'),
('tech_spider_guard', 'スパイダーガード', 'guard', 'blue', '袖を持ち、足を相手の腕に絡めるガード'),
('tech_dlr_guard', 'デラヒーバガード', 'guard', 'blue', '相手の足首をフックし、もう一方の足で相手の太ももを押すガード'),
('tech_x_guard', 'Xガード', 'guard', 'purple', '相手の片足を両足で挟み込むガード'),
('tech_butterfly_guard', 'バタフライガード', 'guard', 'white', '両足を相手の内股に入れるガード'),
('tech_half_guard', 'ハーフガード', 'guard', 'white', '相手の片足を両足で挟むガード'),
('tech_lasso_guard', 'ラッソーガード', 'guard', 'blue', '袖を持ち、足を相手の腕に深く巻きつけるガード'),

-- スイープ
('tech_scissor_sweep', 'シザースイープ', 'sweep', 'white', 'クローズドガードから相手を横に倒すスイープ'),
('tech_flower_sweep', 'フラワースイープ', 'sweep', 'white', 'クローズドガードから相手を前方に倒すスイープ'),
('tech_hip_bump_sweep', 'ヒップバンプスイープ', 'sweep', 'white', '腰を使って相手を倒すスイープ'),
('tech_butterfly_sweep', 'バタフライスイープ', 'sweep', 'blue', 'バタフライガードから相手を倒すスイープ'),
('tech_x_guard_sweep', 'Xガードスイープ', 'sweep', 'purple', 'Xガードから相手のバランスを崩して倒す'),
('tech_dlr_berimbolo', 'ベリンボロ', 'sweep', 'brown', 'デラヒーバガードから相手の背後を取る高度な技術'),
('tech_spider_sweep', 'スパイダースイープ', 'sweep', 'blue', 'スパイダーガードから相手を倒す'),

-- パスガード
('tech_knee_cut_pass', 'ニーカットパス', 'pass', 'blue', '膝を使って相手のガードを割るパス'),
('tech_torreando_pass', 'トレアンドパス', 'pass', 'white', '相手の足を横に流してパスする'),
('tech_stack_pass', 'スタックパス', 'pass', 'white', '相手を折りたたんでパスする'),
('tech_leg_drag_pass', 'レッグドラッグパス', 'pass', 'purple', '相手の足を引っ張ってパスする'),
('tech_x_pass', 'Xパス', 'pass', 'blue', '相手の足をX字にクロスさせてパスする'),

-- サブミッション
('tech_armbar_closed', 'クローズドガードからのアームバー', 'submission', 'white', '腕十字固め'),
('tech_triangle_closed', 'クローズドガードからの三角絞め', 'submission', 'white', '足で首を絞める技'),
('tech_kimura_closed', 'クローズドガードからのキムラ', 'submission', 'blue', '肩関節技'),
('tech_omoplata', 'オモプラッタ', 'submission', 'blue', '足を使った肩関節技'),
('tech_guillotine', 'ギロチンチョーク', 'submission', 'white', '前方から首を絞める技'),
('tech_rear_naked_choke', 'リアネイキッドチョーク', 'submission', 'white', '背後から首を絞める技'),
('tech_bow_arrow_choke', 'ボウアンドアローチョーク', 'submission', 'blue', '襟を使った絞め技'),
('tech_cross_collar_choke', 'クロスカラーチョーク', 'submission', 'white', '襟を交差させて絞める技'),

-- トランジション
('tech_closed_to_spider', 'クローズドガードからスパイダーガードへ', 'transition', 'blue', 'ガードの移行'),
('tech_spider_to_dlr', 'スパイダーガードからデラヒーバへ', 'transition', 'blue', 'ガードの移行'),
('tech_dlr_to_x', 'デラヒーバからXガードへ', 'transition', 'purple', 'ガードの移行'),
('tech_half_to_dlr', 'ハーフガードからデラヒーバへ', 'transition', 'blue', 'ガードの移行'),

-- テイクダウン
('tech_single_leg', 'シングルレッグ', 'takedown', 'white', '片足タックル'),
('tech_double_leg', 'ダブルレッグ', 'takedown', 'white', '両足タックル'),
('tech_osoto_gari', '大外刈り', 'takedown', 'white', '柔道の投げ技'),
('tech_seoi_nage', '背負い投げ', 'takedown', 'blue', '柔道の投げ技')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  belt_level = EXCLUDED.belt_level,
  description = EXCLUDED.description;

-- Create sample flows for different levels

-- 1. 白帯向け：基本的なクローズドガードのフロー
INSERT INTO flows (id, user_id, name, description, nodes, edges, is_public) 
VALUES (
  'flow_beginner_closed_guard',
  (SELECT id FROM auth.users LIMIT 1),
  '初心者向けクローズドガードフロー',
  'クローズドガードからの基本的な攻撃の連携。アームバー、三角絞め、スイープを組み合わせた実戦的なフロー。',
  '[
    {"id": "1", "type": "position", "data": {"label": "クローズドガード", "technique_id": "tech_closed_guard"}, "position": {"x": 250, "y": 0}},
    {"id": "2", "type": "attack", "data": {"label": "アームバー狙い", "technique_id": "tech_armbar_closed"}, "position": {"x": 100, "y": 150}},
    {"id": "3", "type": "attack", "data": {"label": "三角絞め移行", "technique_id": "tech_triangle_closed"}, "position": {"x": 250, "y": 150}},
    {"id": "4", "type": "sweep", "data": {"label": "シザースイープ", "technique_id": "tech_scissor_sweep"}, "position": {"x": 400, "y": 150}},
    {"id": "5", "type": "sweep", "data": {"label": "フラワースイープ", "technique_id": "tech_flower_sweep"}, "position": {"x": 550, "y": 150}},
    {"id": "6", "type": "position", "data": {"label": "マウント獲得"}, "position": {"x": 325, "y": 300}},
    {"id": "7", "type": "submission", "data": {"label": "襟絞め", "technique_id": "tech_cross_collar_choke"}, "position": {"x": 250, "y": 450}},
    {"id": "8", "type": "submission", "data": {"label": "腕十字完成"}, "position": {"x": 400, "y": 450}}
  ]',
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
  ]',
  true
);

-- 2. 青帯向け：スパイダーガードシステム
INSERT INTO flows (id, user_id, name, description, nodes, edges, is_public) 
VALUES (
  'flow_blue_spider_system',
  (SELECT id FROM auth.users LIMIT 1),
  'スパイダーガードシステム',
  'スパイダーガードを中心とした攻撃システム。スイープ、バックテイク、サブミッションへの移行を含む。',
  '[
    {"id": "1", "type": "position", "data": {"label": "スパイダーガード", "technique_id": "tech_spider_guard"}, "position": {"x": 400, "y": 0}},
    {"id": "2", "type": "transition", "data": {"label": "ラッソーガード移行", "technique_id": "tech_lasso_guard"}, "position": {"x": 200, "y": 150}},
    {"id": "3", "type": "sweep", "data": {"label": "スパイダースイープ", "technique_id": "tech_spider_sweep"}, "position": {"x": 400, "y": 150}},
    {"id": "4", "type": "transition", "data": {"label": "デラヒーバ移行", "technique_id": "tech_spider_to_dlr"}, "position": {"x": 600, "y": 150}},
    {"id": "5", "type": "submission", "data": {"label": "三角絞め"}, "position": {"x": 100, "y": 300}},
    {"id": "6", "type": "submission", "data": {"label": "オモプラッタ", "technique_id": "tech_omoplata"}, "position": {"x": 300, "y": 300}},
    {"id": "7", "type": "position", "data": {"label": "トップポジション"}, "position": {"x": 500, "y": 300}},
    {"id": "8", "type": "sweep", "data": {"label": "ベリンボロ", "technique_id": "tech_dlr_berimbolo"}, "position": {"x": 700, "y": 300}},
    {"id": "9", "type": "position", "data": {"label": "バックテイク"}, "position": {"x": 600, "y": 450}},
    {"id": "10", "type": "submission", "data": {"label": "RNC", "technique_id": "tech_rear_naked_choke"}, "position": {"x": 600, "y": 600}}
  ]',
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
  ]',
  true
);

-- 3. 紫帯向け：モダンガードの連携
INSERT INTO flows (id, user_id, name, description, nodes, edges, is_public) 
VALUES (
  'flow_purple_modern_guard',
  (SELECT id FROM auth.users LIMIT 1),
  'モダンガード連携システム',
  'デラヒーバ、X、ハーフガードを組み合わせた現代的なガードシステム。',
  '[
    {"id": "1", "type": "position", "data": {"label": "デラヒーバガード", "technique_id": "tech_dlr_guard"}, "position": {"x": 400, "y": 0}},
    {"id": "2", "type": "transition", "data": {"label": "Xガード移行", "technique_id": "tech_dlr_to_x"}, "position": {"x": 200, "y": 120}},
    {"id": "3", "type": "sweep", "data": {"label": "ベリンボロ", "technique_id": "tech_dlr_berimbolo"}, "position": {"x": 400, "y": 120}},
    {"id": "4", "type": "transition", "data": {"label": "ハーフガード", "technique_id": "tech_half_to_dlr"}, "position": {"x": 600, "y": 120}},
    {"id": "5", "type": "sweep", "data": {"label": "Xガードスイープ", "technique_id": "tech_x_guard_sweep"}, "position": {"x": 100, "y": 240}},
    {"id": "6", "type": "position", "data": {"label": "レッグドラッグ"}, "position": {"x": 300, "y": 240}},
    {"id": "7", "type": "position", "data": {"label": "バックテイク"}, "position": {"x": 500, "y": 240}},
    {"id": "8", "type": "position", "data": {"label": "ディープハーフ"}, "position": {"x": 700, "y": 240}},
    {"id": "9", "type": "position", "data": {"label": "サイドコントロール"}, "position": {"x": 200, "y": 360}},
    {"id": "10", "type": "position", "data": {"label": "マウント"}, "position": {"x": 400, "y": 360}},
    {"id": "11", "type": "submission", "data": {"label": "ボウアンドアロー", "technique_id": "tech_bow_arrow_choke"}, "position": {"x": 600, "y": 360}},
    {"id": "12", "type": "sweep", "data": {"label": "ウェイター"}, "position": {"x": 800, "y": 360}},
    {"id": "13", "type": "submission", "data": {"label": "キムラ"}, "position": {"x": 200, "y": 480}},
    {"id": "14", "type": "submission", "data": {"label": "アームバー"}, "position": {"x": 400, "y": 480}},
    {"id": "15", "type": "submission", "data": {"label": "チョーク"}, "position": {"x": 600, "y": 480}}
  ]',
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
    {"id": "e11", "source": "8", "target": "12", "label": "相手を持ち上げる"},
    {"id": "e12", "source": "9", "target": "10", "label": "マウント移行"},
    {"id": "e13", "source": "9", "target": "13", "label": "腕を取る"},
    {"id": "e14", "source": "10", "target": "14", "label": "腕を伸ばす"},
    {"id": "e15", "source": "7", "target": "15", "label": "首を絞める"}
  ]',
  true
);

-- 4. パスガードシステム
INSERT INTO flows (id, user_id, name, description, nodes, edges, is_public) 
VALUES (
  'flow_passing_system',
  (SELECT id FROM auth.users LIMIT 1),
  'システマチックパスガード',
  'プレッシャーパスとスピードパスを組み合わせたパスガードシステム。',
  '[
    {"id": "1", "type": "position", "data": {"label": "スタンディング"}, "position": {"x": 400, "y": 0}},
    {"id": "2", "type": "pass", "data": {"label": "トレアンドパス", "technique_id": "tech_torreando_pass"}, "position": {"x": 200, "y": 120}},
    {"id": "3", "type": "pass", "data": {"label": "レッグドラッグ", "technique_id": "tech_leg_drag_pass"}, "position": {"x": 400, "y": 120}},
    {"id": "4", "type": "pass", "data": {"label": "ニーカット", "technique_id": "tech_knee_cut_pass"}, "position": {"x": 600, "y": 120}},
    {"id": "5", "type": "transition", "data": {"label": "コンバット"}, "position": {"x": 100, "y": 240}},
    {"id": "6", "type": "pass", "data": {"label": "スタックパス", "technique_id": "tech_stack_pass"}, "position": {"x": 300, "y": 240}},
    {"id": "7", "type": "pass", "data": {"label": "Xパス", "technique_id": "tech_x_pass"}, "position": {"x": 500, "y": 240}},
    {"id": "8", "type": "position", "data": {"label": "ヘッドクォーター"}, "position": {"x": 700, "y": 240}},
    {"id": "9", "type": "position", "data": {"label": "サイドコントロール"}, "position": {"x": 300, "y": 360}},
    {"id": "10", "type": "position", "data": {"label": "ニーオンベリー"}, "position": {"x": 500, "y": 360}},
    {"id": "11", "type": "transition", "data": {"label": "マウント移行"}, "position": {"x": 400, "y": 480}},
    {"id": "12", "type": "submission", "data": {"label": "エゼキエル"}, "position": {"x": 400, "y": 600}}
  ]',
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
  ]',
  true
);

-- 5. レッグロックシステム（茶帯・黒帯向け）
INSERT INTO flows (id, user_id, name, description, nodes, edges, is_public) 
VALUES (
  'flow_leglock_system',
  (SELECT id FROM auth.users LIMIT 1),
  'レッグロックエントリーシステム',
  '様々なポジションからレッグロックへのエントリー。上級者向け。',
  '[
    {"id": "1", "type": "position", "data": {"label": "シングルレッグX"}, "position": {"x": 400, "y": 0}},
    {"id": "2", "type": "transition", "data": {"label": "50/50移行"}, "position": {"x": 200, "y": 120}},
    {"id": "3", "type": "transition", "data": {"label": "アシガラミ"}, "position": {"x": 400, "y": 120}},
    {"id": "4", "type": "transition", "data": {"label": "サドル"}, "position": {"x": 600, "y": 120}},
    {"id": "5", "type": "submission", "data": {"label": "ヒールフック"}, "position": {"x": 100, "y": 240}},
    {"id": "6", "type": "submission", "data": {"label": "ストレートアンクル"}, "position": {"x": 300, "y": 240}},
    {"id": "7", "type": "submission", "data": {"label": "インサイドヒール"}, "position": {"x": 500, "y": 240}},
    {"id": "8", "type": "submission", "data": {"label": "ニーバー"}, "position": {"x": 700, "y": 240}},
    {"id": "9", "type": "transition", "data": {"label": "バックスピン"}, "position": {"x": 300, "y": 360}},
    {"id": "10", "type": "transition", "data": {"label": "クラブライド"}, "position": {"x": 500, "y": 360}},
    {"id": "11", "type": "position", "data": {"label": "バックテイク"}, "position": {"x": 400, "y": 480}}
  ]',
  '[
    {"id": "e1", "source": "1", "target": "2", "label": "相手が足を絡める"},
    {"id": "e2", "source": "1", "target": "3", "label": "足を深く入れる"},
    {"id": "e3", "source": "1", "target": "4", "label": "相手の膝をコントロール"},
    {"id": "e4", "source": "2", "target": "5", "label": "足首を取る"},
    {"id": "e5", "source": "3", "target": "6", "label": "足首を伸ばす"},
    {"id": "e6", "source": "4", "target": "7", "label": "内側から"},
    {"id": "e7", "source": "4", "target": "8", "label": "膝を極める"},
    {"id": "e8", "source": "2", "target": "9", "label": "相手が逃げる"},
    {"id": "e9", "source": "4", "target": "10", "label": "上に乗る"},
    {"id": "e10", "source": "9", "target": "11", "label": "回転成功"},
    {"id": "e11", "source": "10", "target": "11", "label": "背中を取る"}
  ]',
  true
);

-- 6. コンビネーションアタック（競技向け）
INSERT INTO flows (id, user_id, name, description, nodes, edges, is_public) 
VALUES (
  'flow_competition_combo',
  (SELECT id FROM auth.users LIMIT 1),
  '競技用コンビネーション',
  'ポイントを意識した実戦的なコンビネーション。スイープ、パス、サブミッションの連携。',
  '[
    {"id": "1", "type": "position", "data": {"label": "プルガード"}, "position": {"x": 400, "y": 0}},
    {"id": "2", "type": "position", "data": {"label": "クローズドガード", "technique_id": "tech_closed_guard"}, "position": {"x": 200, "y": 100}},
    {"id": "3", "type": "position", "data": {"label": "オープンガード"}, "position": {"x": 600, "y": 100}},
    {"id": "4", "type": "sweep", "data": {"label": "ヒップバンプ", "technique_id": "tech_hip_bump_sweep"}, "position": {"x": 100, "y": 200}},
    {"id": "5", "type": "submission", "data": {"label": "ギロチン", "technique_id": "tech_guillotine"}, "position": {"x": 300, "y": 200}},
    {"id": "6", "type": "sweep", "data": {"label": "バタフライ", "technique_id": "tech_butterfly_sweep"}, "position": {"x": 500, "y": 200}},
    {"id": "7", "type": "position", "data": {"label": "レッグドラッグ"}, "position": {"x": 700, "y": 200}},
    {"id": "8", "type": "position", "data": {"label": "マウント（4点）"}, "position": {"x": 200, "y": 300}},
    {"id": "9", "type": "position", "data": {"label": "サイド（3点）"}, "position": {"x": 400, "y": 300}},
    {"id": "10", "type": "position", "data": {"label": "バック（4点）"}, "position": {"x": 600, "y": 300}},
    {"id": "11", "type": "transition", "data": {"label": "S-マウント"}, "position": {"x": 100, "y": 400}},
    {"id": "12", "type": "submission", "data": {"label": "アームバー完成"}, "position": {"x": 300, "y": 400}},
    {"id": "13", "type": "submission", "data": {"label": "チョーク完成"}, "position": {"x": 500, "y": 400}},
    {"id": "14", "type": "position", "data": {"label": "ポイントリード"}, "position": {"x": 700, "y": 400}},
    {"id": "15", "type": "result", "data": {"label": "勝利"}, "position": {"x": 400, "y": 500}}
  ]',
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
  ]',
  true
);

-- Grant permissions for public viewing
GRANT SELECT ON flows TO anon;
GRANT SELECT ON techniques TO anon;