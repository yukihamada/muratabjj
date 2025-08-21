-- Sample video data
INSERT INTO videos (title, description, url, thumbnail_url, duration, category, belt_level, tags, position, created_at) VALUES
  ('クローズドガードの基本', 'クローズドガードの基本的な構え方と相手のコントロール方法を解説します。', 'https://example.com/video1.mp4', 'https://example.com/thumb1.jpg', 300, 'guard', 'white', ARRAY['guard', 'basic', 'fundamentals'], 'guard', NOW()),
  ('アームドラッグの基礎', 'クローズドガードからのアームドラッグの仕掛け方を詳しく説明します。', 'https://example.com/video2.mp4', 'https://example.com/thumb2.jpg', 420, 'technique', 'blue', ARRAY['guard', 'armdrag', 'sweep'], 'guard', NOW()),
  ('シザースイープ', 'クローズドガードからの基本的なスイープ技術です。', 'https://example.com/video3.mp4', 'https://example.com/thumb3.jpg', 360, 'sweep', 'white', ARRAY['guard', 'sweep', 'basic'], 'guard', NOW()),
  ('トライアングルチョーク', 'ガードからの絞め技の基本、三角絞めの仕掛け方。', 'https://example.com/video4.mp4', 'https://example.com/thumb4.jpg', 480, 'submission', 'blue', ARRAY['guard', 'submission', 'choke'], 'guard', NOW()),
  ('ニーオンベリー基礎', 'サイドコントロールを維持するための基本的な技術。', 'https://example.com/video5.mp4', 'https://example.com/thumb5.jpg', 240, 'position', 'white', ARRAY['side-control', 'pressure', 'basic'], 'side-control', NOW());

-- Update coach profile
UPDATE profiles 
SET is_coach = true, 
    belt_rank = 'black',
    stripes = 2,
    years_training = 15,
    full_name = 'Coach Tanaka'
WHERE email = 'coach@example.com';

-- Add some sample progress data
INSERT INTO user_progress (user_id, technique_id, understanding_level, execution_level, flow_integration_level, sparring_application_level, last_practiced_at, total_practice_time)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1),
  id,
  FLOOR(RANDOM() * 5 + 1),
  FLOOR(RANDOM() * 5 + 1),
  FLOOR(RANDOM() * 5 + 1),
  FLOOR(RANDOM() * 5 + 1),
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30),
  FLOOR(RANDOM() * 7200 + 600)
FROM techniques
LIMIT 5;