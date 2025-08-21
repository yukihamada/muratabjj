# デプロイメントガイド

## Vercelへのデプロイ手順

### 1. 事前準備

必要なアカウント：
- GitHubアカウント（リポジトリ用）
- Vercelアカウント
- Supabaseアカウント（データベース設定済み）
- Stripeアカウント（商品・価格設定済み）
- OpenAIアカウント（オプション）

### 2. Vercelプロジェクトの作成

1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 「Import」をクリック

### 3. 環境変数の設定

Vercelダッシュボードで「Settings」→「Environment Variables」へ移動し、以下を設定：

#### 必須の環境変数

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_live_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRO_PRICE_ID_MONTHLY=price_1...
STRIPE_PRO_PRICE_ID_YEARLY=price_1...
STRIPE_DOJO_PRICE_ID_MONTHLY=price_1...
STRIPE_DOJO_PRICE_ID_YEARLY=price_1...

# App Configuration
NEXT_PUBLIC_APP_URL=https://muratabjj.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@muratabjj.com
```

#### オプションの環境変数

```bash
# OpenAI (AI機能を使用する場合)
OPENAI_API_KEY=sk-proj-...
```

### 4. ビルド設定

Vercelのデフォルト設定で問題ありませんが、必要に応じて調整：

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 5. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. エラーがある場合は修正して再デプロイ

## Stripe Webhookの設定

### 1. Webhookエンドポイントの作成

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks)へアクセス
2. 「Add endpoint」をクリック
3. エンドポイントURL: `https://your-domain.vercel.app/api/stripe/webhook`
4. イベントを選択：
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 2. Webhook秘密鍵の取得

1. 作成したWebhookをクリック
2. 「Signing secret」をコピー
3. Vercelの環境変数`STRIPE_WEBHOOK_SECRET`に設定

## カスタムドメインの設定

### 1. Vercelでドメイン追加

1. Vercelプロジェクトの「Settings」→「Domains」
2. ドメインを入力（例：muratabjj.com）
3. DNSレコードの指示に従う

### 2. DNS設定

ドメインレジストラで以下を設定：

#### Aレコード（ルートドメイン用）
```
Type: A
Name: @
Value: 76.76.21.21
```

#### CNAMEレコード（サブドメイン用）
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. SSL証明書

Vercelが自動的にLet's Encrypt証明書を発行・更新します。

## 本番環境のセキュリティ設定

### 1. 環境変数の確認

- すべての環境変数が本番用の値になっていることを確認
- `SUPABASE_SERVICE_ROLE_KEY`は絶対に公開しない

### 2. Supabase RLS

本番環境でもRLSが有効になっていることを確認：

```sql
-- すべてのテーブルでRLSが有効か確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. CORS設定

Supabaseダッシュボードで本番ドメインを許可：
- Settings → API → CORS Allowed Origins
- `https://muratabjj.com`を追加

## モニタリングとログ

### 1. Vercel Analytics

- プロジェクトダッシュボードで「Analytics」タブを有効化
- パフォーマンスメトリクスを監視

### 2. エラー監視（推奨）

Sentryの設定：

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. アップタイム監視

- [UptimeRobot](https://uptimerobot.com)などでエンドポイント監視
- 主要なページとAPIエンドポイントを登録

## デプロイ後のチェックリスト

- [ ] トップページが正常に表示される
- [ ] ログイン/サインアップが機能する
- [ ] 動画アップロード/再生が機能する
- [ ] 決済フローが正常に動作する
- [ ] 管理者機能にアクセスできる
- [ ] PWAがインストール可能
- [ ] 多言語切り替えが機能する
- [ ] SSL証明書が有効
- [ ] robots.txtとsitemap.xmlが配信される

## トラブルシューティング

### ビルドエラー

1. 環境変数の不足
   - すべての必須環境変数が設定されているか確認
   
2. TypeScriptエラー
   - `npm run typecheck`をローカルで実行
   
3. 依存関係エラー
   - `package-lock.json`を削除して`npm install`

### 実行時エラー

1. Supabase接続エラー
   - 環境変数が正しいか確認
   - RLSポリシーを確認
   
2. Stripe決済エラー
   - Webhook設定を確認
   - 価格IDが正しいか確認

### パフォーマンス問題

1. 画像最適化
   - Next.js Imageコンポーネントを使用
   - 適切なサイズとフォーマット
   
2. コード分割
   - 動的インポートを使用
   - 不要な依存関係を削除

## ロールバック手順

問題が発生した場合：

1. Vercelダッシュボードで「Deployments」タブへ
2. 以前の安定版デプロイメントを選択
3. 「...」メニューから「Promote to Production」
4. 問題を修正してから再デプロイ