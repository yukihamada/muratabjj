# Murata BJJ 🥋

フローと動画で強くなる柔術学習プラットフォーム

監修：村田 良蔵（Ryozo Murata）
- SJJIF世界選手権マスター2黒帯フェザー級 2018・2019 連覇
- スポーツ柔術日本連盟（SJJJF）会長

## 🌟 主要機能

### 実装済み機能

- 🎥 **動画カタログ** - 帯/カテゴリ別でフィルタリング可能な動画管理システム
  - チャプター機能による詳細な区切り
  - 可変速再生（0.5x〜2.0x）
  - AI動画解析機能
  - 自動文字起こし（Whisper API）
- 🔄 **フローエディタ** - 技の連携を可視化・編集（データベース保存対応）
  - ドラッグ&ドロップによる直感的な編集
  - 分岐・代替ルートの表現
- 📊 **習得度トラッキング** - 5段階（理解→手順→再現→連携→実戦）での技術習得管理
- 📝 **スパーリングログ** - 練習記録と統計分析、イベント記録機能
- 🧠 **アダプティブ復習** - 忘却曲線に基づく最適な復習間隔の提案
- 👤 **ユーザープロファイル** - 帯・ストライプ管理と統計表示
- 🥋 **コーチ/道場向け機能** - カリキュラム配信と生徒管理
- 🛡️ **管理者機能** - ユーザー管理、動画管理、AI解析管理
- 💳 **Stripe決済統合** - サブスクリプション管理（Pro/道場プラン）
- 📱 **PWA対応** - モバイル最適化、オフライン対応
- 🌍 **多言語対応** - 日本語、英語、ポルトガル語
- 🔐 **認証システム** - メール/パスワードおよびGoogleログイン対応

## 🛠 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Validation**: Zod + react-hook-form
- **UI Components**: Lucide Icons, React Hot Toast
- **Video Player**: Video.js
- **Flow Editor**: React Flow

### バックエンド
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payment**: Stripe
- **AI/ML**: OpenAI (Whisper API, GPT-4 Vision)

### 開発ツール
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint (Next.js設定)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel
- **PWA**: Service Worker, Web Manifest
- **Developer Tools**: Claude Code対応

## 🚀 セットアップ

### 前提条件

- Node.js 18.17.0以上
- npm または yarn
- Supabaseアカウント
- Stripeアカウント
- OpenAIアカウント（AI機能を使用する場合）

### 1. リポジトリのクローン

```bash
git clone https://github.com/yukihamada/muratabjj.git
cd muratabjj
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local`を編集して、以下の値を設定：

#### Supabase設定
1. [Supabase Dashboard](https://app.supabase.com)にアクセス
2. プロジェクトを作成
3. Settings → API から以下を取得：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### Stripe設定
1. [Stripe Dashboard](https://dashboard.stripe.com)にアクセス
2. API Keys から以下を取得：
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Webhooksを設定：
   - エンドポイント: `https://your-domain.com/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - エンドポイントシークレットを`STRIPE_WEBHOOK_SECRET`に設定
4. 商品と価格を作成：
   - Proプラン（月額/年額）
   - 道場プラン（月額/年額）

#### OpenAI設定（オプション）
1. [OpenAI Platform](https://platform.openai.com)にアクセス
2. API Keysから取得：
   - `OPENAI_API_KEY`

### 4. データベースのセットアップ

Supabaseのダッシュボードから、SQLエディタで以下のマイグレーションを実行：

```bash
# マイグレーションファイルの順番で実行
supabase/migrations/20240819000000_initial_schema.sql
supabase/migrations/20240819100000_add_flow_tables.sql
supabase/migrations/20240819150000_add_coach_features.sql
supabase/migrations/20240819160000_add_subscription_tables.sql
supabase/migrations/20240819200000_create_sparring_tables.sql
supabase/migrations/20240820000000_add_admin_fields.sql
supabase/migrations/20240820120000_add_adaptive_review_tables.sql
supabase/migrations/20231220000000_add_ai_analysis_fields.sql
```

### 5. Storageバケットの作成

Supabaseダッシュボードで以下のバケットを作成：
- `videos` - 公開バケット（動画ファイル用）
- `profile-images` - 公開バケット（プロフィール画像用）

### 6. 管理者の設定

`/src/app/api/admin/users/route.ts`の`adminEmails`配列に管理者のメールアドレスを追加：

```typescript
const adminEmails = ['your-email@example.com']
```

### 7. データベースの初期化とシード

```bash
# サンプルデータの投入（技術・カテゴリ・帯要件）
npm run seed

# テストユーザーの作成
npm run seed:users
```

### 8. テストユーザーアカウント

開発環境で以下のテストユーザーを使用できます：

| 役割 | メールアドレス | パスワード | 権限 |
|------|---------------|------------|------|
| 管理者 | admin@test.muratabjj.com | Admin123!@# | 全機能アクセス可能 |
| コーチ | coach@test.muratabjj.com | Coach123!@# | 道場管理・生徒管理 |
| Proユーザー | pro@test.muratabjj.com | Pro123!@# | Pro機能全て利用可能 |
| 一般ユーザー | user@test.muratabjj.com | User123!@# | 無料プラン機能のみ |
| 初心者 | beginner@test.muratabjj.com | Beginner123!@# | 無料プラン・白帯 |

### 9. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションにアクセス

## 🧪 開発環境

### Claude Codeを使用した開発

本プロジェクトはClaude Code対応しています：

```bash
# Claude Codeの起動
claude

# 利用可能なコマンド
/help              # ヘルプ表示
/fix-lint          # Lint/型エラーの自動修正
/add-technique     # 新技術の追加
/pre-deploy-check  # デプロイ前チェック
/setup-dev         # 開発環境セットアップ
```

詳細は[CLAUDE.md](./CLAUDE.md)を参照してください。

### テストの実行

```bash
# 単体テストの実行
npm test

# カバレッジレポートの生成
npm run test:coverage

# ウォッチモードでテスト
npm run test:watch
```

### コード品質

```bash
# Lintチェック
npm run lint

# TypeScriptの型チェック
npm run typecheck

# デプロイ前の総合チェック
npm run pre-deploy
```

## 📦 デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)にサインイン
2. GitHubリポジトリをインポート
3. 環境変数を設定（下記参照）
4. デプロイ

### 環境変数の設定（Vercel）

Vercelのダッシュボードで以下の環境変数を設定：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID_MONTHLY
STRIPE_PRO_PRICE_ID_YEARLY
STRIPE_DOJO_PRICE_ID_MONTHLY
STRIPE_DOJO_PRICE_ID_YEARLY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_ADMIN_EMAIL
```

### デプロイ後の設定

1. **Stripe Webhook**の本番URLを設定
2. **カスタムドメイン**の設定（必要に応じて）
3. **SSL証明書**の確認

## 🔐 セキュリティ設定

### Supabase RLS（Row Level Security）

すべてのテーブルでRLSが有効になっています。ポリシーは`/supabase/migrations`で定義されています。

### 重要なセキュリティ設定

- 環境変数は必ず`.env.local`に保存（`.env`は使用しない）
- `SUPABASE_SERVICE_ROLE_KEY`は絶対にクライアントサイドで使用しない
- 管理者メールアドレスはサーバーサイドでのみ検証

## 📝 利用可能なスクリプト

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run lint         # ESLintチェック
npm run typecheck    # TypeScriptチェック
npm test             # テスト実行
npm run test:watch   # テスト（ウォッチモード）
npm run test:coverage # カバレッジレポート生成
npm run pre-deploy   # デプロイ前チェック
npm run setup-stripe # Stripe初期設定
npm run seed         # シードデータ投入
```

## 🏗 プロジェクト構成

```
muratabjjv2/
├── .claude/             # Claude Code設定
│   ├── settings.json    # 権限設定
│   └── commands/        # スラッシュコマンド
├── .github/             
│   └── workflows/       # GitHub Actions
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── [locale]/    # 多言語対応ルート
│   │   ├── admin/       # 管理者向けページ
│   │   ├── api/         # APIルート
│   │   └── dashboard/   # ユーザーダッシュボード
│   ├── components/      # Reactコンポーネント
│   │   ├── __tests__/   # コンポーネントテスト
│   │   └── forms/       # フォームコンポーネント
│   ├── contexts/        # Reactコンテキスト
│   ├── features/        # 機能別モジュール
│   │   └── flow/        # フローエディタ機能
│   ├── hooks/           # カスタムフック
│   ├── lib/             # ユーティリティ
│   │   └── validation/  # Zodスキーマ
│   ├── locales/         # 多言語対応
│   ├── types/           # TypeScript型定義
│   └── utils/           # ヘルパー関数
├── docs/                # ドキュメント
├── public/              # 静的ファイル
├── scripts/             # ユーティリティスクリプト
├── supabase/            # データベース設定
│   └── migrations/      # SQLマイグレーション
├── jest.config.js       # Jest設定
├── jest.setup.js        # テスト環境設定
└── CLAUDE.md            # Claude Code用ガイドライン
```

## 💳 料金プラン

1. **個人プラン（無料）**
   - 基本動画アクセス
   - ドリル・スパーログ
   - 基本的な習得度トラッキング

2. **Proプラン（¥1,200/月）**
   - フローエディタ全機能
   - アダプティブ復習
   - 詳細レポート・分析
   - AI動画解析

3. **道場プラン（¥6,000/月〜）**
   - カリキュラム配信機能
   - 非公開スペース
   - コーチ評価機能
   - 複数ユーザー管理

## 🎯 主な画面と機能

- `/` - ランディングページ
- `/dashboard` - ユーザーダッシュボード
- `/dashboard/videos` - 動画一覧・視聴
- `/dashboard/flows` - フローエディタ
- `/dashboard/progress` - 習得度管理
- `/dashboard/sparring` - スパーログ
- `/dashboard/review` - アダプティブ復習
- `/dashboard/profile` - プロフィール管理
- `/admin` - 管理者ダッシュボード

## 🤝 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。

### 貢献の流れ

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コミットメッセージ規約

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメントのみの変更
- `style:` コードの意味に影響しない変更
- `refactor:` バグ修正や機能追加を伴わないコード変更
- `test:` テストの追加や修正
- `chore:` ビルドプロセスやツールの変更

### 開発前の確認事項

- [ ] `npm test`が通ること
- [ ] `npm run lint`でエラーがないこと
- [ ] `npm run typecheck`で型エラーがないこと
- [ ] 新機能にはテストを追加すること

## 📄 ライセンス

Copyright (c) 2024 Murata BJJ. All rights reserved.

## 🙏 謝辞

- 村田 良蔵 様 - 技術監修
- すべてのコントリビューター
- オープンソースコミュニティ

---

お問い合わせ: admin@muratabjj.com