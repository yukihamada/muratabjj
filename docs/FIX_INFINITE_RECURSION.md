# user_profiles 無限再帰エラーの修正方法

## エラー内容
```
infinite recursion detected in policy for relation "user_profiles"
```

## 原因
`user_profiles`テーブルのRLSポリシーで、管理者チェックのために同じ`user_profiles`テーブルを参照していたため、無限再帰が発生していました。

## 修正内容

### 1. 管理者チェック関数の作成
JWT内のメールアドレスを直接チェックする関数`is_admin_user()`を作成し、テーブル参照を回避します。

### 2. ポリシーの再構築
すべての循環参照ポリシーを削除し、シンプルで安全なポリシーに置き換えます：
- ユーザーは自分のプロファイルのみ操作可能
- コーチプロファイルは公開
- 管理者は`is_admin_user()`関数で判定

## 適用手順

### 方法1: Supabaseダッシュボードから実行
1. [Supabaseダッシュボード](https://supabase.com/dashboard)にログイン
2. 対象プロジェクトを選択
3. 左側メニューから「SQL Editor」を選択
4. 新しいクエリタブを開く
5. `/supabase/migrations/20241228_fix_user_profiles_infinite_recursion.sql`の内容をコピー＆ペースト
6. 「Run」ボタンをクリックして実行

### 方法2: Supabase CLIから実行
```bash
# Supabase CLIがインストールされている場合
supabase db push
```

## 確認方法

1. エラーが解消されたか確認：
   - アプリケーションでプロファイルページにアクセス
   - ファイルアップロード機能を試す

2. SQLエディタで確認：
```sql
-- ポリシーが正しく設定されているか確認
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- 管理者関数が存在するか確認
SELECT * FROM pg_proc WHERE proname = 'is_admin_user';
```

## トラブルシューティング

### エラーが続く場合
1. ブラウザのキャッシュをクリア
2. Supabaseの接続をリセット
3. 他のテーブルにも同様の問題がないか確認

### ロールバック方法
問題が発生した場合は、以下のSQLでロールバック：
```sql
-- 作成した関数を削除
DROP FUNCTION IF EXISTS is_admin_user();

-- RLSを一時的に無効化（緊急時のみ）
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

## 今後の推奨事項

1. **RLSポリシーの設計原則**
   - 自己参照を避ける
   - JWT claimsを活用する
   - 複雑なロジックは関数に切り出す

2. **管理者権限の管理**
   - 管理者リストは環境変数または別テーブルで管理
   - JWTカスタムクレームの活用を検討

3. **テスト**
   - 新しいポリシーは必ず開発環境でテスト
   - 複数のユーザーロールでの動作確認