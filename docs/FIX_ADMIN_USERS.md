# Admin Users Page 修正ガイド

## 問題の概要

管理者ユーザーページ (`/admin/users`) でユーザー一覧が表示されない問題が発生しています。これは以下の原因によるものです：

1. **テーブル名の不一致**: APIは `users_profile` テーブルを参照していますが、初期のマイグレーションでは `profiles` という名前で作成されている可能性があります。
2. **必要なカラムの不足**: `is_admin`, `subscription_plan`, `subscription_status` などのカラムが存在しない可能性があります。

## 修正手順

### 方法1: 自動修正スクリプトの実行（推奨）

1. **環境変数の確認**
   ```bash
   # .env.local ファイルに以下が設定されていることを確認
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **修正スクリプトの実行**
   ```bash
   npm run fix:admin-users
   ```

   このスクリプトは以下を実行します：
   - `users_profile` テーブルの存在確認
   - 存在しないユーザープロファイルの作成
   - 管理者権限の設定

### 方法2: 手動でのSQL実行

1. **Supabase SQL Editorにアクセス**
   - Supabaseダッシュボードにログイン
   - SQL Editorセクションに移動

2. **マイグレーションSQLの実行**
   ```bash
   # ファイルの内容をコピー
   cat supabase/migrations/005_fix_users_profile_table.sql
   ```
   
   上記のファイルの内容をSQL Editorに貼り付けて実行します。

3. **実行結果の確認**
   SQL実行後、以下のクエリで確認：
   ```sql
   SELECT * FROM users_profile LIMIT 10;
   ```

## 修正内容の詳細

### 作成されるテーブル構造

```sql
CREATE TABLE users_profile (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  belt TEXT DEFAULT 'white',
  stripes INTEGER DEFAULT 0,
  preferred_position TEXT,
  height DECIMAL,
  weight DECIMAL,
  is_coach BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### 自動的に設定される管理者

以下のメールアドレスのユーザーは自動的に管理者として設定されます：
- `shu.shu.4029@gmail.com`
- `yuki@hamada.tokyo`

## 動作確認

修正後、以下を確認してください：

1. **管理者ページへのアクセス**
   ```
   http://localhost:3000/admin/users
   ```

2. **期待される動作**
   - ユーザー一覧が表示される
   - 各ユーザーの詳細情報（メール、帯、権限など）が表示される
   - コーチ権限の付与/削除ボタンが機能する

## トラブルシューティング

### エラー: "Database table not found"

このエラーが表示される場合は、テーブルが作成されていません。上記の修正手順を実行してください。

### エラー: "Admin access required"

ログインしているユーザーが管理者権限を持っていません。管理者メールアドレスでログインするか、手動でデータベースを更新してください。

### ユーザーが表示されない

1. Supabase Auth にユーザーが存在することを確認
2. `users_profile` テーブルにレコードが存在することを確認
3. 修正スクリプトを再実行

## 開発者向け情報

### APIエンドポイント

- `GET /api/admin/users` - ユーザー一覧取得
- `PATCH /api/admin/users/[userId]` - ユーザー情報更新

### 関連ファイル

- `/src/app/admin/users/page.tsx` - 管理者ユーザーページUI
- `/src/app/api/admin/users/route.ts` - ユーザー一覧API
- `/supabase/migrations/005_fix_users_profile_table.sql` - 修正用マイグレーション
- `/scripts/fix-admin-users.js` - 自動修正スクリプト

### 今後の改善点

1. **型定義の統一**: `database.ts` の型定義を実際のテーブル構造と一致させる
2. **マイグレーション管理**: Supabase CLI を使用した自動マイグレーション
3. **エラーハンドリング**: より詳細なエラーメッセージとリカバリー手順の提供