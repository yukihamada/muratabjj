# Vercel自動デプロイ設定ガイド

## 概要
このガイドでは、mainブランチへのプッシュ時に自動的にVercelへデプロイされるよう設定する方法を説明します。

## 設定手順

### 1. Vercelプロジェクトの接続確認

Vercelダッシュボードで以下を確認してください：

1. https://vercel.com/dashboard にアクセス
2. `muratabjjv2` プロジェクトを選択
3. Settings → Git タブに移動
4. GitHubリポジトリが正しく接続されていることを確認

### 2. 自動デプロイの有効化

`vercel.json` に以下の設定を追加済みです：

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

これにより、mainブランチへのプッシュ時に自動デプロイが実行されます。

### 3. 環境変数の設定

Vercelダッシュボードで環境変数を設定してください：

1. Settings → Environment Variables に移動
2. 以下の環境変数を追加：

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=[your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Stripe
STRIPE_SECRET_KEY=[your-stripe-secret-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your-stripe-publishable-key]
STRIPE_WEBHOOK_SECRET=[your-webhook-secret]

# Stripe Price IDs
STRIPE_PRO_PRICE_ID_MONTHLY=[your-pro-monthly-price-id]
STRIPE_PRO_PRICE_ID_YEARLY=[your-pro-yearly-price-id]
STRIPE_DOJO_PRICE_ID_MONTHLY=[your-dojo-monthly-price-id]
STRIPE_DOJO_PRICE_ID_YEARLY=[your-dojo-yearly-price-id]

# OpenAI
OPENAI_API_KEY=[your-openai-api-key]

# App
NEXT_PUBLIC_APP_URL=https://muratabjjv2.vercel.app
NEXT_PUBLIC_ADMIN_EMAIL=admin@muratabjj.com
```

### 4. GitHub Secretsの設定（CI用）

GitHubリポジトリで以下のSecretsを設定してください：

1. リポジトリのSettings → Secrets and variables → Actions に移動
2. 以下のSecretsを追加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 5. 自動デプロイのテスト

設定が完了したら、以下の手順でテストしてください：

```bash
# 小さな変更を加える
echo "# Test deployment" >> README.md

# 変更をコミット
git add README.md
git commit -m "test: Verify auto deployment"

# mainブランチへプッシュ
git push origin main
```

### 6. デプロイの確認

1. Vercelダッシュボードでデプロイ状況を確認
2. デプロイが成功したら、プロダクションURLにアクセスして動作確認
3. エラーが発生した場合は、Vercelのログを確認

## トラブルシューティング

### デプロイが開始されない場合

1. Vercel Settings → Git でGitHub統合が有効になっているか確認
2. GitHub Webhooksが正しく設定されているか確認
3. `vercel.json` のgit設定が正しいか確認

### ビルドエラーが発生する場合

1. Vercelの環境変数がすべて設定されているか確認
2. ビルドログでエラーメッセージを確認
3. ローカルで `npm run build` が成功するか確認

### 環境変数エラー

エラー例: `Error: supabaseUrl is required`

解決方法:
1. Vercel Settings → Environment Variables で該当の変数を追加
2. 変数を追加後、Redeployを実行

## 追加設定

### リージョンの設定

`vercel.json` で東京リージョン（hnd1）を指定済み：

```json
{
  "regions": ["hnd1"]
}
```

### 関数のタイムアウト設定

API関数のタイムアウトを個別に設定済み：

```json
{
  "functions": {
    "src/app/api/videos/transcribe/route.ts": {
      "maxDuration": 60
    }
  }
}
```

## 次のステップ

1. カスタムドメインの設定
2. プレビューデプロイの設定
3. デプロイ通知の設定（Slack、Discord等）

## 関連ドキュメント

- [DEPLOYMENT.md](../DEPLOYMENT.md) - 完全なデプロイガイド
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)