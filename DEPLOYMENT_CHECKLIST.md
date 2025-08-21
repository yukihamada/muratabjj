# デプロイメントチェックリスト

## 🔐 デプロイ前の必須確認事項

### 1. Supabase設定 ✅
- [ ] Supabaseプロジェクトを作成
- [ ] `/supabase/migrations/000_complete_schema.sql`を実行
- [ ] Storageバケット作成（videos, profile-images）
- [ ] RLSが全テーブルで有効になっていることを確認
- [ ] 環境変数を取得してメモ

### 2. Stripe設定 ✅
- [ ] 本番用のAPIキーを取得
- [ ] 商品と価格を作成：
  - [ ] Proプラン月額（¥1,200）
  - [ ] Proプラン年額（¥12,000）
  - [ ] 道場プラン月額（¥6,000）
  - [ ] 道場プラン年額（¥60,000）
- [ ] 価格IDをメモ

### 3. 管理者設定 ✅
- [ ] `/src/app/api/admin/users/route.ts`の`adminEmails`配列を更新：
  ```typescript
  const adminEmails = ['shu.shu.4029@gmail.com', 'your-email@example.com']
  ```

### 4. 環境変数の準備 ✅
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID_MONTHLY=
STRIPE_PRO_PRICE_ID_YEARLY=
STRIPE_DOJO_PRICE_ID_MONTHLY=
STRIPE_DOJO_PRICE_ID_YEARLY=

# OpenAI (オプション)
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://muratabjj.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@muratabjj.com
```

## 📦 Vercelデプロイ手順

### 1. Vercelプロジェクト作成
1. https://vercel.com にログイン
2. 「New Project」→ GitHubリポジトリを選択
3. 「Import」をクリック

### 2. 環境変数設定
1. 「Environment Variables」セクション
2. 上記の環境変数をすべて追加
3. Production, Preview, Developmentすべてにチェック

### 3. デプロイ
1. 「Deploy」をクリック
2. ビルドログを監視
3. エラーがあれば修正

## 🔧 デプロイ後の設定

### 1. Stripe Webhook
1. https://dashboard.stripe.com/webhooks へアクセス
2. 「Add endpoint」
3. URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. イベント選択：
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
5. Signing secretを`STRIPE_WEBHOOK_SECRET`に設定

### 2. 管理者ユーザー作成
1. 本番サイトでユーザー登録
2. Supabaseダッシュボードで以下のSQLを実行：
```sql
UPDATE users_profile
SET is_admin = true, is_coach = true, belt = 'black'
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'your-admin-email@example.com'
);
```

### 3. カスタムドメイン設定（オプション）
1. Vercel → Settings → Domains
2. ドメインを追加
3. DNSレコードを設定

## ✅ 動作確認

### 基本機能
- [ ] トップページが表示される
- [ ] ユーザー登録・ログインが動作
- [ ] ダッシュボードにアクセスできる

### 動画機能
- [ ] 動画アップロードが動作（コーチ権限）
- [ ] 動画再生が動作
- [ ] チャプター・速度調整が動作

### 決済機能
- [ ] Proプランの購入フローが動作
- [ ] サブスクリプション管理が表示

### 管理機能
- [ ] /adminにアクセスできる（管理者のみ）
- [ ] ユーザー管理が動作
- [ ] 動画管理が動作

### その他
- [ ] PWAインストールが可能
- [ ] 多言語切り替えが動作
- [ ] スパーログが記録できる
- [ ] フローエディタが動作

## 🚨 トラブルシューティング

### ビルドエラー
- TypeScriptエラー: `npm run typecheck`をローカルで実行
- 依存関係エラー: `rm -rf node_modules package-lock.json && npm install`

### 実行時エラー
- 500エラー: Vercelのログを確認
- 認証エラー: 環境変数が正しく設定されているか確認
- データベースエラー: RLSポリシーを確認

### パフォーマンス
- 遅い読み込み: 画像最適化、コード分割を確認
- API遅延: エッジ関数の使用を検討

## 📞 サポート

問題が発生した場合：
1. Vercelのログを確認
2. Supabaseのログを確認
3. ブラウザのコンソールを確認

それでも解決しない場合は、詳細なエラー情報と共に報告してください。