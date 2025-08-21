# データベースセットアップガイド

## Supabaseプロジェクトの作成

1. [Supabase](https://app.supabase.com)にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - Project name: `muratabjj`
   - Database Password: 強力なパスワードを生成
   - Region: Tokyo (東京)推奨

## SQLマイグレーションの実行

Supabaseダッシュボードの「SQL Editor」から、以下のマイグレーションファイルを順番に実行してください。

### 1. 初期スキーマ
`supabase/migrations/20240819000000_initial_schema.sql`

このマイグレーションで作成されるテーブル：
- `users_profile` - ユーザープロフィール
- `videos` - 動画情報
- `progress_tracking` - 習得度追跡
- `video_chapters` - 動画チャプター
- `video_keypoints` - キーポイント

### 2. フロー機能
`supabase/migrations/20240819100000_add_flow_tables.sql`

このマイグレーションで作成されるテーブル：
- `flows` - フロー情報
- `flow_nodes` - フローのノード
- `flow_edges` - ノード間の接続

### 3. コーチ機能
`supabase/migrations/20240819150000_add_coach_features.sql`

このマイグレーションで作成されるテーブル：
- `curricula` - カリキュラム
- `curriculum_items` - カリキュラム項目
- `evaluations` - 評価
- `dojo_spaces` - 道場スペース
- `dojo_members` - 道場メンバー

### 4. サブスクリプション
`supabase/migrations/20240819160000_add_subscription_tables.sql`

このマイグレーションで作成されるテーブル：
- `subscriptions` - サブスクリプション情報
- `subscription_history` - 履歴

### 5. スパーリング機能
`supabase/migrations/20240819200000_create_sparring_tables.sql`

このマイグレーションで作成されるテーブル：
- `sparring_logs` - スパーリングログ
- `sparring_events` - イベント記録

### 6. 管理者機能
`supabase/migrations/20240820000000_add_admin_fields.sql`

ユーザープロフィールに管理者フラグを追加

### 7. アダプティブ復習
`supabase/migrations/20240820120000_add_adaptive_review_tables.sql`

このマイグレーションで作成されるテーブル：
- `review_items` - 復習項目
- `review_history` - 復習履歴

### 8. AI解析機能
`supabase/migrations/20231220000000_add_ai_analysis_fields.sql`

このマイグレーションで追加される機能：
- AI解析フィールド
- `ai_analysis_logs` - 解析ログ

## Storageバケットの作成

1. Supabaseダッシュボードの「Storage」セクションへ
2. 「New bucket」をクリック
3. 以下のバケットを作成：

### videosバケット
- Name: `videos`
- Public bucket: ✅ ON
- File size limit: 500MB
- Allowed MIME types: `video/*`

### profile-imagesバケット
- Name: `profile-images`
- Public bucket: ✅ ON
- File size limit: 5MB
- Allowed MIME types: `image/*`

## RLS（Row Level Security）の確認

すべてのテーブルでRLSが有効になっていることを確認：

1. 「Authentication」→「Policies」へ
2. 各テーブルのポリシーが適切に設定されていることを確認

主なポリシー：
- ユーザーは自分のプロフィールのみ更新可能
- 公開動画は全員が閲覧可能
- 管理者は全データにアクセス可能

## 初期データの投入（オプション）

開発環境用の初期データを投入する場合：

```sql
-- 管理者ユーザーのプロフィールを作成
INSERT INTO users_profile (user_id, full_name, belt, stripes, is_admin, is_coach)
VALUES 
  ('your-user-id', '管理者', 'black', 0, true, true);

-- サンプル動画
INSERT INTO videos (title, description, url, category, position, belt, uploaded_by, is_published)
VALUES 
  ('アームバーの基本', 'アームバーの基本的な手順を解説', 'https://example.com/video1.mp4', 'submission', 'guard', 'blue', 'your-user-id', true);
```

## トラブルシューティング

### マイグレーションエラー
- 外部キー制約エラー: 依存関係の順番でマイグレーションを実行
- 権限エラー: Service Role Keyを使用していることを確認

### Storage設定
- CORS設定: Vercelのドメインを許可リストに追加
- ファイルサイズ制限: 必要に応じて調整

## 本番環境への移行

1. すべてのマイグレーションが成功していることを確認
2. RLSポリシーが適切に設定されていることを確認
3. バックアップを取得
4. 環境変数を本番用に更新