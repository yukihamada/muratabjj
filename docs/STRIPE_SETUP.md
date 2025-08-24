# Stripe決済セットアップガイド - Murata BJJ

このガイドでは、Murata BJJプロジェクトでStripe決済を設定する手順を説明します。

## 📋 概要

### 自動設定可能な項目（コマンドで実行）
- ✅ Stripe商品の作成（Proプラン、道場プラン）
- ✅ 価格設定の作成（月額・年額）
- ✅ カスタマーポータルの設定
- ✅ テスト環境でのWebhook転送（Stripe CLI使用）

### 手動設定が必要な項目
- ❌ Stripeアカウントの作成
- ❌ APIキーの取得（公開可能キー、シークレットキー）
- ❌ 本番環境のWebhookエンドポイント設定
- ❌ 環境変数の設定（.env.local）
- ❌ ビジネス情報の入力・本人確認

## 🎯 料金プラン

Murata BJJでは3つのプランを提供：
- **無料プラン**: 基本機能（¥0）
- **Proプラン**: フローエディタを含む全機能（¥1,200/月）
- **道場プラン**: Pro機能＋複数ユーザー管理（¥6,000/月）

## 🚀 セットアップ手順

### 1. 手動設定：Stripeアカウントの作成

1. [Stripe](https://stripe.com/jp)にアクセス
2. 「今すぐ始める」をクリックしてアカウント作成
3. メールアドレス、パスワードを設定
4. ビジネス情報を入力（後で変更可能）
5. **テストモード**で開始（本番環境は後で設定）

### 2. 手動設定：APIキーの取得

1. [Stripeダッシュボード](https://dashboard.stripe.com)にログイン
2. 右上の「テストモード」がONになっていることを確認
3. 「開発者」→「APIキー」にアクセス
4. 以下のキーをメモ：

```bash
# これらのキーを.env.localに設定します
公開可能キー: pk_test_xxxxxxxxxx
シークレットキー: sk_test_xxxxxxxxxx
```

### 3. 手動設定：環境変数の設定

`.env.local`ファイルを作成または編集：

```bash
# Stripe基本設定（手動でコピー＆ペースト）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx

# 以下は自動設定スクリプト実行後に追加される
STRIPE_PRO_PRICE_ID_MONTHLY=
STRIPE_PRO_PRICE_ID_YEARLY=
STRIPE_DOJO_PRICE_ID_MONTHLY=
STRIPE_DOJO_PRICE_ID_YEARLY=
STRIPE_WEBHOOK_SECRET=
```

### 4. 自動設定：商品と価格の作成

環境変数設定後、以下のコマンドを実行：

```bash
# 1. 依存関係の確認
npm install

# 2. Stripeセットアップスクリプトの実行
npm run setup-stripe
```

このスクリプトは自動的に以下を作成します：
- ✅ Proプラン商品（月額¥1,200、年額¥12,000）
- ✅ 道場プラン商品（月額¥6,000、年額¥60,000）
- ✅ カスタマーポータル設定

実行後、表示される価格IDを`.env.local`にコピー：

```bash
# スクリプトの出力例：
STRIPE_PRO_PRICE_ID_MONTHLY=price_1234567890abcdef
STRIPE_PRO_PRICE_ID_YEARLY=price_0987654321fedcba
STRIPE_DOJO_PRICE_ID_MONTHLY=price_abcdef1234567890
STRIPE_DOJO_PRICE_ID_YEARLY=price_fedcba0987654321
STRIPE_PORTAL_CONFIG_ID=bpc_1234567890abcdef
```

### 5. 自動設定：ローカル開発用Webhook

開発環境では、Stripe CLIで自動的にWebhookを転送できます：

```bash
# 1. Stripe CLIのインストール（macOS）
brew install stripe/stripe-cli/stripe

# Windows/Linuxの場合は公式ドキュメント参照
# https://stripe.com/docs/stripe-cli#install

# 2. Stripe CLIでログイン
stripe login

# 3. Webhookイベントを転送（別ターミナルで実行）
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

表示される署名シークレットを`.env.local`に追加：

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

### 6. 手動設定：本番環境のWebhook

本番環境では手動でWebhookを設定する必要があります：

1. Stripeダッシュボード → 「開発者」→「Webhook」
2. 「エンドポイントを追加」をクリック
3. 設定内容：

```
エンドポイントURL: https://your-domain.com/api/stripe/webhook
リッスンするイベント:
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```

4. 作成後、「署名シークレット」を表示して環境変数に設定

## 🧪 テスト手順

### テストカード番号

Stripeテストモードでは以下のカード番号を使用：

| カード番号 | 結果 | 使用例 |
|-----------|------|--------|
| 4242 4242 4242 4242 | 成功 | 通常のテスト |
| 4000 0000 0000 9995 | 失敗（資金不足） | エラー処理のテスト |
| 4000 0000 0000 0002 | 失敗（カード拒否） | エラー処理のテスト |
| 4000 0025 0000 3155 | 3Dセキュア認証が必要 | 認証フローのテスト |

**その他の入力項目：**
- 有効期限: 任意の将来の日付（例: 12/34）
- CVC: 任意の3桁の数字（例: 123）
- 郵便番号: 任意の5桁の数字（例: 10001）

### 自動テスト：Webhookイベントのシミュレーション

```bash
# 特定のイベントを手動でトリガー
stripe trigger checkout.session.completed

# 複数のイベントをテスト
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

### 統合テストフロー

1. **開発環境の準備**
```bash
# ターミナル1: Next.jsサーバー起動
npm run dev

# ターミナル2: Webhook転送
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

2. **テスト手順**
- ブラウザで`http://localhost:3000`にアクセス
- テストアカウントでログイン
- 料金ページから「Proプランに登録」をクリック
- テストカード（4242...）で決済
- 成功ページへのリダイレクトを確認
- プロフィールページでプラン状態を確認

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. 「npm run setup-stripe」でエラーが出る

**原因**: 環境変数が正しく設定されていない

**解決方法**:
```bash
# .env.localファイルを確認
cat .env.local

# STRIPE_SECRET_KEYが設定されているか確認
# sk_test_で始まる値が必要
```

#### 2. Webhookが401エラーを返す

**原因**: Webhook署名シークレットが間違っている

**解決方法**:
```bash
# Stripe CLIの出力を再確認
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 表示される whsec_xxxxx を正確にコピー
```

#### 3. 決済後にエラーページが表示される

**原因**: 環境変数`NEXT_PUBLIC_APP_URL`が未設定

**解決方法**:
```bash
# .env.localに追加
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. 商品が作成されない

**原因**: Stripeアカウントがアクティベートされていない

**解決方法**:
- Stripeダッシュボードでアカウント状態を確認
- 必要な本人確認を完了する

### デバッグモード

開発時の詳細ログ確認：

```javascript
// src/lib/stripe/debug.ts を作成
export const debugStripe = {
  logWebhookEvent: (event: any) => {
    console.log('Webhook Event:', {
      type: event.type,
      data: event.data,
      timestamp: new Date().toISOString()
    })
  },
  logCheckoutSession: (session: any) => {
    console.log('Checkout Session:', {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      status: session.status
    })
  }
}
```

## 📊 本番環境への移行

### チェックリスト

- [ ] 本番用のStripeアカウントをアクティベート
- [ ] 本番APIキーを取得して環境変数に設定
- [ ] 本番環境でWebhookエンドポイントを作成
- [ ] 本番用の商品と価格を作成（スクリプト再実行）
- [ ] SSL証明書が有効（HTTPSが必須）
- [ ] エラー監視ツール（Sentry等）を設定
- [ ] 決済フローを本番環境でテスト

### Vercelへのデプロイ時の設定

```bash
# Vercel環境変数（本番用）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_PRO_PRICE_ID_YEARLY=price_xxxxx
STRIPE_DOJO_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_DOJO_PRICE_ID_YEARLY=price_xxxxx
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📚 参考リンク

- [Stripe公式ドキュメント（日本語）](https://stripe.com/docs/ja)
- [Stripe APIリファレンス](https://stripe.com/docs/api)
- [Next.js + Stripeサンプル](https://github.com/vercel/nextjs-subscription-payments)
- [Stripe CLI ドキュメント](https://stripe.com/docs/stripe-cli)

## 🆘 サポート

問題が解決しない場合：
1. [Stripeサポート](https://support.stripe.com/contact)に問い合わせ
2. プロジェクトのGitHub Issuesに詳細を記載
3. 開発者（admin@muratabjj.com）に連絡