# 緊急: user_profiles 無限再帰エラーの完全解決

## 問題の説明
「infinite recursion detected in policy for relation "user_profiles"」エラーは、RLSポリシーが自己参照または循環参照を起こしている場合に発生します。

## 即座に実行する手順

### 1. デバッグ情報の取得（オプション）
まず現在の状態を確認したい場合：
```sql
-- /supabase/debug-policies.sql の内容を実行
```

### 2. 緊急修正スクリプトの実行（必須）
Supabaseダッシュボードで以下を実行：

1. SQL Editorを開く
2. 新しいクエリタブを作成
3. `/supabase/emergency-fix-recursion.sql` の内容を全てコピー
4. 貼り付けて「Run」をクリック

### 3. アップロード機能の修正（必要に応じて）
アップロードエラーも発生している場合：
```sql
-- /supabase/fix-upload-permissions.sql の内容を実行
```

## 実行後の確認

### 基本動作確認
1. プロフィールページへアクセス
2. プロフィール情報の表示確認
3. プロフィール情報の更新
4. 画像アップロード機能の確認

### SQLでの確認
```sql
-- 現在のポリシーを確認
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 管理者関数の確認
SELECT proname FROM pg_proc WHERE proname = 'is_admin_by_email';

-- 自分のプロファイルが見えるか確認
SELECT * FROM user_profiles WHERE user_id = auth.uid();
```

## なぜこの修正が効果的か

1. **完全なリセット**: 既存のすべてのポリシーを削除
2. **シンプルなポリシー**: 複雑なロジックを排除
3. **テーブル参照なし**: user_profilesテーブルを参照しない管理者チェック
4. **安全なトリガー**: エラーが発生してもユーザー作成を妨げない

## トラブルシューティング

### それでもエラーが続く場合

1. **キャッシュのクリア**
   - ブラウザのキャッシュをクリア
   - Supabaseクライアントの再初期化

2. **一時的な回避策**
   ```sql
   -- 最終手段: RLSを一時的に無効化
   ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
   ```

3. **Supabaseサポートへの連絡**
   - プロジェクトIDと共にサポートチケットを作成

## ロールバック手順

問題が悪化した場合：
```sql
-- RLSを無効化
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- すべての関数を削除
DROP FUNCTION IF EXISTS is_admin_by_email() CASCADE;
DROP FUNCTION IF EXISTS safe_ensure_user_profile() CASCADE;

-- トリガーを削除
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;
```

## 予防策

今後同じ問題を避けるため：
1. RLSポリシーで自己参照を避ける
2. 複雑なロジックは関数に切り出す
3. JWTクレームを活用する
4. 定期的にポリシーの依存関係をチェック