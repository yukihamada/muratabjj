# 本番環境の認証設定ガイド

## Supabase認証の設定

### 1. 認証URLの設定

Supabaseダッシュボードで以下を設定：

1. **Authentication → URL Configuration**
   - Site URL: `https://www.muratabjj.com`
   - Redirect URLs:
     ```
     https://www.muratabjj.com/auth/callback
     https://muratabjj.com/auth/callback
     https://muratabjjv2.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```

### 2. サードパーティ認証の設定

1. **Google OAuth**
   - Google Cloud Consoleで設定
   - Authorized redirect URIs:
     ```
     https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback
     ```
   - Supabaseダッシュボードで有効化

### 3. CORS設定

Supabaseダッシュボードで：
- **Settings → API → CORS Allowed Origins**
  ```
  https://www.muratabjj.com
  https://muratabjj.com
  https://muratabjjv2.vercel.app
  ```

## Vercel環境変数の設定

以下の環境変数をVercelプロジェクトに設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# App URL
NEXT_PUBLIC_APP_URL=https://www.muratabjj.com

# Stripe (本番用)
STRIPE_SECRET_KEY=sk_live_[YOUR_KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_SECRET]
```

## ドメイン設定

### Vercelでのドメイン設定

1. **Settings → Domains**
   - Primary: `www.muratabjj.com`
   - Redirect: `muratabjj.com` → `www.muratabjj.com`

### DNSレコード

```
Type  Name  Value
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

## トラブルシューティング

### ログインできない場合

1. **ブラウザの設定確認**
   - サードパーティCookieが有効になっているか
   - JavaScriptが有効になっているか

2. **Supabase設定確認**
   - Authentication → Settingsで「Enable Email Confirmations」の設定
   - SMTP設定が正しいか（メール送信用）

3. **環境変数確認**
   ```bash
   # Vercelのダッシュボードで確認
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_APP_URL
   ```

### 開発環境でのテスト

```bash
# ローカルでの動作確認
npm run dev

# 本番ビルドのテスト
npm run build
npm start
```

## セキュリティ設定

### Row Level Security (RLS)

Supabaseで以下のRLSポリシーが有効になっていることを確認：

```sql
-- profilesテーブル
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロファイルのみ更新可能
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 認証されたユーザーはプロファイルを閲覧可能
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
```

### セキュリティヘッダー

vercel.jsonで設定済み：
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin