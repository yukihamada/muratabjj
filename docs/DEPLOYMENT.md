# Murata BJJ - デプロイメントガイド

## 概要

Murata BJJは、Vercelにデプロイすることを前提として設計されています。このガイドでは、本番環境へのデプロイメント手順と注意事項を説明します。

## 前提条件

- GitHub アカウント
- Vercel アカウント
- Supabase プロジェクト
- Stripe アカウント
- OpenAI API キー（AI機能を使用する場合）
- Sentry アカウント（エラー監視を使用する場合）
- Resend アカウント（メール通知を使用する場合）

## デプロイメント手順

### 1. GitHub リポジトリの準備

```bash
# リポジトリをクローン
git clone https://github.com/yukihamada/muratabjjv2.git
cd muratabjjv2

# 依存関係をインストール
npm install

# 環境変数ファイルを作成
cp .env.example .env.local
```

### 2. Supabase のセットアップ

1. [Supabase Dashboard](https://app.supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. SQLエディタでマイグレーションを実行：

```sql
-- 以下の順番で実行
/supabase/migrations/20240819000000_initial_schema.sql
/supabase/migrations/20240819100000_add_flow_tables.sql
/supabase/migrations/20240819150000_add_coach_features.sql
/supabase/migrations/20240819160000_add_subscription_tables.sql
/supabase/migrations/20240819200000_create_sparring_tables.sql
/supabase/migrations/20240820000000_add_admin_fields.sql
/supabase/migrations/20240820120000_add_adaptive_review_tables.sql
/supabase/migrations/20231220000000_add_ai_analysis_fields.sql
/supabase/migrations/020_create_video_analysis_tables.sql
/supabase/migrations/021_create_experiment_tables.sql
```

4. ストレージバケットを作成：
   - `videos` (公開)
   - `thumbnails` (公開)
   - `profile-images` (公開)

### 3. Stripe のセットアップ

1. [Stripe Dashboard](https://dashboard.stripe.com)にアクセス
2. 商品と価格を作成：

```javascript
// scripts/setup-stripe.js を実行
node scripts/setup-stripe.js
```

3. Webhookエンドポイントを設定：
   - URL: `https://your-domain.vercel.app/api/stripe/webhook`
   - イベント：
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### 4. Vercel へのデプロイ

1. [Vercel](https://vercel.com)にログイン
2. "Import Project" をクリック
3. GitHubリポジトリを選択
4. 環境変数を設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
STRIPE_BASIC_PRICE_ID_MONTHLY=price_xxx
STRIPE_BASIC_PRICE_ID_YEARLY=price_xxx
STRIPE_PRO_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRO_PRICE_ID_YEARLY=price_xxx
STRIPE_MASTER_PRICE_ID_MONTHLY=price_xxx
STRIPE_MASTER_PRICE_ID_YEARLY=price_xxx
STRIPE_DOJO_BASIC_PRICE_ID_MONTHLY=price_xxx
STRIPE_DOJO_BASIC_PRICE_ID_YEARLY=price_xxx
STRIPE_DOJO_PRO_PRICE_ID_MONTHLY=price_xxx
STRIPE_DOJO_PRO_PRICE_ID_YEARLY=price_xxx
STRIPE_DOJO_ENTERPRISE_PRICE_ID_MONTHLY=price_xxx
STRIPE_DOJO_ENTERPRISE_PRICE_ID_YEARLY=price_xxx

# OpenAI (オプション)
OPENAI_API_KEY=your-openai-api-key

# Sentry (オプション)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# Email (オプション)
RESEND_API_KEY=your-resend-api-key

# Monitoring (オプション)
GRAFANA_INSTANCE_ID=your-instance-id
GRAFANA_API_KEY=your-api-key
METRICS_ACCESS_TOKEN=your-metrics-token

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com
```

5. "Deploy" をクリック

### 5. デプロイ後の設定

#### カスタムドメイン

1. Vercel Dashboard > Settings > Domains
2. カスタムドメインを追加
3. DNSレコードを設定

#### 管理者の設定

1. Supabase SQL エディタで管理者を追加：

```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'), 
  '{is_admin}', 
  'true'
)
WHERE email = 'your-admin-email@example.com';
```

#### CDN の設定（オプション）

動画配信を最適化する場合：

1. Cloudflare Stream または BunnyCDN を設定
2. 環境変数を追加：

```env
NEXT_PUBLIC_CDN_PROVIDER=cloudflare
NEXT_PUBLIC_CLOUDFLARE_CDN_URL=your-cdn-url
```

### 6. 本番環境のテスト

#### チェックリスト

- [ ] ホームページが正しく表示される
- [ ] ユーザー登録・ログインが機能する
- [ ] Stripe決済が正しく動作する
- [ ] 動画アップロード・再生が機能する
- [ ] AI分析が動作する（有効な場合）
- [ ] メール通知が送信される（有効な場合）
- [ ] PWAがインストール可能
- [ ] 全言語で正しく表示される

#### パフォーマンステスト

```bash
# Lighthouse CI
npx lighthouse https://your-domain.vercel.app

# WebPageTest
# https://www.webpagetest.org/
```

### 7. 監視とメンテナンス

#### Vercel Analytics

1. Vercel Dashboard > Analytics
2. Web Vitals を監視
3. エラー率を確認

#### Sentry

1. Sentry Dashboard でエラーを監視
2. アラートルールを設定
3. リリースを追跡

#### Grafana Cloud

1. ダッシュボードでメトリクスを確認
2. アラートを設定
3. SLOを定義

#### 定期メンテナンス

- 週次：エラーログの確認
- 月次：パフォーマンスレポートの確認
- 四半期：依存関係の更新

### 8. トラブルシューティング

#### ビルドエラー

```bash
# ローカルでビルドをテスト
npm run build

# 型チェック
npm run typecheck

# Lintチェック
npm run lint
```

#### 環境変数の問題

- Vercel Dashboard で環境変数を確認
- プレビューデプロイで動作確認
- 環境変数の前後の空白を削除

#### データベース接続エラー

- Supabase の接続プール設定を確認
- RLSポリシーを確認
- サービスロールキーの権限を確認

### 9. ロールバック手順

問題が発生した場合：

1. Vercel Dashboard > Deployments
2. 以前の正常なデプロイメントを選択
3. "Promote to Production" をクリック

### 10. セキュリティのベストプラクティス

- [ ] 全ての環境変数が正しく設定されている
- [ ] サービスロールキーはサーバーサイドでのみ使用
- [ ] RLSポリシーが全テーブルで有効
- [ ] CORS設定が適切
- [ ] レート制限が有効
- [ ] セキュリティヘッダーが設定済み

## まとめ

本番環境へのデプロイは慎重に行い、各ステップで動作確認を行ってください。問題が発生した場合は、ロールバック手順に従って以前の安定版に戻すことができます。

継続的な監視とメンテナンスにより、高品質なサービスを維持できます。