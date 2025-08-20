-- Seed data for Murata BJJ

-- Insert sample techniques
INSERT INTO techniques (name_ja, name_en, name_pt, category, position, difficulty, description_ja, description_en, description_pt) VALUES
-- Takedowns
('シングルレッグ', 'Single Leg', 'Single Leg', 'takedown', 'standing', 2, '片足タックル', 'Single leg takedown', 'Queda de uma perna'),
('ダブルレッグ', 'Double Leg', 'Double Leg', 'takedown', 'standing', 2, '両足タックル', 'Double leg takedown', 'Queda de duas pernas'),
('内股', 'Uchi Mata', 'Uchi Mata', 'takedown', 'standing', 3, '柔道技の応用', 'Judo technique', 'Técnica de judô'),
('背負投', 'Seoi Nage', 'Seoi Nage', 'takedown', 'standing', 3, '柔道技の応用', 'Judo technique', 'Técnica de judô'),

-- Guards
('クローズドガード', 'Closed Guard', 'Guarda Fechada', 'guard', 'bottom', 1, '基本的なガード', 'Basic guard position', 'Posição básica de guarda'),
('デラヒーバ', 'De La Riva', 'De La Riva', 'guard', 'bottom', 3, '足を絡めるガード', 'Leg entanglement guard', 'Guarda com enrosco de perna'),
('スパイダーガード', 'Spider Guard', 'Guarda Aranha', 'guard', 'bottom', 3, '袖を使ったガード', 'Sleeve-based guard', 'Guarda usando mangas'),
('バタフライガード', 'Butterfly Guard', 'Guarda Borboleta', 'guard', 'bottom', 2, '両足フックのガード', 'Double hook guard', 'Guarda com ganchos duplos'),
('Xガード', 'X-Guard', 'Guarda X', 'guard', 'bottom', 4, '足でXを作るガード', 'X-shaped leg guard', 'Guarda com pernas em X'),
('ハーフガード', 'Half Guard', 'Meia-Guarda', 'guard', 'bottom', 2, '片足を絡めるガード', 'One leg entangled guard', 'Guarda com uma perna enroscada'),

-- Passes
('トレアドールパス', 'Toreando Pass', 'Passagem Toreando', 'pass', 'top', 2, '足を回すパスガード', 'Leg drag pass', 'Passagem arrastando as pernas'),
('ニースライスパス', 'Knee Slice Pass', 'Passagem Cortando', 'pass', 'top', 2, '膝を切るパスガード', 'Knee cutting pass', 'Passagem cortando com joelho'),
('スタックパス', 'Stack Pass', 'Passagem Stack', 'pass', 'top', 3, '相手を畳むパスガード', 'Stacking pass', 'Passagem empilhando'),

-- Submissions - Chokes
('三角絞め', 'Triangle Choke', 'Triângulo', 'submission', 'various', 3, '脚で首を絞める', 'Leg choke', 'Estrangulamento com pernas'),
('リアネイキッドチョーク', 'Rear Naked Choke', 'Mata-Leão', 'submission', 'back', 2, '裸絞め', 'Blood choke from back', 'Estrangulamento pelas costas'),
('ギロチン', 'Guillotine', 'Guilhotina', 'submission', 'various', 2, '前方からの絞め', 'Front choke', 'Estrangulamento frontal'),
('エゼキエル', 'Ezekiel', 'Ezequiel', 'submission', 'various', 3, '袖車絞め', 'Sleeve choke', 'Estrangulamento com manga'),

-- Submissions - Joint Locks
('腕十字', 'Armbar', 'Armlock', 'submission', 'various', 2, '腕の関節技', 'Arm joint lock', 'Chave de articulação do braço'),
('キムラ', 'Kimura', 'Kimura', 'submission', 'various', 2, '肩関節技', 'Shoulder lock', 'Chave de ombro'),
('アメリカーナ', 'Americana', 'Americana', 'submission', 'various', 2, 'キーロック', 'Key lock', 'Chave americana'),
('オモプラータ', 'Omoplata', 'Omoplata', 'submission', 'various', 4, '足を使った肩関節技', 'Shoulder lock with legs', 'Chave de ombro com pernas'),

-- Escapes
('ウパ', 'Upa', 'Upa', 'escape', 'bottom', 1, 'ブリッジ返し', 'Bridge escape', 'Escape com ponte'),
('エルボーエスケープ', 'Elbow Escape', 'Escape de Cotovelo', 'escape', 'bottom', 2, '肘を使った脱出', 'Shrimp escape', 'Escape camarão'),

-- Transitions
('スイープ', 'Sweep', 'Raspagem', 'transition', 'bottom', 2, '返し技', 'Reversal technique', 'Técnica de reversão'),
('バックテイク', 'Back Take', 'Pegada das Costas', 'transition', 'various', 3, '背後を取る', 'Taking the back', 'Pegar as costas');

-- Sample videos (using placeholder URLs for now)
INSERT INTO videos (
  title_ja, title_en, title_pt,
  description_ja, description_en, description_pt,
  url, thumbnail_url, duration,
  technique_id, belt_requirement, is_premium
) VALUES
(
  'クローズドガードの基本',
  'Closed Guard Basics',
  'Básicos da Guarda Fechada',
  '初心者向けのクローズドガードの基本的な使い方',
  'Basic closed guard concepts for beginners',
  'Conceitos básicos de guarda fechada para iniciantes',
  'https://example.com/videos/closed-guard-basics.mp4',
  'https://example.com/thumbnails/closed-guard-basics.jpg',
  600,
  (SELECT id FROM techniques WHERE name_en = 'Closed Guard' LIMIT 1),
  'white',
  false
),
(
  'デラヒーバガードの詳細',
  'De La Riva Guard Details',
  'Detalhes da Guarda De La Riva',
  '上級者向けのデラヒーバガードの詳細なテクニック',
  'Advanced De La Riva guard techniques',
  'Técnicas avançadas de guarda De La Riva',
  'https://example.com/videos/dlr-details.mp4',
  'https://example.com/thumbnails/dlr-details.jpg',
  900,
  (SELECT id FROM techniques WHERE name_en = 'De La Riva' LIMIT 1),
  'blue',
  true
),
(
  'アームバーの基本と応用',
  'Armbar Fundamentals and Applications',
  'Fundamentos e Aplicações do Armlock',
  'アームバーの基本的なセットアップから応用まで',
  'From basic armbar setups to advanced applications',
  'Desde configurações básicas até aplicações avançadas',
  'https://example.com/videos/armbar-fundamentals.mp4',
  'https://example.com/thumbnails/armbar-fundamentals.jpg',
  720,
  (SELECT id FROM techniques WHERE name_en = 'Armbar' LIMIT 1),
  'white',
  false
);

-- Sample video chapters
INSERT INTO video_chapters (video_id, title_ja, title_en, title_pt, start_time, end_time, order_index) VALUES
(
  (SELECT id FROM videos WHERE title_en = 'Closed Guard Basics' LIMIT 1),
  'イントロダクション',
  'Introduction',
  'Introdução',
  0,
  60,
  1
),
(
  (SELECT id FROM videos WHERE title_en = 'Closed Guard Basics' LIMIT 1),
  '基本的なポジション',
  'Basic Position',
  'Posição Básica',
  60,
  180,
  2
),
(
  (SELECT id FROM videos WHERE title_en = 'Closed Guard Basics' LIMIT 1),
  'グリップの詳細',
  'Grip Details',
  'Detalhes da Pegada',
  180,
  300,
  3
);

-- Sample flows
INSERT INTO flows (user_id, name, description, is_public, tags) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  'Basic Guard to Submission',
  'A basic flow from closed guard to armbar or triangle',
  true,
  ARRAY['beginner', 'guard', 'submission']
);

-- Function to create initial user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profile (user_id, full_name, belt_rank, stripes)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'white', 0);
  
  -- Create free subscription for new user
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (new.id, 'free', 'active');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();