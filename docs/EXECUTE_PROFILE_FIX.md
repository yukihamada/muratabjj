# プロフィール更新エラーの修正手順

## 1. Supabaseダッシュボードにアクセス

1. [https://supabase.com/dashboard](https://supabase.com/dashboard) にアクセス
2. Murata BJJプロジェクトを選択
3. 左側のメニューから「SQL Editor」をクリック

## 2. マイグレーションスクリプトの実行

### 方法A: 統合スクリプトを実行（推奨）

1. SQLエディタで新しいクエリタブを開く
2. `/supabase/migrations/026_combined_profile_fixes.sql` の内容を全てコピー
3. SQLエディタに貼り付ける
4. 「Run」ボタンをクリック

### 方法B: 個別に実行

もし統合スクリプトでエラーが出た場合は、以下を個別に実行：

#### Step 1: 無限再帰の修正
```sql
-- /supabase/migrations/20241228_fix_user_profiles_infinite_recursion.sql の内容を実行
```

#### Step 2: 権限の修正  
```sql
-- /supabase/migrations/025_fix_profile_update_permissions.sql の内容を実行
```

## 3. 実行確認

スクリプト実行後、以下のクエリで確認：

```sql
-- 現在のユーザーのプロフィール状態を確認
SELECT * FROM debug_user_profile_status();

-- RLSポリシーを確認
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 管理者チェック関数の動作確認
SELECT is_admin_user();
```

## 4. アプリケーションでの動作確認

1. ブラウザで https://www.muratabjj.com にアクセス
2. ログイン
3. ダッシュボード > プロフィール に移動
4. プロフィールを更新してみる

### デバッグ情報の確認

ブラウザの開発者ツール（F12）でコンソールを開き、以下のログを確認：

- `[Profile] Creating new profile for user:` - 新規作成時
- `[Profile] Updating profile for user:` - 更新時  
- `[Profile] Update successful:` - 成功時
- `[Profile] Supabase update error:` - エラー時の詳細

## 5. トラブルシューティング

### エラー: "infinite recursion detected"
- 統合スクリプトの Part 1 が正しく実行されているか確認
- 古いポリシーが残っていないか確認

### エラー: "violates row-level security policy"
- 統合スクリプトの Part 2 が正しく実行されているか確認
- `debug_user_profile_status()` で権限を確認

### エラー: "permission denied for table user_profiles"
- 統合スクリプトの Part 5 が正しく実行されているか確認
- GRANTコマンドを再実行

### プロフィールが作成されない
- トリガーが正しく設定されているか確認：
```sql
SELECT tgname, tgfoid::regproc, tgenabled 
FROM pg_trigger 
WHERE tgname = 'ensure_user_profile_trigger';
```

## 6. ロールバック手順

問題が発生した場合：

```sql
-- RLSを一時的に無効化（緊急時のみ）
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 作成した関数を削除
DROP FUNCTION IF EXISTS is_admin_user();
DROP FUNCTION IF EXISTS ensure_user_profile();
DROP FUNCTION IF EXISTS debug_user_profile_status();

-- トリガーを削除
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;
```

## 7. 成功の確認

以下が確認できれば成功：

- [ ] プロフィール更新が正常に動作する
- [ ] 新規ユーザー登録時に自動的にプロフィールが作成される
- [ ] 管理者ユーザーが他のユーザーのプロフィールを表示できる
- [ ] エラーメッセージが「不明なエラー」ではなく具体的な内容になっている