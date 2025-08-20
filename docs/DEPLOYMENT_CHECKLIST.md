# Vercelデプロイメントチェックリスト

## 事前準備

### 1. Supabaseプロジェクトの設定
- [ ] Supabaseで新規プロジェクト作成
- [ ] SQLエディタで `/supabase/migrations/001_initial_schema.sql` を実行
- [ ] Storageで `videos` バケットを作成（公開設定）
- [ ] 環境変数をメモ：
  - Project URL
  - Anon Key
  - Service Role Key

### 2. 管理者アカウントの準備
- [ ] 管理者用メールアドレスを決定（デフォルト: admin@muratabjj.com）
- [ ] `/docs/ADMIN_SETUP.md` を参照してパスワード設定

## Vercelでのデプロイ手順

### 1. プロジェクトのインポート
1. [Vercel](https://vercel.com) にログイン
2. "New Project" をクリック
3. GitHubリポジトリをインポート

### 2. 環境変数の設定
Vercelのプロジェクト設定で以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=<SupabaseプロジェクトURL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase Service Role Key>
NEXT_PUBLIC_ADMIN_EMAIL=admin@muratabjj.com
```

### 3. ビルド設定
- Framework Preset: Next.js（自動検出）
- Build Command: `npm run build`
- Output Directory: `.next`（デフォルト）

### 4. デプロイ
- "Deploy" ボタンをクリック
- ビルドログを確認
- エラーがないことを確認

## デプロイ後の確認

### 1. 基本動作確認
- [ ] トップページが表示される
- [ ] 言語切り替えが動作する
- [ ] ログイン/サインアップが動作する

### 2. 管理者機能確認
- [ ] 管理者アカウントでログイン
- [ ] `/admin/videos` にアクセスできる
- [ ] 動画の公開/非公開が切り替えられる

### 3. ユーザー機能確認
- [ ] 一般ユーザーでログイン
- [ ] ダッシュボードが表示される
- [ ] 動画アップロードができる
- [ ] 習得度トラッキングが動作する
- [ ] スパーリングログが作成できる
- [ ] フローエディタが動作する

### 4. セキュリティ確認
- [ ] 環境変数が本番環境用に設定されている
- [ ] Service Role Keyが公開されていない
- [ ] RLS（Row Level Security）が有効

## トラブルシューティング

### ビルドエラーの場合
1. TypeScriptエラー: `npm run typecheck` をローカルで実行
2. 依存関係エラー: `npm install` を再実行
3. 環境変数エラー: Vercelの設定を確認

### 500エラーの場合
1. Supabase接続を確認
2. 環境変数が正しく設定されているか確認
3. Vercelのファンクションログを確認

### 認証エラーの場合
1. Supabaseダッシュボードで認証設定を確認
2. リダイレクトURLが正しく設定されているか確認
3. Googleログインを使用する場合はOAuth設定を確認

## メンテナンス

### 定期的な確認項目
- [ ] Supabaseの使用量確認
- [ ] Vercelの使用量確認
- [ ] エラーログの確認
- [ ] セキュリティアップデートの適用

### バックアップ
- [ ] Supabaseデータベースのバックアップ設定
- [ ] 動画ストレージのバックアップ検討
- [ ] 環境変数のセキュアな保管