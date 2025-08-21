# Stripe セットアップガイド

## 1. Stripeアカウントの準備

1. https://dashboard.stripe.com にログイン
2. 本番環境モードに切り替え（右上のトグル）
3. 日本のビジネス情報を登録（未登録の場合）

## 2. 商品と価格の作成

### 商品作成
1. 左メニューから「商品」→「商品を追加」

### Proプラン
1. **商品情報**：
   - 名前: `Murata BJJ Pro Plan`
   - 説明: `フローエディタ全機能、アダプティブ復習、詳細レポート・分析、AI動画解析`
   - 画像: （オプション）

2. **価格設定**：
   - 「定期的」を選択
   
   **月額プラン**：
   - 価格: `1200`
   - 通貨: `JPY`
   - 請求期間: `月次`
   - 価格のニックネーム: `Pro Monthly`
   
   **年額プラン**（別の価格として追加）：
   - 価格: `12000`
   - 通貨: `JPY`
   - 請求期間: `年次`
   - 価格のニックネーム: `Pro Yearly`

### 道場プラン
1. 再度「商品を追加」
2. **商品情報**：
   - 名前: `Murata BJJ Dojo Plan`
   - 説明: `カリキュラム配信機能、非公開スペース、コーチ評価機能、複数ユーザー管理`

3. **価格設定**：
   **月額プラン**：
   - 価格: `6000`
   - 通貨: `JPY`
   - 請求期間: `月次`
   - 価格のニックネーム: `Dojo Monthly`
   
   **年額プラン**：
   - 価格: `60000`
   - 通貨: `JPY`
   - 請求期間: `年次`
   - 価格のニックネーム: `Dojo Yearly`

## 3. 価格IDの取得

各価格を作成後、価格一覧から以下をコピー：
- `price_xxx...` の形式のID（4つ）

メモ例：
```
STRIPE_PRO_PRICE_ID_MONTHLY=price_1OxxxxxxxxxxxxXXXX
STRIPE_PRO_PRICE_ID_YEARLY=price_1OxxxxxxxxxxxxXXXX
STRIPE_DOJO_PRICE_ID_MONTHLY=price_1OxxxxxxxxxxxxXXXX
STRIPE_DOJO_PRICE_ID_YEARLY=price_1OxxxxxxxxxxxxXXXX
```

## 4. APIキーの取得

1. 左メニューから「開発者」→「APIキー」
2. 以下をコピー：
   - **公開可能キー**: `pk_live_xxx...`
   - **シークレットキー**: `sk_live_xxx...`（「表示」をクリック）

## 5. Webhook設定（Vercelデプロイ後）

1. 「開発者」→「Webhook」→「エンドポイントを追加」
2. **エンドポイントURL**: `https://[your-vercel-url]/api/stripe/webhook`
3. **リッスンするイベント**を選択：
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. 「エンドポイントを追加」
5. 作成後、「署名シークレット」をコピー（`whsec_xxx...`）

## 6. テスト決済の設定（オプション）

本番前にテストする場合：
1. テストモードに切り替え
2. 同じ手順で商品・価格を作成
3. テスト用のAPIキーを使用
4. テストカード番号: `4242 4242 4242 4242`

## チェックリスト

- [ ] 商品2つ（Pro、道場）を作成
- [ ] 各商品に月額・年額の価格を設定
- [ ] 4つの価格IDをメモ
- [ ] APIキー（公開可能、シークレット）をメモ
- [ ] Vercelデプロイ後にWebhook設定

## トラブルシューティング

### 価格が作成できない
- 商品を先に作成する必要がある
- 通貨がJPYになっているか確認

### Webhookが失敗する
- エンドポイントURLが正しいか確認
- 署名シークレットが正しく設定されているか確認
- Vercelのログでエラーを確認