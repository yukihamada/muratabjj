# セキュリティガイド

## 環境変数の管理

### 秘密情報の取り扱い

#### ❌ してはいけないこと
- `.env`ファイルをGitにコミット
- クライアントサイドでService Role Keyを使用
- 環境変数をコード内にハードコード
- 公開リポジトリに秘密情報を含める

#### ✅ すべきこと
- `.env.local`を使用（自動的に.gitignoreされる）
- `NEXT_PUBLIC_`プレフィックスは公開情報のみ
- Vercelの環境変数機能を使用
- 定期的に秘密鍵をローテーション

### 環境変数の分類

#### 公開可能（NEXT_PUBLIC_プレフィックス）
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_ADMIN_EMAIL
```

#### 秘密情報（サーバーサイドのみ）
```
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
OPENAI_API_KEY
```

## Supabaseセキュリティ

### Row Level Security (RLS)

すべてのテーブルでRLSを有効化：

```sql
-- RLSを有効化
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 基本的なポリシー例
CREATE POLICY "Users can only update their own profile"
ON users_profile
FOR UPDATE
USING (auth.uid() = user_id);
```

### ポリシーのベストプラクティス

1. **最小権限の原則**
   - 必要最小限の権限のみ付与
   - デフォルトは拒否

2. **認証チェック**
   ```sql
   -- 認証済みユーザーのみ
   USING (auth.role() = 'authenticated')
   ```

3. **管理者権限**
   ```sql
   -- 管理者チェック
   USING (
     EXISTS (
       SELECT 1 FROM users_profile
       WHERE user_id = auth.uid()
       AND is_admin = true
     )
   )
   ```

## API セキュリティ

### 認証ミドルウェア

```typescript
// 認証が必要なAPIルート
export async function POST(request: NextRequest) {
  // トークン検証
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }

  // 処理を続行...
}
```

### レート制限

```typescript
// 簡単なレート制限の実装
const rateLimitMap = new Map()

export function rateLimit(ip: string, limit: number = 10) {
  const now = Date.now()
  const windowStart = now - 60 * 1000 // 1分間
  
  const requests = rateLimitMap.get(ip) || []
  const recentRequests = requests.filter((time: number) => time > windowStart)
  
  if (recentRequests.length >= limit) {
    return false
  }
  
  recentRequests.push(now)
  rateLimitMap.set(ip, recentRequests)
  return true
}
```

## 入力検証とサニタイゼーション

### 基本的な検証

```typescript
// Zodを使用した検証
import { z } from 'zod'

const videoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['guard', 'mount', 'side-control', 'back', 'standing']),
  belt: z.enum(['white', 'blue', 'purple', 'brown', 'black']),
})

// 使用例
try {
  const validatedData = videoSchema.parse(requestBody)
  // 安全なデータを使用
} catch (error) {
  // バリデーションエラー
}
```

### XSS対策

- Reactは自動的にエスケープ処理を行う
- `dangerouslySetInnerHTML`は極力使用しない
- ユーザー入力をそのままHTMLとして表示しない

## CORS設定

### Supabase CORS

Supabaseダッシュボードで設定：
- 本番ドメインのみ許可
- 開発環境は`localhost:3000`

### Next.js CORS

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

## Stripe セキュリティ

### Webhook検証

```typescript
// Webhook署名の検証
const sig = request.headers.get('stripe-signature')
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

try {
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    webhookSecret
  )
  // 検証済みイベントを処理
} catch (err) {
  return new Response('Webhook signature verification failed', { status: 400 })
}
```

### 金額検証

```typescript
// サーバーサイドで金額を検証
const session = await stripe.checkout.sessions.create({
  // クライアントから送信された金額を信用しない
  line_items: [{
    price: process.env.STRIPE_PRO_PRICE_ID_MONTHLY, // サーバー側で決定
    quantity: 1,
  }],
  // ...
})
```

## Content Security Policy (CSP)

```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: *.supabase.co;
  font-src 'self';
  connect-src 'self' *.supabase.co *.stripe.com;
  media-src 'self' *.supabase.co;
  frame-src *.stripe.com;
`

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}
```

## セキュリティチェックリスト

### デプロイ前

- [ ] 環境変数がすべて本番用
- [ ] Service Role Keyがサーバーサイドのみ
- [ ] RLSポリシーが適切に設定
- [ ] 管理者メールアドレスが正しい
- [ ] CORS設定が本番ドメインのみ

### 定期的な確認

- [ ] 依存関係の脆弱性スキャン（`npm audit`）
- [ ] アクセスログの監視
- [ ] 異常なAPIリクエストの検知
- [ ] バックアップの確認
- [ ] 秘密鍵のローテーション（3ヶ月ごと）

### インシデント対応

1. **検知**
   - エラーログの監視
   - 異常なトラフィックパターン

2. **封じ込め**
   - 影響を受けたサービスの一時停止
   - 不正なアクセスのブロック

3. **根絶**
   - 脆弱性の修正
   - 侵害されたキーの無効化

4. **復旧**
   - サービスの再開
   - 正常性の確認

5. **事後分析**
   - インシデントレポート作成
   - 再発防止策の実施

## 連絡先

セキュリティに関する問題を発見した場合：
- Email: security@muratabjj.com
- 48時間以内に初回応答
- 責任ある開示に感謝します